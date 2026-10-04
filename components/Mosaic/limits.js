// Local files: read in the browser (object URLs), never uploaded. Limits protect the device:
// - images: a decoded image takes 4 bytes per pixel whatever its display size (a 48 MP photo is
//   ~195 MB), so they are downscaled on import and only the copy is kept;
// - videos: they can't be downscaled without re-encoding (a heavy dependency), and each playing
//   video costs CPU/GPU, so only a few are allowed; they play muted and looped.
export const LOCAL_LIMITS = {
  maxFiles: 20, // images + videos
  maxBytes: 30 * 1024 * 1024, // 30 MB per image
  maxPixels: 50_000_000, // 50 MP before downscaling (fits 48 MP phone photos)
  maxSide: 2048, // long side of the image copy that is kept
  maxVideos: 6,
  maxVideoBytes: 200 * 1024 * 1024, // 200 MB per video
};

export const fileKind = (type = '') => (type.startsWith('image/') ? 'image' : type.startsWith('video/') ? 'video' : null);

const MB = 1024 * 1024;

// Before decoding: is it an image or a video, and not too heavy? Returns an error message or null.
export function checkFile({ name, type, size }, limits = LOCAL_LIMITS) {
  const kind = fileKind(type);
  if (!kind) return `${name}: not an image or a video`;
  const max = kind === 'video' ? limits.maxVideoBytes : limits.maxBytes;
  if (size > max) return `${name}: too large (${(size / MB).toFixed(1)} MB, max ${max / MB} MB)`;
  return null;
}

// Limit check for the next file, given what has actually been added so far (files that fail to
// load must not use up a slot). Returns 'files', 'videos' or null.
export function overLimit(file, added, limits = LOCAL_LIMITS) {
  if (added.length >= limits.maxFiles) return 'files';
  if (fileKind(file.type) === 'video' && added.filter((f) => f.kind === 'video').length >= limits.maxVideos) return 'videos';
  return null;
}

export function limitMessages({ files = 0, videos = 0 }, limits = LOCAL_LIMITS) {
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const messages = [];
  if (videos) messages.push(`${plural(videos, 'video was', 'videos were')} not added: the limit is ${limits.maxVideos} videos`);
  if (files) messages.push(`${plural(files, 'file was', 'files were')} not added: the limit is ${limits.maxFiles} files`);
  return messages;
}

// After reading its size: not too many pixels to downscale safely? Returns an error message or null.
export function checkPixels(name, width, height, limits = LOCAL_LIMITS) {
  if (!(width > 0 && height > 0)) return `${name}: couldn't read the image size`;
  const mp = (width * height) / 1e6;
  if (width * height > limits.maxPixels) return `${name}: too large (${mp.toFixed(0)} MP, max ${limits.maxPixels / 1e6} MP)`;
  return null;
}

// Size of the copy: same aspect ratio, long side at most maxSide; never upscales.
export function fitWithin(width, height, maxSide = LOCAL_LIMITS.maxSide) {
  const scale = Math.min(1, maxSide / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}
