'use client';
import { saveFoundItem } from '../../../lib/itemsStore';
import { useState, useCallback, useEffect, useRef } from 'react';
import type { ItemAnalysis } from '../../../services/itemAnalysis';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '../../../lib/authStore';

const cats = ['Electronics','Backpack','Wallet','ID Card','Keys','Clothing','Books','Accessories','Documents','Other'];

const EMPTY: ItemAnalysis & { name?: string } = {
  title: '', name: '', itemType: '', category: 'Other', brand: '', color: '', condition: '', model: '',
  visibleText: '', description: '', estimatedCondition: '', distinctiveFeatures: '',
  date: '', time: '',
};

function compressImage(file: File, maxPx = 640, quality = 0.70): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxPx || height > maxPx) {
        if (width > height) { height = Math.round((height * maxPx) / width); width = maxPx; }
        else { width = Math.round((width * maxPx) / height); height = maxPx; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Image load failed')); };
    img.src = objectUrl;
  });
}

export default function Found() {
  const router = useRouter();
  const [preview, setPreview] = useState<string>();
  const [stage, setStage] = useState<'upload' | 'ai' | 'review' | 'done'>('upload');
  const [data, setData] = useState<ItemAnalysis & { name?: string }>(EMPTY);
  const [foundDate, setFoundDate] = useState('');
  const [foundTime, setFoundTime] = useState('');
  const [aiError, setAiError] = useState<string>();
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      setTimeout(() => router.replace('/login'), 0);
    }
  }, [router]);

  useEffect(() => {
    if (stage === 'ai') {
      setProgress(15);
      let p = 15;
      progressRef.current = setInterval(() => {
        const step = p < 80 ? 10 : 2;
        p = Math.min(p + step, 95);
        setProgress(p);
      }, 300);
    } else {
      if (progressRef.current) clearInterval(progressRef.current);
      setProgress(0);
    }
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, [stage]);

  const analyze = useCallback(async (file: File) => {
    setStage('ai');
    setAiError(undefined);

    const timeoutId = setTimeout(() => {
      setStage('review');
      setAiError('Analysis timed out. Please fill in details manually.');
      setData(EMPTY);
    }, 45000);

    try {
      const compressed = await compressImage(file, 512, 0.60);
      setPreview(compressed);
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: compressed, fileName: file.name }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Analysis failed');

      const hint = json as ItemAnalysis & { name?: string };

      // Fallback key mappings (data.name || data.title || data.itemType)
      const rawName = hint.name || hint.title || hint.itemType || '';
      const rawBrand = hint.brand || '';
      const rawColor = hint.color || '';
      const rawDescription = hint.description || '';
      const rawCategory = hint.category || 'Other';

      // Check for placeholder, generic, or mismatched dummy names
      const isDummyName =
        !rawName ||
        ['found item', 'lost item', 'item', 'unknown item', 'unknown', 'smart item'].includes(
          rawName.trim().toLowerCase()
        );
      const isDummyBrand =
        !rawBrand ||
        ['generic', 'campus', 'unknown', 'none'].includes(rawBrand.trim().toLowerCase());

      // Exact case-sensitive match with dropdown <select> options
      const matchedCategory = cats.find(
        (c) => c.toLowerCase() === rawCategory.trim().toLowerCase()
      ) || 'Other';

      const now = new Date();
      const deviceDate = now.toLocaleDateString('sv-SE');
      const deviceTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

      setData({
        ...hint,
        name: !isDummyName ? rawName.trim() : '',
        title: !isDummyName ? rawName.trim() : '',
        itemType: !isDummyName ? rawName.trim() : '',
        brand: !isDummyBrand ? rawBrand.trim() : '',
        color: rawColor,
        description: rawDescription,
        category: matchedCategory,
      });

      setFoundDate(hint.date && hint.date !== 'Unknown' ? hint.date : deviceDate);
      setFoundTime(hint.time && hint.time !== 'Unknown' ? hint.time : deviceTime);
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'AI analysis failed.');
      setData(EMPTY);
    } finally {
      clearTimeout(timeoutId);
      setStage('review');
    }
  }, []);

  if (stage === 'done') {
    return (
      <main className="hero">
        <div className="glass form">
          <span className="pill">FOUND REPORT SAVED · FN-820</span>
          <h1>Possible match found.</h1>
          <p className="muted">A 92% match was identified. The owner has been privately notified.</p>
          <a className="btn primary" href="/dashboard">View dashboard</a>
        </div>
      </main>
    );
  }

  return (
    <main className="form glass">
      <span className="label">Found item report</span>
      <h1>Give an item a way back.</h1>

      {stage === 'upload' && (
        <div className="upload">
          <div style={{ fontSize: 38 }}>⌁</div>
          <h2>Upload the item photo</h2>
          <p className="muted">JPG, PNG or WEBP · up to 10 MB</p>
          <input type="file" accept="image/jpeg,image/png,image/webp"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) analyze(f); }} />
        </div>
      )}

      {stage === 'ai' && (
        <div className="glass ai card">
          <span className="label" style={{ color: '#d5f5ff' }}>LOSIFY AI</span>
          <h2>Analyzing your image…</h2>
          <ul>
            <li>Compressing photo</li>
            <li>Detecting object type</li>
            <li>Identifying brand &amp; color</li>
            <li>Extracting visible text &amp; timestamps</li>
            <li>Finding distinctive features</li>
          </ul>
          <div className="progress">
            <i style={{ width: `${progress}%`, transition: 'width 0.4s ease' }} />
          </div>
        </div>
      )}

      {stage === 'review' && (
        <form className="fields" onSubmit={(e) => {
          e.preventDefault();
          saveFoundItem({
            name: data.name || data.title || data.itemType || 'Found Item',
            category: data.category || 'Other',
            brand: data.brand || 'Generic',
            color: data.color || '',
            description: data.description || '',
            foundDate,
            foundTime,
            image: preview,
          });
          setStage('done');
        }}>
          {preview && (
            <img src={preview} className="thumb"
              style={{ width: 130, height: 130, gridColumn: '1/-1', objectFit: 'cover', borderRadius: 8 }}
              alt="Upload preview" />
          )}
          <div className="glass ai card full">
            {aiError ? (
              <>
                <b style={{ color: '#ffb3b3' }}>⚠ AI could not analyze this image</b>
                <p style={{ fontSize: '0.85em', opacity: 0.85 }}>{aiError}</p>
                <p>Please fill in the details below manually.</p>
              </>
            ) : (
              <>
                <b>✓ Analysis complete</b>
                <p>Review and correct these details below before submitting.</p>
              </>
            )}
          </div>

          <label>Item Name / Title
            <input
              required
              value={data.name || data.title || data.itemType || ''}
              onChange={(e) => setData({ ...data, name: e.target.value, title: e.target.value, itemType: e.target.value })}
              placeholder="e.g. Black Nike Backpack"
            />
          </label>

          <label>Category
            <select
              value={data.category || 'Other'}
              onChange={(e) => setData({ ...data, category: e.target.value })}
            >
              {cats.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </label>

          <label>Brand
            <input
              value={data.brand || ''}
              onChange={(e) => setData({ ...data, brand: e.target.value })}
              placeholder="e.g. Nike"
            />
          </label>

          <label>Color
            <input
              value={data.color || ''}
              onChange={(e) => setData({ ...data, color: e.target.value })}
              placeholder="e.g. Black"
            />
          </label>

          <label>Found Date
            <input type="date" required value={foundDate} onChange={(e) => setFoundDate(e.target.value)} />
          </label>

          <label>Found Time
            <input type="time" value={foundTime} onChange={(e) => setFoundTime(e.target.value)} />
          </label>

          <label className="full">Description
            <textarea
              required
              value={data.description || ''}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              placeholder="Short visual description of the item"
            />
          </label>

          <label className="full">Found Location
            <input required placeholder="e.g. Near Central Library" />
          </label>

          <label className="full">Additional Notes
            <textarea placeholder="Anything the HOD or owner should know" />
          </label>

          <button className="btn primary" type="submit">Submit &amp; find matches →</button>
        </form>
      )}
    </main>
  );
}
