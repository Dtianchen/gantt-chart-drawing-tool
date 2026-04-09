import { useRef, useCallback, useState } from 'react'
import { Download, ZoomIn, ZoomOut, Plus, Calendar, HelpCircle, LayoutTemplate, AlertTriangle, X } from 'lucide-react'
import { TimeScale } from '../../types'
import { useGanttExport } from '../../hooks/useGanttExport'
import dayjs from 'dayjs'

interface TemplateOption {
  id: string
  name: string
  description: string
}

const TEMPLATE_OPTIONS: TemplateOption[] = [
  { id: 'blank', name: '空白模板', description: '不填充任何数据' },
  { id: 'system-integration', name: '系统集成项目', description: '3个月 · 7个阶段' },
  { id: 'software-dev', name: '软件开发项目', description: '2个月 · 8个阶段' },
]

interface ToolbarProps {
  onAddTask: () => void
  onToggleScale: () => void
  onToggleTodayLine: () => void
  onShowHelp: () => void
  onLoadTemplate?: (templateId: string) => void
  scale: TimeScale
  showTodayLine: boolean
  exportRef: React.RefObject<HTMLDivElement | null>
  projectName?: string
  projectStartDate?: string
  projectEndDate?: string
  totalDays?: number
  taskCount?: number
}

export default function Toolbar({
  onAddTask,
  onToggleScale,
  onToggleTodayLine,
  onShowHelp,
  onLoadTemplate,
  scale,
  showTodayLine,
  exportRef,
  projectName = '',
  projectStartDate = '',
  projectEndDate = '',
  totalDays = 0,
  taskCount = 0,
}: ToolbarProps) {
  const { exportGanttAsImage } = useGanttExport()
  const [showTemplates, setShowTemplates] = useState(false)
  const [confirmTemplate, setConfirmTemplate] = useState<TemplateOption | null>(null)

  const handleExport = useCallback(async () => {
    if (exportRef.current) {
      const timestamp = dayjs().format('YYYYMMDD_HHmmss')
      const name = projectName.trim() || '项目'
      const filename = `${name}_${timestamp}_进度计划甘特图.png`
      await exportGanttAsImage(exportRef.current, filename, {
        projectName,
        startDate: projectStartDate,
        endDate: projectEndDate,
        totalDays,
      }, taskCount)
    }
  }, [exportRef, exportGanttAsImage, projectName, projectStartDate, projectEndDate, totalDays])

  const handleSelectTemplate = useCallback((templateId: string) => {
    const tpl = TEMPLATE_OPTIONS.find(t => t.id === templateId)
    if (tpl) setConfirmTemplate(tpl)
  }, [])

  const handleConfirmLoad = useCallback(() => {
    if (confirmTemplate) {
      onLoadTemplate?.(confirmTemplate.id)
      setConfirmTemplate(null)
      setShowTemplates(false)
    }
  }, [confirmTemplate, onLoadTemplate])

  const handleCancelConfirm = useCallback(() => {
    setConfirmTemplate(null)
  }, [])

  const btnBase = "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer active:scale-[0.97]"

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onAddTask}
        className={`${btnBase} bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow`}
      >
        <Plus size={15} />
        添加任务
      </button>

      <button
        onClick={handleExport}
        className={`${btnBase} bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow`}
      >
        <Download size={15} />
        导出图片
      </button>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      <button
        onClick={onToggleScale}
        className={`${btnBase} bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 hover:border-slate-300`}
      >
        {scale === 'week' ? <ZoomIn size={14} /> : <ZoomOut size={14} />}
        {scale === 'week' ? '周视图' : '月视图'}
      </button>

      <button
        onClick={onToggleTodayLine}
        className={`${btnBase} border transition-colors ${
          showTodayLine
            ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
        }`}
        title={showTodayLine ? '隐藏今日线' : '显示今日线'}
      >
        <Calendar size={14} />
        {showTodayLine ? '今日线' : '无今日线'}
      </button>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      {/* 模板选择按钮 + 下拉面板 */}
      <div className="relative">
        <button
          onClick={() => setShowTemplates(prev => !prev)}
          className={`${btnBase} bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 hover:border-violet-300`}
          title="选择项目模板"
        >
          <LayoutTemplate size={14} />
          模板
          <svg className={`w-3.5 h-3.5 transition-transform ${showTemplates ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showTemplates && (
          <>
            {/* 点击外部关闭 */}
            <div className="fixed inset-0 z-30" onClick={(e) => { e.preventDefault(); setShowTemplates(false) }} />
            
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-[200px] bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 pt-2 pb-1.5 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">选择模板</p>
              </div>
              
              {TEMPLATE_OPTIONS.map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-violet-50 transition-colors text-left"
                >
                  <LayoutTemplate size={15} className="shrink-0 text-violet-400" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 leading-tight">{tpl.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{tpl.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <button
        onClick={onShowHelp}
        className={`${btnBase} bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 hover:border-indigo-300`}
        title="帮助"
      >
        <HelpCircle size={15} />
        帮助
      </button>

      {/* 模板确认弹窗 */}
      {confirmTemplate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={handleCancelConfirm}>
          {/* 遮罩 */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

          {/* 弹窗内容 */}
          <div
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 标题栏 - 蓝紫渐变 */}
            <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-[#5b8def] via-[#7c6fd6] to-[#9366c9]">
              <AlertTriangle size={20} className="text-white/90 shrink-0" />
              <h2 className="text-base font-bold text-white">加载模板确认</h2>
              <button
                onClick={handleCancelConfirm}
                className="ml-auto p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* 内容区 */}
            <div className="px-5 py-4 space-y-3">
              <p className="text-sm text-slate-700 leading-relaxed">
                确定要加载模板 <span className="font-semibold text-violet-600">{confirmTemplate.name}</span> 吗？
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                当前所有任务数据将被替换为模板数据，此操作不可撤销。
              </p>

              {/* 模板信息卡片 */}
              <div className="flex items-center gap-2.5 p-3 bg-violet-50 rounded-lg border border-violet-100">
                <LayoutTemplate size={18} className="shrink-0 text-violet-500" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">{confirmTemplate.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{confirmTemplate.description}</p>
                </div>
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="px-5 py-4 bg-slate-50/80 border-t border-slate-100 flex gap-3">
              <button
                onClick={handleCancelConfirm}
                className="flex-1 py-2 bg-white hover:bg-slate-100 text-slate-600 font-medium rounded-lg border border-slate-200 transition-colors cursor-pointer text-sm"
              >
                取消
              </button>
              <button
                onClick={handleConfirmLoad}
                className="flex-1 py-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all cursor-pointer text-sm shadow-sm"
              >
                确认加载
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
