# 进度计划甘特图绘制工具

一款基于 Web 的轻量级项目进度管理甘特图工具，支持任务增删改查、拖拽排序、整体移动/边缘调整时间、双视图切换、高清图片导出及数据持久化。

![技术栈](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue) ![Vite](https://img.shields.io/badge/Vite-5-646CFF) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4)

---

## 功能特性

| 功能 | 说明 |
|------|------|
| 任务管理 | 新建、编辑、删除任务，支持自定义名称、起止时间（通过持续时间自动计算）、颜色选择 |
| 智能默认日期 | 添加新任务时自动以上一个任务的结束日期 + 1 天作为开始时间 |
| 拖拽排序 | 通过 @dnd-kit 实现任务行的上下拖拽排序 |
| 整体平移 | 按住任务条中间区域左右拖动，保持持续时间不变，同步偏移起止时间 |
| 边缘调期 | 左右拖拽任务条两侧的边缘手柄，动态调整开始或结束日期 |
| 双视图切换 | 周视图（28px/天，详细） / 月视图（12px/天，紧凑总览） 一键切换 |
| 今日标记线 | 红色竖线标记今日位置，可显示/隐藏 |
| 导出 PNG | 2x 高清导出包含项目信息（名称、起止时间、计划工期）+ 完整甘特图的 PNG 图片 |
| 数据持久化 | 基于 localStorage 自动保存，刷新不丢失 |
| 周末高亮 | 自动标记周末日期区域（浅红色背景） |
| 帮助面板 | 内置使用帮助弹窗，含功能说明与操作指南 |

## 快速开始

### 环境要求

- **Node.js** >= 18.x
- **npm** >= 9.x（或 pnpm / yarn）

> **注意**：只需安装一次 Node.js。每次启动项目时执行 `npm install` 安装依赖包即可，不需要重新安装 Node.js 本身。

### 安装步骤

```bash
# 1. 进入项目目录
cd 进度工具

# 2. 安装依赖（首次或 node_modules 被删除后需要执行）
npm install

# 3. 启动开发服务器
npm run dev
```

启动后在浏览器访问 `http://localhost:5173` 即可使用。

### 其他命令

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 项目结构

```
进度工具/
├── index.html                  # HTML 入口
├── package.json                # 项目依赖配置
├── tsconfig.json               # TypeScript 配置
├── vite.config.ts              # Vite 构建配置
├── tailwind.config.js          # TailwindCSS 样式配置
├── postcss.config.js           # PostCSS 配置
├── .gitignore                  # Git 忽略规则
│
└── src/
    ├── main.tsx                # React 应用入口
    ├── App.tsx                 # 根组件（状态管理、布局、帮助弹窗）
    ├── index.css               # 全局样式（含甘特图专用 CSS 变量）
    │
    ├── components/             # UI 组件目录
    │   ├── GanttChart/index.tsx       # 甘特图容器（导出 ref）
    │   ├── GanttTimeline/index.tsx     # 时间轴主体（网格线、任务条渲染）
    │   ├── TaskTable/index.tsx         # 左侧任务表格（表头 + 行列表）
    │   ├── TaskRow/index.tsx           # 单行任务数据展示
    │   ├── TaskBar/index.tsx           # 可拖拽的任务条（整体移动 + 边缘调整）
    │   ├── TimeScaleHeader/index.tsx   # 时间刻度头（月份行 + 日期行）
    │   ├── ProjectHeader/index.tsx     # 顶部标题栏（工具栏 + 项目名称 + 时间信息栏）
    │   ├── Toolbar/index.tsx           # 工具栏按钮组（添加/导出/视图/今日线/帮助）
    │   ├── TaskEditModal/index.tsx     # 编辑任务弹窗（含删除功能）
    │   ├── TaskAddModal/index.tsx      # 添加任务弹窗（智能默认日期）
    │   └── HelpModal/index.tsx         # 使用帮助弹窗
    │
    ├── hooks/                  # 自定义 Hooks
    │   ├── useTaskManager.ts          # 任务 CRUD 状态管理
    │   ├── useGanttExport.ts           # PNG 导出（含头部信息合成）
    │   └── useLocalStorage.ts          # localStorage 封装
    │
    ├── types/
    │   └── index.ts             # TypeScript 类型定义（Task, Project, TimeScale 等）
    │
    ├── utils/
    │   └── dateUtils.ts        # 日期计算工具函数（基于 dayjs）
    │
    └── data/
        └── mockData.ts         # 默认示例数据
```

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| [React](https://react.dev) | 18.3 | UI 框架 |
| [TypeScript](https://www.typescriptlang.org/) | 5.6 | 类型安全 |
| [Vite](https://vitejs.dev/) | 5.4 | 构建工具 & 开发服务器（HMR） |
| [TailwindCSS](https://tailwindcss.com/) | 3.4 | 原子化 CSS 框架 |
| [@dnd-kit/core](https://dndkit.com/) | 6.1 | 拖拽核心库 |
| [@dnd-kit/sortable](https://dndkit.com/) | 8.0 | 排序拖拽 |
| [dayjs](https://day.js.org/) | 1.11 | 轻量日期处理（避免 Windows 时区问题） |
| [html-to-image](https://github.com/bubkoo/html-to-image) | 1.11 | DOM 转 PNG（2x 像素密度） |
| [lucide-react](https://lucide.dev/) | 0.460 | 图标库 |

## 使用说明

### 页面布局

页面从上到下分为四个区域：

1. **顶部标题栏** — 显示"进度计划甘特图绘制工具"
2. **工具栏** — 包含操作按钮组（添加任务 / 导出图片 / 视图切换 / 今日线 / 帮助）
3. **信息栏** — 显示项目名称（可编辑）、开始时间、结束时间、计划工期
4. **主内容区** — 左侧任务列表 + 右侧甘特图时间轴

### 基本操作

1. **修改项目名**：点击信息栏中铅笔图标旁的文本框直接输入
2. **添加任务**：点击「添加任务」→ 填写名称 → 选择开始时间与持续时间 → 结束时间自动计算 → 选择颜色 → 确定
3. **编辑任务**：点击甘特图中的任务条 → 弹出编辑框修改所有属性
4. **删除任务**：在编辑弹窗中点击「删除任务」按钮
5. **调整顺序**：拖拽左侧任务行的抓取图标（⋮⋮）上下移动
6. **整体移动任务**：按住任务条中间区域左右拖动（持续时间不变）
7. **调整起止时间**：拖拽任务条左侧或右侧的边缘手柄
8. **切换视图**：点击「周视图 / 月视图」按钮
9. **显示/隐藏今日线**：点击「今日线 / 无今日线」按钮
10. **导出图片**：点击「导出图片」下载高清 PNG（含完整项目信息和全部任务）

### 任务条三种操作模式

| 操作 | 触发方式 | 效果 | 光标提示 |
|------|---------|------|---------|
| 整体移动 | 按住任务条**中间区域**拖动 | 左右平移，起止时间同步偏移，持续时间不变 | `grab` → `grabbing` |
| 调整开始 | 拖拽任务条**左边缘**（约8px宽） | 改变开始时间，自动调整结束时间 | ↔ 水平调整 |
| 调整结束 | 拖拽任务条**右边缘**（约8px宽） | 改变结束时间，自动调整持续时间 | ↔ 水平调整 |

### 视图模式

| 模式 | 日宽度 | 适用场景 |
|------|--------|----------|
| 周视图 | 28px | 详细查看每日进度，适合短期项目 |
| 月视图 | 12px | 长周期项目总览，适合多任务大范围查看 |

### 智能日期逻辑

- 添加第一个任务时，默认开始时间为**明天**
- 添加后续任务时，默认开始时间为**上一任务的结束日期 + 1 天**
- 持续时间默认为 **5 天**
- 开始时间和持续时间改变时，结束时间自动重算；反之亦然

## 常见问题

### Q: 每次启动都要重新安装依赖吗？
**A:** 不需要重装 Node.js 本身。只需要在项目目录下执行 `npm install` 安装依赖包（`node_modules` 目录）。如果 `node_modules` 已存在且未损坏，直接运行 `npm run dev` 即可。

### Q: 数据保存在哪里？
**A:** 所有数据通过浏览器 `localStorage` 自动持久化，键前缀为 `gantt_`。清除浏览器数据会丢失已保存的任务。

### Q: 导出的图片只显示了部分任务怎么办？
**A:** 已修复此问题。导出时会从原始 DOM 获取真实任务总数并展开所有滚动容器，确保全部任务都包含在导出的图片中。如仍有问题请刷新页面后再次尝试。

### Q: 为什么使用 dayjs 而不是 Date？
**A:** 在 Windows 环境下 `new Date()` 解析 `YYYY-MM-DD` 格式的字符串会因 UTC 时区转换导致日期偏移一天。使用 dayjs 的本地解析可以避免这个问题。

## 开发说明

本项目使用 Vite 作为构建工具，支持热模块替换（HMR），代码修改后会自动刷新浏览器。

### 关键设计决策

- **行高固定为 30px** — 通过 CSS 变量 `--gantt-row-height` 统一控制，保证左右两侧对齐
- **左侧表格宽度 540px** — 固定列宽布局（编号64px + 名称弹性 + 时长80px + 开始112px + 结束112px）
- **Grid 布局** — 主容器采用 `grid-cols-[540px_auto]` 实现左右分栏
- **日期范围自动扩展** — 根据任务起止时间，开始前留白 1 天，结束后留白 3 天
- **线条统一风格** — 所有边框统一使用 `slate-200`（#e2e8f0）1px 细线，视觉一致
- **导出含项目信息** — 导出图片顶部自动附加一行项目名称、起止时间、计划工期信息
- **打印友好设计** — 头部使用白色背景，无边框色块，方便直接打印输出

## License

MIT
