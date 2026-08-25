import { lost as initialLost, found as initialFound } from './demo';
import { localMatch } from '../services/itemMatching';
import { getCurrentUser } from './authStore';

export interface Item {
  id: string;
  name: string;
  category: string;
  brand: string;
  color: string;
  location: string;
  date: string;
  status: string;
  image?: string;
  confidence?: number;
  description?: string;
  lostTime?: string;
  studentName?: string;
  studentId?: string;
}

export interface MatchPair {
  id: string;
  lostItem: Item;
  foundItem: Item;
  confidence: number;
  reason: string;
  collected: boolean;
  studentName: string;
  studentId: string;
}

const LOST_KEY = 'losify_user_lost_items';
const FOUND_KEY = 'losify_user_found_items';
const COLLECTED_KEY = 'losify_collected_matches';

const placeholderImages: Record<string, string> = {
  Electronics: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=300&q=80',
  Backpack: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=300&q=80',
  Wallet: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=300&q=80',
  'ID Card': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=300&q=80',
  Keys: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=300&q=80',
  Clothing: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80',
  Books: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80',
  Accessories: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80',
  Documents: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=300&q=80',
  Other: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=300&q=80',
};

// Default student profiles for initial demo items so names vary
const demoStudentProfiles: Record<string, { name: string; id: string }> = {
  'LS-2048': { name: 'Arjun Mehta', id: 'STU-2026104' },
  'LS-2047': { name: 'Priya Sharma', id: 'STU-2026109' },
  'LS-2042': { name: 'Rahul Verma', id: 'STU-2026112' },
  'FN-819': { name: 'Arjun Mehta', id: 'STU-2026104' },
};

export function getRawLostItems(): Item[] {
  if (typeof window === 'undefined') return initialLost;
  try {
    const saved = localStorage.getItem(LOST_KEY);
    const userItems: Item[] = saved ? JSON.parse(saved) : [];
    return [...userItems, ...initialLost];
  } catch {
    return initialLost;
  }
}

export function getRawFoundItems(): Item[] {
  if (typeof window === 'undefined') return initialFound;
  try {
    const saved = localStorage.getItem(FOUND_KEY);
    const userItems: Item[] = saved ? JSON.parse(saved) : [];
    return [...userItems, ...initialFound];
  } catch {
    return initialFound;
  }
}

export function getMatchedPairs(): MatchPair[] {
  const lostList = getRawLostItems();
  const foundList = getRawFoundItems();
  const pairs: MatchPair[] = [];

  let collectedSet = new Set<string>();
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(COLLECTED_KEY);
      if (saved) collectedSet = new Set(JSON.parse(saved));
    } catch {}
  }

  const pairedFoundIds = new Set<string>();

  for (const lost of lostList) {
    for (const found of foundList) {
      if (pairedFoundIds.has(found.id)) continue;

      const res = localMatch(
        { name: lost.name, category: lost.category, brand: lost.brand, color: lost.color, locationLost: lost.location, description: lost.description || '' },
        { name: found.name, category: found.category, brand: found.brand, color: found.color, foundLocation: found.location, description: found.description || '' }
      );

      if (res.match) {
        pairedFoundIds.add(found.id);
        const pairId = `${lost.id}_${found.id}`;

        const studentName = lost.studentName || demoStudentProfiles[lost.id]?.name || 'Student';
        const studentId = lost.studentId || demoStudentProfiles[lost.id]?.id || 'STU-202600';

        pairs.push({
          id: pairId,
          lostItem: lost,
          foundItem: found,
          confidence: res.confidence,
          reason: res.reason,
          collected: collectedSet.has(pairId),
          studentName,
          studentId,
        });
        break;
      }
    }
  }

  return pairs;
}

