import { z } from 'zod';

export const CATEGORIES = [
  'Electronics',
  'Backpack',
  'Wallet',
  'ID Card',
  'Keys',
  'Clothing',
  'Books',
  'Accessories',
  'Documents',
  'Other',
] as const;

const safeString = (def: string) =>
  z.preprocess((val) => {
    if (val === null || val === undefined) return def;
    if (Array.isArray(val)) return val.length ? val.join(', ') : def;
    return String(val);
  }, z.string());

export const analysisSchema = z.object({
  title: safeString('Unknown'),
  name: safeString('Unknown'),
  itemType: safeString('Unknown'),
  category: safeString('Other'),
  brand: safeString('Generic'),
  color: safeString('Unknown'),
  condition: safeString('Good'),
  estimatedCondition: safeString('Good'),
  model: safeString('Unknown'),
  visibleText: safeString('None'),
  description: safeString('Unknown'),
  distinctiveFeatures: safeString('None'),
  date: safeString(''),
  time: safeString(''),
});

export type ItemAnalysis = z.infer<typeof analysisSchema>;

const FALLBACK: ItemAnalysis = {
  title: 'Unknown',
  name: 'Unknown',
  itemType: 'Unknown',
  category: 'Other',
  brand: 'Generic',
  color: 'Unknown',
  condition: 'Good',
  estimatedCondition: 'Good',
  model: 'Unknown',
  visibleText: 'None',
  description: 'AI key not configured. Please complete details manually.',
  distinctiveFeatures: 'None',
  date: '',
  time: '',
};

// Explicit system instructions ensuring NO fields are omitted or left blank
const SYSTEM_INSTRUCTION = `You are an expert AI lost-and-found item classifier. Analyze the provided image carefully.
Ensure ALL fields are populated with exact, factual details:
- name/title: exact item title including brand and color (e.g. "Blue OnePlus Wireless Earbuds", "Pink Apple iPhone", "Black Nike Backpack")
- brand: specific manufacturer or brand name (e.g. OnePlus, Apple, Samsung, Sony, Boat, Nike, Adidas, Dell, HP). Look for brand text or logos. If title contains a brand like OnePlus, brand MUST be "OnePlus".
- color: exact primary visual color (e.g. Blue, Pink, Black, White, Silver, Gold, Red, Green).
- category: MUST be accurately chosen from: Electronics, Backpack, Wallet, ID Card, Keys, Clothing, Books, Accessories, Documents, Other. Wireless earbuds/phones/laptops are ALWAYS "Electronics".
- description: short 1-2 sentence visual summary describing the item, color, and condition.`;

const PROMPT = `Identify this item image accurately. Return structured JSON with all fields populated:
- name: exact item name (e.g. "Blue OnePlus Wireless Earbuds")
- title: exact item title
- brand: manufacturer brand name (e.g. "OnePlus", "Apple", "Nike", "Samsung", "Sony", "Boat")
- color: primary visual color (e.g. "Blue", "Pink", "Black", "White", "Silver")
- category: one of Electronics, Backpack, Wallet, ID Card, Keys, Clothing, Books, Accessories, Documents, Other
- description: 1-2 sentence clear description`;

// ─── Gemini Structured Output Schema ──────────────────────────────────────────
const responseSchema = {
  type: 'OBJECT',
  properties: {
    name: { type: 'STRING', description: 'Exact item title e.g. Blue OnePlus Wireless Earbuds' },
    title: { type: 'STRING', description: 'Exact item title' },
    itemType: { type: 'STRING', description: 'Short item type' },
    brand: { type: 'STRING', description: 'Manufacturer or brand name e.g. OnePlus, Apple, Nike' },
    color: { type: 'STRING', description: 'Primary visual color e.g. Blue, Pink, Black, White' },
    category: {
      type: 'STRING',
      enum: [
        'Electronics',
        'Backpack',
        'Wallet',
        'ID Card',
        'Keys',
        'Clothing',
        'Books',
        'Accessories',
        'Documents',
        'Other',
      ],
    },
    description: { type: 'STRING', description: 'Detailed 1-2 sentence visual description' },
    condition: { type: 'STRING', enum: ['Good', 'Fair', 'Poor'] },
    estimatedCondition: { type: 'STRING', enum: ['Good', 'Fair', 'Poor'] },
    model: { type: 'STRING', description: 'Model name/number if visible, else Unknown' },
    visibleText: { type: 'STRING', description: 'Text visible on item, else None' },
    distinctiveFeatures: { type: 'STRING', description: 'Unique features, else None' },
  },
  required: ['name', 'title', 'brand', 'color', 'category', 'description'],
};

