/**
 * tauri-plugin-integration.ts — 集成 Tauri 命令和存储系统
 *
 * 提供高级 API 将插件文件导入、验证和存储到现有的存储系统（IndexedDB/FileSystem）。
 *
 * 使用示例：
 *   import { integratedPluginOperations } from './tauri-plugin-integration';
 *
 *   // 导入并自动保存插件
 *   const result = await integratedPluginOperations.importPluginFile();
 */

import { tauriCommands, pluginFileOperations } from './tauri-commands';
import { getPluginStorage } from './plugin-storage/plugin-storage-factory';
import type { InstalledPlugin, PluginManifest } from './plugin-db';

/**
 * 插件导入状态
 */
export enum PluginImportStatus {
	/** 选择文件 */
	SELECTING = 'selecting',
	/** 验证中 */
	VALIDATING = 'validating',
	/** 读取内容 */
	READING = 'reading',
	/** 保存中 */
	SAVING = 'saving',
	/** 完成 */
	COMPLETED = 'completed',
	/** 失败 */
	FAILED = 'failed',
}

/**
 * 插件导入结果
 */
export interface PluginImportResult {
	/** 导入状态 */
	status: PluginImportStatus;
	/** 插件 ID */
	pluginId?: string;
	/** 插件名称 */
	pluginName?: string;
	/** 错误消息 */
	error?: string;
	/** 进度百分比 (0-100) */
	progress?: number;
}

/**
 * 集成的插件操作
 */
export const integratedPluginOperations = {
	/**
	 * 导入插件文件到存储系统
	 *
	 * 流程：
	 * 1. 打开文件对话框
	 * 2. 验证插件包格式
	 * 3. 读取 manifest 和资源
	 * 4. 保存到存储系统
	 *
	 * @returns 导入结果
	 *
	 * @example
	 * try {
	 *   const result = await integratedPluginOperations.importPluginFile();
	 *   console.log(`Successfully imported: ${result.pluginId}`);
	 * } catch (error) {
	 *   console.error(`Import failed: ${error.message}`);
	 * }
	 */
	async importPluginFile(): Promise<PluginImportResult> {
		try {
			// 检查是否在 Tauri 环境
			if (!(await tauriCommands.isAvailable())) {
				throw new Error('不在 Tauri 环境中。此功能仅在桌面应用中可用。');
			}

			// 步骤 1: 选择文件
			let importResult = await tauriCommands.importPluginFile();
			if (!importResult) {
				return {
					status: PluginImportStatus.FAILED,
					error: '用户取消了文件选择',
				};
			}

			// 步骤 2: 验证插件包
			const validation = await tauriCommands.validatePluginFile(importResult.file_path);
			if (!validation.valid) {
				return {
					status: PluginImportStatus.FAILED,
					error: validation.message,
				};
			}

			const pluginId = validation.plugin_id;
			if (!pluginId) {
				return {
					status: PluginImportStatus.FAILED,
					error: '无法获取插件 ID',
				};
			}

			// 步骤 3: 读取 ZIP 内容
			const pluginData = await this._readPluginFile(importResult.file_path);
			if (!pluginData) {
				return {
					status: PluginImportStatus.FAILED,
					error: '无法读取插件文件内容',
				};
			}

			// 步骤 4: 保存到存储
			const storage = getPluginStorage();
			const plugin: InstalledPlugin = {
				id: pluginId,
				manifest: pluginData.manifest,
				definitions: pluginData.definitions,
				i18n: pluginData.i18n,
			};

			await storage.savePlugin(plugin);

			// 保存资源
			for (const [key, asset] of Object.entries(pluginData.assets || {})) {
				await storage.saveAsset(key, asset as Blob);
			}

			return {
				status: PluginImportStatus.COMPLETED,
				pluginId,
				pluginName: pluginData.manifest.name,
				progress: 100,
			};
		} catch (error) {
			return {
				status: PluginImportStatus.FAILED,
				error: error instanceof Error ? error.message : '未知错误',
			};
		}
	},

	/**
	 * 导出插件到本地磁盘
	 *
	 * @param pluginId - 要导出的插件 ID
	 * @returns 导出结果
	 *
	 * @example
	 * const result = await integratedPluginOperations.exportPluginFile('my-plugin');
	 * console.log(`Exported to: ${result.export_path}`);
	 */
	async exportPluginFile(pluginId: string): Promise<string> {
		try {
			// 检查是否在 Tauri 环境
			if (!(await tauriCommands.isAvailable())) {
				throw new Error('不在 Tauri 环境中。此功能仅在桌面应用中可用。');
			}

			// 获取导出路径
			const exportResult = await tauriCommands.exportPlugin(pluginId);
			if (!exportResult.success) {
				throw new Error(exportResult.message);
			}

			// TODO: 后续可从存储中读取插件数据，创建 ZIP 并写入到 exportResult.export_path
			return exportResult.export_path;
		} catch (error) {
			throw error instanceof Error
				? error
				: new Error('导出失败: 未知错误');
		}
	},

	/**
	 * 获取插件存储目录
	 *
	 * @returns 完整的目录路径
	 */
	async getPluginDirectory(): Promise<string> {
		if (!(await tauriCommands.isAvailable())) {
			throw new Error('不在 Tauri 环境中');
		}
		return tauriCommands.getPluginDirectory();
	},

	/**
	 * 从 ZIP 文件中读取插件数据（内部方法）
	 */
	async _readPluginFile(
		filePath: string
	): Promise<{
		manifest: PluginManifest;
		definitions: string | null;
		i18n: Record<string, string>;
		assets: Record<string, Blob>;
	} | null> {
		try {
			// 在实际应用中，需要通过 Tauri 命令读取 ZIP 文件
			// 这里仅展示结构，实际实现取决于如何处理二进制数据
			// 
			// 选项 1: Rust 端完成解析，只返回 JSON
			// 选项 2: 使用 Web Worker + jszip 处理（如果文件已复制）
			// 选项 3: Tauri 提供流式 API
			
			console.warn(
				'[PluginImport] ZIP 读取需要在 Rust 端或通过 Tauri 文件系统 API 完成'
			);
			return null;
		} catch (error) {
			console.error('[PluginImport] Failed to read plugin file:', error);
			return null;
		}
	},
};

