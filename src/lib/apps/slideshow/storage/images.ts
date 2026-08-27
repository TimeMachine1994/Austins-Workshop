import { mkdir, rm, unlink } from 'node:fs/promises';
import { createReadStream, existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';

/**
 * Filesystem image storage for the slideshow app.
 *
 * Originals (resized to a display-friendly max edge) and thumbnails live under
 * UPLOADS_ROOT/<slideshowId>/, referenced from the photos table by paths
 * relative to UPLOADS_ROOT. Swap this module for R2/S3 when deploying.
 */
export const UPLOADS_ROOT =
	process.env.SLIDESHOW_UPLOADS_DIR ?? path.resolve('data/slideshow-uploads');

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_PHOTOS_PER_SLIDESHOW = 100;
export const MAX_PHOTOS_PER_GUEST_SUBMISSION = 10;

const DISPLAY_MAX_EDGE = 1920;
const THUMB_MAX_EDGE = 400;

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function isAllowedImageType(mimeType: string): boolean {
	return ALLOWED_TYPES.has(mimeType);
}

export type SavedImage = {
	/** Relative to UPLOADS_ROOT. */
	originalPath: string;
	/** Relative to UPLOADS_ROOT. */
	thumbPath: string;
	width: number;
	height: number;
};

/**
 * Processes and stores one uploaded image: re-encodes to webp at a capped
 * display size plus a small thumbnail. Re-encoding via sharp also strips
 * metadata and neutralizes malformed/hostile files.
 */
export async function saveImage(slideshowId: string, data: Buffer): Promise<SavedImage> {
	const dir = path.join(UPLOADS_ROOT, slideshowId);
	await mkdir(dir, { recursive: true });

	const id = randomUUID();
	const originalRel = path.join(slideshowId, `${id}.webp`);
	const thumbRel = path.join(slideshowId, `${id}.thumb.webp`);

	const display = await sharp(data, { failOn: 'error' })
		.rotate() // apply EXIF orientation
		.resize(DISPLAY_MAX_EDGE, DISPLAY_MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
		.webp({ quality: 82 })
		.toBuffer({ resolveWithObject: true });

	await sharp(display.data)
		.resize(THUMB_MAX_EDGE, THUMB_MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
		.webp({ quality: 70 })
		.toFile(path.join(UPLOADS_ROOT, thumbRel));

	await sharp(display.data).toFile(path.join(UPLOADS_ROOT, originalRel));

	return {
		originalPath: originalRel,
		thumbPath: thumbRel,
		width: display.info.width,
		height: display.info.height
	};
}

/** Resolves a stored relative path to an absolute file path, refusing traversal. */
export function resolveImagePath(relativePath: string): string | null {
	const abs = path.resolve(UPLOADS_ROOT, relativePath);
	if (!abs.startsWith(path.resolve(UPLOADS_ROOT) + path.sep)) return null;
	if (!existsSync(abs)) return null;
	return abs;
}

/** Creates a readable stream for a stored image (call resolveImagePath first). */
export function imageStream(absolutePath: string) {
	return createReadStream(absolutePath);
}

/** Deletes a photo's files, ignoring already-missing files. */
export async function deleteImageFiles(originalPath: string, thumbPath: string): Promise<void> {
	for (const rel of [originalPath, thumbPath]) {
		const abs = resolveImagePath(rel);
		if (abs) await unlink(abs).catch(() => {});
	}
}

/** Deletes a slideshow's entire upload directory. */
export async function deleteSlideshowFiles(slideshowId: string): Promise<void> {
	if (!/^[a-zA-Z0-9-]+$/.test(slideshowId)) return;
	await rm(path.join(UPLOADS_ROOT, slideshowId), { recursive: true, force: true });
}