// ─── Robust JSON parser ───────────────────────────────────────────────────────
function parseFlexibleJson(raw: string): unknown {
  let text = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  text = text.replace(/^```(?:json)?/im, '').replace(/```\s*$/m, '').trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1) text = text.slice(start, end + 1);

  try { return JSON.parse(text); } catch { /* fall through */ }

  const repaired = text.replace(/,\s*([}\]])/g, '$1');
  try { return JSON.parse(repaired); } catch { /* fall through */ }

  const extract = (key: string, def: string) => {
    const m = repaired.match(new RegExp(`"${key}"\\s*:\\s*"([^"]*)"`, 'i'));
    return m ? m[1] : def;
  };
  return {
    name: extract('name', extract('title', extract('itemType', 'Unknown'))),
    title: extract('title', extract('name', extract('itemType', 'Unknown'))),
    itemType: extract('itemType', extract('name', 'Unknown')),
    category: extract('category', 'Other'),
    brand: extract('brand', 'Generic'),
    color: extract('color', 'Unknown'),
    condition: extract('condition', 'Good'),
    estimatedCondition: extract('estimatedCondition', 'Good'),
    description: extract('description', 'Unknown'),
    model: extract('model', 'Unknown'),
    visibleText: extract('visibleText', 'None'),
    distinctiveFeatures: extract('distinctiveFeatures', 'None'),
  };
}