export function markMatchCollected(pairId: string) {
  if (typeof window === 'undefined') return;
  try {
    const saved = localStorage.getItem(COLLECTED_KEY);
    const set = new Set<string>(saved ? JSON.parse(saved) : []);
    set.add(pairId);
    localStorage.setItem(COLLECTED_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

export function getLostItems(): Item[] {
  const lostList = getRawLostItems();
  const pairs = getMatchedPairs();
  const matchedMap = new Map<string, number>();

  pairs.forEach(p => matchedMap.set(p.lostItem.id, p.confidence));

  return lostList.map(item => {
    if (matchedMap.has(item.id)) {
      return {
        ...item,
        status: 'MATCHED',
        confidence: matchedMap.get(item.id),
      };
    }
    return item;
  });
}

export function getFoundItems(): Item[] {
  const foundList = getRawFoundItems();
  const pairs = getMatchedPairs();
  const matchedMap = new Map<string, MatchPair>();

  pairs.forEach(p => matchedMap.set(p.foundItem.id, p));

  return foundList.map(item => {
    if (matchedMap.has(item.id)) {
      const pair = matchedMap.get(item.id)!;
      return {
        ...item,
        status: pair.collected ? 'COLLECTED' : 'READY_FOR_COLLECTION',
        confidence: pair.confidence,
      };
    }
    return item;
  });
}

export function saveLostItem(data: {
  name: string;
  category: string;
  brand?: string;
  color?: string;
  location: string;
  lostDate?: string;
  lostTime?: string;
  description?: string;
  image?: string;
}): Item {
  const user = getCurrentUser();
  const image = data.image || placeholderImages[data.category] || placeholderImages.Other;

  let formattedDate = 'Today';
  if (data.lostDate) {
    try {
      const d = new Date(data.lostDate);
      formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      formattedDate = data.lostDate;
    }
  }

  const newItem: Item = {
    id: `LS-${Math.floor(2000 + Math.random() * 9000)}`,
    name: data.name || 'Unnamed Lost Item',
    category: data.category || 'Other',
    brand: data.brand || 'Unknown',
    color: data.color || 'Unknown',
    location: data.location || 'Campus',
    date: formattedDate,
    status: 'LOST',
    image,
    confidence: 0,
    description: data.description || '',
    lostTime: data.lostTime || '',
    studentName: user ? user.name : 'Student',
    studentId: user ? user.registerId : 'STU-GUEST',
  };

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(LOST_KEY);
      const userItems: Item[] = saved ? JSON.parse(saved) : [];
      localStorage.setItem(LOST_KEY, JSON.stringify([newItem, ...userItems]));
    } catch (e) {
      console.error('Failed to save lost item to localStorage', e);
    }
  }
  return newItem;
}

export function saveFoundItem(data: {
  name?: string;
  category?: string;
  brand?: string;
  color?: string;
  location?: string;
  foundDate?: string;
  foundTime?: string;
  description?: string;
  image?: string;
  itemType?: string;
}): Item {
  const user = getCurrentUser();
  const cat = data.category || 'Other';
  const image = data.image || placeholderImages[cat] || placeholderImages.Other;

  let formattedDate = 'Today';
  if (data.foundDate) {
    try {
      const d = new Date(data.foundDate);
      formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      formattedDate = data.foundDate;
    }
  }

  const newItem: Item = {
    id: `FN-${Math.floor(800 + Math.random() * 900)}`,
    name: data.name || data.itemType || 'Found Item',
    category: cat,
    brand: data.brand || 'Unknown',
    color: data.color || 'Unknown',
    location: data.location || 'Campus',
    date: formattedDate,
    status: 'UNCLAIMED',
    image,
    confidence: 85,
    description: data.description || '',
    studentName: user ? user.name : 'Student',
    studentId: user ? user.registerId : 'STU-GUEST',
  };

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(FOUND_KEY);
      const userItems: Item[] = saved ? JSON.parse(saved) : [];
      localStorage.setItem(FOUND_KEY, JSON.stringify([newItem, ...userItems]));
    } catch (e) {
      console.error('Failed to save found item to localStorage', e);
    }
  }
  return newItem;
}

export function getGlobalStats() {
  let userLostCount = 0;
  let userFoundCount = 0;
  if (typeof window !== 'undefined') {
    try {
      const savedLost = localStorage.getItem(LOST_KEY);
      if (savedLost) userLostCount = JSON.parse(savedLost).length;
      const savedFound = localStorage.getItem(FOUND_KEY);
      if (savedFound) userFoundCount = JSON.parse(savedFound).length;
    } catch {}
  }
  const pairs = getMatchedPairs();
  const totalMatches = 768 + pairs.length;
  const totalLost = 899 + userLostCount;
  const totalFound = 800 + userFoundCount;
  const accuracy = Math.min(98, Math.max(92, Math.round((totalMatches / totalLost) * 100))) + '%';

  return {
    totalLost,
    totalFound,
    totalMatches,
    accuracy,
  };
}

export function getMyLostItems(studentId?: string, studentName?: string): Item[] {
  const allLost = getLostItems();
  if (!studentId && !studentName) return [];
  return allLost.filter(
    (item) =>
      (studentId && item.studentId === studentId) ||
      (studentName && item.studentName === studentName)
  );
}

export function getMyFoundItems(studentId?: string, studentName?: string): Item[] {
  const allFound = getFoundItems();
  if (!studentId && !studentName) return [];
  return allFound.filter(
    (item) =>
      (studentId && item.studentId === studentId) ||
      (studentName && item.studentName === studentName)
  );
}