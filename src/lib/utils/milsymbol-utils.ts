/**
 * milsymbol 工具函数
 * 将项目内部的 NatoUnitType / UnitSide 映射到 MIL-STD-2525C letter SIDC，
 * 并封装常用的 SVG 生成函数。
 */
import ms from 'milsymbol';
import type { NatoUnitType, UnitSide } from '$lib/types';
import type { SymbolOptions } from 'milsymbol';

/** 立场 → SIDC 中的 Affiliation 字符 (position 1) */
const SIDE_TO_AFFILIATION: Record<UnitSide, string> = {
	blue: 'F', // Friend
	red: 'H', // Hostile
	neutral: 'N' // Neutral
};

/**
 * 北约单位类型 → SIDC Function ID（positions 4-9，共 6 位）
 * 参考 MIL-STD-2525C 及 milsymbol 内置 SIDC 表
 */
const NATO_TYPE_TO_FUNCTION: Record<NatoUnitType, { dimension: string; fn: string }> = {
	infantry: { dimension: 'G', fn: 'UCI---' }, // Ground Combat Infantry
	armor: { dimension: 'G', fn: 'UCA---' }, // Ground Combat Armour
	artillery: { dimension: 'G', fn: 'UCF---' }, // Ground Combat Field Artillery
	mechanized: { dimension: 'G', fn: 'UCIZ--' }, // Ground Combat Armor + Infantry (Mech)
	aviation: { dimension: 'A', fn: 'MF----' }, // Air Military Fixed Wing
	navy: { dimension: 'S', fn: 'C-----' }, // Sea Surface Combatant
	headquarters: { dimension: 'G', fn: 'UH1---' } // Ground HQ/Headquarters
};

/**
 * 生成 10 位 MIL-STD-2525C letter SIDC
 * 格式: [S][Affil][Dim][P][FunctionID(6)]
 */
export function getSIDC(type: NatoUnitType, side: UnitSide): string {
	const affil = SIDE_TO_AFFILIATION[side] ?? 'F';
	const { dimension, fn } = NATO_TYPE_TO_FUNCTION[type] ?? NATO_TYPE_TO_FUNCTION.infantry;
	return `S${affil}${dimension}P${fn}`;
}

/**
 * 将任意 CSS 颜色解析为 rgba（支持 #rrggbb 和 #rgb）
 * 用于生成浅色填充背景
 */
function toRgba(color: string, alpha: number): string {
	const hex6 = color.match(/^#([0-9a-f]{6})$/i);
	if (hex6) {
		const v = parseInt(hex6[1], 16);
		return `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},${alpha})`;
	}
	const hex3 = color.match(/^#([0-9a-f]{3})$/i);
	if (hex3) {
		const [r, g, b] = hex3[1].split('').map((c) => parseInt(c + c, 16));
		return `rgba(${r},${g},${b},${alpha})`;
	}
	return color;
}

/**
 * 使用 milsymbol 生成 SVG 字符串
 * @param factionColor 阵营自定义颜色（传入时覆盖北约默认配色）
 */
export function getMilSymbolSVG(
	type: NatoUnitType,
	side: UnitSide,
	size: number = 35,
	factionColor?: string,
	extra: Partial<SymbolOptions> = {}
): string {
	const sidc = getSIDC(type, side);
	// 只染填充背景和内部图标为阵营色，描边保持黑色默认（最稳健的对比度方案）
	const colorOptions: Partial<SymbolOptions> = factionColor
		? {
				fillColor: toRgba(factionColor, 0.25),
				iconColor: factionColor
			}
		: {};
	const sym = new ms.Symbol(sidc, {
		size,
		infoFields: false,
		colorMode: 'Light',
		...colorOptions,
		...extra
	});
	return sym.asSVG();
}

/**
 * 获取 milsymbol 符号的锚点（用于 Leaflet marker 对齐）
 */
export function getMilSymbolAnchor(
	type: NatoUnitType,
	side: UnitSide,
	size: number = 35
): { x: number; y: number } {
	const sidc = getSIDC(type, side);
	const sym = new ms.Symbol(sidc, { size, infoFields: false });
	return sym.getAnchor();
}

/**
 * 获取 milsymbol 符号的尺寸
 */
export function getMilSymbolSize(
	type: NatoUnitType,
	side: UnitSide,
	size: number = 35
): { width: number; height: number } {
	const sidc = getSIDC(type, side);
	const sym = new ms.Symbol(sidc, { size, infoFields: false });
	const bbox = sym.getSize();
	return bbox;
}
