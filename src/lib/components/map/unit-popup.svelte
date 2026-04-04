<script lang="ts">
	import { BRANCH_LABELS, UNIT_STATUS_LABELS } from '$lib/types';
	import type { MilitaryUnit, PlacedUnit, Faction } from '$lib/types';

	let { unit, faction, placed }: { unit: MilitaryUnit; faction: Faction; placed: PlacedUnit } =
		$props();
</script>

<div class="min-w-40 py-0.5 font-sans">
	<p class="mb-1 text-sm font-semibold text-stone-900">{unit.name}</p>
	<p class="mb-0.5 flex items-center gap-1.5 text-xs text-stone-500">
		<span style="color: {faction.color}; font-size: 0.5rem; line-height: 1;">●</span>
		{faction.name} · {BRANCH_LABELS[unit.branch]}
	</p>
	<p class="text-xs text-stone-400">状态：{UNIT_STATUS_LABELS[placed.status]}</p>
</div>
