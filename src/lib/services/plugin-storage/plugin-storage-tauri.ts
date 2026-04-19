/**
 * plugin-storage-tauri.ts — Tauri 文件系统存储实现
 *
 * 利用 Tauri 的文件系统 API 实现本地文件存储，特别适合 Desktop 环境。
 * 存储位置：$APPDATA/Veto/plugins/
 */

import type { PluginStorage } from './plugin-storage';
import { onPluginListChanged as notifyChanged } from './plugin-storage';
import type { InstalledPlugin, ModAsset } from '../plugin-db';

// @ts-ignore - Tauri API only available in Tauri environment
import { appDataDir } from '@tauri-apps/api/path';
// @ts-ignore - Tauri API only available in Tauri environment
import {
	exists,
	mkdir,
	writeTextFile,
	readTextFile,
	readDir,
	remove,
	writeFile,
	readFile
} from '@tauri-apps/plugin-fs';
// @ts-ignore - Tauri API only available in Tauri environment
import { convertFileSrc } from '@tauri-apps/api/core';

const PLUGINS_DIR = 'plugins';
const MANIFEST_FILE = 'manifest.json';
const DEFINITIONS_FILE = 'definitions.json';
const I18N_DIR = 'i18n';
const ASSETS_DIR = 'assets';

async function getFullPath(...segments: string[]): Promise<string> {
	const baseDir = await appDataDir();
	const sep = baseDir.includes('\\') ? '\\' : '/';
	
	// appDataDir() returns: C:\Users\{user}\AppData\Roaming\Veto\
	// We want: C:\Users\{user}\AppData\Roaming\Veto\plugins\...
	const basePath = baseDir.endsWith(sep) ? baseDir : baseDir + sep;
	const allSegments = [PLUGINS_DIR, ...segments];
	const fullPath = allSegments.reduce((acc, seg) => acc + seg + sep, basePath);
	
	console.log('[TauriPluginStorage] Full path:', fullPath);
	return fullPath.replace(/[\\/]+$/, ''); // Remove trailing slash
}

function joinPath(...parts: string[]): string {
	const sep = parts.some(p => p.includes('\\')) ? '\\' : '/';
	return parts.join(sep);
}

async function ensureDir(path: string): Promise<void> {
	if (!(await exists(path))) {
		await mkdir(path, { recursive: true });
	}
}

export class TauriPluginStorage implements PluginStorage {
	private initialized = false;

	async init(): Promise<void> {
		if (this.initialized) return;
		const pluginsDir = await getFullPath();
		await ensureDir(pluginsDir);
		this.initialized = true;
	}

	async savePlugin(plugin: InstalledPlugin): Promise<void> {
		await this.init();
		const pluginDir = await getFullPath(plugin.id);
		await ensureDir(pluginDir);

		const manifestPath = joinPath(pluginDir, MANIFEST_FILE);
		await writeTextFile(manifestPath, JSON.stringify(plugin.manifest, null, 2));

		if (plugin.definitions) {
			const defsPath = joinPath(pluginDir, DEFINITIONS_FILE);
			await writeTextFile(defsPath, plugin.definitions);
		}

		if (Object.keys(plugin.i18n).length > 0) {
			const i18nDirPath = await getFullPath(plugin.id, I18N_DIR);
			await ensureDir(i18nDirPath);
			for (const [locale, content] of Object.entries(plugin.i18n)) {
				const localePath = joinPath(i18nDirPath, `${locale}.json`);
				await writeTextFile(localePath, content);
			}
		}

		notifyChanged?.();
	}

	async getPlugin(id: string): Promise<InstalledPlugin | undefined> {
		await this.init();
		const pluginDir = await getFullPath(id);

		if (!(await exists(pluginDir))) return undefined;

		const manifestPath = joinPath(pluginDir, MANIFEST_FILE);
		if (!(await exists(manifestPath))) return undefined;

		const manifestJson = await readTextFile(manifestPath);
		const manifest = JSON.parse(manifestJson);

		let definitions: string | null = null;
		const defsPath = joinPath(pluginDir, DEFINITIONS_FILE);
		if (await exists(defsPath)) {
			definitions = await readTextFile(defsPath);
		}

		const i18n: Record<string, string> = {};
		const i18nDir = await getFullPath(id, I18N_DIR);
		if (await exists(i18nDir)) {
			const files = await readDir(i18nDir);
			for (const file of files) {
				if (file.name?.endsWith('.json')) {
					const locale = file.name.replace(/\.json$/, '');
					const content = await readTextFile(joinPath(i18nDir, file.name ?? ''));
					i18n[locale] = content;
				}
			}
		}

		const assetKeys: string[] = [];
		const assetsDir = await getFullPath(id, ASSETS_DIR);
		if (await exists(assetsDir)) {
			assetKeys.push(...(await this.scanAssetKeys(id, assetsDir)));
		}

		return {
			id,
			manifest,
			definitions,
			i18n,
			assetKeys,
			installedAt: Date.now()
		};
	}

