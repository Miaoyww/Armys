<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onDestroy, onMount } from 'svelte';
	import Map from '$lib/components/map/map.svelte';
	import { battles, currentBattleId } from '$lib/stores/crisis/battle-store';
	import { mods, registry, pluginsReady } from '$lib/registry/mod-registry.svelte';
	import { get } from 'svelte/store';

	const battleId = page.params.battle_id ?? null;
	const battle = get(battles).find((b) => b.id === battleId);
	const exists = !!battle;

	if (!exists) {
		goto('/');
	} else {
		currentBattleId.set(battleId);
	}

	onMount(async () => {
		if (exists && battle) {
			// 等待插件加载完成
			await pluginsReady;
			// 然后加载战局对应的 Mod
			mods.loadMods(battle.enabledMods ?? []);
		}
	});

	onDestroy(() => {
		// 离开战局页面时清理当前战局状态
		mods.clear();
	});
</script>

{#if exists}
	<div class="app-container">
		<div class="relative flex-1 bg-[var(--bg-primary)]">
			<div id="battle-map">
				<Map />
			</div>
		</div>
	</div>
{/if}

<style>
	* {
		margin: 0;
		box-sizing: border-box;
	}

	.app-container {
		display: flex;
		height: 100vh;
	}

	#battle-map {
		width: 100%;
		height: 100%;
	}
</style>
