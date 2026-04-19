/**
 * plugin-storage-factory.ts — 存储后端工厂函数
 *
 * 运行时根据平台选择合适的存储实现：
 * - Web (Vercel): IndexedDB
 * - Tauri (Desktop): 文件系统
 */

import type { PluginStorage } from './plugin-storage';
import { IndexedDBPluginStorage } from './plugin-storage-idb';

let storageInstance: PluginStorage | null = null;

/**
 * 初始化存储后端
 * 应在应用启动时调用一次
 *
 * 自动检测运行平台：
 * - Tauri 环境 → 使用 TauriPluginStorage
 * - Web 环境 → 使用 IndexedDBPluginStorage
 *
 * @returns 初始化后的存储实例
 * @throws 初始化失败时抛出错误
 */
export async function initPluginStorage(): Promise<PluginStorage> {
	if (storageInstance) return storageInstance;

	try {
		// 检测 Tauri 环境 - 检查 __TAURI__ 全局变量而不是调用 isTauri()
		// 这样避免触发文件系统权限检查
		if (typeof window !== 'undefined' && '__TAURI__' in window) {
			const { TauriPluginStorage } = await import('./plugin-storage-tauri');
			const storage = new TauriPluginStorage();
			await storage.init?.();
			storageInstance = storage;
			console.log('[PluginStorage] Initialized with Tauri backend');
		} else {
			storageInstance = new IndexedDBPluginStorage();
			console.log('[PluginStorage] Initialized with IndexedDB backend');
		}
	} catch (err) {
		// 如果 Tauri 初始化失败，默认使用 IndexedDB
		console.warn('[PluginStorage] Tauri initialization failed, using IndexedDB:', err);
		storageInstance = new IndexedDBPluginStorage();
	}

	return storageInstance;
}

/**
 * 获取存储实例
 * 必须在 initPluginStorage() 之后调用
 *
 * @returns 存储实例
 * @throws 未初始化时抛出错误
 */
export function getPluginStorage(): PluginStorage {
	if (!storageInstance) {
		throw new Error(
			'PluginStorage not initialized. Call initPluginStorage() first.'
		);
	}
	return storageInstance;
}

/**
 * 重置存储实例（仅用于测试或重新初始化）
 */
export function resetPluginStorage(): void {
	storageInstance = null;
}
