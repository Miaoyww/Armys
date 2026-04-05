<script lang="ts">
	import {
		Upload,
		AlertCircle,
		CheckCircle2,
		FileJson,
		Info,
		RefreshCw,
		Store,
		Loader,
		WifiOff
	} from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { registry } from '$lib/registry/mod-registry';
	import type { ModData } from '$lib/registry/types';
	import type { PluginManifest } from '$lib/services/plugin-db';
	import { dbGetAllPlugins } from '$lib/services/plugin-db';
	import { fetchPluginRegistry } from '$lib/services/plugin-registry';
	import RegistryPluginCard from '$lib/components/cards/settings/registry-plugin-card.svelte';

	// ── 浏览注册中心 ──
	type FetchState = 'idle' | 'loading' | 'done' | 'error';
	let fetchState = $state<FetchState>('idle');
	let remotePlugins = $state<PluginManifest[]>([]);
	let fetchError = $state<string | null>(null);
	/** 已安装的插件 id 集合（从 IndexedDB 读取） */
	let installedIds = $state(new Set<string>());

	async function loadRegistry() {
		fetchState = 'loading';
		fetchError = null;
		try {
			const [plugins, dbPlugins] = await Promise.all([fetchPluginRegistry(), dbGetAllPlugins()]);
			remotePlugins = plugins;
			installedIds = new Set(dbPlugins.map((p) => p.id));
			fetchState = 'done';
		} catch (err) {
			fetchError = err instanceof Error ? err.message : '未知错误';
			fetchState = 'error';
		}
	}

	function markInstalled(id: string) {
		installedIds = new Set([...installedIds, id]);
	}
</script>

<div class="space-y-3">
	{#if fetchState === 'idle'}
		<div
			class="flex min-h-60 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-stone-300 text-stone-400 dark:border-stone-700 dark:text-stone-500"
		>
			<Store size={32} class="opacity-40" />
			<p class="text-sm">从 VetoExpress 官方注册中心获取插件列表</p>
			<Button variant="outline" size="sm" class="gap-1.5" onclick={loadRegistry}>
				<RefreshCw class="size-3.5" />
				获取列表
			</Button>
		</div>
	{:else if fetchState === 'loading'}
		<div class="flex min-h-60 flex-col items-center justify-center gap-3 text-muted-foreground">
			<Loader class="size-7 animate-spin opacity-60" />
			<p class="text-sm">正在从注册中心拉取…</p>
		</div>
	{:else if fetchState === 'error'}
		<div
			class="flex min-h-60 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-destructive/40 text-destructive/70"
		>
			<WifiOff size={32} class="opacity-60" />
			<p class="text-sm">{fetchError}</p>
			<Button variant="outline" size="sm" class="gap-1.5" onclick={loadRegistry}>
				<RefreshCw class="size-3.5" />重试
			</Button>
		</div>
	{:else}
		<!-- 顶部操作栏 -->
		<div class="flex items-center justify-between">
			<span class="text-xs text-muted-foreground">共 {remotePlugins.length} 个插件</span>
			<Button variant="ghost" size="sm" class="h-7 gap-1 px-2 text-xs" onclick={loadRegistry}>
				<RefreshCw class="size-3" />刷新
			</Button>
		</div>
		<!-- 插件列表 -->
		<div class="flex flex-col gap-2">
			{#each remotePlugins as manifest (manifest.id)}
				<RegistryPluginCard
					{manifest}
					installed={installedIds.has(manifest.id)}
					oninstalled={markInstalled}
				/>
			{/each}
			{#if remotePlugins.length === 0}
				<p class="py-8 text-center text-sm text-muted-foreground">注册中心暂无插件</p>
			{/if}
		</div>
	{/if}
</div>
