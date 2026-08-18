<script lang="ts">
	import Modal from '$lib/ui/shared/Modal.svelte';
	import Button from '$lib/ui/shared/Button.svelte';

	let {
		open = $bindable(false),
		title = 'Are you sure?',
		message,
		confirmLabel = 'Delete',
		onconfirm
	}: {
		open?: boolean;
		title?: string;
		message: string;
		confirmLabel?: string;
		onconfirm: () => void;
	} = $props();

	function confirm() {
		open = false;
		onconfirm();
	}
</script>

<Modal bind:open {title}>
	<p class="text-sm text-ink-muted">{message}</p>
	<div class="mt-5 flex justify-end gap-2">
		<Button variant="secondary" size="sm" onclick={() => (open = false)}>Cancel</Button>
		<Button variant="danger" size="sm" onclick={confirm}>{confirmLabel}</Button>
	</div>
</Modal>
