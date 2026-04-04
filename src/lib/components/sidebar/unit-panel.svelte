<script lang="ts">
	import {
		currentBattle,
		currentFaction,
		currentFactionId,
		currentBranch,
		addUnit,
		removeUnit,
		updateUnit,
		updateFaction,
		interactionMode,
		pendingPlaceUnitId
	} from '$lib/stores/battle-store';
	import type {
		ArmyUnit,
		NavyUnit,
		AirForceUnit,
		MilitaryUnit,
		ArmyUnitCategory,
		NavyUnitCategory,
		AirForceUnitCategory,
		ArmyInfantryType,
		InfantryQuality,
		ArmyArmorType,
		ArmorQuality,
		ArmyMissileType,
		MissileQuality,
		NavySurfaceType,
		NavalQuality,
		NavySubmarineType,
		SubmarineQuality,
		NavySupportType,
		NavalSupportQuality,
		AirForceFighterType,
		FighterQuality,
		AirForceBomberType,
		BomberQuality,
		AirForceSupportType,
		AirSupportQuality,
		Branch,
		UnitSide
	} from '$lib/types';
	import {
		BRANCH_LABELS,
		ARMY_CATEGORY_LABELS,
		NAVY_CATEGORY_LABELS,
		AIR_FORCE_CATEGORY_LABELS,
		INFANTRY_TYPE_LABELS,
		INFANTRY_QUALITY_LABELS,
		ARMOR_TYPE_LABELS,
		ARMOR_QUALITY_LABELS,
		MISSILE_TYPE_LABELS,
		MISSILE_QUALITY_LABELS,
		SURFACE_TYPE_LABELS,
		NAVAL_QUALITY_LABELS,
		SUBMARINE_TYPE_LABELS,
		SUBMARINE_QUALITY_LABELS,
		NAVAL_SUPPORT_TYPE_LABELS,
		NAVAL_SUPPORT_QUALITY_LABELS,
		FIGHTER_TYPE_LABELS,
		FIGHTER_QUALITY_LABELS,
		BOMBER_TYPE_LABELS,
		BOMBER_QUALITY_LABELS,
		AIR_SUPPORT_TYPE_LABELS,
		AIR_SUPPORT_QUALITY_LABELS
	} from '$lib/types';
	import {
		Trash2,
		MapPin,
		X,
		Swords,
		Users,
		Shield,
		Rocket,
		Ship,
		Waves,
		Anchor,
		Plane,
		Bomb,
		Radio,
		Crosshair,
		Pencil,
		Check
	} from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Separator } from '$lib/components/ui/separator';
	import UnitCompRow from '$lib/components/cards/units/unit-comp-row.svelte';
	import BranchSelector from '$lib/components/buttons/branch-selector.svelte';
	import { mapFlyTo } from '$lib/stores/map-store';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import { runtimePositions } from '$lib/stores/battle-store';
	import UnitListRow from '$lib/components/cards/units/unit-list-row.svelte';
	// 编辑状态
	let editingUnitId = $state<string | null>(null);

	// 阵营信息编辑
	let editingFaction = $state(false);
	let factionEditName = $state('');
	let factionEditColor = $state('');
	let factionEditSide = $state<UnitSide>('blue');

	function startEditFaction() {
		if (!$currentFaction) return;
		factionEditName = $currentFaction.name;
		factionEditColor = $currentFaction.color;
		factionEditSide = $currentFaction.side ?? 'blue';
		editingFaction = true;
	}

	function saveEditFaction() {
		if (!$currentFactionId) return;
		const name = factionEditName.trim();
		if (!name) return;
		updateFaction($currentFactionId, { name, color: factionEditColor, side: factionEditSide });
		editingFaction = false;
	}

	$effect(() => {
		// 切换阵营时关闭编辑
		$currentFactionId;
		editingFaction = false;
		editingUnitId = null;
	});

	// 陆军添加表单
	let armyInfantryType = $state<ArmyInfantryType>('light');
	let armyInfantryQuality = $state<InfantryQuality>('basic');
	let armyInfantryCount = $state(1000);

	let armyArmorType = $state<ArmyArmorType>('light_tank');
	let armyArmorQuality = $state<ArmorQuality>('gen1');
	let armyArmorCount = $state(50);

	let armyMissileType = $state<ArmyMissileType>('anti_tank');
	let armyMissileQuality = $state<MissileQuality>('basic');
	let armyMissileCount = $state(20);

	// 海军添加表单
	let navySurfaceType = $state<NavySurfaceType>('destroyer');
	let navySurfaceQuality = $state<NavalQuality>('basic');
	let navySurfaceCount = $state(2);

	let navySubType = $state<NavySubmarineType>('attack_sub');
	let navySubQuality = $state<SubmarineQuality>('basic');
	let navySubCount = $state(1);

	let navySupportType = $state<NavySupportType>('amphibious');
	let navySupportQuality = $state<NavalSupportQuality>('basic');
	let navySupportCount = $state(1);

	// 空军添加表单
	let airFighterType = $state<AirForceFighterType>('air_superiority');
	let airFighterQuality = $state<FighterQuality>('gen4');
	let airFighterCount = $state(12);

	let airBomberType = $state<AirForceBomberType>('strategic');
	let airBomberQuality = $state<BomberQuality>('basic');
	let airBomberCount = $state(4);

	let airSupportType = $state<AirForceSupportType>('awacs');
	let airSupportQuality = $state<AirSupportQuality>('basic');
	let airSupportCount = $state(2);

	// ============ 辅助函数 ============
	function genId() {
		return crypto.randomUUID();
	}

	// 获取当前编辑的单位
	let editingUnit = $derived.by(() => {
		if (!editingUnitId || !$currentFaction) return null;
		return $currentFaction.units.find((u) => u.id === editingUnitId) ?? null;
	});

	// 选择单位大类：立即创建单位并进入编辑
	function selectUnitCategory(cat: ArmyUnitCategory | NavyUnitCategory | AirForceUnitCategory) {
		const faction = $currentFaction;
		if (!faction || !$currentFactionId) return;
		const branch = $currentBranch;
		let label = '';
		if (branch === 'army') label = ARMY_CATEGORY_LABELS[cat as ArmyUnitCategory];
		else if (branch === 'navy') label = NAVY_CATEGORY_LABELS[cat as NavyUnitCategory];
		else label = AIR_FORCE_CATEGORY_LABELS[cat as AirForceUnitCategory];
		const count = faction.units.filter(
			(u) => u.branch === branch && (u as ArmyUnit | NavyUnit | AirForceUnit).category === cat
		).length;
		const name = `${label}${count + 1}`;
		const id = genId();
		let unit: MilitaryUnit;
		switch (branch) {
			case 'army':
				unit = {
					id,
					name,
					branch: 'army',
					category: cat as ArmyUnitCategory,
					infantry: [],
					armor: [],
					missiles: []
				};
				break;
			case 'navy':
				unit = {
					id,
					name,
					branch: 'navy',
					category: cat as NavyUnitCategory,
					surface: [],
					submarines: [],
					support: []
				};
				break;
			case 'air_force':
				unit = {
					id,
					name,
					branch: 'air_force',
					category: cat as AirForceUnitCategory,
					fighters: [],
					bombers: [],
					support: []
				};
				break;
		}
		addUnit($currentFactionId, unit);
		editingUnitId = id;
	}

	// 重命名单位（由列表行组件回调）
	function renameUnit(unitId: string, name: string) {
		if (!$currentFactionId) return;
		updateUnit($currentFactionId, unitId, (u) => ({ ...u, name }));
	}

	// ============ 添加组件到单位 ============
	function addInfantryComp() {
		if (!$currentFactionId || !editingUnitId) return;
		updateUnit($currentFactionId, editingUnitId, (u) => {
			if (u.branch !== 'army') return u;
			return {
				...u,
				infantry: [
					...u.infantry,
					{
						id: genId(),
						type: armyInfantryType,
						quality: armyInfantryQuality,
						count: armyInfantryCount
					}
				]
			};
		});
	}

	function addArmorComp() {
		if (!$currentFactionId || !editingUnitId) return;
		updateUnit($currentFactionId, editingUnitId, (u) => {
			if (u.branch !== 'army') return u;
			return {
				...u,
				armor: [
					...u.armor,
					{ id: genId(), type: armyArmorType, quality: armyArmorQuality, count: armyArmorCount }
				]
			};
		});
	}

	function addMissileComp() {
		if (!$currentFactionId || !editingUnitId) return;
		updateUnit($currentFactionId, editingUnitId, (u) => {
			if (u.branch !== 'army') return u;
			return {
				...u,
				missiles: [
					...u.missiles,
					{
						id: genId(),
						type: armyMissileType,
						quality: armyMissileQuality,
						count: armyMissileCount
					}
				]
			};
		});
	}

	function addSurfaceComp() {
		if (!$currentFactionId || !editingUnitId) return;
		updateUnit($currentFactionId, editingUnitId, (u) => {
			if (u.branch !== 'navy') return u;
			return {
				...u,
				surface: [
					...u.surface,
					{
						id: genId(),
						type: navySurfaceType,
						quality: navySurfaceQuality,
						count: navySurfaceCount
					}
				]
			};
		});
	}

	function addSubComp() {
		if (!$currentFactionId || !editingUnitId) return;
		updateUnit($currentFactionId, editingUnitId, (u) => {
			if (u.branch !== 'navy') return u;
			return {
				...u,
				submarines: [
					...u.submarines,
					{ id: genId(), type: navySubType, quality: navySubQuality, count: navySubCount }
				]
			};
		});
	}

	function addNavSupportComp() {
		if (!$currentFactionId || !editingUnitId) return;
		updateUnit($currentFactionId, editingUnitId, (u) => {
			if (u.branch !== 'navy') return u;
			return {
				...u,
				support: [
					...u.support,
					{
						id: genId(),
						type: navySupportType,
						quality: navySupportQuality,
						count: navySupportCount
					}
				]
			};
		});
	}

	function addFighterComp() {
		if (!$currentFactionId || !editingUnitId) return;
		updateUnit($currentFactionId, editingUnitId, (u) => {
			if (u.branch !== 'air_force') return u;
			return {
				...u,
				fighters: [
					...u.fighters,
					{ id: genId(), type: airFighterType, quality: airFighterQuality, count: airFighterCount }
				]
			};
		});
	}

	function addBomberComp() {
		if (!$currentFactionId || !editingUnitId) return;
		updateUnit($currentFactionId, editingUnitId, (u) => {
			if (u.branch !== 'air_force') return u;
			return {
				...u,
				bombers: [
					...u.bombers,
					{ id: genId(), type: airBomberType, quality: airBomberQuality, count: airBomberCount }
				]
			};
		});
	}

	function addAirSupportComp() {
		if (!$currentFactionId || !editingUnitId) return;
		updateUnit($currentFactionId, editingUnitId, (u) => {
			if (u.branch !== 'air_force') return u;
			return {
				...u,
				support: [
					...u.support,
					{ id: genId(), type: airSupportType, quality: airSupportQuality, count: airSupportCount }
				]
			};
		});
	}

	function removeComponent(compId: string) {
		if (!$currentFactionId || !editingUnitId) return;
		updateUnit($currentFactionId, editingUnitId, (u) => {
			switch (u.branch) {
				case 'army':
					return {
						...u,
						infantry: u.infantry.filter((c) => c.id !== compId),
						armor: u.armor.filter((c) => c.id !== compId),
						missiles: u.missiles.filter((c) => c.id !== compId)
					};
				case 'navy':
					return {
						...u,
						surface: u.surface.filter((c) => c.id !== compId),
						submarines: u.submarines.filter((c) => c.id !== compId),
						support: u.support.filter((c) => c.id !== compId)
					};
				case 'air_force':
					return {
						...u,
						fighters: u.fighters.filter((c) => c.id !== compId),
						bombers: u.bombers.filter((c) => c.id !== compId),
						support: u.support.filter((c) => c.id !== compId)
					};
			}
		});
	}

	// 在地图上放置单位
	function handlePlaceUnit(unitId: string) {
		pendingPlaceUnitId.set(unitId);
		interactionMode.set('place');
	}
