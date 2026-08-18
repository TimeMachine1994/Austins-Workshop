<script lang="ts">
	import { DocumentState } from './documentState.svelte';

	let { docState }: { docState: DocumentState } = $props();

	let contactRef: HTMLTextAreaElement | undefined;

	function autosize(node: HTMLTextAreaElement) {
		node.style.height = 'auto';
		node.style.height = `${node.scrollHeight}px`;
	}

	function onContactInput(e: Event) {
		const ta = e.currentTarget as HTMLTextAreaElement;
		docState.setTitlePageField('contact', ta.value);
		autosize(ta);
	}

	function registerContactRef(node: HTMLTextAreaElement) {
		contactRef = node;
		autosize(node);
	}
</script>

<div class="page title-page">
	<div class="title-block">
		<input
			class="title-input"
			placeholder="UNTITLED SCREENPLAY"
			value={docState.doc.titlePage.title}
			oninput={(e) => docState.setTitlePageField('title', (e.currentTarget as HTMLInputElement).value)}
		/>
		<p class="written-by">Written by</p>
		<input
			class="author-input"
			placeholder="Author Name"
			value={docState.doc.titlePage.author}
			oninput={(e) => docState.setTitlePageField('author', (e.currentTarget as HTMLInputElement).value)}
		/>
	</div>

	<textarea
		class="contact-input"
		rows="1"
		placeholder={'Name\nAddress\nPhone\nEmail'}
		value={docState.doc.titlePage.contact}
		use:registerContactRef
		oninput={onContactInput}
	></textarea>
</div>

<style>
	.page {
		max-width: 8.5in;
		width: 100%;
		margin: 0 auto;
		padding: 1in 1in 1in 1.5in;
		/* Print-like and theme-independent, matching Editor.svelte's .page. */
		background: var(--page-bg, #fff);
		color: #171717;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
		font-family: 'Courier Prime', 'Courier New', Courier, monospace;
		font-size: 12pt;
		line-height: 1.5;
		min-height: 11in;
		position: relative;
	}

	.title-block {
		position: absolute;
		top: 40%;
		left: 0;
		right: 0;
		text-align: center;
	}

	.title-input {
		width: 100%;
		text-align: center;
		text-transform: uppercase;
		font-weight: 700;
		font-size: 1.1em;
		letter-spacing: 0.02em;
	}

	.written-by {
		margin: 1.5em 0 0.25em;
		text-align: center;
	}

	.author-input {
		width: 100%;
		text-align: center;
	}

	.contact-input {
		position: absolute;
		bottom: 1in;
		left: 1.5in;
		width: 40%;
		resize: none;
		overflow: hidden;
	}

	input,
	textarea {
		border: none;
		outline: none;
		box-shadow: none;
		background: transparent;
		font: inherit;
		color: inherit;
		padding: 0;
	}

	input::placeholder,
	textarea::placeholder {
		color: #b3b3b3;
	}
</style>
