import { X, Plus, Pencil, GripVertical, Move, Calendar, ZoomIn, Download, ChevronDown, ChevronRight, ListTree, Undo2, Search } from 'lucide-react'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* 弹窗内容 */}
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-white rounded-t-xl">
          <h2 className="text-base font-bold text-slate-800">使用帮助</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* 内容区 */}
        <div className="px-6 py-5 overflow-y-auto space-y-5 text-sm text-slate-700">
          {/* 项目介绍 */}
          <section>
            <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-500 rounded-full" />
              项目简介
            </h3>
            <p className="leading-relaxed pl-3.5 text-slate-600">
              进度计划甘特图绘制工具是一款轻量级的项目进度管理工具，支持可视化甘特图展示、任务拖拽排序与时间调整、视图缩放切换、高清图片导出等功能。界面简洁直观，适合快速规划和管理各类项目进度。
            </p>
          </section>

          {/* 主要功能 */}
          <section>
            <h3 className="font-semibold text-slate-800 mb-2.5 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-500 rounded-full" />
              主要功能
            </h3>
            <ul className="space-y-2.5 pl-3.5">
              {[
                { icon: Plus, color: 'text-blue-600', bg: 'bg-blue-50', title: '添加任务', desc: '点击工具栏「添加任务」→「添加任务」创建顶级任务，或选中一个任务后点击「添加子任务」为其添加子任务' },
                { icon: ListTree, color: 'text-violet-600', bg: 'bg-violet-50', title: '子任务层级', desc: '支持父子任务嵌套，父任务自动计算起止时间（最早子任务开始 → 最晚子任务结束）；父任务名称加粗显示；点击展开/收起图标查看子任务' },
                { icon: Pencil, color: 'text-amber-600', bg: 'bg-amber-50', title: '编辑 / 删除', desc: '双击任务行打开编辑弹窗，可修改任务名称、时间、颜色、完成进度和前置任务。子任务可自由修改日期，父任务日期由系统自动计算' },
                { icon: GripVertical, color: 'text-green-600', bg: 'bg-green-50', title: '拖拽排序', desc: '按住左侧任务行的拖拽图标（⋮⋮）上下移动，调整任务显示顺序' },
                { icon: Move, color: 'text-violet-600', bg: 'bg-violet-50', title: '整体移动', desc: '按住任务条中间区域左右拖动，可整体平移任务起止时间，持续时间保持不变' },
                { icon: Calendar, color: 'text-rose-500', bg: 'bg-rose-50', title: '今日标记线', desc: '红色竖线标注当天位置，方便对照当前日期与各任务的时间关系，可显示/隐藏' },
                { icon: ZoomIn, color: 'text-purple-600', bg: 'bg-purple-50', title: '视图切换', desc: '日视图逐天显示（详细），自定义视图可设置每格代表天数（默认2天，每格28px宽），一键切换' },
                { icon: Download, color: 'text-emerald-600', bg: 'bg-emerald-50', title: '导入 / 导出', desc: '导出 PNG 图片、XLSX 表格或 JSON 数据备份；支持从 JSON 文件恢复完整项目数据（含任务层级、颜色、进度）' },
                { icon: Undo2, color: 'text-indigo-600', bg: 'bg-indigo-50', title: '撤销 / 重做', desc: '工具栏撤销/重做按钮或使用快捷键 Ctrl+Z / Ctrl+Shift+Z，最多保留 50 步操作历史' },
                { icon: Search, color: 'text-sky-600', bg: 'bg-sky-50', title: '搜索过滤', desc: '工具栏搜索框输入任务名称实时过滤，自动展开匹配项的父任务路径，左右区域同步显示结果' },
              ].map((item) => (
                <li key={item.title} className="flex items-start gap-2.5">
                  <span className={`${item.bg} ${item.color} p-1 rounded-md shrink-0 mt-0.5`}>
                    <item.icon size={13} />
                  </span>
                  <div>
                    <span className="font-medium text-slate-800">{item.title}</span>
                    <span className="text-slate-500 ml-0.5">{item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* 任务条操作说明 */}
          <section>
            <h3 className="font-semibold text-slate-800 mb-2.5 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-orange-500 rounded-full" />
              任务条操作
            </h3>
            <div className="pl-3.5 space-y-2 text-xs">
              <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="shrink-0 w-16 font-medium text-slate-700">中间区域</span>
                <span className="text-slate-600">按住拖动 → 整体左右移动，起止时间同步偏移，持续时间不变</span>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="shrink-0 w-16 font-medium text-slate-700">左边缘</span>
                <span className="text-slate-600">向左/右拖拽 → 调整开始时间，改变持续时间</span>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="shrink-0 w-16 font-medium text-slate-700">右边缘</span>
                <span className="text-slate-600">向左/右拖拽 → 调整结束时间，改变持续时间</span>
              </div>
            </div>
          </section>

          {/* 基本操作 */}
          <section>
            <h3 className="font-semibold text-slate-800 mb-2.5 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
              快速上手
            </h3>
            <div className="pl-3.5 space-y-2">
              {[
                { step: '1', text: '修改项目名称：在信息栏中点击铅笔图标旁的文本框输入名称' },
                { step: '2', text: '添加第一个任务：点击工具栏「添加任务」→「添加任务」，系统自动填入默认日期，确认即可' },
                { step: '3', text: '继续添加任务：新任务的默认开始时间会自动取为上一任务的结束日期+1天' },
                { step: '4', text: '添加子任务：选中一个父任务后，点击「添加任务」→「添加子任务」，或 hover 任务行右侧点击 + 按钮' },
                { step: '5', text: '展开/收起：点击父任务前的 ▸/▾ 图标查看或隐藏子任务，父任务时间由子任务自动计算' },
                { step: '6', text: '调整任务顺序：按住左侧拖拽图标上下移动排列顺序（仅限同级任务）' },
                { step: '7', text: '微调时间安排：通过任务条的边缘拖拽或整体拖拽调整日期' },
                { step: '8', text: '导出打印：点击「导出」按钮选择导出图片（PNG）或表格（XLSX）' },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {item.step}
                  </span>
                  <span className="text-slate-600 leading-relaxed pt-0.5">{item.text}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 提示 */}
          <section className="bg-slate-50 rounded-lg p-3.5 border border-slate-100">
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong className="text-slate-600">提示：</strong>
              周末日期以浅红色背景标识；父任务名称加粗显示；父任务日期由所有子任务自动计算（不可手动编辑）；
              删除父任务时会级联删除所有子任务；所有数据自动保存在浏览器本地存储中，刷新不丢失；
              任务完成进度可在编辑弹窗中调整（0-100%），进度条双层显示（底层计划/上层实际）；
              导出 JSON 可完整备份项目数据（含任务层级、颜色、进度），换电脑或清浏览器后可导入恢复；
              导出的 PNG 图片包含 2 倍像素密度，适合打印和分享。
            </p>
          </section>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 border-t border-slate-100 rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg transition-colors cursor-pointer text-sm"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  )
}
