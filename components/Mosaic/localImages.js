import { checkFile, checkPixels, fileKind, fitWithin, LOCAL_LIMITS } from './limits';

const loadImage = (url) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error('decode'));
  img.src = url;
});

const toBlob = (canvas, type) => new Promise((resolve) => canvas.toBlob(resolve, type, 0.9));

// Reads one file locally and returns { image } or { error }. Images larger than maxSide are
// redrawn smaller on a canvas and only that copy is kept (the original URL is released).
export async function importImage(file, limits = LOCAL_LIMITS) {
  const early = checkFile(file, limits);
  if (early) return { error: early };

  const originalUrl = URL.createObjectURL(file);
  let keepOriginal = false; // true only when the original URL is handed over as the image
  try {
    const img = await loadImage(originalUrl).catch(() => null);
    if (!img) return { error: `${file.name}: this browser can't read this image format` };

    const tooBig = checkPixels(file.name, img.naturalWidth, img.naturalHeight, limits);
    if (tooBig) return { error: tooBig };

    const { width, height } = fitWithin(img.naturalWidth, img.naturalHeight, limits.maxSide);
    let url = originalUrl;
    if (width >= img.naturalWidth) keepOriginal = true;
    else {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      // Keep transparency for PNGs; everything else becomes a JPEG copy.
      const blob = await toBlob(canvas, file.type === 'image/png' ? 'image/png' : 'image/jpeg');
      canvas.width = canvas.height = 0; // free the canvas memory right away
      if (!blob) return { error: `${file.name}: couldn't resize the image` };
      url = URL.createObjectURL(blob);
    }
    return { image: { id: crypto.randomUUID(), kind: 'image', name: file.name, url, width, height, source: 'local' } };
  } finally {
    // Release the original unless it is the image we return (rejected files, or a smaller copy made).
    if (!keepOriginal) URL.revokeObjectURL(originalUrl);
  }
}

const METADATA_TIMEOUT_MS = 15000;

// Reads a video's size from its metadata only (nothing is decoded or copied): the original file
// is played directly through its object URL.
const loadVideoSize = (url) => new Promise((resolve, reject) => {
  const video = document.createElement('video');
  const done = (fn) => { clearTimeout(timer); video.removeAttribute('src'); video.load(); fn(); };
  const timer = setTimeout(() => done(() => reject(new Error('timeout'))), METADATA_TIMEOUT_MS);
  video.preload = 'metadata';
  video.muted = true;
  video.onloadedmetadata = () => {
    const size = { width: video.videoWidth, height: video.videoHeight };
    done(() => resolve(size));
  };
  video.onerror = () => done(() => reject(new Error('decode')));
  video.src = url;
});

export async function importVideo(file, limits = LOCAL_LIMITS) {
  const early = checkFile(file, limits);
  if (early) return { error: early };
  const url = URL.createObjectURL(file);
  const size = await loadVideoSize(url).catch(() => null);
  if (!size || !(size.width > 0 && size.height > 0)) {
    URL.revokeObjectURL(url);
    return { error: `${file.name}: this browser can't play this video format` };
  }
  return { image: { id: crypto.randomUUID(), kind: 'video', name: file.name, url, ...size, source: 'local' } };
}

export const importFile = (file, limits = LOCAL_LIMITS) =>
  fileKind(file.type) === 'video' ? importVideo(file, limits) : importImage(file, limits);
