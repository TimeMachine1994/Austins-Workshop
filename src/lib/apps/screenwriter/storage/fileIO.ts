import { withTitlePageDefault, type ScreenplayDocument } from '$lib/apps/screenwriter/screenplay/types';
import { isValidDocument } from '$lib/apps/screenwriter/screenplay/validate';
import html2pdf from 'html2pdf.js';

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

export async function exportDocumentAsPDF(doc: ScreenplayDocument): Promise<void> {
	const filename = `${sanitizeFilename(doc.title)}.pdf`;
	console.log('Starting PDF export for:', doc.title);
	console.log('Document has', doc.elements.length, 'elements');

	// Create a container with proper screenplay styling
	const container = document.createElement('div');
	container.id = 'pdf-export-container';
	container.style.cssText = `
		font-family: 'Courier Prime', 'Courier New', Courier, monospace;
		font-size: 12pt;
		line-height: 1.5;
		color: #171717;
		background: #fff;
		width: 8.5in;
		min-height: 11in;
		margin: 0;
		padding: 1in 1in 1in 1.5in;
		position: absolute;
		left: -9999px;
		top: 0;
	`;

	// Add title page
	const titlePage = document.createElement('div');
	titlePage.style.cssText = `
		min-height: 11in;
		position: relative;
		page-break-after: always;
	`;

	const titleBlock = document.createElement('div');
	titleBlock.style.cssText = `
		position: absolute;
		top: 40%;
		left: 0;
		right: 0;
		text-align: center;
	`;

	const title = document.createElement('h1');
	title.textContent = doc.titlePage.title || doc.title;
	title.style.cssText = `
		text-transform: uppercase;
		font-weight: 700;
		font-size: 1.1em;
		letter-spacing: 0.02em;
		margin: 0;
	`;

	const writtenBy = document.createElement('p');
	writtenBy.textContent = 'Written by';
	writtenBy.style.cssText = `
		margin: 1.5em 0 0.25em;
	`;

	const author = document.createElement('p');
	author.textContent = doc.titlePage.author;
	author.style.cssText = `
		margin: 0;
	`;

	titleBlock.appendChild(title);
	titleBlock.appendChild(writtenBy);
	titleBlock.appendChild(author);
	titlePage.appendChild(titleBlock);

	if (doc.titlePage.contact) {
		const contact = document.createElement('div');
		contact.style.cssText = `
			position: absolute;
			bottom: 1in;
			left: 1.5in;
			width: 40%;
			white-space: pre-line;
		`;
		contact.textContent = doc.titlePage.contact;
		titlePage.appendChild(contact);
	}

	container.appendChild(titlePage);

	// Add screenplay elements
	const content = document.createElement('div');
	content.style.cssText = `
		page-break-before: always;
	`;

	for (const el of doc.elements) {
		const line = document.createElement('div');
		line.textContent = el.text;

		switch (el.type) {
			case 'scene_heading':
				line.style.cssText = `
					text-transform: uppercase;
					font-weight: 700;
					margin-top: 1.5em;
					margin-bottom: 0;
				`;
				break;
			case 'action':
				line.style.cssText = `
					width: 100%;
					margin: 0;
				`;
				break;
			case 'character':
				line.style.cssText = `
					width: 60%;
					margin-left: 40%;
					text-transform: uppercase;
					margin-top: 1em;
					margin-bottom: 0;
				`;
				break;
			case 'dialogue':
				line.style.cssText = `
					width: 65%;
					margin-left: 17%;
					margin: 0;
				`;
				break;
			case 'parenthetical':
				line.style.cssText = `
					width: 45%;
					margin-left: 30%;
					font-style: italic;
					margin: 0;
				`;
				break;
			case 'transition':
				line.style.cssText = `
					width: 100%;
					text-align: right;
					text-transform: uppercase;
					margin-top: 1em;
					margin-bottom: 0;
				`;
				break;
		}

		content.appendChild(line);
	}

	container.appendChild(content);

	// Add to document temporarily
	document.body.appendChild(container);

	// Configure html2pdf options with better CSS handling
	const opt = {
		margin: 0,
		filename: filename,
		image: { type: 'jpeg', quality: 0.98 },
		html2canvas: { 
			scale: 2, 
			useCORS: true,
			logging: false,
			allowTaint: true,
			letterRendering: true
		},
		jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
		pagebreak: { mode: ['css', 'legacy'] }
	};

	try {
		// Generate and download PDF
		await html2pdf().set(opt).from(container).save();
		console.log('PDF generated successfully');
	} catch (err) {
		console.error('Failed to generate PDF:', err);
		throw err;
	} finally {
		// Clean up
		if (document.body.contains(container)) {
			document.body.removeChild(container);
		}
	}
}
