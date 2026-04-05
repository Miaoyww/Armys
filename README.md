<div align="center">

# VETO

**否定权** · 模拟联合国会议系统

[![SvelteKit](https://img.shields.io/badge/SvelteKit-5-FF3E00?style=flat-square&logo=svelte&logoColor=white)](https://svelte.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://veto.miaoyww.top)

[**在线演示**](https://veto.miaoyww.top) · [**插件库**](https://github.com/VetoExpress/veto-plugins) · [**问题反馈**](https://github.com/Miaoyww/Veto/issues)

</div>

---

## 概述

VETO 是一款基于Svelte5的集现代军事推演、模拟联合国会议系统的综合平台，支持多军种作战单位的态势标绘、时间轴推演与 HOI4 风格战斗结算。无需安装，即开即用。

- **危机模式** — 自定义战场，部署陆海空三军单位，实时推演作战进程
- **会议模式** — 模拟联合国会议流程，支持多方代表发言、提案与表决
- **地图集成** — Leaflet 驱动，支持多种底图切换

---

## 技术栈

| 层次 | 技术 |
|------|------|
| 框架 | Svelte 5 + SvelteKit |
| 语言 | TypeScript |
| 样式 | Tailwind CSS v4 |
| 地图 | Leaflet + Sveaflet |
| 部署 | Vercel |

---

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

---

## 插件生态

VETO 支持通过插件扩展能力。官方插件库持续维护中：

> **[VetoExpress / veto-plugins](https://github.com/VetoExpress/veto-plugins)**

---

## 许可证

[LICENSE](./LICENSE)

---

## 致谢

军事符号渲染基于 [**milsymbol**](https://github.com/spatialillusions/milsymbol) 实现，遵循 MIL-STD-2525 标准。感谢 [@spatialillusions](https://github.com/spatialillusions) 的出色工作。
