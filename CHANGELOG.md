# 更新日志 (CHANGELOG)

本文档记录项目的所有重要变更，格式基于 [Keep a Changelog](https://keepachangelog.com/)。

---

## [1.0.2] - 2026-04-08

### 新增

- **Electron 桌面应用打包**
  - 支持 Windows EXE 安装版 + 便携版
  - 内置 Chromium 内核，无需浏览器即可运行
- **便携启动包**
  - 内置 Node.js 运行时（v20.18.0），解压即用
  - 无需安装任何环境，双击 `启动进度工具.bat` 即可运行
  - 一键构建脚本 `构建生产版本.bat`
- **一键启动脚本**
  - `start.bat` — 开发模式自动检测依赖并启动
  - `build.bat` — 自动检测依赖并执行构建

### 文件变更

| 新增文件 | 说明 |
|---------|------|
| `electron/main.js` | Electron 主进程（窗口管理） |
| `electron/preload.js` | 安全预加载脚本 |
| `启动进度工具.bat` | 便携版一键启动脚本 |
| `构建生产版本.bat` | 便携版一键构建脚本 |
| `打包EXE.bat` | Electron EXE 打包脚本 |

### 部署方式

| 方式 | 适用场景 | 说明 |
|------|---------|------|
| **Web 版** (`dist/`) | 部署到服务器 | Nginx/Vercel/Gitee Pages |
| **便携版 ZIP** | 分享给他人 | 解压即用，含内置 Node.js |
| **EXE 安装版** | 正式发布 | 像普通软件一样安装运行 |
| **EXE 便携版** | U盘携带使用 | 无需安装，直接运行 |

### 提交记录

| 提交 ID | 说明 |
|---------|------|
| `bab9a66` | feat: 添加一键启动/构建脚本，自动安装依赖 |

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
| `66b6468` | docs: 添加版本更新日志 (CHANGELOG.md) |

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
| 桌面打包 | Electron + electron-builder |

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
├── electron/               # Electron 桌面应用配置
│   ├── main.js             # 主进程
│   └── preload.js          # 预加载脚本
├── dist/                   # Web 生产构建产物
├── release/                # EXE 打包输出目录
├── runtime/                # 便携版 Node.js 运行时（可选）
├── public/favicon.svg      # 网站图标
├── index.html              # HTML 入口
├── package.json            # 项目配置
├── vite.config.ts          # Vite 配置
├── tailwind.config.js      # Tailwind 配置
├── tsconfig.json           # TypeScript 配置
├── .gitignore              # Git 忽略规则
├── README.md               # 项目说明文档
├── CHANGELOG.md            # 版本更新日志
├── start.bat               # 开发模式一键启动
├── build.bat               # 一键构建生产版本
├── 启动进度工具.bat         # 便携版启动（使用内置 Node.js）
├── 构建生产版本.bat          # 便携版构建（使用内置 Node.js）
└── 打包EXE.bat              # Electron EXE 打包
```

### 使用方式

```bash
# 安装依赖（首次运行或拉取代码后）
npm install

# 开发模式运行（热更新）
npm run dev
# 或双击 start.bat

# 构建生产版本
npm run build
# 或双击 build.bat

# 预览构建结果
npm run preview

# 打包 EXE 桌面应用
npm run electron:build
# 或双击 打包EXE.bat
```

### 便携版使用

无需安装任何环境，解压后：
```
# 启动开发服务器
双击 "启动进度工具.bat"

# 构建生产版本
双击 "构建生产版本.bat"
```

### 提交记录

| 提交 ID | 说明 |
|---------|------|
| `490ef99` | init: 进度工具项目初始化 - 甘特图应用 |

---

## 版本历史

| 版本 | 日期 | 类型 | 说明 |
|------|------|------|------|
| 1.0.0 | 2026-04-08 | Major | 首次发布，完整功能上线 |
| 1.0.1 | 2026-04-04 | Patch | 修复 TypeScript 类型错误 |
| 1.0.2 | 2026-04-08 | Minor | 新增 Electron 打包、便携版、一键脚本 |

### 远程仓库

- **Gitee**: https://gitee.com/tianchen007/gantt-chart-drawing-tool
- **分支**: master

---

*文档最后更新：2026-04-08*
