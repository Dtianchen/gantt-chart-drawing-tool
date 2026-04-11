# 更新日志 (CHANGELOG)

本文档记录项目的所有重要变更，格式基于 [Keep a Changelog](https://keepachangelog.com/)。

---

## [1.0.8] - 2026-04-10

### 重构：视图系统

- **移除周视图和月视图**，`TimeScale` 类型从 `'day' | 'week' | 'month' | 'custom'` 缩减为 `'day' | 'custom'`
- **日视图**：逐日渲染，每格 28px（`dayWidth` = `UNIT_WIDTH / activeDaysPerUnit`）
- **自定义视图**：单元模式，每格固定 28px 宽度，默认 2 天/格，可自定义 1-365 天/格
- `SCALE_CONFIG` 移除 `week`/`month` 配置项；清理全项目 8 处残留的 `scale === 'month'` 死代码引用

### 新功能

- **时间轴表头改为三行结构**（总高 50px）：
  - **第一行（14px）**：年月分组（日视图 `YYYY.M`，自定义视图 `YYYY年M月`），跨单元合并
  - **第二行（16px）**：日期数字 + 星期缩写（与日视图一致格式）
  - **第三行（20px）工程标尺**：每5天显示刻度数字，11px 蓝色字体（`text-blue-500`）
- **信息栏标题栏对齐时间轴高度**
  - CSS 变量 `--gantt-table-header-height` 从 30px → **50px**
  - 两行结构：第一行（30px）显示列标题（编号/工作名称/持续时间/开始时间/结束时间），第二行（20px）显示「工程标尺」标签
- **自定义视图周末高亮修复**
  - 原逻辑：遍历单元日期范围检查是否含周末 → 导致非周末列也被高亮
  - 修复后：仅根据单元末尾日期是否为周六/日判断高亮（与表头一致）

### 变更

| 文件 | 说明 |
|------|------|
| `src/types/index.ts` | `TimeScale` 缩减为 day/custom；移除 week/month SCALE_CONFIG |
| `src/components/TimeScaleHeader/index.tsx` | 重写三行表头；CustomViewHeader 单元模式+末尾日期显示；工程标尺行 h-[20px]、字体 11px |
| `src/components/GanttTimeline/index.tsx` | 自定义视图单元模式渲染；周末高亮统一基于 endDate 判断 |
| `src/components/TaskTable/index.tsx` | 标题栏两行结构(30+20=50px)；移除 month 死代码 |
| `src/components/TaskRow/index.tsx` | 移除 5 处 scale === 'month' 死代码 |
| `src/components/TaskBar/index.tsx` | 移除 scale === 'month' 死代码 |
| `src/components/HelpModal/index.tsx` | 视图切换描述更新为日视图/自定义视图 |
| `src/App.tsx` | customDays 默认值从 15 改为 2 |
| `src/hooks/useGanttExport.ts` | TIME_HEADER_H 更新为 50（匹配三行表头） |
| `src/index.css` | --gantt-table-header-height: 30→50 |
| `README.md` | 功能特性、使用说明、版本历史同步更新 |
| `package.json` | 版本号 1.0.7→1.0.8 |

---

## [1.0.7] - 2026-04-09

### 新功能

- **模板系统**（替代原「重置」功能）
  - 工具栏「重置」按钮改为「模板」下拉选择器
  - 新增 `src/data/templates.ts`，定义三套预设项目模板：
    - **空白模板**：不填充数据，从零开始
    - **系统集成项目**：7 个阶段（前期准备→方案设计→采购到货→实施部署→测试验证→上线交付→运维售后），约 3 个月工期
    - **软件开发项目**：8 个阶段（启动规划→需求分析→设计→开发→测试→部署上线→验收交付→运维迭代），约 2 个月工期
  - 自定义确认弹窗替代原生 window.confirm，UI 与项目风格统一
    - 蓝紫渐变标题栏、AlertTriangle 警告图标、双按钮布局

### UI 重构

- **顶部标题栏**重新设计为蓝紫渐变风格
  - 背景：`from #5b8def → via #7c6fd6 → to #9366c9`
  - 标题 + 副标题白色文字、圆角卡片样式
- **信息栏列宽调整**
  - 编号：w-16(64px) → w-10(40px)
  - 开始/结束时间：w-28(112px) → w-20(80px)
  - 持续时间表头：「持续时间（天）」→ 「持续时间」，数值后追加「天」字
  - 信息栏总宽度：540px → 460px
- **信息栏视觉优化**
  - 列分隔线、行底部分割线统一使用纯黑边框 (`border-black`)
  - 文字颜色全部改为纯黑 (`text-black`)
- **项目信息栏**
  - 字号从 text-xs(12px) 升至 text-sm(14px)
  - 项目名称 input 宽度计算适配新字号
- **空状态提示**增加模板引导文字

### 变更

| 文件 | 说明 |
|------|------|
| `src/data/templates.ts` | **新增** — 三套项目模板定义 |
| `src/components/Toolbar/index.tsx` | 重写：重置→模板下拉+自定义确认弹窗 |
| `src/hooks/useTaskManager.ts` | 新增 `loadTemplate(templateId)` 方法 |
| `src/App.tsx` | onReset→onLoadTemplate 回调；标题栏蓝紫渐变 |
| `src/components/TaskTable/index.tsx` | 列宽+边框+表头文字纯黑化 |
| `src/components/TaskRow/index.tsx` | 行宽+边框+行分割线+文字纯黑化 |
| `src/components/GanttChart/index.tsx` | 信息栏宽度 540→460px |
| `src/components/ProjectHeader/index.tsx` | 信息栏字号+input宽度适配 |

---

## [1.0.6] - 2026-04-09

### 修复

- **导出图片信息栏错乱**（任务条位置偏移、左右不对齐、日期散落）
  - 根因：`forceAllVisible` 过于激进，清除了 `height/flex/grid` 等布局属性
  - 修复：重写为 `removeOverflowClipping` — 仅精准清除 `overflow/max-height/clip` 四个溢出属性
  - 影响：Grid 布局和行高保持完整，导出图片与页面显示一致

- **导出图片任务数与页面不一致**
  - 根因链路：App 未传 taskCount → 导出函数只能从 DOM 查询 → 受 overflow-hidden 约束 → 部分行被裁剪
  - 修复：
    1. `useGanttExport` 新增 `taskCount` 参数，优先使用传入的可靠值
    2. `TreeWalker` 遍历所有子元素强制 overflow=visible（替代递归 fixChildren）
    3. `Toolbar` 新增 `taskCount` prop 并透传给导出函数
    4. `App` 传入 `tasks.length` 作为任务数来源

- **HelpModal 运行时崩溃**（点击帮助面板白屏）
  - 根因：之前清理 import 时误删了 `Plus/Pencil/GripVertical/Move/Calendar/ZoomIn/Download` 共 7 个图标
  - 修复：恢复全部 7 个图标的 import

### 变更

| 文件 | 说明 |
|------|------|
| `src/hooks/useGanttExport.ts` | 重写：taskCount 参数 + removeOverflowClipping 精准清除 + Grid 列宽精确设值 |
| `src/components/Toolbar/index.tsx` | 新增 taskCount prop |
| `src/App.tsx` | 传入 taskCount={tasks.length} |
| `src/components/HelpModal/index.tsx` | 恢复 7 个缺失的 lucide-react 图标 import |
| `.gitignore` | 补充 output/、release/ 忽略规则 |

---

## [1.0.5] - 2026-04-09

### 新功能

- **内置便携版 Nginx Web 服务器**（4.5MB，Nginx 1.26.3）
  - `启动Web服务.bat`：一键构建 + 启动 Nginx + 打开浏览器（http://localhost:8080）
  - `停止Web服务.bat`：一键停止 Nginx 服务
  - 预配置 `nginx.conf`：SPA 路由支持、Gzip 压压、静态资源长期缓存
  - 无需安装任何服务器软件，双击即用

### 变更

| 文件 | 说明 |
|------|------|
| `nginx/` | 内置 Nginx 运行时（精简至 13 文件 / 4.5MB） |
| `启动Web服务.bat` | 新增：自动构建+启动Nginx+打开浏览器 |
| `停止Web服务.bat` | 新增：停止 Nginx 进程 |
| `package.json` | 输出目录改为 `dist-exe/` 绕过文件锁定问题 |

---

## [1.0.4] - 2026-04-09

### 修复

- **EXE 关闭后进程残留**（窗口关闭但 Electron 主进程不退出）
  - 根因：`main.cjs` 中窗口关闭事件只设了 `mainWindow = null`，未调用 `app.quit()`
  - 修复：在 `closed` 事件中增加 `app.quit()`；统一 `window-all-closed` 为所有平台退出
  - 影响：关闭 EXE 窗口后进程立即终止，不再锁定文件

### 清理

删除以下无用文件和目录：

| 文件/目录 | 原因 |
|-----------|------|
| `start.bat` | 被「启动进度工具.bat」替代 |
| `build.bat` | 被「构建生产版本.bat」替代 |
| `gen-icon.cjs` | 一次性图标生成脚本（icon.ico 已生成） |
| `dist-release/` | 旧打包输出目录（已换用 output/） |
| `runtime/` | 便携版 Node.js v20 运行时（~100MB，已被 EXE 替代） |

### 变更

| 文件 | 变更 |
|------|------|
| `electron/main.cjs` | 窗口关闭时调用 `app.quit()` 防止进程残留 |
| `.gitignore` | 新增 output/、release/、runtime/、gen-icon.cjs 忽略规则 |
| `打包EXE.bat` | 打包前自动 taskkill 清理残留进程 |

---

## [1.0.3] - 2026-04-08

### 新增

- **180天软件项目开发流程数据**
  - 完整的软件开发生命周期模板（62个任务，9个阶段）
  - 覆盖从启动收尾的全流程：需求→设计→开发→测试→验收→上线
  - 替换原有通用模拟数据，开箱即用
- **Windows ICO 应用图标** (`build/icon.ico`)
  - 蓝色主题 256x256 图标，用于 EXE 文件和窗口图标

### 修复

- **EXE 运行空白页面**
  - 根因：Vite 构建使用绝对路径 (`/assets/xxx.js`)，Electron `file://` 协议无法解析
  - 修复：`vite.config.ts` 添加 `base: './'` 改用相对路径
- **EXE 打包"文件被占用"错误**
  - 根因：残留 electron 进程锁定 `app.asar` 文件
  - 修复：打包脚本自动 `taskkill` 清理残留进程 + 更换输出目录为 `output/`
- **CommonJS / ES Module 冲突**（`require is not defined`）
  - 根因：`package.json` 设置 `"type": "module"` 导致 `.js` 文件被当作 ES 模块
  - 修复：Electron 主进程文件重命名为 `.cjs` 扩展名
- **BAT 脚本 Unicode 制表符乱码**
  - 修复：移除 Unicode 绘图字符，改用 ASCII 安全字符
- **GitHub 网络超时**（国内无法下载 winCodeSign）
  - 修复：添加淘宝镜像加速 + 配置 `forceCodeSigning: false`

### 变更

| 文件 | 变更 |
|------|------|
| `vite.config.ts` | 新增 `base: './'` |
| `electron/` | `.js` → `.cjs`（ESM/CJS 兼容） |
| `package.json` | main 入口 + 跳过签名配置 |
| `打包EXE.bat` / `启动进度工具.bat` / `构建生产版本.bat` | 全部重写修复乱码 |
| `src/data/mockData.ts` | 替换为180天软件项目数据 |

---

## [1.0.2] - 2026-04-08

### 新增

- **Electron 桌面应用打包** — NSIS 安装版 + Portable 便携版
- **一键脚本** — 启动进度工具.bat / 构建生产版本.bat / 打包EXE.bat
- **完整项目文档** — README.md / CHANGELOG.md

---

## [1.0.1] - 2026-04-08

### 修复

- TypeScript 类型错误（GanttChart RefObject、TaskEditModal 空值检查）

---

## [1.0.0] - 2026-04-08

### 新增

项目首次发布：甘特图时间轴视图、任务 CRUD、拖拽排序/调日期、工程标尺、工期统计、今日线、周末高亮、缩放切换、PNG 导出、localStorage 持久化。

---

## 版本历史总览

| 版本 | 日期 | 类型 | 关键变更 |
|------|------|------|---------|
| 1.0.8 | 2026-04-10 | Major | **重构视图系统**：移除周/月视图；时间轴三行表头(年月/日期+星期/工程标尺50px)；自定义视图单元模式(默认2天/格)；信息栏标题栏对齐；周末高亮逻辑统一 |
| 1.0.7 | 2026-04-09 | Major | 模板系统(3套预设)；UI全面重构(蓝紫标题栏/纯黑边框/列宽优化) |
| 1.0.6 | 2026-04-09 | Patch | 修复导出图片错乱+任务数不一致；修复 HelpModal 崩溃 |
| 1.0.5 | 2026-04-09 | Minor | 新增内置 Nginx Web 服务（一键启动/停止） |
| 1.0.4 | 2026-04-09 | Patch | 修复进程残留 bug；清理无用文件 |
| 1.0.3 | 2026-04-08 | Patch | 修复 EXE 空白/锁定/签名；新增强大示例数据 |
| 1.0.2 | 2026-04-08 | Minor | 新增 Electron 打包、一键脚本、文档 |
| 1.0.1 | 2026-04-08 | Patch | 修复 TS 类型错误 |
| 1.0.0 | 2026-04-08 | Major | 首次发布，完整功能上线 |

---

*文档最后更新：2026-04-11*
