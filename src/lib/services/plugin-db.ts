/**
 * plugin-db.ts — IndexedDB 持久化层，存储用户已安装的插件数据。
 *
 * DB: veto-mods  version: 1
 * Object store: plugins  (keyPath: "id")
 */

export interface InstalledPlugin {
	id: string;
	manifest: PluginManifest;
	/** definitions.json 的原始内容（字符串，按需解析） */
	definitions: string | null;
	/** i18n locale → JSON 字符串 */
	i18n: Record<string, string>;
	installedAt: number;
}

/** dist/registry.json 中每个条目的结构（manifest 字段 + 注册中心元数据） */
export interface PluginManifest {
	manifest_version: number;
	id: string;
	name: string;
	version: string;
	author: string;
	type: 'faction' | 'scenario' | 'ruleset' | 'campaign' | 'utility' | 'dependency';
	preview?: string;
	description?: string;
	min_engine_version?: string;
	definitions?: string | Record<string, string>;
	i18n?: string | Record<string, string>;
	dependencies?: string[];
	tags?: string[];
	license?: string;
}

const DB_NAME = 'veto-mods';
const DB_VERSION = 1;
const STORE = 'plugins';

function openDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, DB_VERSION);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(STORE)) {
				db.createObjectStore(STORE, { keyPath: 'id' });
			}
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

export async function dbSavePlugin(plugin: InstalledPlugin): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE, 'readwrite');
		tx.objectStore(STORE).put(plugin);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}

export async function dbGetPlugin(id: string): Promise<InstalledPlugin | undefined> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(id);
		req.onsuccess = () => resolve(req.result as InstalledPlugin | undefined);
		req.onerror = () => reject(req.error);
	});
}

export async function dbGetAllPlugins(): Promise<InstalledPlugin[]> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
		req.onsuccess = () => resolve(req.result as InstalledPlugin[]);
		req.onerror = () => reject(req.error);
	});
}

export async function dbDeletePlugin(id: string): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE, 'readwrite');
		tx.objectStore(STORE).delete(id);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}

export async function dbIsInstalled(id: string): Promise<boolean> {
	return (await dbGetPlugin(id)) !== undefined;
}
