<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { createBattle } from '$lib/stores/battle-store';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	const MAP_PRESETS = [
		{ label: '中国', center: [35, 105] as [number, number], zoom: 5 },
		{ label: '东亚', center: [37, 120] as [number, number], zoom: 4 },
		{ label: '欧洲', center: [50, 10] as [number, number], zoom: 4 },
		{ label: '中东', center: [30, 45] as [number, number], zoom: 5 },
		{ label: '全球', center: [20, 0] as [number, number], zoom: 2 }
	];

	let { open = $bindable(false) }: { open: boolean } = $props();

	let newName = $state('');
	let selectedPreset = $state(0);

	function handleCreate() {
		const name = newName.trim();
		if (!name) return;
		const preset = MAP_PRESETS[selectedPreset];
		const id = createBattle(name, { mapCenter: preset.center, mapZoom: preset.zoom });
		open = false;
		goto(`/crisis/${id}`);
	}

	function handleOpenChange(value: boolean) {
		if (value) {
			newName = '';
			selectedPreset = 0;
		}
		open = value;
	}
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
	<Dialog.Portal>
		<Dialog.Overlay />
		<Dialog.Content class="max-w-md">
			<Dialog.Header>
				<Dialog.Title>新建战局</Dialog.Title>
				<Dialog.Description>配置战局基本信息后开始推演。</Dialog.Description>
			</Dialog.Header>

			<div class="flex flex-col gap-5 py-4">
				<!-- 战局名称 -->
				<div class="flex flex-col gap-2">
					<Label for="battle-name">战局名称</Label>
					<Input
						id="battle-name"
						bind:value={newName}
						placeholder="输入战局名称..."
						onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && handleCreate()}
					/>
				</div>

				<!-- 地图初始区域 -->
				<div class="flex flex-col gap-2">
					<Label>地图初始区域</Label>
					<div class="flex flex-wrap gap-2">
						{#each MAP_PRESETS as preset, i}
							<button
								type="button"
								class="rounded-lg border px-3 py-1.5 text-sm transition-all {selectedPreset === i
									? 'border-stone-600 bg-stone-800 text-white'
									: 'border-stone-200 bg-white/60 text-stone-600 hover:border-stone-400'}"
								onclick={() => (selectedPreset = i)}
							>
								{preset.label}
							</button>
						{/each}
					</div>
				</div>
			</div>

			<Dialog.Footer>
				<Button variant="outline" onclick={() => (open = false)}>取消</Button>
				<Button onclick={handleCreate} disabled={!newName.trim()} class="gap-2">
					<Plus size={16} />
					创建
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
