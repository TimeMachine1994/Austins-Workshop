<script lang="ts">
	import { tick } from 'svelte';
	import { DocumentState } from './documentState.svelte';
	import { ELEMENT_LABELS, HOTKEY_TYPES } from '$lib/apps/screenwriter/screenplay/elementTypes';
	import type { ScreenplayElement } from '$lib/apps/screenwriter/screenplay/types';

	let { docState }: { docState: DocumentState } = $props();

	const refs = new Map<string, HTMLTextAreaElement>();

	let toastLabel = $state('');
	let toastVisible = $state(false);
	let toastTimeout: ReturnType<typeof setTimeout> | undefined;

	function showToast(label: string) {
		clearTimeout(toastTimeout);
		toastLabel = label;
		toastVisible = true;
		toastTimeout = setTimeout(() => {
			toastVisible = false;
		}, 900);
	}

	function registerRef(node: HTMLTextAreaElement, id: string) {
		refs.set(id, node);
		autosize(node);
		return {
			destroy() {
				refs.delete(id);
			}
		};
	}

	function autosize(node: HTMLTextAreaElement) {
		node.style.height = 'auto';
		node.style.height = `${node.scrollHeight}px`;
	}

	function onInput(el: ScreenplayElement, e: Event) {
		const ta = e.currentTarget as HTMLTextAreaElement;
		const caret = ta.selectionStart;
		docState.updateText(el.id, ta.value);
		autosize(ta);
		// If the text was transformed (e.g. auto-uppercase), Svelte will
		// rewrite ta.value on the next tick, which can reset the caret to
		// the end. Restore the caret position the user was actually at.
		if (ta.value !== el.text) {
			tick().then(() => {
				ta.setSelectionRange(caret, caret);
			});
		}
	}

	function onKeydown(el: ScreenplayElement, e: KeyboardEvent) {
		const ta = e.currentTarget as HTMLTextAreaElement;
		const meta = e.metaKey || e.ctrlKey;

		if (e.key === 'Tab') {
			e.preventDefault();
			docState.cycleType(el.id, e.shiftKey ? 'backward' : 'forward');
			const updated = docState.elements.find((item) => item.id === el.id);
			if (updated) showToast(ELEMENT_LABELS[updated.type]);
			return;
		}

		if (meta && HOTKEY_TYPES[e.key]) {
			e.preventDefault();
			docState.setType(el.id, HOTKEY_TYPES[e.key]);
			showToast(ELEMENT_LABELS[HOTKEY_TYPES[e.key]]);
			return;
		}

		if (e.key === 'Enter') {
			e.preventDefault();
			let start = ta.selectionStart;
			const end = ta.selectionEnd;
			if (start !== end) {
				const newText = el.text.slice(0, start) + el.text.slice(end);
				docState.updateText(el.id, newText);
				start = start;
			}
			docState.handleEnter(el.id, start);
			return;
		}

		if (e.key === 'Backspace' && ta.selectionStart === 0 && ta.selectionEnd === 0) {
			e.preventDefault();
			docState.handleBackspaceMerge(el.id);
			return;
		}

		if (e.key === 'ArrowUp' && ta.selectionStart === 0 && ta.selectionEnd === 0) {
			e.preventDefault();
			docState.focusPrevious(el.id, 0);
			return;
		}

		if (
			e.key === 'ArrowDown' &&
			ta.selectionStart === el.text.length &&
			ta.selectionEnd === el.text.length
		) {
			e.preventDefault();
			docState.focusNext(el.id, el.text.length);
			return;
		}
	}

	$effect(() => {
		const req = docState.pendingCaret;
		if (!req) return;
		tick().then(() => {
			const node = refs.get(req.elementId);
			if (!node) return;
			node.focus();
			const offset = req.offset < 0 ? node.value.length : req.offset;
			node.setSelectionRange(offset, offset);
			autosize(node);
			docState.consumeCaretRequest();
		});
	});
</script>

<div class="toast" class:toast-visible={toastVisible}>{toastLabel}</div>

<div class="page">
	{#each docState.elements as el (el.id)}
		<div class="line-wrap">
			<textarea
				use:registerRef={el.id}
				class="line-input line-{el.type}"
				rows="1"
				spellcheck="true"
				value={el.text}
				aria-label={ELEMENT_LABELS[el.type]}
				oninput={(e) => onInput(el, e)}
				onkeydown={(e) => onKeydown(el, e)}
			></textarea>
		</div>
	{/each}
</div>

<style>
	.page {
		max-width: 8.5in;
		width: 100%;
		margin: 0 auto;
		padding: 1in 1in 1in 1.5in;
		/* The paper is intentionally print-like and theme-independent:
		   always a white page with dark Courier text, whatever the site theme. */
		background: var(--page-bg, #fff);
		color: #171717;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
		font-family: 'Courier Prime', 'Courier New', Courier, monospace;
		font-size: 12pt;
		line-height: 1.5;
		min-height: 11in;
	}

	.line-wrap {
		display: flex;
	}

	.line-input {
		width: 100%;
		border: none;
		outline: none;
		box-shadow: none;
		resize: none;
		overflow: hidden;
		background: transparent;
		font: inherit;
		color: inherit;
		padding: 0;
	}

	.line-input:focus {
		outline: none;
		box-shadow: none;
	}

	.toast {
		position: fixed;
		bottom: 2rem;
		left: 50%;
		transform: translateX(-50%) translateY(8px);
		background: rgba(23, 23, 23, 0.9);
		color: #fff;
		font-family:
			-apple-system,
			BlinkMacSystemFont,
			segoe ui,
			sans-serif;
		font-size: 0.75rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		padding: 0.4rem 0.85rem;
		border-radius: 999px;
		opacity: 0;
		pointer-events: none;
		transition:
			opacity 0.25s ease,
			transform 0.25s ease;
		z-index: 30;
	}

	.toast-visible {
		opacity: 1;
		transform: translateX(-50%) translateY(0);
	}

	.line-scene_heading {
		text-transform: uppercase;
		font-weight: 700;
		margin-top: 1.5em;
	}

	.line-action {
		width: 100%;
	}

	.line-character {
		width: 60%;
		margin-left: 40%;
		text-transform: uppercase;
		margin-top: 1em;
	}

	.line-dialogue {
		width: 65%;
		margin-left: 17%;
	}

	.line-parenthetical {
		width: 45%;
		margin-left: 30%;
		font-style: italic;
	}

	.line-transition {
		width: 100%;
		text-align: right;
		text-transform: uppercase;
		margin-top: 1em;
	}
</style>
