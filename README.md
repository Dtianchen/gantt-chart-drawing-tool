# 进度工具 - 甘特图项目管理应用

<p align="center">
  <strong>轻量级项目进度管理工具，支持甘特图可视化与任务跟踪</strong><br>
  基于 React + TypeScript + Vite + Electron 构建，支持 Web 浏览器和 Windows 桌面端
</p>

---

## 功能特性

| 功能 | 说明 |
|------|------|
| **甘特图展示** | 时间轴视图直观显示任务进度条，支持日/周/月三种粒度切换 |
| **任务管理** | 添加、编辑、删除、拖拽排序任务 |
| **时间调整** | 通过拖拽修改任务的开始/结束日期 |
| **工程标尺** | 每5天显示刻度数字（0, 5, 10...），清晰标注工期位置 |
| **工期统计** | 自动计算并显示项目总工期天数 |
| **今日线** | 在时间轴上标记当前日期位置 |
| **周末高亮** | 自动标识周六/周日，方便识别工作日 |
| **导出图片** | 将甘特图导出为 PNG 图片保存/分享 |
| **数据持久化** | 使用 localStorage 自动保存，刷新不丢失 |
| **桌面应用** | Electron 打包为 Windows EXE，关闭窗口即完全退出 |

---

## 快速开始

### 环境要求

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### 安装与运行

```bash
# 克隆仓库
git clone https://gitee.com/tianchen007/gantt-chart-drawing-tool.git
cd gantt-chart-drawing-tool

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

浏览器访问 http://localhost:5173 即可使用。

### 一键脚本

| 脚本 | 用途 | 依赖 |
|------|------|------|
| `启动进度工具.bat` | 开发模式（自动安装依赖 + 自动构建 + 启动 dev server） | 系统已装 Node.js |
| `构建生产版本.bat` | 构建生产版本到 `dist/` 目录（Web 静态文件） | 系统已装 Node.js |
| `打包EXE.bat` | 打包 Windows 桌面应用到 `output/` 目录（含镜像加速 + 自动清进程） | 系统已装 Node.js |

> 双击 `.bat` 文件即可运行，无需手动输入命令。三个脚本均使用**系统 Node.js**（需确保 `node` 和 `npm` 在系统 PATH 中可用）。

---

## 部署方式

### 方式一：Web 版部署（静态文件）

```bash
# 方式A：命令行
npm run build

# 方式B：双击脚本
"构建生产版本.bat"
```

输出目录：`dist/`，包含完整的 Web 静态文件：

| 文件 | 说明 |
|------|------|
| `index.html` | 入口页面（JS/CSS 使用相对路径引用） |
| `assets/index-*.js` | 打包后的 JavaScript bundle |
| `assets/index-*.css` | 打包后的样式文件 |

可部署到任意静态服务器：
- **Nginx** — 将 `dist/` 内容放到 `html/` 目录
- **Vercel / Netlify** — 设置构建命令为 `npm run build`，输出目录为 `dist`
- **Gitee Pages** — 上传 `dist/` 内容到仓库的 `pages` 分支
- **本地预览** — `npx serve dist` 或 `npx vite preview`

### 方式二：桌面应用 EXE

像普通软件一样安装或直接运行：

```bash
# 方式A：命令行
npm run electron:build

