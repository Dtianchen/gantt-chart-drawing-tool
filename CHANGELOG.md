# 更新日志 (CHANGELOG)

本文档记录项目的所有重要变更，格式基于 [Keep a Changelog](https://keepachangelog.com/)。

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
  - 修复：Electron 主进程文件重命名为 `.cjs` 扩展名（`main.js` → `main.cjs`, `preload.js` → `preload.cjs`）
- **BAT 脚本 Unicode 制表符乱码** (`'╗═══' is not recognized`)
  - 修复：移除 Unicode 绘图字符，改用 ASCII 安全字符 (`=`)
- **GitHub 网络超时**（国内环境无法下载 winCodeSign）
  - 修复：添加淘宝镜像加速 + 配置 `forceCodeSigning: false` 跳过代码签名

### 变更

| 文件 | 变更 |
|------|------|
| `vite.config.ts` | 新增 `base: './'` |
| `electron/main.js` → `electron/main.cjs` | 重命名（ESM/CJS 兼容） |
| `electron/preload.js` → `electron/preload.cjs` | 重命名（简化预加载脚本） |
| `package.json` | main 入口改为 `electron/main.cjs`；新增跳过签名配置 |
| `打包EXE.bat` | 自动清理进程 + 镜像加速 + 乱码修复 |
| `src/data/mockData.ts` | 替换为180天软件项目数据 |

### 提交记录

| 提交 ID | 说明 |
|---------|------|
| 待提交 | fix: 修复 EXE 空白页面、文件锁定、CJS/ESM 冲突等问题 |
| 待提交 | feat: 替换模拟数据为180天软件项目开发流程 |

---

## [1.0.2] - 2026-04-08

### 新增

- **Electron 桌面应用打包**
  - 支持 Windows NSIS 安装版 + Portable 便携版
  - 内置 Chromium 内核，无需浏览器即可运行
- **一键启动/构建脚本**
  - `start.bat` — 开发模式自动检测依赖并启动
  - `build.bat` — 自动检测依赖并执行构建
  - `启动进度工具.bat` / `构建生产版本.bat` — 便携版专用脚本
  - `打包EXE.bat` — Electron EXE 打包脚本

### 新增文件

| 文件 | 说明 |
|------|------|
| `electron/main.js` | Electron 主进程（窗口管理） |
| `electron/preload.js` | 安全预加载脚本 |
| `启动进度工具.bat` | 便携版一键启动 |
| `构建生产版本.bat` | 便携版一键构建 |
| `打包EXE.bat` | EXE 打包脚本 |
| `README.md` | 完整项目说明文档 |

### 部署方式

| 方式 | 适用场景 | 输出目录 |
|------|---------|---------|
| Web 版 | 部署到 Nginx/Vercel/Gitee Pages | `dist/` |
| EXE 安装版 | 正式发布，像普通软件安装 | `output/` |
| EXE 便携版 | U盘携带，无需安装直接运行 | `output/` |

---

## [1.0.1] - 2026-04-08

### 修复

- **TypeScript 类型错误**
  - `GanttChart/index.tsx` — 修复 `RefObject<HTMLDivElement | null>` 类型不兼容
  - `TaskEditModal/index.tsx` — 修复 `task` 可能为 null 的空值检查缺失

### 构建

- 生产构建成功：HTML (0.48 kB) + CSS (26.09 kB) + JS (~255 kB)
- Gzip 压缩后总计约 **86 kB**

---

## [1.0.0] - 2026-04-08

### 新增

- 项目初始化完成，甘特图应用首次发布

#### 功能清单

- 甘特图时间轴视图展示任务进度条
- 任务 CRUD 操作（添加/编辑/删除）
- 拖拽排序和拖拽调整日期
- 工程标尺刻度（每5天）+ 工期统计
- 今日线标记 + 周末高亮显示
- 日/周/月三种时间粒度缩放切换
- PNG 图片导出功能
- localStorage 数据持久化

#### 技术栈

React 18 + TypeScript 5 + Vite 5 + TailwindCSS 3 + @dnd-kit + dayjs + html-to-image + lucide-react

---

## 版本历史总览

| 版本 | 日期 | 类型 | 关键变更 |
|------|------|------|---------|
| 1.0.0 | 2026-04-08 | Major | 首次发布，完整功能上线 |
| 1.0.1 | 2026-04-08 | Patch | 修复 TS 类型错误 |
| 1.0.2 | 2026-04-08 | Minor | 新增 Electron 打包、一键脚本 |
| 1.0.3 | 2026-04-08 | Patch | 修复 EXE 空白/锁定/签名问题；新增强大示例数据 |

---

*文档最后更新：2026-04-08*
