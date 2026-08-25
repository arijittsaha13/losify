'use client';
import { saveLostItem } from '../../../lib/itemsStore';
import { useState, useCallback, useEffect, useRef } from 'react';
import type { ItemAnalysis } from '../../../services/itemAnalysis';

import { useRouter } from 'next/navigation';
import { getCurrentUser } from '../../../lib/authStore';

const cats = ['Electronics','Backpack','Wallet','ID Card','Keys','Clothing','Books','Accessories','Documents','Other'];

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

export default function Lost() {
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string>();
  const [aiSuccess, setAiSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string>();
  const [formData, setFormData] = useState({
    name: '', category: 'Electronics', brand: '', color: '',
    lostDate: '', lostTime: '', location: '', description: '', privateDetails: '',
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.replace('/login');
    }
  }, [router]);

  // Animate progress bar while analyzing
  useEffect(() => {
    if (analyzing) {
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
  }, [analyzing]);

  const handleImageUpload = useCallback(async (file: File) => {
    setAnalyzing(true);
    setAiError(undefined);
    setAiSuccess(false);

    // Client-side safety timeout
    const timeoutId = setTimeout(() => {
      setAnalyzing(false);
      setAiError('Analysis timed out. Please fill in details manually.');
    }, 45000);

    try {
      const compressed = await compressImage(file, 512, 0.60);
      setUploadedImage(compressed);
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: compressed }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Analysis failed');
      const hint = json as ItemAnalysis & { name?: string };

      const now = new Date();
      const deviceDate = now.toLocaleDateString('sv-SE');
      const deviceTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

      // Fallback key mappings (data.name || data.title || data.itemType)
      const rawName = hint.name || hint.title || hint.itemType || '';
      const rawBrand = hint.brand || 'Generic';
      const rawColor = hint.color || '';
      const rawDescription = hint.description || '';
      const rawCategory = hint.category || 'Other';

      // Exact case-sensitive match with dropdown <select> options
      const matchedCategory = cats.find(
        (c) => c.toLowerCase() === rawCategory.trim().toLowerCase()
      ) || 'Other';

      setFormData(prev => ({
        ...prev,
        name:        rawName.trim()        || prev.name,
        brand:       rawBrand.trim()       || prev.brand,
        color:       rawColor.trim()       || prev.color,
        description: rawDescription.trim() || prev.description,
        category:    matchedCategory,
        lostDate:    hint.date             || deviceDate,
        lostTime:    hint.time             || deviceTime,
      }));
      setAiSuccess(true);
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'AI analysis failed.');
    } finally {
      clearTimeout(timeoutId);
      setAnalyzing(false);
    }
  }, []);

  if (done) {
    return (
      <main className="hero">
        <div className="glass form">
          <span className="pill">REPORT RECEIVED · LS-2051</span>
          <h1>We're looking.</h1>
          <p className="muted">Your report is live. We'll notify you when a match is found.</p>
          <a className="btn primary" href="/dashboard">Go to dashboard</a>
        </div>
      </main>
    );
  }

  return (
    <main className="form glass">
      <span className="label">Lost item report</span>
      <h1>Let's bring it home.</h1>
      <p className="muted">The more detail you share, the smarter our match becomes.</p>
      <form className="fields" onSubmit={(e) => {
        e.preventDefault();
        saveLostItem({
          name: formData.name,
          category: formData.category,
          brand: formData.brand,
          color: formData.color,
          location: formData.location,
          lostDate: formData.lostDate,
          lostTime: formData.lostTime,
          description: formData.description,
          image: uploadedImage,
        });
        setDone(true);
      }}>

        <label className="full">
          Photo (optional — AI will auto-fill details)
          <input type="file" accept="image/*"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
        </label>

        {analyzing && (
          <div className="glass ai card full">
            <span className="label" style={{ color: '#d5f5ff' }}>LOSIFY AI</span>
            <p>Analyzing image… fields will be auto-filled shortly.</p>
            <div className="progress">
              <i style={{ width: `${progress}%`, transition: 'width 0.4s ease' }} />
            </div>
          </div>
        )}

        {!analyzing && aiSuccess && (
          <div className="glass ai card full">
            <b>✓ AI auto-filled some fields</b>
            <p>Review and adjust any details below before submitting.</p>
          </div>
        )}

        {!analyzing && aiError && (
          <div className="glass ai card full">
            <b style={{ color: '#ffb3b3' }}>⚠ AI could not analyze this image</b>
            <p style={{ fontSize: '0.85em', opacity: 0.85 }}>{aiError}</p>
            <p>Please fill in the details below manually.</p>
          </div>
        )}

        <label>Item name
          <input required placeholder="e.g. Black Nike backpack" value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        </label>
        <label>Category
          <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
            {cats.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </label>
        <label>Brand
          <input placeholder="e.g. Nike" value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
        </label>
        <label>Color
          <input placeholder="e.g. Black" value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
        </label>
        <label>Lost date
          <input type="date" required value={formData.lostDate}
            onChange={(e) => setFormData({ ...formData, lostDate: e.target.value })} />
        </label>
        <label>Approximate time
          <input type="time" value={formData.lostTime}
            onChange={(e) => setFormData({ ...formData, lostTime: e.target.value })} />
        </label>
        <label className="full">Location lost
          <input required placeholder="e.g. Central Library, second floor" value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
        </label>
        <label className="full">Description
          <textarea required placeholder="Describe size, contents, patterns and anything memorable…" value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
        </label>
        <label className="full">Additional identifying information
          <textarea placeholder="Private details used only to verify ownership" value={formData.privateDetails}
            onChange={(e) => setFormData({ ...formData, privateDetails: e.target.value })} />
        </label>
        <button className="btn primary" type="submit">Submit lost report →</button>
      </form>
    </main>
  );
}
