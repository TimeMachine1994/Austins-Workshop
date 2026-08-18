<script lang="ts">
	let { message }: { message: string } = $props();
</script>

<p class="rounded-xl border border-dashed border-edge px-6 py-10 text-center text-sm text-ink-faint">
	{message}
</p>
