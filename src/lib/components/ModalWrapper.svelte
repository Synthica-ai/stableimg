<script lang="ts">
	import { windowHeight, windowWidth } from '$ts/stores/window';

	export let hasPadding = true;
	let scrollY: number;
</script>

<div
	style="width: {$windowWidth}px; height: {$windowHeight}px;"
	class="flex flex-col items-center fixed left-0 
    top-0 bg-c-barrier/90 z-[100]"
/>
<div
	on:scroll={(e) => {
		scrollY = e.currentTarget.scrollTop;
	}}
	style="width: {$windowWidth}px; height: {$windowHeight}px;"
	class="flex flex-col items-center fixed left-0 top-0 z-[101] overflow-auto {hasPadding
		? 'px-4 py-16'
		: ''}"
>
	<slot {scrollY} />
</div>
