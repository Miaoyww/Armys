/**
 * tauri-commands.ts — Tauri 插件管理命令的 TypeScript 包装层
 *
 * 提供类型安全的命令调用接口，自动处理平台检测和错误处理。
 * 文件对话框在 TypeScript/前端实现，Rust 端主要负责验证和路径处理。
 *
 * 使用示例：
 *   import { tauriCommands } from './tauri-commands';
 *
 *   // 获取插件目录
 *   const dir = await tauriCommands.getPluginDirectory();
 *
 *   // 验证插件包
 *   const validation = await tauriCommands.validatePluginFile(filePath);
 */

/**
 * 导入插件响应数据
 */
export interface ImportPluginResponse {
	/** 选择的文件路径 */
	file_path: string;
	/** 文件名称 */
	file_name: string;
	/** 文件大小（字节） */
	file_size: number;
}

/**
 * 插件验证结果
 */
export interface ValidationResult {
	/** 是否有效 */
	valid: boolean;
	/** 验证消息 */
	message: string;
	/** 插件 ID（如果有效） */
	plugin_id?: string;
}

/**
 * 导出结果
 */
export interface ExportResult {
	/** 导出目标路径 */
	export_path: string;
	/** 是否成功 */
	success: boolean;
	/** 消息 */
	message: string;
}

/**
 * 检查是否在 Tauri 环境中运行
 */
async function isTauriAvailable(): Promise<boolean> {
	try {
		const { isTauri } = await import('@tauri-apps/api/core');
		return await isTauri();
	} catch {
		return false;
	}
}

/**
 * 调用 Tauri 命令的通用包装器
 */
async function invokeCommand<T>(
	command: string,
	payload?: Record<string, unknown>
): Promise<T> {
	try {
		// @ts-ignore - Tauri API only available in Tauri runtime
		const { invoke } = await import('@tauri-apps/api/core');
		return await invoke<T>(command, payload);
	} catch (error) {
		throw new Error(`Failed to invoke command '${command}': ${error}`);
	}
}

/**
 * 打开文件选择对话框
 */
async function openFileDialog(filters?: { name: string; extensions: string[] }[]): Promise<string | null> {
	try {
		// @ts-ignore - Tauri API only available in Tauri runtime
		const { open } = await import('@tauri-apps/plugin-dialog');
		return await open({
			multiple: false,
			filters: filters || [
				{ name: 'Veto Mods', extensions: ['csmod'] },
				{ name: 'All Files', extensions: ['*'] }
			]
		});
	} catch (error) {
		console.error('File dialog error:', error);
		return null;
	}
}

/**
 * 打开保存对话框
 */
async function openSaveDialog(defaultName?: string): Promise<string | null> {
	try {
		// @ts-ignore - Tauri API only available in Tauri runtime
		const { save } = await import('@tauri-apps/plugin-dialog');
		return await save({
			defaultPath: defaultName || 'plugin.csmod',
			filters: [
				{ name: 'Veto Mods', extensions: ['csmod'] }
			]
		});
	} catch (error) {
		console.error('Save dialog error:', error);
		return null;
	}
}

/**
 * Tauri 插件管理命令集合
 */
