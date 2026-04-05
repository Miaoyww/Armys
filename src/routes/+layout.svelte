<script lang="ts">
	import '../app.css';
	import '$units'; // 初始化 ModRegistry 基础数据
	import MyAlertDialog from '$lib/components/dialog/my-alert-dialog.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { ModeWatcher } from 'mode-watcher';
	import { VETO_NAME } from '$lib/const';
	import logo from '$lib/assets/logo.svg';
	import { browser } from '$app/environment';
	import { dbGetAllPlugins } from '$lib/services/plugin-db';
	import { injectToRegistry } from '$lib/services/plugin-registry';
	let { children } = $props();

	// 从 IndexedDB 恢复用户已安装的插件到运行时 ModRegistry
	if (browser) {
		dbGetAllPlugins().then((plugins) => {
			for (const plugin of plugins) {
				injectToRegistry(plugin);
			}
		});
	}

	// Vercel Analytics
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';

	injectAnalytics({ mode: dev ? 'development' : 'production' });

	// Vercel Speed Insights
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

	injectSpeedInsights();
</script>

<svelte:head>
	<title>{VETO_NAME}</title>
	<meta name="title" content={VETO_NAME} />
	<link rel="icon" type="image/x-icon" href={logo} />
</svelte:head>

<ModeWatcher />
<MyAlertDialog />
<Toaster richColors position="bottom-right" />

<div>
	<div>
		<main>
			{@render children?.()}
		</main>
	</div>
</div>

<style>
	* {
		margin: 0;
	}
</style>