	async getAllPlugins(): Promise<InstalledPlugin[]> {
		await this.init();
		const pluginsDir = await getFullPath();

		if (!(await exists(pluginsDir))) return [];

		const entries = await readDir(pluginsDir);
		const plugins: InstalledPlugin[] = [];

		for (const entry of entries) {
			if (entry.isDirectory && entry.name) {
				const plugin = await this.getPlugin(entry.name);
				if (plugin) plugins.push(plugin);
			}
		}

		return plugins;
	}

	async deletePlugin(id: string): Promise<void> {
		await this.init();
		const pluginDir = await getFullPath(id);

		if (await exists(pluginDir)) {
			await remove(pluginDir, { recursive: true });
		}

		notifyChanged?.();
	}

	async isInstalled(id: string): Promise<boolean> {
		await this.init();
		const pluginDir = await getFullPath(id);
		if (!(await exists(pluginDir))) return false;

		const manifestPath = joinPath(pluginDir, MANIFEST_FILE);
		return await exists(manifestPath);
	}

	async saveAsset(asset: ModAsset): Promise<void> {
		await this.init();
		const [pluginId, ...pathSegments] = asset.key.split('/');
		const assetPath = await getFullPath(pluginId, ...pathSegments);

		const sep = assetPath.includes('\\') ? '\\' : '/';
		const dirPath = assetPath.substring(0, assetPath.lastIndexOf(sep));
		await ensureDir(dirPath);

		const arrayBuffer = await asset.blob.arrayBuffer();
		await writeFile(assetPath, new Uint8Array(arrayBuffer));
	}

	async getAsset(key: string): Promise<ModAsset | undefined> {
		await this.init();
		const [pluginId, ...pathSegments] = key.split('/');
		const assetPath = await getFullPath(pluginId, ...pathSegments);

		if (!(await exists(assetPath))) return undefined;

		const data = await readFile(assetPath);
		const uint8Array = data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBuffer);
		return {
			key,
			blob: new Blob([uint8Array], { type: this.guessMimeType(assetPath) }),
			mimeType: this.guessMimeType(assetPath)
		};
	}

	async getAssetUrl(key: string): Promise<string | null> {
		await this.init();
		const [pluginId, ...pathSegments] = key.split('/');
		const assetPath = await getFullPath(pluginId, ...pathSegments);

		if (!(await exists(assetPath))) return null;

		return convertFileSrc(assetPath);
	}

	async deleteAsset(key: string): Promise<void> {
		await this.init();
		const [pluginId, ...pathSegments] = key.split('/');
		const assetPath = await getFullPath(pluginId, ...pathSegments);

		if (await exists(assetPath)) {
			await remove(assetPath);
		}
	}

	async deleteAssets(keys: string[]): Promise<void> {
		const errors: string[] = [];
		for (const key of keys) {
			try {
				await this.deleteAsset(key);
			} catch {
				errors.push(key);
			}
		}
		if (errors.length > 0) {
			throw new Error(`Failed to delete ${errors.length} assets`);
		}
	}

	async getAllAssetKeys(): Promise<string[]> {
		const plugins = await this.getAllPlugins();
		return plugins.flatMap((p) => p.assetKeys);
	}

	async clear(): Promise<void> {
		await this.init();
		const pluginsDir = await getFullPath();

		if (await exists(pluginsDir)) {
			await remove(pluginsDir, { recursive: true });
		}

		notifyChanged?.();
	}

	private async scanAssetKeys(
		pluginId: string,
		dirPath: string,
		prefix = ''
	): Promise<string[]> {
		const keys: string[] = [];
		const entries = await readDir(dirPath);

		for (const entry of entries) {
			const name = entry.name || '';
			const relativePath = prefix ? `${prefix}/${name}` : name;

			if (entry.isDirectory) {
				const subKeys = await this.scanAssetKeys(
					pluginId,
					joinPath(dirPath, name),
					`assets/${relativePath}`
				);
				keys.push(...subKeys);
			} else {
				keys.push(`${pluginId}/assets/${relativePath}`);
			}
		}

		return keys;
	}


	private guessMimeType(filePath: string): string {
		const ext = filePath.split('.').pop()?.toLowerCase() ?? '';
		const mimeMap: Record<string, string> = {
			png: 'image/png',
			jpg: 'image/jpeg',
			jpeg: 'image/jpeg',
			gif: 'image/gif',
			webp: 'image/webp',
			svg: 'image/svg+xml',
			json: 'application/json',
			txt: 'text/plain'
		};
		return mimeMap[ext] ?? 'application/octet-stream';
	}
}
