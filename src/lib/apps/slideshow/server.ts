import { randomUUID } from 'node:crypto';
import { and, asc, eq, max, sql } from 'drizzle-orm';
import { db } from './db/client';
import { photos, slideshows } from './db/schema';
import { deleteImageFiles, deleteSlideshowFiles, type SavedImage } from './storage/images';

export type SlideshowSettings = {
	slideDurationMs: number;
	transition: 'fade' | 'kenburns';
};

export const DEFAULT_SETTINGS: SlideshowSettings = {
	slideDurationMs: 5000,
	transition: 'kenburns'
};

export const SLUG_RE = /^[a-z0-9-]{3,50}$/;

/** Route segments under /apps/slideshow that can never be share slugs. */
const RESERVED_SLUGS = new Set(['api', 'edit', 'login', 'logout', 'signup', 's', 'new']);

export function isValidSlug(slug: string): boolean {
	return SLUG_RE.test(slug) && !RESERVED_SLUGS.has(slug);
}

export function parseSettings(json: string): SlideshowSettings {
	try {
		const raw = JSON.parse(json) as Partial<SlideshowSettings>;
		return {
			slideDurationMs:
				typeof raw.slideDurationMs === 'number' && raw.slideDurationMs >= 2000 && raw.slideDurationMs <= 30000
					? raw.slideDurationMs
					: DEFAULT_SETTINGS.slideDurationMs,
			transition: raw.transition === 'fade' ? 'fade' : 'kenburns'
		};
	} catch {
		return { ...DEFAULT_SETTINGS };
	}
}

/** Accepts youtube.com/watch, youtu.be, shorts, and embed URLs; returns the video ID or null. */
export function extractYouTubeId(url: string): string | null {
	let parsed: URL;
	try {
		parsed = new URL(url.trim());
	} catch {
		return null;
	}
	const host = parsed.hostname.replace(/^www\.|^m\./, '');
	let id: string | null = null;
	if (host === 'youtu.be') {
		id = parsed.pathname.slice(1).split('/')[0] || null;
	} else if (host === 'youtube.com' || host === 'music.youtube.com') {
		if (parsed.pathname === '/watch') id = parsed.searchParams.get('v');
		else if (parsed.pathname.startsWith('/shorts/') || parsed.pathname.startsWith('/embed/'))
			id = parsed.pathname.split('/')[2] || null;
	}
	return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
}

// ---------------------------------------------------------------------------
// Slideshows
// ---------------------------------------------------------------------------

export async function listSlideshowsForOwner(ownerId: string) {
	return db
		.select({
			id: slideshows.id,
			slug: slideshows.slug,
			title: slideshows.title,
			musicUrl: slideshows.musicUrl,
			createdAt: slideshows.createdAt,
			updatedAt: slideshows.updatedAt,
			photoCount: sql<number>`(select count(*) from ${photos} where ${photos.slideshowId} = ${slideshows.id} and ${photos.status} = 'approved')`,
			pendingCount: sql<number>`(select count(*) from ${photos} where ${photos.slideshowId} = ${slideshows.id} and ${photos.status} = 'pending')`
		})
		.from(slideshows)
		.where(eq(slideshows.ownerId, ownerId))
		.orderBy(sql`${slideshows.updatedAt} desc`);
}

export async function getSlideshowBySlug(slug: string) {
	const rows = await db.select().from(slideshows).where(eq(slideshows.slug, slug)).limit(1);
	return rows[0] ?? null;
}

export async function getSlideshowById(id: string) {
	const rows = await db.select().from(slideshows).where(eq(slideshows.id, id)).limit(1);
	return rows[0] ?? null;
}

export async function isSlugTaken(slug: string): Promise<boolean> {
	const rows = await db
		.select({ id: slideshows.id })
		.from(slideshows)
		.where(eq(slideshows.slug, slug))
		.limit(1);
	return rows.length > 0;
}

export async function createSlideshow(ownerId: string, title: string, slug: string) {
	const id = randomUUID();
	const now = Date.now();
	await db.insert(slideshows).values({
		id,
		ownerId,
		slug,
		title,
		musicUrl: null,
		settings: JSON.stringify(DEFAULT_SETTINGS),
		createdAt: now,
		updatedAt: now
	});
	return id;
}

export async function updateSlideshow(
	id: string,
	patch: Partial<{ title: string; musicUrl: string | null; settings: SlideshowSettings }>
) {
	await db
		.update(slideshows)
		.set({
			...(patch.title !== undefined ? { title: patch.title } : {}),
			...(patch.musicUrl !== undefined ? { musicUrl: patch.musicUrl } : {}),
			...(patch.settings !== undefined ? { settings: JSON.stringify(patch.settings) } : {}),
			updatedAt: Date.now()
		})
		.where(eq(slideshows.id, id));
}

export async function deleteSlideshow(id: string) {
	await db.delete(photos).where(eq(photos.slideshowId, id));
	await db.delete(slideshows).where(eq(slideshows.id, id));
	await deleteSlideshowFiles(id);
}

// ---------------------------------------------------------------------------
// Photos
// ---------------------------------------------------------------------------

export async function listPhotos(slideshowId: string, status?: 'approved' | 'pending') {
	return db
		.select()
		.from(photos)
		.where(
			status
				? and(eq(photos.slideshowId, slideshowId), eq(photos.status, status))
				: eq(photos.slideshowId, slideshowId)
		)
		.orderBy(asc(photos.position), asc(photos.createdAt));
}

export async function getPhotoById(id: string) {
	const rows = await db.select().from(photos).where(eq(photos.id, id)).limit(1);
	return rows[0] ?? null;
}

export async function countPhotos(slideshowId: string): Promise<number> {
	const rows = await db
		.select({ count: sql<number>`count(*)` })
		.from(photos)
		.where(and(eq(photos.slideshowId, slideshowId), sql`${photos.status} != 'rejected'`));
	return rows[0]?.count ?? 0;
}

export async function addPhoto(
	slideshowId: string,
	image: SavedImage,
	options: { contributorName: string | null; status: 'approved' | 'pending' }
) {
	const rows = await db
		.select({ maxPosition: max(photos.position) })
		.from(photos)
		.where(eq(photos.slideshowId, slideshowId));
	const position = (rows[0]?.maxPosition ?? -1) + 1;

	const id = randomUUID();
	await db.insert(photos).values({
		id,
		slideshowId,
		position,
		contributorName: options.contributorName,
		status: options.status,
		originalPath: image.originalPath,
		thumbPath: image.thumbPath,
		width: image.width,
		height: image.height,
		createdAt: Date.now()
	});
	return id;
}

export async function setPhotoStatus(id: string, status: 'approved' | 'rejected') {
	if (status === 'rejected') {
		await deletePhoto(id);
		return;
	}
	await db.update(photos).set({ status }).where(eq(photos.id, id));
}

export async function deletePhoto(id: string) {
	const photo = await getPhotoById(id);
	if (!photo) return;
	await db.delete(photos).where(eq(photos.id, id));
	await deleteImageFiles(photo.originalPath, photo.thumbPath);
}

/** Persists a full ordering: photoIds in the desired display order. */
export async function reorderPhotos(slideshowId: string, photoIds: string[]) {
	for (let i = 0; i < photoIds.length; i++) {
		await db
			.update(photos)
			.set({ position: i })
			.where(and(eq(photos.id, photoIds[i]), eq(photos.slideshowId, slideshowId)));
	}
}
