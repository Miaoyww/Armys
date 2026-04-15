import { writable } from 'svelte/store';
import type { BranchDefinition, CategoryDefinition, UnitTemplate, ModData } from './types';

/**
 * 每次 registry 有效数据变化时递增（inject system mod / prepareBattleRegistry / clearBattleRegistry）。
 * Svelte 组件订阅此 store 即可响应式感知注册表更新。
 */
export const registryRevision = writable(0);

/** Mod 元数据（轻量，仅从 manifest 读取，供大厅列表展示） */
export interface ModMetadata {
	id: string;
	name?: string;
	version?: string;
	author?: string;
	description?: string;
	type?: ModData['type'];
}

/**
 * 大厅 Mod 条目。切换 isGlobalEnabled 不会修改任何注册表数据，
 * 不触发数据重建，也不影响正在进行的战局快照。
 */
export interface ModEntry {
	id: string;
	metadata: ModMetadata;
	/** 'system' = 基础游戏，始终加载；'user' = 用户安装，需战局激活 */
	source: 'system' | 'user';
	/** 用户在大厅的全局勾选状态，仅用于战局创建时的预选参考 */
	isGlobalEnabled: boolean;
	/** 完整数据包（inject 时存入，prepareBattleRegistry 时使用） */
	data?: ModData;
}

// ── 内部：注册表数据快照 ──────────────────────────────────────────────────────
// 系统数据和战局数据各持一份独立快照，相互隔离。

class RegistrySnapshot {
	readonly branches = new Map<string, BranchDefinition>();
	readonly categories = new Map<string, CategoryDefinition>();
	readonly unitTemplates = new Map<string, UnitTemplate>();
	private readonly _i18n = new Map<string, Map<string, string>>();

	getI18n(): Map<string, Map<string, string>> {
		return this._i18n;
	}

	applyModData(mod: ModData, defaultLocale: string): void {
		for (const branch of mod.branches ?? []) this.branches.set(branch.id, branch);
		for (const cat of mod.categories ?? []) this.categories.set(cat.id, cat);
		for (const tpl of mod.unitTemplates ?? []) this.unitTemplates.set(tpl.id, tpl);

		const i18nData = mod.i18n;
		if (!i18nData) return;
		const firstVal = Object.values(i18nData)[0];
		if (firstVal !== undefined && typeof firstVal === 'object') {
			for (const [loc, keys] of Object.entries(
				i18nData as Record<string, Record<string, string>>
			)) {
				if (!this._i18n.has(loc)) this._i18n.set(loc, new Map());
				const m = this._i18n.get(loc)!;
				for (const [k, v] of Object.entries(keys)) m.set(k, v);
			}
		} else {
			if (!this._i18n.has(defaultLocale)) this._i18n.set(defaultLocale, new Map());
			const m = this._i18n.get(defaultLocale)!;
			for (const [k, v] of Object.entries(i18nData as Record<string, string>)) m.set(k, v);
		}
	}

	clear(): void {
		this.branches.clear();
		this.categories.clear();
		this.unitTemplates.clear();
		this._i18n.clear();
	}
}

// ── ModRegistry ───────────────────────────────────────────────────────────────

/**
 * ModRegistry — 全局单例注册表。
 *
 * 两级数据隔离：
 * - **_sys（系统快照）**：仅含 source='system' 的基础游戏数据，始终有效，不受战局影响。
 * - **_battle（战局快照）**：含系统数据 + 本局选定用户 Mod，仅在战局期间有效。
 *
 * 大厅状态：`registry.branches` 等访问系统快照。
 * 战局状态：`registry.branches` 等访问战局快照；大厅切换开关不影响此快照。
 */
class ModRegistry {
	/** 系统内置数据快照（始终加载，不受战局影响） */
	private readonly _sys = new RegistrySnapshot();
	/** 当前激活的战局数据快照（null = 大厅模式） */
	private _battle: RegistrySnapshot | null = null;
	/** 所有已注册 Mod 条目（按注入顺序） */
	private readonly _entries: ModEntry[] = [];
	/** 当前语言，默认 zh-CN */
	private _locale = 'zh-CN';

	// ── 活跃数据代理（战局中用 _battle，大厅中用 _sys）────────────────────────

	get branches(): Map<string, BranchDefinition> {
		return (this._battle ?? this._sys).branches;
	}
	get categories(): Map<string, CategoryDefinition> {
		return (this._battle ?? this._sys).categories;
	}
	get unitTemplates(): Map<string, UnitTemplate> {
		return (this._battle ?? this._sys).unitTemplates;
	}
	private get _activeI18n(): Map<string, Map<string, string>> {
		return (this._battle ?? this._sys).getI18n();
	}