</script>

<Card
	class="absolute z-[100] h-full w-[24rem] gap-0 border-border/70 bg-background/75 py-0 shadow-xl backdrop-blur-md"
>
	<CardHeader class="border-b px-5 py-4">
		<CardTitle class="flex items-center gap-2 text-sm font-semibold tracking-wide">
			<Swords class="size-4" />军事单位
			<Button
				variant="ghost"
				size="icon"
				class="ml-auto size-6 shrink-0 text-muted-foreground hover:text-foreground"
				title="关闭"
				onclick={() => currentFactionId.set(null)}
			>
				<X class="size-3.5" />
			</Button>
		</CardTitle>

		{#if $currentFaction}
			{#if editingFaction}
				<!-- 编辑模式 -->
				<div class="mt-2 space-y-2">
					<div class="flex items-center gap-2">
						<div
							class="h-4 w-4 shrink-0 rounded-full ring-2 ring-background"
							style:background-color={factionEditColor}
						></div>
						<Input
							class="h-7 flex-1 text-xs"
							bind:value={factionEditName}
							placeholder="阵营名称"
							onkeydown={(e: KeyboardEvent) => {
								if (e.key === 'Enter') saveEditFaction();
								if (e.key === 'Escape') editingFaction = false;
							}}
						/>
					</div>
					<div class="flex items-center gap-2">
						<Label class="shrink-0 text-xs text-muted-foreground">颜色</Label>
						<input
							type="color"
							bind:value={factionEditColor}
							class="h-7 w-10 cursor-pointer rounded border border-input bg-transparent p-0.5"
						/>
					</div>
					<div class="flex items-center gap-2">
						<Label class="shrink-0 text-xs text-muted-foreground">立场</Label>
						<div class="flex gap-1.5">
							{#each [{ v: 'blue' as UnitSide, l: '蓝方', c: '#1d4ed8' }, { v: 'red' as UnitSide, l: '红方', c: '#dc2626' }, { v: 'neutral' as UnitSide, l: '中立', c: '#16a34a' }] as opt}
								<button
									type="button"
									class="rounded border px-2 py-0.5 text-[11px] font-medium transition-all {factionEditSide ===
									opt.v
										? 'border-transparent text-white'
										: 'border-stone-200 text-stone-500 hover:border-stone-400'}"
									style={factionEditSide === opt.v ? `background:${opt.c}` : ''}
									onclick={() => (factionEditSide = opt.v)}>{opt.l}</button
								>
							{/each}
						</div>
					</div>
					<div class="flex justify-end gap-1.5">
						<Button
							variant="ghost"
							size="sm"
							class="h-7 px-2 text-xs text-muted-foreground"
							onclick={() => (editingFaction = false)}
						>
							<X class="mr-1 size-3" />取消
						</Button>
						<Button
							size="sm"
							class="h-7 px-2 text-xs"
							onclick={saveEditFaction}
							disabled={!factionEditName.trim()}
						>
							<Check class="mr-1 size-3" />保存
						</Button>
					</div>
				</div>
			{:else}
				<!-- 展示模式 -->
				<div class="mt-1.5 flex items-center justify-between">
					<div class="flex min-w-0 items-center gap-2">
						<span
							class="h-3 w-3 shrink-0 rounded-full ring-2 ring-background"
							style:background-color={$currentFaction.color}
						></span>
						<span class="truncate text-xs text-muted-foreground">{$currentFaction.name}</span>
					</div>
					<Button
						variant="ghost"
						size="icon"
						class="size-6 shrink-0 text-muted-foreground hover:text-foreground"
						title="编辑阵营信息"
						onclick={startEditFaction}
					>
						<Pencil class="size-3" />
					</Button>
				</div>
			{/if}
		{:else}
			<CardDescription class="text-xs text-muted-foreground">部署军事单位</CardDescription>
		{/if}
	</CardHeader>
	<CardContent class="sidebar-body overflow-y-auto px-4 py-4">
		<div class="space-y-3">
			<div class="space-y-2">
				{#if !$currentFaction}
					<p class="py-4 text-center text-xs text-muted-foreground">请先选择阵营</p>
				{:else}
					<!-- 军种选择 -->
					<BranchSelector
						value={$currentBranch}
						onchange={(b) => {
							currentBranch.set(b);
							editingUnitId = null;
						}}
					/>

					<!-- 选择单位类型：单击即创建 -->
					<div class="grid grid-cols-3 gap-1">
						{#if $currentBranch === 'army'}
							{#each [{ cat: 'infantry' as ArmyUnitCategory, label: '步兵' }, { cat: 'armor' as ArmyUnitCategory, label: '装甲' }, { cat: 'missile' as ArmyUnitCategory, label: '导弹' }] as opt}
								<button
									class="flex items-center justify-center rounded-md border py-1.5 text-xs font-medium transition-all {editingUnit &&
									(editingUnit as ArmyUnit).category === opt.cat
										? 'border-transparent bg-primary text-primary-foreground'
										: 'border-border text-muted-foreground hover:bg-muted'}"
									onclick={() => selectUnitCategory(opt.cat)}>{opt.label}</button
								>
							{/each}
						{:else if $currentBranch === 'navy'}
							{#each [{ cat: 'surface' as NavyUnitCategory, label: '水面' }, { cat: 'submarine' as NavyUnitCategory, label: '潜艇' }, { cat: 'support' as NavyUnitCategory, label: '支援舰' }] as opt}
								<button
									class="flex items-center justify-center rounded-md border py-1.5 text-xs font-medium transition-all {editingUnit &&
									(editingUnit as NavyUnit).category === opt.cat
										? 'border-transparent bg-primary text-primary-foreground'
										: 'border-border text-muted-foreground hover:bg-muted'}"
									onclick={() => selectUnitCategory(opt.cat)}>{opt.label}</button
								>
							{/each}
						{:else}
							{#each [{ cat: 'fighter' as AirForceUnitCategory, label: '战斗机' }, { cat: 'bomber' as AirForceUnitCategory, label: '轰炸机' }, { cat: 'support' as AirForceUnitCategory, label: '支援机' }] as opt}
								<button
									class="flex items-center justify-center rounded-md border py-1.5 text-xs font-medium transition-all {editingUnit &&
									(editingUnit as AirForceUnit).category === opt.cat
										? 'border-transparent bg-primary text-primary-foreground'
										: 'border-border text-muted-foreground hover:bg-muted'}"
									onclick={() => selectUnitCategory(opt.cat)}>{opt.label}</button
								>
							{/each}
						{/if}
					</div>



					<!-- 已有单位列表 -->
					<ScrollArea class="h-[full]">
						<div class="flex flex-col gap-0.5 pr-2">
							{#each $currentFaction.units.filter((u) => u.branch === $currentBranch) as unit (unit.id)}
								{@const placed = $currentBattle?.placedUnits.find(
									(p) => p.unitId === unit.id && p.factionId === $currentFactionId
								)}
								{@const runtimePos = placed ? $runtimePositions[placed.id] : undefined}
								<UnitListRow
									{unit}
									isSelected={editingUnitId === unit.id}
									{placed}
									{runtimePos}
									onSelect={() => {
										editingUnitId = editingUnitId === unit.id ? null : unit.id;
									}}
									onLocate={() => {
										if (placed) mapFlyTo.set({ lat: placed.lat, lng: placed.lng });
									}}
									onPlace={() => handlePlaceUnit(unit.id)}
									onDelete={() => {
										removeUnit($currentFactionId!, unit.id);
										if (editingUnitId === unit.id) editingUnitId = null;
									}}
									onRename={(name) => renameUnit(unit.id, name)}
								/>
							{/each}
							{#if $currentFaction.units.filter((u) => u.branch === $currentBranch).length === 0}
								<p class="py-4 text-center text-xs text-muted-foreground">
									暂无单位，选择上方类型即可创建
								</p>
							{/if}
						</div>
					</ScrollArea>
				{/if}
			</div>
		</div>
	</CardContent>
</Card>