/**
 * 从 Web 方式导入（用于 Web 上传组件）
 *
 * @param file - File 对象
 * @returns 导入结果
 *
 * @example
 * const fileInput = document.querySelector('input[type="file"]');
 * const file = fileInput.files?.[0];
 * if (file) {
 *   const result = await webPluginImport(file);
 * }
 */
export async function webPluginImport(file: File): Promise<PluginImportResult> {
	try {
		// 检查文件类型
		if (!file.name.endsWith('.csmod')) {
			return {
				status: PluginImportStatus.FAILED,
				error: '只接受 .csmod 文件',
			};
		}

		// 使用 jszip 解析
		const JSZip = (await import('jszip')).default;
		const zip = new JSZip();
		const archive = await zip.loadAsync(file);

		// 读取 manifest
		const manifestFile = archive.file('manifest.json');
		if (!manifestFile) {
			return {
				status: PluginImportStatus.FAILED,
				error: '缺少 manifest.json',
			};
		}

		const manifestContent = await manifestFile.async('string');
		const manifest = JSON.parse(manifestContent) as PluginManifest;
		const pluginId = manifest.id;

		// 读取 definitions
		let definitions: string | null = null;
		const definitionsFile = archive.file('definitions.json');
		if (definitionsFile) {
			definitions = await definitionsFile.async('string');
		}

		// 读取 i18n
		const i18n: Record<string, string> = {};
		const i18nDir = archive.folder('i18n');
		if (i18nDir) {
			for (const [key, file] of Object.entries(i18nDir.files)) {
				if (!key.endsWith('/')) {
					const locale = key.split('/').pop()?.replace('.json', '');
					if (locale) {
						i18n[locale] = await file.async('string');
					}
				}
			}
		}

		// 保存到存储
		const storage = getPluginStorage();
		const plugin: InstalledPlugin = {
			id: pluginId,
			manifest,
			definitions,
			i18n,
		};

		await storage.savePlugin(plugin);

		// 读取并保存资源
		const assetsDir = archive.folder('assets');
		if (assetsDir) {
			for (const [key, file] of Object.entries(assetsDir.files)) {
				if (!key.endsWith('/')) {
					const assetKey = `${pluginId}/assets/${key}`;
					const blob = await file.async('blob');
					await storage.saveAsset(assetKey, blob);
				}
			}
		}

		return {
			status: PluginImportStatus.COMPLETED,
			pluginId,
			pluginName: manifest.name,
			progress: 100,
		};
	} catch (error) {
		return {
			status: PluginImportStatus.FAILED,
			error: error instanceof Error ? error.message : '导入失败',
		};
	}
}
