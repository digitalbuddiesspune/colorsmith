import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { colors as colorsApi, products as productsApi, colorSuggestions } from '../api/client';
import { useAuth } from '../context/AuthContext';

/* ───────── helpers ───────── */
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return { r: parseInt(h.substring(0, 2), 16), g: parseInt(h.substring(2, 4), 16), b: parseInt(h.substring(4, 6), 16) };
}
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}
function colorDistance(c1, c2) {
  return Math.sqrt((c1.r - c2.r) ** 2 + (c1.g - c2.g) ** 2 + (c1.b - c2.b) ** 2);
}
const MAX_DIST = Math.sqrt(255 ** 2 * 3);

const tabs = [
  { id: 'match', label: 'AI Color Match', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg> },
  { id: 'suggest', label: 'Color Suggestion', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg> },
  { id: 'visualize', label: 'Color Visualizer', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
];

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */
export default function ColorTools() {
  const [activeTab, setActiveTab] = useState('match');
  const [allColors, setAllColors] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    Promise.all([colorsApi.list(), productsApi.list()])
      .then(([cRes, pRes]) => {
        const c = cRes.data; const p = pRes.data;
        setAllColors(Array.isArray(c) ? c : c?.data ?? []);
        setAllProducts(Array.isArray(p) ? p : p?.data ?? []);
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">Color Tools</h1>
        <p className="text-neutral-500 max-w-2xl">
          Match colors from photos, suggest new shades, or preview how colors look on products — all powered by smart color analysis. In AI Color Match, you can allow camera access when prompted to capture a photo for color matching.
        </p>
      </div>

      {/* tabs */}
      <div className="flex gap-2 mb-10 overflow-x-auto pb-1 -mx-1 px-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === t.id
                ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-900/10'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {activeTab === 'match' && <AIColorMatch allColors={allColors} loading={loadingData} />}
      {activeTab === 'suggest' && <ColorSuggestion allProducts={allProducts} />}
      {activeTab === 'visualize' && <ColorVisualizer allColors={allColors} />}
    </div>
  );
}

/* ═══════════════════════════════════════════
   1. AI COLOR MATCH
   ═══════════════════════════════════════════ */
function AIColorMatch({ allColors, loading }) {
  const canvasRef = useRef(null);
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const [extractedColor, setExtractedColor] = useState(null);
  const [matches, setMatches] = useState([]);
  const [imgPreview, setImgPreview] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  const extractColor = useCallback((imgSrc) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      // sample center region
      const sx = Math.floor(img.width * 0.3), sy = Math.floor(img.height * 0.3);
      const sw = Math.floor(img.width * 0.4), sh = Math.floor(img.height * 0.4);
      const data = ctx.getImageData(sx, sy, sw, sh).data;
      let rT = 0, gT = 0, bT = 0, count = 0;
      for (let i = 0; i < data.length; i += 16) { rT += data[i]; gT += data[i + 1]; bT += data[i + 2]; count++; }
      const avg = { r: Math.round(rT / count), g: Math.round(gT / count), b: Math.round(bT / count) };
      const hex = rgbToHex(avg.r, avg.g, avg.b);
      setExtractedColor({ ...avg, hex });
      // match
      const results = allColors
        .filter((c) => c.hexCode)
        .map((c) => {
          const rgb = hexToRgb(c.hexCode);
          const dist = colorDistance(avg, rgb);
          const similarity = Math.round((1 - dist / MAX_DIST) * 100);
          return { ...c, similarity };
        })
        .filter((c) => c.similarity >= 50)
        .sort((a, b) => b.similarity - a.similarity);
      setMatches(results);
    };
    img.src = imgSrc;
  }, [allColors]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImgPreview(url);
    extractColor(url);
    stopCamera();
  };

  const openCamera = async () => {
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera is not supported in this browser. Please use "Upload Image" instead.');
      return;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(s);
      setCameraOpen(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = s; }, 100);
    } catch (err) {
      const denied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
      setCameraError(denied
        ? 'Camera access was denied. Please allow camera access in your browser settings, or use "Upload Image" instead.'
        : 'Could not access the camera. Make sure it is connected and not in use by another app, or try "Upload Image".'
      );
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const url = canvas.toDataURL('image/png');
    setImgPreview(url);
    extractColor(url);
    stopCamera();
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCameraOpen(false);
    setCameraError(null);
  };

  const reset = () => { setExtractedColor(null); setMatches([]); setImgPreview(null); setCameraError(null); stopCamera(); };

  return (
    <div>
      <canvas ref={canvasRef} className="hidden" />

      {/* upload area */}
      {!imgPreview && !cameraOpen && (
        <div className="border-2 border-dashed border-neutral-300 rounded-2xl p-10 text-center bg-neutral-50">
          <div className="w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Upload or capture a color</h3>
          <p className="text-neutral-500 text-sm mb-4 max-w-md mx-auto">
            Take a photo or upload an image — we'll extract the dominant color and find the closest matches in our catalog.
          </p>
          <p className="text-neutral-500 text-xs mb-6 max-w-md mx-auto">
            <strong className="text-neutral-700">Camera:</strong> When you tap Camera, your browser will ask for permission to use your camera. Allow access to capture a photo for color matching — we use it only for this feature.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={openCamera} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-neutral-900 text-white font-semibold text-sm hover:bg-neutral-800 transition-all shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>
              Use camera (allow access when prompted)
            </button>
            <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-neutral-300 text-neutral-700 font-semibold text-sm hover:border-neutral-400 hover:bg-neutral-50 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
              Upload Image
            </button>
          </div>
          {cameraError && (
            <div className="mt-6 mx-auto max-w-md px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-left">
              <p className="text-sm text-amber-800">{cameraError}</p>
              <button type="button" onClick={() => setCameraError(null)} className="mt-2 text-sm font-semibold text-amber-700 hover:underline">Dismiss</button>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
      )}

      {/* camera view */}
      {cameraOpen && (
        <div className="rounded-2xl overflow-hidden bg-black relative">
          <video ref={videoRef} autoPlay playsInline muted className="w-full max-h-[400px] object-cover" />
          {/* center reticle */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-32 h-32 border-2 border-white/60 rounded-full" />
          </div>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
            <button onClick={capturePhoto} className="px-6 py-3 rounded-full bg-white text-neutral-900 font-semibold text-sm shadow-lg">Capture</button>
            <button onClick={stopCamera} className="px-6 py-3 rounded-full bg-white/20 text-white font-semibold text-sm backdrop-blur-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* result */}
      {imgPreview && extractedColor && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* uploaded image */}
            <div className="rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-50">
              <img src={imgPreview} alt="Uploaded" className="w-full max-h-[300px] object-cover" />
            </div>
            {/* extracted color */}
            <div className="rounded-2xl border border-neutral-200 p-6 flex flex-col items-center justify-center text-center">
              <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-xl mb-4" style={{ backgroundColor: extractedColor.hex }} />
              <h3 className="text-lg font-bold text-neutral-900 mb-1">Extracted Color</h3>
              <p className="text-neutral-500 text-sm font-mono">{extractedColor.hex.toUpperCase()}</p>
              <p className="text-neutral-400 text-xs mt-1">RGB({extractedColor.r}, {extractedColor.g}, {extractedColor.b})</p>
              <button onClick={reset} className="mt-4 text-sm text-neutral-500 hover:text-neutral-900 underline">Try another</button>
            </div>
          </div>

          {/* matches */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              {matches.length > 0 ? `${matches.length} catalog match${matches.length !== 1 ? 'es' : ''} found` : 'No close matches found'}
            </h3>
            {matches.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {matches.slice(0, 12).map((m) => (
                  <div key={m._id} className="rounded-xl border border-neutral-200 bg-white p-4 flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-full border-2 border-white shadow-md mb-3" style={{ backgroundColor: m.hexCode }} />
                    <span className="text-sm font-medium text-neutral-800 mb-1 truncate w-full">{m.name}</span>
                    <span className="text-xs font-mono text-neutral-400 mb-2">{m.hexCode}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      m.similarity >= 90 ? 'bg-emerald-100 text-emerald-700' :
                      m.similarity >= 75 ? 'bg-amber-100 text-amber-700' :
                      'bg-neutral-100 text-neutral-600'
                    }`}>{m.similarity}% match</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-8 text-center">
                <p className="text-neutral-500 mb-4">No colors in our catalog match closely enough. Suggest this color?</p>
                <button onClick={() => {/* handled by parent tab switch if needed */}} className="text-sm font-semibold text-neutral-900 underline">Suggest this color →</button>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && <p className="text-center text-neutral-400 py-10">Loading catalog colors…</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════
   2. COLOR SUGGESTION
   ═══════════════════════════════════════════ */
const WEB3FORMS_ACCESS_KEY = 'd3adc8c3-08fc-4141-b63a-133586243760';

function ColorSuggestion({ allProducts }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', hexCode: '#ff6b6b', product: '', notes: '' });
  const [result, setResult] = useState('');
  const [mySuggestions, setMySuggestions] = useState([]);
  const [loadingMine, setLoadingMine] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoadingMine(true);
    colorSuggestions.mine()
      .then((res) => setMySuggestions(res.data?.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingMine(false));
  }, [user, result]);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!form.name || !form.hexCode) return;
    setResult('Sending....');
    const formData = new FormData();
    formData.append('access_key', WEB3FORMS_ACCESS_KEY);
    formData.append('name', form.name);
    formData.append('hexCode', form.hexCode);
    formData.append('product', form.product);
    formData.append('notes', form.notes);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setResult('Form Submitted Successfully');
        setForm({ name: '', hexCode: '#ff6b6b', product: '', notes: '' });
      } else {
        setResult('Error');
      }
    } catch {
      setResult('Error');
    }
  };

  if (!user) {
    return (
      <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-10 text-center">
        <p className="text-neutral-500 mb-4">Please log in to suggest new colors.</p>
        <Link to="/login" className="text-sm font-semibold text-neutral-900 underline">Log in →</Link>
      </div>
    );
  }

  const statusStyles = { pending: 'bg-amber-100 text-amber-700', approved: 'bg-emerald-100 text-emerald-700', rejected: 'bg-red-100 text-red-700' };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
      {/* form */}
      <div className="lg:col-span-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-neutral-900 mb-1">Suggest a new color</h3>
          <p className="text-neutral-500 text-sm mb-6">Can't find the shade you need? Suggest it and our team will review it.</p>

          {result === 'Form Submitted Successfully' && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm">
              Color suggestion submitted! Our team will review it shortly.
              <button type="button" onClick={() => setResult('')} className="ml-2 underline">Submit another</button>
            </div>
          )}
          {result === 'Error' && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm">
              Something went wrong. Please try again.
              <button type="button" onClick={() => setResult('')} className="ml-2 underline">Dismiss</button>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Color name *</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sunset Coral" className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Color code *</label>
                <div className="flex gap-2">
                  <input type="color" value={form.hexCode} onChange={(e) => setForm({ ...form, hexCode: e.target.value })} className="w-12 h-10 rounded-lg border border-neutral-300 cursor-pointer p-0.5" />
                  <input type="text" value={form.hexCode} onChange={(e) => setForm({ ...form, hexCode: e.target.value })} className="flex-1 px-4 py-2.5 rounded-lg border border-neutral-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-900" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">For product (optional)</label>
              <select value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-900">
                <option value="">Select a product</option>
                {allProducts.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Notes</label>
              <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Describe the shade, reference image link, etc." className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-900" />
            </div>

            {/* preview */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-100">
              <div className="w-14 h-14 rounded-xl border-2 border-white shadow-md shrink-0" style={{ backgroundColor: form.hexCode }} />
              <div>
                <p className="text-sm font-semibold text-neutral-800">{form.name || 'Color preview'}</p>
                <p className="text-xs font-mono text-neutral-400">{form.hexCode}</p>
              </div>
            </div>

            <button type="submit" disabled={result === 'Sending....'} className="px-6 py-3 rounded-xl bg-neutral-900 text-white font-semibold text-sm hover:bg-neutral-800 transition-all shadow-lg disabled:opacity-50">
              {result === 'Sending....' ? 'Sending....' : 'Submit suggestion'}
            </button>
          </form>
        </div>
      </div>

      {/* my suggestions */}
      <div className="lg:col-span-2">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Your suggestions</h3>
        {loadingMine ? (
          <p className="text-neutral-400 text-sm">Loading…</p>
        ) : mySuggestions.length === 0 ? (
          <p className="text-neutral-400 text-sm">No suggestions yet.</p>
        ) : (
          <div className="space-y-3">
            {mySuggestions.map((s) => (
              <div key={s._id} className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 bg-white">
                <div className="w-10 h-10 rounded-lg shrink-0 border border-neutral-200" style={{ backgroundColor: s.hexCode }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800 truncate">{s.name}</p>
                  <p className="text-xs text-neutral-400 font-mono">{s.hexCode}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyles[s.status] ?? ''}`}>{s.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   3. COLOR VISUALIZER
   ═══════════════════════════════════════════ */
const productShapes = [
  { id: 'lips', label: 'Lips', path: 'M12 2C8 2 4 6.5 4 10c0 2 1 3.5 2 4.5C7.5 16 9.5 17 12 17s4.5-1 6-2.5c1-1 2-2.5 2-4.5 0-3.5-4-8-8-8z' },
  { id: 'nails', label: 'Nails', path: 'M8 22V12a4 4 0 018 0v10M6 12a6 6 0 0112 0' },
  { id: 'circle', label: 'Swatch', path: null },
];

function ColorVisualizer({ allColors }) {
  const [selectedColor, setSelectedColor] = useState(null);
  const [shape, setShape] = useState('circle');
  const [search, setSearch] = useState('');

  const filtered = allColors.filter((c) => c.hexCode && (
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.hexCode.toLowerCase().includes(search.toLowerCase())
  ));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
      {/* preview */}
      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 flex flex-col items-center justify-center min-h-[360px] sticky top-24">
          {selectedColor ? (
            <>
              {shape === 'circle' ? (
                <div className="w-48 h-48 rounded-full border-4 border-white shadow-2xl transition-colors duration-500" style={{ backgroundColor: selectedColor.hexCode }} />
              ) : shape === 'lips' ? (
                <svg viewBox="0 0 120 80" className="w-56 h-40">
                  <ellipse cx="60" cy="50" rx="50" ry="28" fill={selectedColor.hexCode} stroke="white" strokeWidth="2" />
                  <path d="M10 50 Q60 30 110 50" fill="none" stroke="white" strokeWidth="1.5" opacity="0.5" />
                </svg>
              ) : (
                <svg viewBox="0 0 60 100" className="w-28 h-44">
                  <rect x="10" y="0" width="40" height="100" rx="20" fill={selectedColor.hexCode} stroke="white" strokeWidth="2" />
                  <ellipse cx="30" cy="20" rx="18" ry="18" fill={selectedColor.hexCode} stroke="white" strokeWidth="1.5" />
                </svg>
              )}
              <h3 className="text-lg font-bold text-neutral-900 mt-6">{selectedColor.name}</h3>
              <p className="text-sm font-mono text-neutral-400">{selectedColor.hexCode}</p>
            </>
          ) : (
            <div className="text-center text-neutral-400">
              <svg className="w-16 h-16 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <p className="text-sm">Select a color to preview</p>
            </div>
          )}

          {/* shape selector */}
          <div className="flex gap-2 mt-6">
            {productShapes.map((s) => (
              <button key={s.id} onClick={() => setShape(s.id)} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${shape === s.id ? 'bg-neutral-900 text-white' : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-400'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* color picker grid */}
      <div className="lg:col-span-3">
        <input
          type="text"
          placeholder="Search colors…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-900"
        />
        <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-2">
          {filtered.slice(0, 60).map((c) => (
            <button
              key={c._id}
              onClick={() => setSelectedColor(c)}
              title={`${c.name} — ${c.hexCode}`}
              className={`aspect-square rounded-xl border-2 transition-all hover:scale-110 hover:shadow-lg ${
                selectedColor?._id === c._id ? 'border-neutral-900 ring-2 ring-neutral-900/20 scale-110' : 'border-white shadow-sm'
              }`}
              style={{ backgroundColor: c.hexCode }}
            />
          ))}
        </div>
        {filtered.length === 0 && <p className="text-neutral-400 text-sm text-center py-8">No colors found.</p>}
      </div>
    </div>
  );
}
