<script lang="ts">
	import { PackageCheck, Trash2 } from '@lucide/svelte';
	import { registry } from '$lib/registry/mod-registry';
	import ModCard from '$lib/components/cards/settings/mod-card.svelte';
	import { dbGetAllPlugins, dbDeletePlugin } from '$lib/services/plugin-db';
	import type { InstalledPlugin } from '$lib/services/plugin-db';
	import { Button } from '$lib/components/ui/button';

	let modList = $state(registry.getModList());
	let dbPlugins = $state<InstalledPlugin[]>([]);

	async function loadDb() {
		dbPlugins = await dbGetAllPlugins();
	}

	// 从注册中心安装的插件（存于 IndexedDB）
	const dbInstalled = $derived(dbPlugins);
	// 通过文件导入的（在 registry 的 user Mod，但不在 IndexedDB）
	const fileInstalled = $derived(
		registry.getModList().filter(
			(m) => m.source === 'user' && !dbPlugins.some((p) => p.id === m.mod.id)
		)
	);

	function refresh() {
		modList = registry.getModList();
	}

	async function handleUninstall(id: string) {
		await dbDeletePlugin(id);
		await loadDb();
	}

	// 初始化时加载 IndexedDB
	$effect(() => { loadDb(); });
</script>

<div class="space-y-4">
	<!-- 注册中心安装的插件 -->
	{#if dbInstalled.length > 0}
		<div>
			<p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">注册中心安装</p>
			<div class="flex flex-col gap-2">
				{#each dbInstalled as plugin (plugin.id)}
					<div class="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-3">
						<div class="flex items-center justify-between gap-2">
							<div class="min-w-0">
								<p class="truncate text-sm font-semibold text-foreground">{plugin.manifest.name}</p>
								<p class="text-xs text-muted-foreground">
									v{plugin.manifest.version} · {plugin.manifest.author}
									· 安装于 {new Date(plugin.installedAt).toLocaleDateString('zh-CN')}
								</p>
							</div>
							<Button
								variant="ghost"
								size="icon"
								class="size-7 shrink-0 text-muted-foreground hover:text-destructive"
								title="卸载"
								onclick={() => handleUninstall(plugin.id)}
							>
								<Trash2 class="size-3.5" />
							</Button>
						</div>
						{#if plugin.manifest.description}
							<p class="text-xs text-muted-foreground">{plugin.manifest.description}</p>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- 文件导入的（仅在内存中） -->
	{#if fileInstalled.length > 0}
		<div>
			<p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">文件导入</p>
			<div class="flex flex-col gap-2">
				{#each fileInstalled as entry (entry.mod.id)}
					<ModCard {entry} ontoggle={refresh} />
				{/each}
			</div>
		</div>
	{/if}

	{#if dbInstalled.length === 0 && fileInstalled.length === 0}
		<div class="flex min-h-60 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-stone-300 text-stone-400 dark:border-stone-700 dark:text-stone-500">
			<PackageCheck size={32} class="opacity-40" />
			<span class="text-sm">尚未安装任何用户 Mod</span>
			<span class="text-xs">在「安装 Mod」标签页中浏览或导入</span>
		</div>
	{/if}
</div>

