<script lang="ts">
	import type { NatoUnitType, UnitSide } from '$lib/types';

	let {
		type,
		side,
		size = 64
	}: {
		type: NatoUnitType;
		side: UnitSide;
		size?: number;
	} = $props();

	// 北约标准配色
	const frameStroke: Record<UnitSide, string> = {
		blue: '#1d4ed8',
		red: '#dc2626',
		neutral: '#16a34a'
	};
	const frameFill: Record<UnitSide, string> = {
		blue: '#dbeafe',
		red: '#fee2e2',
		neutral: '#dcfce7'
	};

	const stroke = $derived(frameStroke[side ?? 'blue']);
	const fill = $derived(frameFill[side ?? 'blue']);

	// viewBox 固定 44×32，通过 size prop 缩放
	const vw = 44;
	const vh = 32;
	const h = $derived(Math.round((size / vw) * vh));
</script>

<svg
	width={size}
	height={h}
	viewBox="0 0 {vw} {vh}"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
>
	<!-- ── 外框 ── -->
	{#if side === 'red'}
		<!-- 敌方：菱形框 -->
		<polygon
			points="22,1.5 42.5,16 22,30.5 1.5,16"
			fill={fill}
			stroke={stroke}
			stroke-width="2.2"
			stroke-linejoin="round"
		/>
	{:else}
		<!-- 友方(蓝) / 中立(绿)：矩形框 -->
		<rect
			x="1.5"
			y="1.5"
			width="41"
			height="29"
			rx="1.5"
			fill={fill}
			stroke={stroke}
			stroke-width="2.2"
		/>
	{/if}

	<!-- ── 内部北约符号 ── -->
	{#if type === 'infantry'}
		<!-- 步兵：X 形 -->
		<line x1="10" y1="8" x2="34" y2="24" stroke={stroke} stroke-width="2.5" stroke-linecap="round" />
		<line x1="34" y1="8" x2="10" y2="24" stroke={stroke} stroke-width="2.5" stroke-linecap="round" />
	{:else if type === 'armor'}
		<!-- 装甲：椭圆 -->
		<ellipse cx="22" cy="16" rx="11" ry="6.5" stroke={stroke} stroke-width="2.5" />
	{:else if type === 'artillery'}
		<!-- 炮兵：实心圆 -->
		<circle cx="22" cy="16" r="7" fill={stroke} />
	{:else if type === 'mechanized'}
		<!-- 机械化：椭圆 + X -->
		<ellipse cx="22" cy="16" rx="11" ry="6" stroke={stroke} stroke-width="1.8" />
		<line x1="13" y1="10" x2="31" y2="22" stroke={stroke} stroke-width="1.8" stroke-linecap="round" />
		<line x1="31" y1="10" x2="13" y2="22" stroke={stroke} stroke-width="1.8" stroke-linecap="round" />
	{:else if type === 'aviation'}
		<!-- 航空：弧线 + 圆点 -->
		<path d="M8,24 Q22,5 36,24" stroke={stroke} stroke-width="2.5" stroke-linecap="round" />
		<circle cx="22" cy="12" r="3" fill={stroke} />
	{:else if type === 'navy'}
		<!-- 海军：双波浪线 -->
		<path
			d="M7,12 Q14.5,8 22,12 Q29.5,16 37,12"
			stroke={stroke}
			stroke-width="2"
			stroke-linecap="round"
		/>
		<path
			d="M7,20 Q14.5,16 22,20 Q29.5,24 37,20"
			stroke={stroke}
			stroke-width="2"
			stroke-linecap="round"
		/>
	{:else if type === 'headquarters'}
		<!-- 司令部：双横线 -->
		<line x1="8" y1="12" x2="36" y2="12" stroke={stroke} stroke-width="2.5" stroke-linecap="round" />
		<line x1="8" y1="20" x2="36" y2="20" stroke={stroke} stroke-width="2.5" stroke-linecap="round" />
	{:else}
		<!-- 未知：星号 -->
		<text x="22" y="21" text-anchor="middle" font-size="14" fill={stroke}>★</text>
	{/if}
</svg>
