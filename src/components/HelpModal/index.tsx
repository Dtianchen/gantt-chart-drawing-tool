import { X } from 'lucide-react'

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
                { icon: Plus, color: 'text-blue-600', bg: 'bg-blue-50', title: '添加任务', desc: '点击「添加任务」按钮，填写名称、开始时间、持续时间等信息。新任务默认开始时间为上一任务的结束日期+1天' },
                { icon: Pencil, color: 'text-amber-600', bg: 'bg-amber-50', title: '编辑 / 删除', desc: '点击甘特图中的任务条打开编辑弹窗，可修改所有属性或在弹窗内删除任务' },
                { icon: GripVertical, color: 'text-green-600', bg: 'bg-green-50', title: '拖拽排序', desc: '按住左侧任务行的拖拽图标（⋮⋮）上下移动，调整任务显示顺序' },
                { icon: Move, color: 'text-violet-600', bg: 'bg-violet-50', title: '整体移动', desc: '按住任务条中间区域左右拖动，可整体平移任务起止时间，持续时间保持不变' },
                { icon: Calendar, color: 'text-rose-500', bg: 'bg-rose-50', title: '今日标记线', desc: '红色竖线标注当天位置，方便对照当前日期与各任务的时间关系，可显示/隐藏' },
                { icon: ZoomIn, color: 'text-purple-600', bg: 'bg-purple-50', title: '视图切换', desc: '周视图每天一格（详细），月视图每周一格（紧凑总览），一键切换' },
                { icon: Download, color: 'text-emerald-600', bg: 'bg-emerald-50', title: '导出图片', desc: '一键导出包含项目名称、起止时间、计划工期及完整甘特图的高清 PNG 图片' },
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
                { step: '2', text: '添加第一个任务：点击「添加任务」，系统自动填入默认日期，确认即可' },
                { step: '3', text: '继续添加任务：新任务的默认开始时间会自动取为上一任务的结束日期+1天' },
                { step: '4', text: '调整任务顺序：按住左侧拖拽图标上下移动排列顺序' },
                { step: '5', text: '微调时间安排：通过任务条的边缘拖拽或整体拖拽调整日期' },
                { step: '6', text: '导出打印：点击「导出图片」生成包含完整信息的 PNG 文件' },
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
              周末日期以浅红色背景标识；所有数据自动保存在浏览器本地存储中，关闭页面后再次打开不会丢失；
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
