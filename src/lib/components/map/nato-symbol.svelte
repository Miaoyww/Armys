<script lang="ts">
	import type { NatoUnitType, UnitSide } from '$lib/types';
	import { getMilSymbolSVG } from '$lib/utils/milsymbol-utils';

	let {
		type,
		side,
		size = 64,
		color
	}: {
		type: NatoUnitType;
		side: UnitSide;
		size?: number;
		/** 阵营自定义颜色，传入时覆盖北约默认配色 */
		color?: string;
	} = $props();

	const svgString = $derived(getMilSymbolSVG(type, side, size, color));
</script>

<span class="milsymbol-icon" style="display:inline-flex;align-items:center;justify-content:center;">
	{@html svgString}
</span>
