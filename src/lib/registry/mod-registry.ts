import type { BranchDefinition, CategoryDefinition, UnitTemplate, ModData } from './types';

/**
 * ModRegistry — 全局单例注册表，所有军种/大类/单位模板/i18n 文本均通过此注册。
 *
 * 设计原则：
 * - 引擎是"空壳"，所有数据（军种、状态名、单位类型）均来自注册表
 * - 基础游戏和 Mod 使用完全相同的 inject(ModData) 接口
 * - 后注入的数据覆盖先前的同名条目（Mod 热补丁机制）
 *
 * @example 注入"星际文明"军种
 * ```ts
 * import { registry } from '$lib/registry/mod-registry';
 *
 * registry.inject({
 *   id: 'example.stellar-civ',
 *   branches: [{ id: 'stellar_force' }],
 *   categories: [{
 *     id: 'stellar_force.vanguard',
 *     branchId: 'stellar_force',
 *     natoCode: 'AFM----',
 *     componentGroups: [{ key: 'ships', types: ['dreadnought', 'cruiser'], qualities: ['mk1', 'mk2'], defaultCount: 5 }]
 *   }],
 *   unitTemplates: [{
 *     id: 'stellar-dreadnought',
 *     name: '无畏级战舰',
 *     branchId: 'stellar_force',
 *     categoryId: 'stellar_force.vanguard',
 *     tags: ['can_strike'],
 *     stats: { maxHp: 500, maxOrg: 200, softAttack: 80, hardAttack: 120, airAttack: 60, defense: 50, speed: 3000, attackRange: 800, hardness: 0.9 }
 *   }],
 *   i18n: {
 *     'branch.stellar_force': '星际军',
 *     'category.stellar_force.vanguard': '先锋舰队',
 *     'status.moving': '跃迁',      // 覆盖基础游戏"行军"
 *     'status.attacking': '轨道轰炸' // 覆盖基础游戏"攻击"
 *   }
 * });
 * ```
 */
class ModRegistry {
	/** 已注册军种（id → BranchDefinition） */
	readonly branches = new Map<string, BranchDefinition>();
	/** 已注册单位大类（id → CategoryDefinition） */
	readonly categories = new Map<string, CategoryDefinition>();
	/** 已注册单位模板（id → UnitTemplate） */
	readonly unitTemplates = new Map<string, UnitTemplate>();

	private readonly _i18n = new Map<string, string>();
	private readonly _loadedMods = new Set<string>();

	/**
	 * 注入 Mod 数据包。同一 id 的 Mod 不会重复加载。
	 * 各 Map 条目：后注入覆盖先注入。
	 */
	inject(mod: ModData): void {
		if (mod.id) {
			if (this._loadedMods.has(mod.id)) return;
			this._loadedMods.add(mod.id);
		}
		for (const branch of mod.branches ?? []) {
			this.branches.set(branch.id, branch);
		}
		for (const cat of mod.categories ?? []) {
			this.categories.set(cat.id, cat);
		}
		for (const template of mod.unitTemplates ?? []) {
			this.unitTemplates.set(template.id, template);
		}
		for (const [key, val] of Object.entries(mod.i18n ?? {})) {
			this._i18n.set(key, val);
		}
	}

	/**
	 * 万能标签解析函数。
	 * @param path  点路径，如 "branch.army"、"status.moving"、"type.infantry.light"
	 * @param defaultText  找不到时的回退文本（若不传则回退为 path 本身）
	 */
	getLabel(path: string, defaultText?: string): string {
		return this._i18n.get(path) ?? defaultText ?? path;
	}

	/** 按 id 查找单位模板 */
	findTemplate(id: string): UnitTemplate | undefined {
		return this.unitTemplates.get(id);
	}

	/** 获取指定军种下所有单位模板 */
	getBranchTemplates(branchId: string): UnitTemplate[] {
		return [...this.unitTemplates.values()].filter((t) => t.branchId === branchId);
	}

	/** 获取指定大类下所有单位模板 */
	getCategoryTemplates(categoryId: string): UnitTemplate[] {
		return [...this.unitTemplates.values()].filter((t) => t.categoryId === categoryId);
	}

	/** 获取指定军种下所有大类 */
	getBranchCategories(branchId: string): CategoryDefinition[] {
		return [...this.categories.values()].filter((c) => c.branchId === branchId);
	}

	/**
	 * 解析单位模板的北约 SIDC 功能代码（7 字符）。
	 * 优先级：template.natoCode > category.natoCode > 默认回退 "GUCI---"（地面步兵）
	 */
	getNatoCode(template: UnitTemplate): string {
		if (template.natoCode) return template.natoCode;
		const cat = this.categories.get(template.categoryId);
		if (cat?.natoCode) return cat.natoCode;
		return 'GUCI---'; // 默认 Ground Infantry
	}

	/**
	 * 重置所有注册数据（通常仅用于测试或热重载）。
	 * 调用后需重新调用 inject() 加载基础游戏数据。
	 */
	reset(): void {
		this.branches.clear();
		this.categories.clear();
		this.unitTemplates.clear();
		this._i18n.clear();
		this._loadedMods.clear();
	}
}

/** 全局 ModRegistry 单例 */
export const registry = new ModRegistry();