	// ── 注册 ──────────────────────────────────────────────────────────────────

	/**
	 * 注入 Mod 数据包。同一 id 不会重复加载。
	 * - `source='system'`：立即写入系统快照，始终生效。
	 * - `source='user'`：仅登记元数据与数据包，**不写入任何快照**；
	 *   须调用 `prepareBattleRegistry()` 才能在战局中生效。
	 */
	inject(mod: ModData, source: ModEntry['source'] = 'user'): void {
		const id = mod.id ?? `_anon_${this._entries.length}`;
		const normalized: ModData = { ...mod, id };
		if (this._entries.some((e) => e.id === id)) return;

		this._entries.push({
			id,
			metadata: {
				id,
				name: normalized.name,
				version: normalized.version,
				author: normalized.author,
				description: normalized.description,
				type: normalized.type
			},
			source,
			isGlobalEnabled: source === 'system',
			data: normalized
		});

		if (source === 'system') {
			this._sys.applyModData(normalized, this._locale);
			registryRevision.update((n) => n + 1);
		}
		// user mod：仅登记，不立即写入任何快照
	}

	// ── 大厅开关（不触发数据重建）────────────────────────────────────────────

	/**
	 * 更新用户在大厅对某个用户 Mod 的全局勾选状态。
	 * 此操作**不修改任何注册表数据**，不影响正在进行的战局快照。
	 * 系统 Mod 的开关状态不可修改。
	 */
	setGlobalEnabled(id: string, enabled: boolean): void {
		const entry = this._entries.find((e) => e.id === id);
		if (!entry || entry.source === 'system' || entry.isGlobalEnabled === enabled) return;
		entry.isGlobalEnabled = enabled;
		registryRevision.update((n) => n + 1);
	}

	// ── 战局激活 ──────────────────────────────────────────────────────────────

	/**
	 * 为当前战局创建隔离的数据快照并激活。
	 * 内容 = 系统数据 + `selectedModIds` 中对应的用户 Mod。
	 * 战局期间大厅对全局开关的修改**不会影响**此快照。
	 *
	 * @param selectedModIds 战局启用的用户 Mod ID 列表（空数组 = 纯基础游戏）
	 */
	prepareBattleRegistry(selectedModIds: string[]): void {
		const snapshot = new RegistrySnapshot();
		const selected = new Set(selectedModIds);
		for (const entry of this._entries) {
			if (!entry.data) continue;
			if (entry.source === 'system' || selected.has(entry.id)) {
				snapshot.applyModData(entry.data, this._locale);
			}
		}
		this._battle = snapshot;
		registryRevision.update((n) => n + 1);
	}

	/**
	 * 退出战局，清除战局快照，回到大厅模式（仅系统数据可见）。
	 */
	clearBattleRegistry(): void {
		if (!this._battle) return;
		this._battle = null;
		registryRevision.update((n) => n + 1);
	}

	// ── 查询 API ──────────────────────────────────────────────────────────────

	/** 获取所有已注册 Mod 条目（供大厅列表展示） */
	getModList(): ModEntry[] {
		return [...this._entries];
	}

	setLocale(locale: string): void {
		this._locale = locale;
	}
	getLocale(): string {
		return this._locale;
	}

	/**
	 * 万能标签解析函数。
	 * 查找顺序：当前语言 → 第一个可用语言 → defaultText → path 本身
	 */
	getLabel(path: string, defaultText?: string): string {
		const i18n = this._activeI18n;
		return (
			i18n.get(this._locale)?.get(path) ?? [...i18n.values()][0]?.get(path) ?? defaultText ?? path
		);
	}

	findTemplate(id: string): UnitTemplate | undefined {
		return this.unitTemplates.get(id);
	}

	getBranchTemplates(branchId: string): UnitTemplate[] {
		return [...this.unitTemplates.values()].filter((t) => t.branchId === branchId);
	}
	getCategoryTemplates(categoryId: string): UnitTemplate[] {
		return [...this.unitTemplates.values()].filter((t) => t.categoryId === categoryId);
	}
	getBranchCategories(branchId: string): CategoryDefinition[] {
		return [...this.categories.values()].filter((c) => c.branchId === branchId);
	}

	getNatoCode(template: UnitTemplate): string {
		if (template.natoCode) return template.natoCode;
		const cat = this.categories.get(template.categoryId);
		if (cat?.natoCode) return cat.natoCode;
		return 'GUCI---';
	}

	/** 重置所有数据（用于测试或热重载） */
	reset(): void {
		this._sys.clear();
		this._battle = null;
		this._entries.length = 0;
	}
}

/** 全局 ModRegistry 单例 */
export const registry = new ModRegistry();