# 方式B：双击脚本
"打包EXE.bat"
```

产物位于 `output/` 目录：

| 文件 | 类型 | 说明 |
|------|------|------|
| `进度工具 Setup 1.0.1.exe` | NSIS 安装版 | 双击安装，创建桌面快捷方式 |
| `进度工具 1.0.1.exe` | Portable 便携版 | 无需安装，直接运行，关闭即退出 |

---

## 内置示例数据

项目预置了完整的 **180 天软件项目开发流程** 作为默认演示数据：

| 阶段 | 时间范围 | 任务数 | 主要内容 |
|------|---------|--------|---------|
| 1. 启动与需求 | 第1~15天 | 6个 | 团队组建、需求调研、SRS 编写 |
| 2. 系统设计 | 第16~35天 | 6个 | 架构设计、数据库设计、API 设计、UI 原型 |
| 3. 环境搭建 | 第28~38天 | 4个 | CI/CD 流水线、代码规范、环境配置 |
| 4. 后端开发 | 第36~85天 | 11个 | 认证权限、业务模块、第三方对接 |
| 5. 前端开发 | 第46~95天 | 11个 | 组件库、页面开发、移动端适配 |
| 6. 联调测试 | 第86~115天 | 6个 | 接口联调、性能测试、安全测试 |
| 7. UAT验收 | 第116~140天 | 6个 | 用户培训、两轮 UAT 测试 |
| 8. 部署上线 | 第141~165天 | 7个 | 生产部署、数据迁移、灰度发布 |
| 9. 项目收尾 | 第166~180天 | 5个 | 验收交付、文档归档、复盘总结 |

> 共 **62 个任务**，涵盖软件开发生命周期全流程。可在应用中自由编辑或清空后自定义。

---

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| UI 框架 | React | 18.x |
| 语言 | TypeScript | 5.x |
| 构建工具 | Vite | 5.x |
| 样式方案 | TailwindCSS | 3.x |
| 拖拽库 | @dnd-kit | latest |
| 日期处理 | dayjs | latest |
| 图片导出 | html-to-image | latest |
| 图标库 | lucide-react | latest |
| 桌面打包 | Electron + electron-builder | latest |

---

## 项目结构

```
进度工具/
├── src/                          # 源代码（20个文件）
│   ├── components/               # React 组件（11个）
│   │   ├── GanttChart/           # 甘特图主容器
│   │   ├── GanttTimeline/        # 时间轴 + 任务条区域
│   │   ├── TaskTable/            # 左侧任务列表表格
│   │   ├── TaskRow/              # 单行任务组件
│   │   ├── TaskBar/              # 任务进度条（可拖拽调整）
│   │   ├── TimeScaleHeader/      # 时间刻度表头
│   │   ├── ProjectHeader/        # 项目头部信息
│   │   ├── Toolbar/              # 工具栏（添加/导出/缩放/今日线）
│   │   ├── TaskAddModal/         # 添加任务弹窗
│   │   └── TaskEditModal/        # 编辑任务弹窗
│   ├── hooks/                    # 自定义 Hooks（3个）
│   ├── utils/dateUtils.ts        # 日期计算工具函数
│   ├── types/index.ts            # TypeScript 类型定义
│   ├── data/mockData.ts          # 初始模拟数据（180天软件项目）
│   ├── App.tsx                   # 主应用组件
│   ├── main.tsx                  # React 入口
│   └── index.css                 # 全局样式
├── electron/                     # Electron 配置
│   ├── main.cjs                  # 主进程（CommonJS，关闭窗口自动退出）
│   └── preload.cjs               # 安全预加载脚本
├── build/
│   └── icon.ico                  # Windows 应用图标（256x256 蓝色）
├── public/favicon.svg            # 网页图标
├── index.html                    # HTML 入口
├── package.json                  # 项目配置 & Electron Builder 配置
├── vite.config.ts                # Vite 配置（base: './' 相对路径）
├── tailwind.config.js            # TailwindCSS 配置
├── tsconfig.json                 # TypeScript 编译配置
├── postcss.config.js             # PostCSS 配置
├── .gitignore                    # Git 忽略规则
├── CHANGELOG.md                  # 版本更新日志
├── README.md                     # 本文件
├── 启动进度工具.bat               # 开发模式一键启动
├── 构建生产版本.bat               # 构建生产版本一键脚本
└── 打包EXE.bat                    # Electron EXE 打包（含镜像+自动清进程）
```

---

## 使用说明

### 基本操作

1. **添加任务**：点击工具栏「+ 添加任务」按钮
2. **编辑任务**：点击任务名称进入编辑模式，修改名称/开始日期/结束日期/颜色/进度
3. **删除任务**：点击任务行右侧删除图标
4. **调整时间**：拖拽任务条的左边缘（开始日期）或右边缘（结束日期）
5. **排序任务**：拖拽任务行左侧 ⋮ 图标上下拖动调整顺序
6. **导出图片**：点击工具栏「导出图片」按钮下载 PNG

### 快捷操作

- 点击「**今日**」按钮快速定位当前日期在时间轴上的位置
- 使用「**缩放控件**」切换 日 / 周 / 月 三种时间粒度视图
- 所有修改自动保存到浏览器本地存储（localStorage）

---

## 常见问题

### Q: EXE 关闭后进程还在后台运行？

**A:** 此问题已在 v1.0.4 中修复。现在关闭窗口会立即调用 `app.quit()` 终止整个进程，不会残留。如果使用旧版 EXE 仍有此问题，请在任务管理器中手动结束进程。

### Q: EXE 运行后是空白页面？

**A:** 已通过 Vite 相对路径配置修复（`vite.config.ts` 设置 `base: './'`）。请确认使用 v1.0.3 或更高版本的打包产物。

### Q: 打包时提示"文件被占用"？

**A:** `打包EXE.bat` 已内置自动清理逻辑。如果仍报错：
1. 确保已关闭所有正在运行的「进度工具.exe」
2. 按 `Ctrl+Shift+Esc` 打开任务管理器确认无残留进程
3. 如果还不行，重启电脑后再打包

### Q: 导出的图片不完整？

**A:** 请确保：
1. 浏览器已滚动到甘特图最顶部和最左侧
2. 尝试缩小缩放比例后再导出
3. 使用 Chrome / Edge 浏览器获得最佳效果

### Q: 数据保存在哪里？如何备份？

**A:** 任务数据存储在浏览器的 localStorage 中。清除浏览器数据会导致丢失。建议定期使用「导出图片」功能进行视觉备份。

### Q: 没有 Node.js 环境怎么办？

**A:** 有两种方案：

1. **使用 EXE 桌面应用**（推荐） — 直接运行 `output/` 目录中的 EXE 文件，已内置 Chromium 内核，无需任何环境
2. **安装 Node.js** — 访问 [nodejs.org](https://nodejs.org/) 下载 LTS 版本（v20+），安装时勾选"添加到 PATH"。安装后即可使用三个 `.bat` 一键脚本

> 验证 Node.js 是否可用：打开终端输入 `node -v` 和 `npm -v`，显示版本号即正常。

---

## 版本历史

查看完整变更记录：[CHANGELOG.md](./CHANGELOG.md)

| 版本 | 日期 | 关键变更 |
|------|------|---------|
| [1.0.4](./CHANGELOG.md#104--2026-04-09) | 2026-04-09 | 修复进程残留 bug；清理无用文件释放 ~100MB |
| [1.0.3](./CHANGELOG.md#103--2026-04-08) | 2026-04-08 | 修复 EXE 空白/锁定/签名；新增180天示例数据 |
| [1.0.2](./CHANGELOG.md#102--2026-04-08) | 2026-04-08 | 新增 Electron 打包、一键脚本、完整文档 |
| [1.0.1](./CHANGELOG.md#101--2026-04-08) | 2026-04-08 | 修复 TypeScript 类型错误 |
| [1.0.0](./CHANGELOG.md#100--2026-04-08) | 2026-04-08 | 首次发布 |

---

## 远程仓库

- **Gitee**: https://gitee.com/tianchen007/gantt-chart-drawing-tool
- **分支**: master

---

## 许可证

本项目仅供学习交流使用。
