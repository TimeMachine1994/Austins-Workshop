import { withTitlePageDefault, type ScreenplayDocument } from '$lib/apps/screenwriter/screenplay/types';
import { isValidDocument } from '$lib/apps/screenwriter/screenplay/validate';

function sanitizeFilename(name: string): string {
	return name.replace(/[^a-z0-9-_ ]/gi, '').trim() || 'screenplay';
}

// Minimal ambient typing for the File System Access API (not yet in all TS lib defs).
declare global {
	interface Window {
		showSaveFilePicker?: (options?: unknown) => Promise<FileSystemFileHandle>;
		showOpenFilePicker?: (options?: unknown) => Promise<FileSystemFileHandle[]>;
	}
}

export async function exportDocument(doc: ScreenplayDocument): Promise<void> {
	const json = JSON.stringify(doc, null, 2);
	const filename = `${sanitizeFilename(doc.title)}.json`;

	if (typeof window !== 'undefined' && window.showSaveFilePicker) {
		try {
			const handle = await window.showSaveFilePicker({
				suggestedName: filename,
				types: [
					{
						description: 'Screenplay JSON',
						accept: { 'application/json': ['.json'] }
					}
				]
			});
			const writable = await handle.createWritable();
			await writable.write(json);
			await writable.close();
			return;
		} catch (err) {
			if ((err as DOMException)?.name === 'AbortError') return;
			// fall through to download fallback on other errors
		}
	}

	// Fallback: trigger a browser download.
	const blob = new Blob([json], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}

export async function importDocument(): Promise<ScreenplayDocument | null> {
	if (typeof window !== 'undefined' && window.showOpenFilePicker) {
		try {
			const [handle] = await window.showOpenFilePicker({
				types: [
					{
						description: 'Screenplay JSON',
						accept: { 'application/json': ['.json'] }
					}
				],
				multiple: false
			});
			const file = await handle.getFile();
			return parseFile(file);
		} catch (err) {
			if ((err as DOMException)?.name === 'AbortError') return null;
			// fall through to input fallback on other errors
		}
	}

	// Fallback: hidden <input type="file">.
	return new Promise((resolve) => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'application/json';
		input.onchange = async () => {
			const file = input.files?.[0];
			resolve(file ? await parseFile(file) : null);
		};
		input.click();
	});
}

async function parseFile(file: File): Promise<ScreenplayDocument | null> {
	const text = await file.text();
	try {
		const data = JSON.parse(text);
		if (!isValidDocument(data)) {
			throw new Error('Invalid screenplay JSON shape');
		}
		return withTitlePageDefault(data);
	} catch (err) {
		console.error('Failed to import screenplay JSON:', err);
		throw err;
	}
}
