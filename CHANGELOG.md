# 更新日志 (CHANGELOG)

本文档记录项目的所有重要变更，格式基于 [Keep a Changelog](https://keepachangelog.com/)。

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
| 1.0.0 | 2026-04-08 | Major | 首次发布，完整功能上线 |
| 1.0.1 | 2026-04-08 | Patch | 修复 TS 类型错误 |
| 1.0.2 | 2026-04-08 | Minor | 新增 Electron 打包、一键脚本、文档 |
| 1.0.3 | 2026-04-08 | Patch | 修复 EXE 空白/锁定/签名；新增强大示例数据 |
| 1.0.4 | 2026-04-09 | Patch | 修复进程残留 bug；清理无用文件 |
| 1.0.5 | 2026-04-09 | Minor | 新增内置 Nginx Web 服务（一键启动/停止） |
| 1.0.6 | 2026-04-09 | Patch | 修复导出图片错乱+任务数不一致；修复 HelpModal 崩溃 |

---

*文档最后更新：2026-04-09*
