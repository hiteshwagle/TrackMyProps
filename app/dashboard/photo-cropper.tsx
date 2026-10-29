'use client';
import { useEffect, useRef, useState } from 'react';
import { Crop, LoaderCircle, RotateCcw, X } from 'lucide-react';
import { cropRect, cropAndCompress } from '../../lib/photo-processing';
import { uploadLimits } from '../../lib/resources-domain';
export default function PhotoCropper({
  files,
  onUpload,
  onFinish,
}: {
  files: File[];
  onUpload: (file: File) => Promise<void>;
  onFinish: (saved: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [ratio, setRatio] = useState('4:3');
  const [zoom, setZoom] = useState(1);
  const [horizontal, setHorizontal] = useState(50);
  const [vertical, setVertical] = useState(50);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState('');
  const saved = useRef(0);
  const canvas = useRef<HTMLCanvasElement>(null);
  const file = files[index];
  useEffect(() => {
    setImage(null);
    setError('');
    setZoom(1);
    setHorizontal(50);
    setVertical(50);
    setRatio('4:3');
    const url = URL.createObjectURL(file);
    const next = new Image();
    next.onload = () => {
      if (next.naturalWidth * next.naturalHeight > 50000000) {
        setError('This photo exceeds 50 megapixels. Choose a smaller source photo.');
        return;
      }
      setImage(next);
    };
    next.onerror = () =>
      setError('This photo could not be opened. Choose a JPG, PNG or WebP image.');
    next.src = url;
    return () => {
      next.onload = null;
      next.onerror = null;
      URL.revokeObjectURL(url);
    };
  }, [file]);
  const aspect =
    ratio === 'original' && image
      ? image.naturalWidth / image.naturalHeight
      : ratio === '1:1'
        ? 1
        : ratio === '16:9'
          ? 16 / 9
          : 4 / 3;
  useEffect(() => {
    const preview = canvas.current;
    if (!image || !preview) return;
    preview.width = 800;
    preview.height = Math.round(800 / aspect);
    const ctx = preview.getContext('2d');
    if (!ctx) return;
    const rect = cropRect(
      image.naturalWidth,
      image.naturalHeight,
      aspect,
      zoom,
      horizontal,
      vertical,
    );
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, preview.width, preview.height);
    ctx.drawImage(
      image,
      rect.x,
      rect.y,
      rect.width,
      rect.height,
      0,
      0,
      preview.width,
      preview.height,
    );
  }, [image, aspect, zoom, horizontal, vertical]);
  function next() {
    if (index + 1 === files.length) onFinish(saved.current);
    else setIndex((i) => i + 1);
  }
  async function save() {
    if (!image) return;
    setBusy(true);
    setError('');
    try {
      setStage('Compressing photo…');
      const result = await cropAndCompress(
        image,
        cropRect(image.naturalWidth, image.naturalHeight, aspect, zoom, horizontal, vertical),
        file.name,
        uploadLimits.photoBytes,
      );
      setStage(`Uploading ${(result.size / 1000).toFixed(0)} KB photo…`);
      await onUpload(result);
      saved.current++;
      next();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      setStage('');
    }
  }
  return (
    <div className="photo-cropper">
      <div className="cropper-heading">
        <div>
          <h4>
            <Crop size={16} /> Crop & compress
          </h4>
          <p>
            Photo {index + 1} of {files.length} · {file.name}
          </p>
        </div>
        <button
          type="button"
          className="icon-button"
          aria-label="Cancel remaining photos"
          disabled={busy}
          onClick={() => onFinish(saved.current)}
        >
          <X size={18} />
        </button>
      </div>
      <p className="cropper-hint">
        Adjust your crop, then upload. Photos are resized without upscaling and saved as JPEGs at up
        to 800 KB. Smaller results are kept smaller.
      </p>
      {error && (
        <div className="alert error" role="alert">
          {error}
        </div>
      )}
      <div className="crop-preview" style={{ aspectRatio: aspect }}>
        {image ? (
          <canvas ref={canvas} aria-label="Photo crop preview" role="img" />
        ) : (
          <span>
            <LoaderCircle className="spin" size={20} />
            {error ? 'Unable to load photo' : 'Opening photo…'}
          </span>
        )}
      </div>
      <fieldset disabled={busy || !image} className="crop-controls">
        <label className="form-field">
          <span>Crop shape</span>
          <select value={ratio} onChange={(e) => setRatio(e.target.value)}>
            <option value="4:3">4:3 · Property photo</option>
            <option value="16:9">16:9 · Wide</option>
            <option value="1:1">1:1 · Square</option>
            <option value="original">Original proportions</option>
          </select>
        </label>
        <label className="crop-slider">
          <span>
            Zoom <b>{zoom.toFixed(2)}×</b>
          </span>
          <input
            aria-label="Photo zoom"
            type="range"
            min="1"
            max="4"
            step="0.01"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </label>
        <label className="crop-slider">
          <span>Move horizontally</span>
          <input
            aria-label="Horizontal crop position"
            type="range"
            min="0"
            max="100"
            value={horizontal}
            onChange={(e) => setHorizontal(Number(e.target.value))}
          />
        </label>
        <label className="crop-slider">
          <span>Move vertically</span>
          <input
            aria-label="Vertical crop position"
            type="range"
            min="0"
            max="100"
            value={vertical}
            onChange={(e) => setVertical(Number(e.target.value))}
          />
        </label>
      </fieldset>
      <div className="cropper-actions">
        <button
          type="button"
          className="text-link"
          disabled={busy}
          onClick={() => {
            setZoom(1);
            setHorizontal(50);
            setVertical(50);
          }}
        >
          <RotateCcw size={13} /> Reset crop
        </button>
        <button
          type="button"
          className="button button-outline button-small"
          disabled={busy}
          onClick={next}
        >
          Skip photo
        </button>
        <button
          type="button"
          className="button button-small"
          disabled={busy || !image}
          onClick={() => void save()}
        >
          {busy ? (
            <>
              <LoaderCircle size={14} className="spin" />
              {stage}
            </>
          ) : (
            <>Crop, compress & upload</>
          )}
        </button>
      </div>
    </div>
  );
}
