import { useRef, useCallback, useState } from 'react'
import { Download, ZoomIn, ZoomOut, Plus, Calendar, HelpCircle, LayoutTemplate, AlertTriangle, X, ChevronDown, FileSpreadsheet } from 'lucide-react'
import { TimeScale, SCALE_CONFIG } from '../../types'
import { useGanttExport } from '../../hooks/useGanttExport'
import { useGanttExcelExport } from '../../hooks/useGanttExcelExport'
import dayjs from 'dayjs'
import { Task } from '../../types'

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
  onScaleChange: (scale: TimeScale) => void
  onCustomDaysChange?: (days: number) => void
  customDays?: number
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
  tasks?: Task[]
  selectedTaskId?: string | null
  onAddSubTask?: (parentTask: Task) => void
}

export default function Toolbar({
  onAddTask,
  onScaleChange,
  onCustomDaysChange,
  customDays = 2,
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
  tasks = [],
  selectedTaskId,
  onAddSubTask,
}: ToolbarProps) {
  const { exportGanttAsImage } = useGanttExport()
  const { exportGanttAsExcel } = useGanttExcelExport()
  const [showTemplates, setShowTemplates] = useState(false)
  const [confirmTemplate, setConfirmTemplate] = useState<TemplateOption | null>(null)
  const [showScaleMenu, setShowScaleMenu] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [customInputValue, setCustomInputValue] = useState(String(customDays))

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

  const handleExportExcel = useCallback(() => {
    const timestamp = dayjs().format('YYYYMMDD_HHmmss')
    const name = projectName.trim() || '项目'
    const filename = `${name}_${timestamp}_项目计划.xlsx`
    exportGanttAsExcel(tasks, {
      projectName,
      startDate: projectStartDate,
      endDate: projectEndDate,
      totalDays,
    }, filename)
    setShowExportMenu(false)
  }, [tasks, exportGanttAsExcel, projectName, projectStartDate, projectEndDate, totalDays])

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

  const selectedTask = tasks.find(t => t.id === selectedTaskId)

  return (
    <div className="flex items-center gap-2">
      {/* 添加任务下拉菜单 */}
      <div className="relative">
        <button
          onClick={() => setShowAddMenu(prev => !prev)}
          className={`${btnBase} bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow`}
        >
        <Plus size={15} />
        添加任务
        </button>

        {showAddMenu && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setShowAddMenu(false)} />

            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-[140px] bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <button
                onClick={() => { onAddTask(); setShowAddMenu(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 transition-colors text-left"
              >
                <Plus size={16} className="text-blue-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-700">添加任务</p>
                  <p className="text-[10px] text-slate-400">创建新的父级任务</p>
                </div>
              </button>

              {onAddSubTask && (
                <button
                  onClick={() => { selectedTask && onAddSubTask(selectedTask); setShowAddMenu(false) }}
                  disabled={!selectedTask}
                  className={`w-full flex items-center gap-2 px-3 py-2 transition-colors text-left ${
                    selectedTask ? 'hover:bg-violet-50' : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <Plus size={16} className="text-violet-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">添加子任务</p>
                    <p className="text-[10px] text-slate-400">
                      {selectedTask ? `为「${selectedTask.name}」添加` : '请先选中一个任务'}
                    </p>
                  </div>
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => setShowExportMenu(prev => !prev)}
          className={`${btnBase} bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow`}
        >
          <Download size={15} />
          导出
          <ChevronDown size={13} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
        </button>

        {showExportMenu && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setShowExportMenu(false)} />

            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-[140px] bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 pt-2 pb-1.5 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">导出格式</p>
              </div>

              <button
                onClick={() => { handleExport(); setShowExportMenu(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-emerald-50 transition-colors text-left"
              >
                <Download size={16} className="text-emerald-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-700">导出图片</p>
                  <p className="text-[10px] text-slate-400">PNG 格式，适合分享</p>
                </div>
              </button>

              <button
                onClick={handleExportExcel}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-violet-50 transition-colors text-left"
              >
                <FileSpreadsheet size={16} className="text-violet-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-700">导出 Excel</p>
                  <p className="text-[10px] text-slate-400">XLSX 格式，可编辑</p>
                </div>
              </button>
            </div>
          </>
        )}
      </div>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      {/* 视图切换下拉菜单 */}
      <div className="relative">
        <button
          onClick={() => setShowScaleMenu(prev => !prev)}
          className={`${btnBase} bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 hover:border-slate-300`}
          title="切换视图"
        >
          {scale === 'day' ? <ZoomIn size={14} /> : <ZoomOut size={14} />}
          切换视图
          <ChevronDown size={13} className={`transition-transform ${showScaleMenu ? 'rotate-180' : ''}`} />
        </button>

        {showScaleMenu && (
          <>
            <div className="fixed inset-0 z-30" onClick={(e) => { e.preventDefault(); setShowScaleMenu(false) }} />

            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-[140px] bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 pt-2 pb-1.5 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">时间刻度</p>
              </div>

              {(Object.keys(SCALE_CONFIG) as TimeScale[]).filter(k => k !== 'custom').map(key => {
                const cfg = SCALE_CONFIG[key]
                const isActive = key === scale
                return (
                  <button
                    key={key}
                    onClick={() => { onScaleChange(key); setShowScaleMenu(false) }}
                    className={`w-full flex items-center gap-2 px-3 py-2 transition-colors text-left ${
                      isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-blue-500' : 'bg-slate-300'}`} />
                    <span className="text-sm">{cfg.label}</span>
                    <span className="text-[11px] text-slate-400 ml-auto">{cfg.daysPerUnit}天/格</span>
                  </button>
                )
              })}

              {/* 自定义选项 + 输入行 */}
              <div className="border-t border-slate-100 mt-1 pt-1">
                <button
                  onClick={() => { onScaleChange('custom'); setShowScaleMenu(false) }}
                  className={`w-full flex items-center gap-2 px-3 py-2 transition-colors text-left ${
                    scale === 'custom' ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${scale === 'custom' ? 'bg-blue-500' : 'bg-slate-300'}`} />
                  <span className="text-sm">自定义</span>
                  {scale === 'custom' && (
                    <span className="text-[11px] text-blue-500 ml-auto font-medium">{customDays}天/格</span>
                  )}
                </button>

                {/* 自定义输入 */}
                <div className="px-3 pb-2 pt-1" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={customInputValue}
                      onChange={e => setCustomInputValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          const val = parseInt(customInputValue, 10)
                          if (val >= 1 && val <= 365) {
                            onCustomDaysChange?.(val)
                            onScaleChange('custom')
                            setShowScaleMenu(false)
                          }
                        }
                      }}
                      className="w-16 px-1.5 py-1 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 text-center"
                      />
                    <button
                      onClick={() => {
                        const val = parseInt(customInputValue, 10)
                        if (val >= 1 && val <= 365) {
                          onCustomDaysChange?.(val)
                          onScaleChange('custom')
                          setShowScaleMenu(false)
                        }
                      }}
                      className="px-2 py-1 text-[11px] bg-blue-50 hover:bg-blue-100 text-blue-600 rounded border border-blue-200 transition-colors cursor-pointer font-medium"
                    >
                      应用
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 pl-0.5">输入每格代表的天数 (1-365)</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

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
            
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-[140px] bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 pt-2 pb-1.5 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">选择模板</p>
              </div>
              
              {TEMPLATE_OPTIONS.map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-violet-50 transition-colors text-left"
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
