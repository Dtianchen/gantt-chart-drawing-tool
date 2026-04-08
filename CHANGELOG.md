# 更新日志 (CHANGELOG)

本文档记录项目的所有重要变更，格式基于 [Keep a Changelog](https://keepachangelog.com/)。

---

## [1.0.1] - 2026-04-08

### 修复

- **TypeScript 类型错误**
  - `GanttChart/index.tsx` — 修复 `RefObject<HTMLDivElement | null>` 类型不兼容问题
  - `TaskEditModal/index.tsx` — 修复 `task` 可能为 null 的空值检查缺失问题

### 构建

- ✅ 生产构建成功（`npm run build`）
- 构建产物：HTML (0.48 kB) + CSS (26.09 kB) + JS (249.07 kB)
- Gzip 压缩后总计约 **86 kB**

### 提交记录

| 提交 ID | 说明 |
|---------|------|
| `c33a1c1` | fix: 修复 TypeScript 类型错误，构建成功 |

---

## [1.0.0] - 2026-04-08

### 新增

- 🎉 项目初始化完成

#### 功能特性

- **甘特图展示** — 时间轴视图显示任务进度条
- **任务管理** — 添加、编辑、删除、拖拽排序任务
- **时间调整** — 通过拖拽修改任务的开始/结束日期
- **工程标尺** — 每5天显示刻度数字（0, 5, 10...）
- **工期统计** — 自动计算并显示项目总工期
- **今日线** — 在时间轴上标记当前日期位置
- **缩放控制** — 支持 日/周/月 三种时间粒度切换
- **周末高亮** — 自动标识周六/周日（红色背景）
- **导出图片** — 将甘特图导出为 PNG 图片
- **数据持久化** — 使用 localStorage 自动保存任务数据

#### UI 细节优化

- 工作名称表头标题居中
- 工期统计数字在表格内显示
- 工程标尺刻度数字纯黑色，与日期列对齐

### 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建工具 | Vite 5 |
| 样式方案 | TailwindCSS 3 |
| 拖拽库 | @dnd-kit (core/sortable/utilities) |
| 日期处理 | dayjs |
| 图片导出 | html-to-image |
| 图标库 | lucide-react |

### 目录结构

```
进度工具/
├── src/
│   ├── components/        # 组件目录（11个组件）
│   │   ├── GanttChart/    # 甘特图容器
│   │   ├── GanttTimeline/ # 时间轴区域
│   │   ├── TaskTable/     # 任务列表表格
│   │   ├── TaskRow/       # 单行任务
│   │   ├── TaskBar/       # 任务进度条（可拖拽）
│   │   ├── TimeScaleHeader/ # 时间刻度表头
│   │   ├── ProjectHeader/ # 项目头部信息
│   │   ├── Toolbar/       # 工具栏
│   │   ├── TaskAddModal/  # 添加任务弹窗
│   │   ├── TaskEditModal/ # 编辑任务弹窗
│   │   └── HelpModal/     # 帮助弹窗
│   ├── hooks/
│   │   ├── useTaskManager.ts      # 任务 CRUD 操作
│   │   ├── useLocalStorage.ts     # 本地存储持久化
│   │   └── useGanttExport.ts      # 图片导出功能
│   ├── utils/dateUtils.ts         # 日期工具函数
│   ├── types/index.ts             # TypeScript 类型定义
│   └── data/mockData.ts           # 初始模拟数据（8个任务）
├── public/favicon.svg             # 网站图标
├── index.html                     # HTML 入口
├── package.json                   # 项目配置
├── vite.config.ts                 # Vite 配置
├── tailwind.config.js             # Tailwind 配置
├── tsconfig.json                  # TypeScript 配置
├── .gitignore                     # Git 忽略规则
└── README.md                      # 项目说明文档
```

### 使用方式

```bash
# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 提交记录

| 提交 ID | 说明 |
|---------|------|
| `490ef99` | init: 进度工具项目初始化 - 甘特图应用 |

---

## 版本说明

| 版本 | 日期 | 类型 | 说明 |
|------|------|------|------|
| 1.0.0 | 2026-04-08 | Major | 首次发布，完整功能上线 |
| 1.0.1 | 2026-04-08 | Patch | 修复 TypeScript 类型错误 |

### 远程仓库

- **Gitee**: https://gitee.com/tianchen007/gantt-chart-drawing-tool
- **分支**: master

---

*文档最后更新：2026-04-08*