// ─── Fetch with hard timeout ──────────────────────────────────────────────────
async function fetchWithTimeout(url: string, options: RequestInit, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err: unknown) {
    if ((err as Error)?.name === 'AbortError') throw new Error(`Timed out after ${ms / 1000}s`);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export async function analyzeItem(imageData: string): Promise<ItemAnalysis> {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (!geminiKey) return FALLBACK;

  const match = imageData.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/s);
  if (!match) throw new Error('imageData must be a base64 data URI');
  const [, mimeType, base64Data] = match;

  const models = [
    process.env.GEMINI_MODEL,
    'gemini-2.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-2.5-flash-lite',
    'gemini-flash-latest',
  ].filter(Boolean) as string[];

  const seen = new Set<string>();
  const modelList = models.filter((m) => !seen.has(m) && seen.add(m));

  let lastError = 'No models available';

  for (const modelId of modelList) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${geminiKey}`;
    const body = {
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }],
      },
      contents: [
        {
          parts: [
            { text: PROMPT },
            { inline_data: { mime_type: mimeType, data: base64Data } },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        maxOutputTokens: 512,
        temperature: 0.1,
      },
    };

    try {
      const r = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }, 25000);

      if (!r.ok) {
        const errText = await r.text().catch(() => '');
        lastError = `${modelId} (${r.status}): ${errText.slice(0, 120)}`;
        continue;
      }

      const json = await r.json();
      const raw: string | undefined = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!raw) { lastError = `${modelId}: empty response`; continue; }

      const parsed = parseFlexibleJson(raw) as Record<string, any>;
      const result = analysisSchema.parse(parsed);

      let title = (result.name && result.name !== 'Unknown') ? result.name : ((result.title && result.title !== 'Unknown') ? result.title : (result.itemType && result.itemType !== 'Unknown' ? result.itemType : 'Item'));
      let brand = (result.brand || '').trim();
      let color = (result.color || '').trim();
      let category = (result.category || '').trim();
      let description = (result.description || '').trim();

      const combinedText = `${title} ${description}`;

      // 1. SMART BRAND EXTRACTION & INFERENCE
      if (!brand || ['Generic', 'Unknown', 'none', 'N/A', ''].includes(brand)) {
        const brandMatches: [RegExp, string][] = [
          [/\b(oneplus|nord)\b/i, 'OnePlus'],
          [/\b(boat)\b/i, 'Boat'],
          [/\b(apple|iphone|ipad|macbook|airpods)\b/i, 'Apple'],
          [/\b(samsung|galaxy)\b/i, 'Samsung'],
          [/\b(realme)\b/i, 'Realme'],
          [/\b(xiaomi|redmi|mi)\b/i, 'Xiaomi'],
          [/\b(oppo)\b/i, 'Oppo'],
          [/\b(vivo)\b/i, 'Vivo'],
          [/\b(noise)\b/i, 'Noise'],
          [/\b(fire-boltt|fireboltt)\b/i, 'Fire-Boltt'],
          [/\b(boult)\b/i, 'Boult'],
          [/\b(sony)\b/i, 'Sony'],
          [/\b(nike)\b/i, 'Nike'],
          [/\b(adidas)\b/i, 'Adidas'],
          [/\b(dell)\b/i, 'Dell'],
          [/\b(hp|hewlett)\b/i, 'HP'],
          [/\b(lenovo|thinkpad)\b/i, 'Lenovo'],
          [/\b(asus)\b/i, 'Asus'],
          [/\b(acer)\b/i, 'Acer'],
          [/\b(anker)\b/i, 'Anker'],
          [/\b(bose)\b/i, 'Bose'],
          [/\b(jbl)\b/i, 'JBL'],
          [/\b(logitech)\b/i, 'Logitech'],
          [/\b(casio)\b/i, 'Casio'],
          [/\b(puma)\b/i, 'Puma'],
          [/\b(under armour)\b/i, 'Under Armour'],
          [/\b(fossil)\b/i, 'Fossil'],
        ];
        for (const [regex, brandName] of brandMatches) {
          if (regex.test(combinedText)) {
            brand = brandName;
            break;
          }
        }

        // Dynamic fallback: scan title words for brand names
        if (!brand || ['Generic', 'Unknown', 'none', 'N/A', ''].includes(brand)) {
          const words = title.split(/\s+/);
          const nonBrandWords = new Set([
            'pink', 'black', 'white', 'blue', 'red', 'green', 'yellow', 'gold', 'silver', 'grey', 'gray', 'purple', 'brown', 'orange', 'beige', 'navy',
            'wireless', 'earbuds', 'headphones', 'earphones', 'phone', 'smartphone', 'backpack', 'bag', 'wallet', 'case', 'laptop', 'watch', 'charger', 'item', 'card', 'keys', 'in', 'charging', 'good', 'condition'
          ]);
          for (const word of words) {
            const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '');
            if (cleanWord.length > 2 && !nonBrandWords.has(cleanWord.toLowerCase())) {
              brand = cleanWord;
              break;
            }
          }
        }

        if (!brand || ['Unknown', 'none', 'N/A', ''].includes(brand)) brand = 'Generic';
      }

      // 2. SMART COLOR EXTRACTION
      if (!color || ['Unknown', 'unknown', 'none', 'N/A', ''].includes(color)) {
        const colorList = ['Pink', 'Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Gold', 'Silver', 'Grey', 'Gray', 'Purple', 'Brown', 'Orange', 'Beige', 'Navy'];
        for (const c of colorList) {
          if (new RegExp(`\\b${c}\\b`, 'i').test(combinedText)) {
            color = c;
            break;
          }
        }
        if (!color || ['Unknown', 'unknown', 'none', 'N/A', ''].includes(color)) color = 'Black';
      }

      // 3. SMART CATEGORY INFERENCE
      const categoryMap: [RegExp, typeof CATEGORIES[number]][] = [
        [/\b(iphone|phone|smartphone|laptop|macbook|ipad|tablet|airpods|earbuds|headphones|earphones|charger|cable|powerbank|watch|smartwatch|camera|calculator)\b/i, 'Electronics'],
        [/\b(backpack|bag|rucksack|duffel|tote)\b/i, 'Backpack'],
        [/\b(wallet|purse|billfold|pouch)\b/i, 'Wallet'],
        [/\b(card|id|license|badge|pass|passport)\b/i, 'ID Card'],
        [/\b(key|keychain|fob)\b/i, 'Keys'],
        [/\b(jacket|shirt|hoodie|sweater|pants|coat|hat|cap|glove|scarf)\b/i, 'Clothing'],
        [/\b(book|notebook|textbook|journal|binder)\b/i, 'Books'],
        [/\b(ring|necklace|glasses|sunglasses|umbrella|watch|strap|jewelry)\b/i, 'Accessories'],
        [/\b(document|paper|certificate|folder|file)\b/i, 'Documents'],
      ];

      let finalCategory: typeof CATEGORIES[number] = 'Other';
      const foundCat = CATEGORIES.find(c => c.toLowerCase() === category.toLowerCase());
      if (foundCat && foundCat !== 'Other') {
        finalCategory = foundCat;
      } else {
        for (const [regex, catName] of categoryMap) {
          if (regex.test(combinedText)) {
            finalCategory = catName;
            break;
          }
        }
      }

      // 4. CLEAN NON-REPETITIVE DESCRIPTION GENERATION
      if (!description || description === 'Unknown' || description === 'Item analyzed via image' || description.toLowerCase().includes('clean condition')) {
        let descTitle = title;
        // Avoid duplicate color prepending if title already starts with color
        if (color && !descTitle.toLowerCase().startsWith(color.toLowerCase())) {
          descTitle = `${color} ${descTitle}`;
        }
        // Avoid duplicate brand if title already has brand
        if (brand && brand !== 'Generic' && !descTitle.toLowerCase().includes(brand.toLowerCase())) {
          descTitle = `${brand} ${descTitle}`;
        }
        description = `${descTitle} in good condition.`;
      }

      (result as any).name = title;
      (result as any).title = title;
      (result as any).itemType = title;
      (result as any).brand = brand;
      (result as any).color = color;
      (result as any).category = finalCategory;
      (result as any).description = description;

      return result;

    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : String(err);
      if (lastError.includes('Timed out')) break;
      continue;
    }
  }

  throw new Error(`Analysis failed: ${lastError}`);
}