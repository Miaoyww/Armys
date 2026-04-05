/**
 * plugin-registry.ts — 拉取远程注册表、下载插件文件、注入 ModRegistry。
 */
import type { PluginManifest, InstalledPlugin } from './plugin-db';
import { dbSavePlugin } from './plugin-db';
import { registry } from '$lib/registry/mod-registry';
import type { ModData } from '$lib/registry/types';

const REGISTRY_URL =
	'https://raw.githubusercontent.com/VetoExpress/veto-plugins/main/dist/registry.json';

/** 插件文件的 raw base URL */
function pluginBaseUrl(id: string): string {
	return `https://raw.githubusercontent.com/VetoExpress/veto-plugins/main/plugins-data/${id}/`;
}

/** 拉取远程注册表列表 */
export async function fetchPluginRegistry(): Promise<PluginManifest[]> {
	const res = await fetch(REGISTRY_URL);
	if (!res.ok) throw new Error(`获取注册表失败：HTTP ${res.status}`);
	return res.json() as Promise<PluginManifest[]>;
}

/**
 * 下载插件所有文件并持久化到 IndexedDB，同时注入运行时 ModRegistry。
 * @returns 安装后的 InstalledPlugin 记录
 */
export async function installPlugin(manifest: PluginManifest): Promise<InstalledPlugin> {
	const base = pluginBaseUrl(manifest.id);

	// 1. 下载 definitions（可为路径字符串或多文件映射）
	let definitions: string | null = null;
	if (manifest.definitions) {
		const defPath = typeof manifest.definitions === 'string'
			? manifest.definitions
			: Object.values(manifest.definitions)[0]; // 取第一个文件
		const res = await fetch(base + defPath);
		if (!res.ok) throw new Error(`下载 definitions 失败：HTTP ${res.status}`);
		definitions = await res.text();
	}

	// 2. 下载 i18n 文件
	const i18nRecord: Record<string, string> = {};
	if (manifest.i18n) {
		const i18nMap: Record<string, string> =
			typeof manifest.i18n === 'string'
				? { default: manifest.i18n }
				: manifest.i18n;
		for (const [locale, path] of Object.entries(i18nMap)) {
			const res = await fetch(base + path);
			if (res.ok) {
				i18nRecord[locale] = await res.text();
			}
		}
	}

	// 3. 持久化到 IndexedDB
	const record: InstalledPlugin = {
		id: manifest.id,
		manifest,
		definitions,
		i18n: i18nRecord,
		installedAt: Date.now()
	};
	await dbSavePlugin(record);

	// 4. 注入运行时 ModRegistry
	injectToRegistry(record);

	return record;
}

/** 将 InstalledPlugin 数据注入运行时 ModRegistry */
export function injectToRegistry(plugin: InstalledPlugin): void {
	let modData: ModData = { id: plugin.id, name: plugin.manifest.name, version: plugin.manifest.version, author: plugin.manifest.author };

	if (plugin.definitions) {
		try {
			const parsed = JSON.parse(plugin.definitions) as ModData;
			modData = { ...parsed, id: plugin.id, name: plugin.manifest.name };
		} catch {
			// definitions 格式不兼容 ModData，跳过
		}
	}

	// 合并 i18n（优先 zh-CN，回退 default）
	const i18nSource = plugin.i18n['zh-CN'] ?? plugin.i18n['zh-cn'] ?? plugin.i18n['default'];
	if (i18nSource) {
		try {
			const i18nParsed = JSON.parse(i18nSource) as Record<string, string>;
			modData = { ...modData, i18n: { ...(modData.i18n ?? {}), ...i18nParsed } };
		} catch {
			// 忽略
		}
	}

	registry.inject(modData, 'user');
}
