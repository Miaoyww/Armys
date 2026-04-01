<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Pin, PinOff } from '@lucide/svelte';
	import { rightBarPinned } from '$lib/stores/sidebar-store';
	import { animate } from 'animejs';

	let slashEl: SVGGElement;

	function togglePin() {
		rightBarPinned.update((prev) => !prev);
		if (!slashEl) return;

		if ($rightBarPinned) {
			// 动画隐藏斜杠
			animate(slashEl, {
				opacity: [1, 0],
				scale: [1, 0.6],
				translateY: [0, -4],
				easing: 'easeInOutQuad',
				duration: 200
			});
		} else {
			// 动画显示斜杠
			animate(slashEl, {
				opacity: [0, 1],
				scale: [0.6, 1],
				translateY: [-4, 0],
				easing: 'easeInOutQuad',
				duration: 200
			});
		}
	}
</script>

<Button variant="ghost" size="icon" onclick={togglePin}>
	<Pin>
		<line bind:this={slashEl} stroke-width={2.4} x1="0" y1="0" x2="24" y2="18" />
	</Pin>
</Button>
