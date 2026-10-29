export type CropRect = { x: number; y: number; width: number; height: number };
export function cropRect(
  width: number,
  height: number,
  aspect: number,
  zoom = 1,
  horizontal = 50,
  vertical = 50,
): CropRect {
  if (
    ![width, height, aspect, zoom, horizontal, vertical].every(Number.isFinite) ||
    width <= 0 ||
    height <= 0 ||
    aspect <= 0
  )
    throw new Error('Invalid photo dimensions.');
  const scale = Math.max(1, Math.min(4, zoom));
  const cropWidth = Math.min(width, height * aspect) / scale;
  const cropHeight = cropWidth / aspect;
  return {
    x: ((width - cropWidth) * Math.max(0, Math.min(100, horizontal))) / 100,
    y: ((height - cropHeight) * Math.max(0, Math.min(100, vertical))) / 100,
    width: cropWidth,
    height: cropHeight,
  };
}
export function outputSize(width: number, height: number, maxEdge = 2048) {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}
function jpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error('Your browser could not encode this photo.')),
      'image/jpeg',
      quality,
    ),
  );
}
export async function cropAndCompress(
  image: HTMLImageElement,
  rect: CropRect,
  name: string,
  maxBytes: number,
): Promise<File> {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Photo editing is unavailable in this browser.');
  let size = outputSize(rect.width, rect.height);
  for (let attempt = 0; attempt < 8; attempt++) {
    canvas.width = size.width;
    canvas.height = size.height;
    context.fillStyle = '#fff';
    context.fillRect(0, 0, size.width, size.height);
    context.drawImage(
      image,
      rect.x,
      rect.y,
      rect.width,
      rect.height,
      0,
      0,
      size.width,
      size.height,
    );
    const high = await jpeg(canvas, 0.95);
    let best: Blob | null = high.size <= maxBytes ? high : null;
    if (!best) {
      let low = 0.45,
        upper = 0.95;
      const minimum = await jpeg(canvas, low);
      if (minimum.size <= maxBytes) {
        best = minimum;
        for (let i = 0; i < 8; i++) {
          const middle = (low + upper) / 2;
          const encoded = await jpeg(canvas, middle);
          if (encoded.size <= maxBytes) {
            best = encoded;
            low = middle;
          } else upper = middle;
        }
      }
    }
    if (best && best.size > 0 && best.size <= maxBytes)
      return new File([best], name.replace(/\.[^.]*$/, '').slice(0, 160) + '.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
    size = outputSize(Math.floor(size.width * 0.8), Math.floor(size.height * 0.8));
  }
  throw new Error(
    'Unable to compress this photo below 800 KB. Try a tighter crop or another photo.',
  );
}