export const tauriCommands = {
	/**
	 * 获取插件存储目录路径
	 *
	 * @returns 插件目录的完整路径
	 * @throws 如果不在 Tauri 环境或调用失败
	 */
	async getPluginDirectory(): Promise<string> {
		if (!(await isTauriAvailable())) {
			throw new Error('Not in Tauri environment');
		}
		return invokeCommand<string>('get_plugin_directory');
	},

	/**
	 * 打开文件对话框选择插件文件（.csmod）
	 *
	 * @returns 选择的文件路径，或 null 如果用户取消
	 * @throws 如果不在 Tauri 环境或调用失败
	 *
	 * @example
	 * const result = await tauriCommands.importPluginFile();
	 * if (result) {
	 *   console.log(`Selected: ${result}`);
	 * }
	 */
	async importPluginFile(): Promise<string | null> {
		if (!(await isTauriAvailable())) {
			throw new Error('Not in Tauri environment');
		}
		return openFileDialog([
			{ name: 'Veto Mods', extensions: ['csmod'] },
			{ name: 'All Files', extensions: ['*'] }
		]);
	},

	/**
	 * 验证插件包的格式和内容
	 *
	 * @param filePath - 插件文件的完整路径
	 * @returns 验证结果
	 * @throws 如果不在 Tauri 环境或调用失败
	 *
	 * @example
	 * const result = await tauriCommands.validatePluginFile('/path/to/plugin.csmod');
	 * if (result.valid) {
	 *   console.log(`Plugin ID: ${result.plugin_id}`);
	 * } else {
	 *   console.error(`Validation failed: ${result.message}`);
	 * }
	 */
	async validatePluginFile(filePath: string): Promise<ValidationResult> {
		if (!(await isTauriAvailable())) {
			throw new Error('Not in Tauri environment');
		}
		return invokeCommand<ValidationResult>('validate_plugin_file', {
			file_path: filePath,
		});
	},

	/**
	 * 导出插件到本地磁盘
	 *
	 * @param pluginId - 要导出的插件 ID
	 * @returns 导出结果
	 * @throws 如果不在 Tauri 环境或调用失败
	 *
	 * @example
	 * const result = await tauriCommands.exportPlugin('my-plugin');
	 * if (result.success) {
	 *   console.log(`Exported to: ${result.export_path}`);
	 * }
	 */
	async exportPlugin(pluginId: string): Promise<ExportResult> {
		if (!(await isTauriAvailable())) {
			throw new Error('Not in Tauri environment');
		}
		
		// 打开保存对话框
		const exportPath = await openSaveDialog(`${pluginId}.csmod`);
		if (!exportPath) {
			return {
				export_path: '',
				success: false,
				message: '用户取消了导出',
			};
		}

		// 验证导出路径
		return invokeCommand<ExportResult>('export_plugin', {
			plugin_id: pluginId,
			export_path: exportPath,
		});
	},

	/**
	 * 检查文件是否可读
	 *
	 * @param filePath - 文件路径
	 * @returns 是否可读
	 */
	async checkFileReadable(filePath: string): Promise<boolean> {
		if (!(await isTauriAvailable())) {
			return false;
		}
		return invokeCommand<boolean>('check_file_readable', {
			file_path: filePath,
		});
	},

	/**
	 * 检查是否在 Tauri 环境中运行
	 *
	 * @returns true 如果在 Tauri，false 如果在 Web
	 */
	async isAvailable(): Promise<boolean> {
		return isTauriAvailable();
	},
};

/**
 * 高级插件操作助手
 */
export const pluginFileOperations = {
	/**
	 * 导入插件文件并验证
	 *
	 * @returns 验证通过的文件路径，或 null 如果验证失败或用户取消
	 *
	 * @example
	 * const result = await pluginFileOperations.importAndValidate();
	 * if (result) {
	 *   console.log(`Successfully selected: ${result}`);
	 * }
	 */
	async importAndValidate(): Promise<string | null> {
		const filePath = await tauriCommands.importPluginFile();
		if (!filePath) {
			return null;
		}

		const validation = await tauriCommands.validatePluginFile(filePath);
		if (!validation.valid) {
			throw new Error(`验证失败: ${validation.message}`);
		}

		return filePath;
	},

	/**
	 * 获取文件名（不含扩展名）
	 *
	 * @param filePath - 完整文件路径
	 * @returns 文件名（不含 .csmod）
	 */
	extractPluginName(filePath: string): string {
		return filePath.split(/[/\\]/).pop()?.replace(/\.csmod$/i, '') || 'unknown';
	},

	/**
	 * 格式化文件大小为可读字符串
	 *
	 * @param bytes - 字节数
	 * @returns 格式化后的大小字符串
	 */
	formatFileSize(bytes: number): string {
		const units = ['B', 'KB', 'MB', 'GB'];
		let size = bytes;
		let unitIndex = 0;

		while (size >= 1024 && unitIndex < units.length - 1) {
			size /= 1024;
			unitIndex++;
		}

		return `${size.toFixed(2)} ${units[unitIndex]}`;
	},
};
