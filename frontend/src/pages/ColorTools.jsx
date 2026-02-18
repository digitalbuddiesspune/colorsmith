import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FilesetResolver, FaceLandmarker, HandLandmarker } from '@mediapipe/tasks-vision';
import { colors as colorsApi, products as productsApi, colorSuggestions } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { scrollToTop } from '../utility/scrollToTop';

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
  { id: 'detect', label: 'Face & Nail Detect', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" /></svg> },
];

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */
export default function ColorTools() {
  const [activeTab, setActiveTab] = useState('match');
  const [allColors, setAllColors] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [suggestionPrefill, setSuggestionPrefill] = useState(null);
  const [detectApplyColorPrefill, setDetectApplyColorPrefill] = useState(null);

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

  const handleAddToSuggestion = useCallback((hexCode) => {
    setSuggestionPrefill({ hexCode: hexCode || '#ff6b6b' });
    setActiveTab('suggest');
    scrollToTop();
  }, []);

  const handleApplyOnLipsNails = useCallback((hexCode) => {
    setDetectApplyColorPrefill(hexCode || '#e11d48');
    setActiveTab('detect');
    scrollToTop();
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

      {activeTab === 'match' && <AIColorMatch allColors={allColors} loading={loadingData} onAddToSuggestion={handleAddToSuggestion} onApplyOnLipsNails={handleApplyOnLipsNails} />}
      {activeTab === 'suggest' && <ColorSuggestion allProducts={allProducts} suggestionPrefill={suggestionPrefill} onPrefillConsumed={() => setSuggestionPrefill(null)} />}
      {activeTab === 'visualize' && <ColorVisualizer allColors={allColors} />}
      {activeTab === 'detect' && <FaceNailDetect onAddToSuggestion={handleAddToSuggestion} applyColorPrefill={detectApplyColorPrefill} onApplyColorPrefillConsumed={() => setDetectApplyColorPrefill(null)} />}
    </div>
  );
}

/* ═══════════════════════════════════════════
   1. AI COLOR MATCH
   ═══════════════════════════════════════════ */
function AIColorMatch({ allColors, loading, onAddToSuggestion, onApplyOnLipsNails }) {
  const canvasRef = useRef(null);
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const imageRef = useRef(null);
  const pickerContainerRef = useRef(null);
  const [extractedColor, setExtractedColor] = useState(null);
  const [matches, setMatches] = useState([]);
  const [imgPreview, setImgPreview] = useState(null);
  const [imageDimensions, setImageDimensions] = useState(null);
  const [pickerPosition, setPickerPosition] = useState({ x: 0.5, y: 0.5 });
  const [cameraOpen, setCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  const computeMatches = useCallback((avg) => {
    return allColors
      .filter((c) => c.hexCode)
      .map((c) => {
        const rgb = hexToRgb(c.hexCode);
        const dist = colorDistance(avg, rgb);
        const similarity = Math.round((1 - dist / MAX_DIST) * 100);
        return { ...c, similarity };
      })
      .filter((c) => c.similarity >= 50)
      .sort((a, b) => b.similarity - a.similarity);
  }, [allColors]);

  const extractColorAtPicker = useCallback(() => {
    if (!imgPreview || !imageDimensions) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const px = Math.round(pickerPosition.x * img.width);
      const py = Math.round(pickerPosition.y * img.height);
      const radius = 2;
      const sx = Math.max(0, px - radius);
      const sy = Math.max(0, py - radius);
      const sw = Math.min(img.width - sx, radius * 2 + 1);
      const sh = Math.min(img.height - sy, radius * 2 + 1);
      const data = ctx.getImageData(sx, sy, sw, sh).data;
      let rT = 0, gT = 0, bT = 0, count = 0;
      for (let i = 0; i < data.length; i += 4) {
        rT += data[i]; gT += data[i + 1]; bT += data[i + 2]; count++;
      }
      const avg = { r: Math.round(rT / count), g: Math.round(gT / count), b: Math.round(bT / count) };
      const hex = rgbToHex(avg.r, avg.g, avg.b);
      setExtractedColor({ ...avg, hex });
      setMatches(computeMatches(avg));
    };
    img.src = imgPreview;
  }, [imgPreview, imageDimensions, pickerPosition, computeMatches]);

  const handleImageLoad = useCallback(() => {
    const img = imageRef.current;
    if (!img || !img.naturalWidth) return;
    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    setPickerPosition({ x: 0.5, y: 0.5 });
    setExtractedColor(null);
    setMatches([]);
  }, []);

  const handlePickerAreaClick = useCallback((e) => {
    const el = pickerContainerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setPickerPosition({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) });
  }, []);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImgPreview(url);
    setImageDimensions(null);
    setExtractedColor(null);
    setMatches([]);
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
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const url = canvas.toDataURL('image/png');
    setImgPreview(url);
    setImageDimensions(null);
    setExtractedColor(null);
    setMatches([]);
    stopCamera();
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCameraOpen(false);
    setCameraError(null);
  };

  const reset = () => {
    setExtractedColor(null);
    setMatches([]);
    setImgPreview(null);
    setImageDimensions(null);
    setPickerPosition({ x: 0.5, y: 0.5 });
    setCameraError(null);
    stopCamera();
  };

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

      {/* camera view — full frame with padding, no crop */}
      {cameraOpen && (
        <div className="rounded-2xl overflow-hidden bg-neutral-900 p-4 relative">
          <div className="flex justify-center items-center min-h-[300px]">
            <video ref={videoRef} autoPlay playsInline muted className="max-w-full max-h-[70vh] w-auto h-auto object-contain" />
          </div>
          <div className="flex justify-center gap-3 mt-4 pb-2">
            <button onClick={capturePhoto} className="px-6 py-3 rounded-full bg-white text-neutral-900 font-semibold text-sm shadow-lg">Capture</button>
            <button onClick={stopCamera} className="px-6 py-3 rounded-full bg-white/20 text-white font-semibold text-sm backdrop-blur-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* result — full-length image with padding, picker, Extract, then color + matches */}
      {imgPreview && (
        <div className="space-y-8">
          {/* Full-length image with padding (no crop), picker overlay, Extract button */}
          <div className="rounded-2xl border border-neutral-200 bg-neutral-100 p-4 sm:p-6">
            <p className="text-sm text-neutral-600 mb-3">Move the picker to any point on the image, then click Extract to get that color.</p>
            <div
              ref={pickerContainerRef}
              className="relative mx-auto bg-neutral-200 rounded-xl overflow-hidden cursor-crosshair flex justify-center items-center min-h-[280px] max-h-[70vh]"
              style={imageDimensions ? { aspectRatio: `${imageDimensions.width} / ${imageDimensions.height}`, maxWidth: '100%' } : undefined}
              onClick={handlePickerAreaClick}
              onKeyDown={(e) => e.key === 'Enter' && extractColorAtPicker()}
              role="button"
              tabIndex={0}
              aria-label="Click to move color picker"
            >
              <img
                ref={imageRef}
                src={imgPreview}
                alt="Captured"
                className="absolute inset-0 w-full h-full object-contain"
                onLoad={handleImageLoad}
                draggable={false}
                style={{ pointerEvents: 'none' }}
              />
              {imageDimensions && (
                <>
                  <div
                    className="absolute w-8 h-8 border-2 border-white shadow-lg rounded-full pointer-events-none ring-2 ring-neutral-900/40 z-10"
                    style={{
                      left: `${pickerPosition.x * 100}%`,
                      top: `${pickerPosition.y * 100}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                  <div
                    className="absolute w-2 h-2 rounded-full bg-white border border-neutral-900 pointer-events-none z-10"
                    style={{
                      left: `${pickerPosition.x * 100}%`,
                      top: `${pickerPosition.y * 100}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                </>
              )}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={extractColorAtPicker}
                disabled={!imageDimensions}
                className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white font-semibold text-sm hover:bg-neutral-800 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-lg"
              >
                Extract color
              </button>
              <button type="button" onClick={reset} className="text-sm text-neutral-500 hover:text-neutral-900 underline">
                Try another image
              </button>
            </div>
          </div>

          {/* Extracted color and matches — shown after Extract */}
          {extractedColor && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-neutral-200 p-6 flex flex-col items-center justify-center text-center bg-white">
                  <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-xl mb-4" style={{ backgroundColor: extractedColor.hex }} />
                  <h3 className="text-lg font-bold text-neutral-900 mb-1">Extracted Color</h3>
                  <p className="text-neutral-500 text-sm font-mono">{extractedColor.hex.toUpperCase()}</p>
                  <p className="text-neutral-400 text-xs mt-1">RGB({extractedColor.r}, {extractedColor.g}, {extractedColor.b})</p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    {onAddToSuggestion && (
                      <button
                        type="button"
                        onClick={() => onAddToSuggestion(extractedColor.hex)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-all shadow"
                      >
                        Add to color suggestion
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                      </button>
                    )}
                    {onApplyOnLipsNails && (
                      <button
                        type="button"
                        onClick={() => onApplyOnLipsNails(extractedColor.hex)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-neutral-900 text-neutral-900 text-sm font-semibold hover:bg-neutral-100 transition-all"
                      >
                        Try on lips & nails
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                      </button>
                    )}
                  </div>
                </div>
                <div className="rounded-2xl border border-neutral-200 p-6 flex flex-col items-center justify-center text-center bg-white">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                    {matches.length > 0 ? `${matches.length} catalog match${matches.length !== 1 ? 'es' : ''} found` : 'No close matches found'}
                  </h3>
                  {matches.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
                      {matches.slice(0, 6).map((m) => (
                        <div key={m._id} className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full border-2 border-white shadow shrink-0" style={{ backgroundColor: m.hexCode }} />
                          <span className="text-xs font-mono text-neutral-500 truncate w-full text-center mt-1">{m.hexCode}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-neutral-500 text-sm">No catalog colors match closely.</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Catalog matches</h3>
                {matches.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {matches.slice(0, 12).map((m) => {
                      const productId = m.product?._id ?? m.product;
                      return (
                        <div key={m._id} className="rounded-xl border border-neutral-200 bg-white p-4 flex flex-col items-center text-center">
                          <div className="w-14 h-14 rounded-full border-2 border-white shadow-md mb-3" style={{ backgroundColor: m.hexCode }} />
                          <span className="text-sm font-medium text-neutral-800 mb-1 truncate w-full">{m.name}</span>
                          <span className="text-xs font-mono text-neutral-400 mb-2">{m.hexCode}</span>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full mb-3 ${
                            m.similarity >= 90 ? 'bg-emerald-100 text-emerald-700' :
                            m.similarity >= 75 ? 'bg-amber-100 text-amber-700' :
                            'bg-neutral-100 text-neutral-600'
                          }`}>{m.similarity}% match</span>
                          {productId && (
                            <Link
                              to={`/product/${productId}`}
                              onClick={scrollToTop}
                              className="text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              View product
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-8 text-center">
                    <p className="text-neutral-500 mb-4">No colors in our catalog match closely enough. Suggest this color?</p>
                    {onAddToSuggestion && (
                      <button type="button" onClick={() => onAddToSuggestion(extractedColor.hex)} className="text-sm font-semibold text-neutral-900 underline">Add to color suggestion →</button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
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

function ColorSuggestion({ allProducts, suggestionPrefill, onPrefillConsumed }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', hexCode: '#ff6b6b', product: '', notes: '' });
  const [result, setResult] = useState('');
  const [mySuggestions, setMySuggestions] = useState([]);
  const [loadingMine, setLoadingMine] = useState(false);

  useEffect(() => {
    if (suggestionPrefill?.hexCode) {
      setForm((prev) => ({ ...prev, hexCode: suggestionPrefill.hexCode }));
      onPrefillConsumed?.();
    }
  }, [suggestionPrefill, onPrefillConsumed]);

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
    const productName = form.product ? (allProducts.find((p) => p._id === form.product)?.name ?? '') : '';
    const formData = new FormData();
    formData.append('access_key', WEB3FORMS_ACCESS_KEY);
    formData.append('name', form.name);
    formData.append('hexCode', form.hexCode);
    formData.append('product', productName);
    formData.append('notes', form.notes);

    try {
      const [web3Res, apiPayload] = await Promise.all([
        fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData }),
        colorSuggestions.create({
          name: form.name.trim(),
          hexCode: form.hexCode.trim(),
          product: form.product || undefined,
          notes: form.notes?.trim() || undefined,
        }).then((r) => r.data).catch(() => null),
      ]);
      const web3Data = await web3Res.json();
      if (web3Data.success) {
        setResult('Form Submitted Successfully');
        setForm({ name: '', hexCode: '#ff6b6b', product: '', notes: '' });
        if (apiPayload?.data) {
          setMySuggestions((prev) => [apiPayload.data, ...prev]);
        }
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

/* ───────── Lip contours: upper and lower (MediaPipe face mesh) ───────── */
// const UPPER_OUTER_LIP = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291];
// const LOWER_OUTER_LIP = [291, 375, 321, 405, 314, 17, 84, 181, 91, 146, 61];

// const FINGERTIP_INDICES = [4, 8, 12, 16, 20];

/* ═══════════════════════════════════════════
   3. FACE & NAIL DETECT (MediaPipe)
   ═══════════════════════════════════════════ */
// function FaceNailDetect({ onAddToSuggestion, applyColorPrefill, onApplyColorPrefillConsumed }) {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const rafRef = useRef(null);
//   const [stream, setStream] = useState(null);
//   const [cameraOpen, setCameraOpen] = useState(false);
//   const [cameraError, setCameraError] = useState(null);
//   const [modelsReady, setModelsReady] = useState(false);
//   const [modelsError, setModelsError] = useState(null);
//   const [applyColor, setApplyColor] = useState('#e11d48');
//   const faceLandmarkerRef = useRef(null);
//   const handLandmarkerRef = useRef(null);

//   useEffect(() => {
//     if (applyColorPrefill) {
//       setApplyColor(applyColorPrefill);
//       onApplyColorPrefillConsumed?.();
//     }
//   }, [applyColorPrefill, onApplyColorPrefillConsumed]);

//   const wasmPath = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm';
//   const faceModelPath = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
//   const handModelPath = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       try {
//         const vision = await FilesetResolver.forVisionTasks(wasmPath);
//         if (cancelled) return;
//         const face = await FaceLandmarker.createFromOptions(vision, {
//           baseOptions: { modelAssetPath: faceModelPath },
//           runningMode: 'VIDEO',
//           numFaces: 1,
//         });
//         if (cancelled) return;
//         faceLandmarkerRef.current = face;
//         const hand = await HandLandmarker.createFromOptions(vision, {
//           baseOptions: { modelAssetPath: handModelPath },
//           runningMode: 'VIDEO',
//           numHands: 2,
//         });
//         if (cancelled) return;
//         handLandmarkerRef.current = hand;
//         setModelsReady(true);
//       } catch (err) {
//         if (!cancelled) setModelsError(err?.message || 'Failed to load detection models.');
//       }
//     })();
//     return () => {
//       cancelled = true;
//       faceLandmarkerRef.current?.close?.();
//       handLandmarkerRef.current?.close?.();
//     };
//   }, []);

//   const drawLandmarks = useCallback((ctx, width, height, faceResult, handResult, colorHex) => {
//     ctx.clearRect(0, 0, width, height);
//     const scaleX = (x) => x * width;
//     const scaleY = (y) => y * height;
//     const hex = colorHex || '#e11d48';

//     if (faceResult?.faceLandmarks?.length > 0) {
//       const landmarks = faceResult.faceLandmarks[0];
//       if (!landmarks.length) return;

//       const pt = (i) => {
//         const l = landmarks[i];
//         return l ? [scaleX(l.x), scaleY(l.y)] : null;
//       };

//       const drawContour = (indices, fillWithColor = false) => {
//         const points = indices.map((i) => pt(i)).filter(Boolean);
//         if (points.length < 2) return;
//         ctx.beginPath();
//         ctx.moveTo(points[0][0], points[0][1]);
//         for (let k = 1; k < points.length; k++) ctx.lineTo(points[k][0], points[k][1]);
//         ctx.closePath();
//         if (fillWithColor) {
//           ctx.fillStyle = hex + 'cc';
//           ctx.fill();
//           ctx.strokeStyle = hex;
//           ctx.lineWidth = 1;
//           ctx.stroke();
//         } else {
//           ctx.stroke();
//         }
//       };

//       drawContour(UPPER_OUTER_LIP.filter((i) => i < landmarks.length), true);
//       drawContour(LOWER_OUTER_LIP.filter((i) => i < landmarks.length), true);
//     }

//     if (handResult?.landmarks?.length > 0) {
//       ctx.fillStyle = hex + 'cc';
//       handResult.landmarks.forEach((handLms) => {
//         FINGERTIP_INDICES.forEach((idx) => {
//           const l = handLms[idx];
//           if (!l) return;
//           const x = scaleX(l.x);
//           const y = scaleY(l.y);
//           ctx.beginPath();
//           ctx.arc(x, y, Math.min(width, height) * 0.025, 0, Math.PI * 2);
//           ctx.fill();
//           ctx.strokeStyle = hex;
//           ctx.lineWidth = 1;
//           ctx.stroke();
//         });
//       });
//     }
//   }, []);

//   const detectLoop = useCallback(() => {
//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     if (!video || !canvas || !modelsReady || !video.videoWidth) {
//       rafRef.current = requestAnimationFrame(detectLoop);
//       return;
//     }
//     const faceLandmarker = faceLandmarkerRef.current;
//     const handLandmarker = handLandmarkerRef.current;
//     if (!faceLandmarker || !handLandmarker) {
//       rafRef.current = requestAnimationFrame(detectLoop);
//       return;
//     }
//     const w = video.videoWidth;
//     const h = video.videoHeight;
//     if (canvas.width !== w || canvas.height !== h) {
//       canvas.width = w;
//       canvas.height = h;
//     }
//     const timestamp = performance.now();
//     let faceResult = null;
//     let handResult = null;
//     try {
//       faceResult = faceLandmarker.detectForVideo(video, timestamp);
//       handResult = handLandmarker.detectForVideo(video, timestamp);
//     } catch (_) {}
//     const ctx = canvas.getContext('2d');
//     if (ctx) drawLandmarks(ctx, w, h, faceResult, handResult, applyColor);
//     rafRef.current = requestAnimationFrame(detectLoop);
//   }, [modelsReady, drawLandmarks, applyColor]);

//   useEffect(() => {
//     if (!cameraOpen || !modelsReady) return;
//     rafRef.current = requestAnimationFrame(detectLoop);
//     return () => cancelAnimationFrame(rafRef.current);
//   }, [cameraOpen, modelsReady, detectLoop]);

//   const openCamera = async () => {
//     setCameraError(null);
//     if (!navigator.mediaDevices?.getUserMedia) {
//       setCameraError('Camera not supported. Use a modern browser with camera access.');
//       return;
//     }
//     try {
//       const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } });
//       setStream(s);
//       setCameraOpen(true);
//       setTimeout(() => {
//         if (videoRef.current) videoRef.current.srcObject = s;
//       }, 50);
//     } catch (err) {
//       const denied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
//       setCameraError(denied ? 'Camera access denied. Allow camera in browser settings.' : 'Could not access camera.');
//     }
//   };

//   const stopCamera = () => {
//     stream?.getTracks().forEach((t) => t.stop());
//     setStream(null);
//     setCameraOpen(false);
//     setCameraError(null);
//   };

//   if (!modelsReady && !modelsError) {
//     return (
//       <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-10 text-center">
//         <p className="text-neutral-500">Loading face and hand detection models…</p>
//       </div>
//     );
//   }

//   if (modelsError) {
//     return (
//       <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
//         <p className="text-amber-800 mb-2">Models could not be loaded.</p>
//         <p className="text-sm text-amber-700 mb-4">{modelsError}</p>
//         <p className="text-xs text-neutral-500">Check your network and try again.</p>
//       </div>
//     );
//   }

//   return (
//     <div>
//       {!cameraOpen ? (
//         <div className="border-2 border-dashed border-neutral-300 rounded-2xl p-10 text-center bg-neutral-50">
//           <div className="w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center mx-auto mb-5">
//             <svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" /></svg>
//           </div>
//           <h3 className="text-lg font-semibold text-neutral-900 mb-2">Detect face, lips, eyes & nails</h3>
//           <p className="text-neutral-500 text-sm mb-6 max-w-md mx-auto">
//             Use your camera to see real-time detection of your face outline, lips, eyes, and fingernails (fingertips). Great for trying shades.
//           </p>
//           <button onClick={openCamera} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-neutral-900 text-white font-semibold text-sm hover:bg-neutral-800 transition-all shadow-lg">
//             Start camera
//           </button>
//           {cameraError && <p className="mt-4 text-sm text-amber-600">{cameraError}</p>}
//         </div>
//       ) : (
//         <div className="space-y-4">
//           <div className="relative rounded-2xl overflow-hidden bg-black inline-block w-full max-w-2xl">
//             <video ref={videoRef} autoPlay playsInline muted className="w-full max-h-[480px] object-cover" />
//             <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ maxHeight: '480px' }} />
//             <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
//               <button onClick={stopCamera} className="px-6 py-3 rounded-full bg-white text-neutral-900 font-semibold text-sm shadow-lg">Stop camera</button>
//             </div>
//             <div className="absolute top-2 left-2 text-white/90 text-xs">
//               <span className="bg-white/20 px-2 py-0.5 rounded">Lips & nails (your color)</span>
//             </div>
//           </div>
//           <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl border border-neutral-200 bg-white">
//             <span className="text-sm font-medium text-neutral-700">Apply color on lips & nails:</span>
//             <input
//               type="color"
//               value={applyColor}
//               onChange={(e) => setApplyColor(e.target.value)}
//               className="w-12 h-10 rounded-lg border border-neutral-300 cursor-pointer p-0.5"
//             />
//             <input
//               type="text"
//               value={applyColor}
//               onChange={(e) => setApplyColor(e.target.value)}
//               className="w-24 px-3 py-2 rounded-lg border border-neutral-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
//             />
//             {onAddToSuggestion && (
//               <button
//                 type="button"
//                 onClick={() => onAddToSuggestion(applyColor)}
//                 className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-all shadow"
//               >
//                 Add to color suggestion
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
//               </button>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

const UPPER_OUTER_LIP = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291];
const LOWER_OUTER_LIP = [291, 375, 321, 405, 314, 17, 84, 181, 91, 146, 61];

const FINGERTIP_INDICES = [4, 8, 12, 16, 20];

/* ═══════════════════════════════════════════
   3. FACE & NAIL DETECT (MediaPipe)
   ═══════════════════════════════════════════ */
function FaceNailDetect({ onAddToSuggestion, applyColorPrefill, onApplyColorPrefillConsumed }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [modelsReady, setModelsReady] = useState(false);
  const [modelsError, setModelsError] = useState(null);
  const [applyColor, setApplyColor] = useState('#e11d48');
  const faceLandmarkerRef = useRef(null);
  const handLandmarkerRef = useRef(null);

  useEffect(() => {
    if (applyColorPrefill) {
      setApplyColor(applyColorPrefill);
      onApplyColorPrefillConsumed?.();
    }
  }, [applyColorPrefill, onApplyColorPrefillConsumed]);

  const wasmPath = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm';
  const faceModelPath = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
  const handModelPath = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(wasmPath);
        if (cancelled) return;
        const face = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: faceModelPath },
          runningMode: 'VIDEO',
          numFaces: 1,
        });
        if (cancelled) return;
        faceLandmarkerRef.current = face;
        const hand = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: handModelPath },
          runningMode: 'VIDEO',
          numHands: 2,
        });
        if (cancelled) return;
        handLandmarkerRef.current = hand;
        setModelsReady(true);
      } catch (err) {
        if (!cancelled) setModelsError(err?.message || 'Failed to load detection models.');
      }
    })();
    return () => {
      cancelled = true;
      faceLandmarkerRef.current?.close?.();
      handLandmarkerRef.current?.close?.();
    };
  }, []);

  const drawLandmarks = useCallback((ctx, width, height, faceResult, handResult, colorHex) => {
    ctx.clearRect(0, 0, width, height);
    const scaleX = (x) => x * width;
    const scaleY = (y) => y * height;
    const hex = colorHex || '#e11d48';

    if (faceResult?.faceLandmarks?.length > 0) {
      const landmarks = faceResult.faceLandmarks[0];
      if (!landmarks.length) return;

      const pt = (i) => {
        const l = landmarks[i];
        return l ? [scaleX(l.x), scaleY(l.y)] : null;
      };

      const drawContour = (indices, fillWithColor = false) => {
        const points = indices.map((i) => pt(i)).filter(Boolean);
        if (points.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (let k = 1; k < points.length; k++) ctx.lineTo(points[k][0], points[k][1]);
        ctx.closePath();
        if (fillWithColor) {
          ctx.fillStyle = hex + 'cc';
          ctx.fill();
          ctx.strokeStyle = hex;
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          ctx.stroke();
        }
      };

      drawContour(UPPER_OUTER_LIP.filter((i) => i < landmarks.length), true);
      drawContour(LOWER_OUTER_LIP.filter((i) => i < landmarks.length), true);
    }

    /* Nails: fingertip ellipses aligned to finger (DIP → TIP) */
    if (handResult?.landmarks?.length > 0) {
      const base = Math.min(width, height) * 0.02;
      handResult.landmarks.forEach((hand) => {
        FINGERTIP_INDICES.forEach((tipIdx) => {
          const dipIdx = tipIdx - 1;
          const tip = hand[tipIdx];
          const dip = hand[dipIdx];
          if (!tip || !dip) return;
          const tx = scaleX(tip.x);
          const ty = scaleY(tip.y);
          const dx = scaleX(dip.x);
          const dy = scaleY(dip.y);
          const angle = Math.atan2(ty - dy, tx - dx);
          const len = Math.hypot(tx - dx, ty - dy) || 1;
          const nailLen = Math.min(len * 0.85, base * 2.2);
          const nailW = base * 1.5;
          ctx.save();
          ctx.translate(tx, ty);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.ellipse(0, 0, nailW, nailLen, 0, 0, Math.PI * 2);
          ctx.fillStyle = hex + 'cc';
          ctx.fill();
          ctx.strokeStyle = hex + 'aa';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();
        });
      });
    }
  }, []);

  const detectLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !modelsReady || !video.videoWidth) {
      rafRef.current = requestAnimationFrame(detectLoop);
      return;
    }
    const faceLandmarker = faceLandmarkerRef.current;
    const handLandmarker = handLandmarkerRef.current;
    if (!faceLandmarker || !handLandmarker) {
      rafRef.current = requestAnimationFrame(detectLoop);
      return;
    }
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const timestamp = performance.now();
    let faceResult = null;
    let handResult = null;
    try {
      faceResult = faceLandmarker.detectForVideo(video, timestamp);
      handResult = handLandmarker.detectForVideo(video, timestamp);
    } catch (_) {}
    const ctx = canvas.getContext('2d');
    if (ctx) drawLandmarks(ctx, w, h, faceResult, handResult, applyColor);
    rafRef.current = requestAnimationFrame(detectLoop);
  }, [modelsReady, drawLandmarks, applyColor]);

  useEffect(() => {
    if (!cameraOpen || !modelsReady) return;
    rafRef.current = requestAnimationFrame(detectLoop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [cameraOpen, modelsReady, detectLoop]);

  const openCamera = async () => {
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera not supported. Use a modern browser with camera access.');
      return;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } });
      setStream(s);
      setCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = s;
      }, 50);
    } catch (err) {
      const denied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
      setCameraError(denied ? 'Camera access denied. Allow camera in browser settings.' : 'Could not access camera.');
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCameraOpen(false);
    setCameraError(null);
  };

  if (!modelsReady && !modelsError) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-10 text-center">
        <p className="text-neutral-500">Loading face and hand detection models…</p>
      </div>
    );
  }

  if (modelsError) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
        <p className="text-amber-800 mb-2">Models could not be loaded.</p>
        <p className="text-sm text-amber-700 mb-4">{modelsError}</p>
        <p className="text-xs text-neutral-500">Check your network and try again.</p>
      </div>
    );
  }

  return (
    <div>
      {!cameraOpen ? (
        <div className="border-2 border-dashed border-neutral-300 rounded-2xl p-10 text-center bg-neutral-50">
          <div className="w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" /></svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Detect face & lips</h3>
          <p className="text-neutral-500 text-sm mb-6 max-w-md mx-auto">
            Use your camera to see real-time detection of your lips. Great for trying lipstick shades.
          </p>
          <button onClick={openCamera} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-neutral-900 text-white font-semibold text-sm hover:bg-neutral-800 transition-all shadow-lg">
            Start camera
          </button>
          {cameraError && <p className="mt-4 text-sm text-amber-600">{cameraError}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-black inline-block w-full max-w-2xl">
            <video ref={videoRef} autoPlay playsInline muted className="w-full max-h-[480px] object-cover" />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ maxHeight: '480px' }} />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              <button onClick={stopCamera} className="px-6 py-3 rounded-full bg-white text-neutral-900 font-semibold text-sm shadow-lg">Stop camera</button>
            </div>
            <div className="absolute top-2 left-2 text-white/90 text-xs">
              <span className="bg-white/20 px-2 py-0.5 rounded">Lips only</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl border border-neutral-200 bg-white">
            <span className="text-sm font-medium text-neutral-700">Apply color on lips:</span>
            <input
              type="color"
              value={applyColor}
              onChange={(e) => setApplyColor(e.target.value)}
              className="w-12 h-10 rounded-lg border border-neutral-300 cursor-pointer p-0.5"
            />
            <input
              type="text"
              value={applyColor}
              onChange={(e) => setApplyColor(e.target.value)}
              className="w-24 px-3 py-2 rounded-lg border border-neutral-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
            />
            {onAddToSuggestion && (
              <button
                type="button"
                onClick={() => onAddToSuggestion(applyColor)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-all shadow"
              >
                Add to color suggestion
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}