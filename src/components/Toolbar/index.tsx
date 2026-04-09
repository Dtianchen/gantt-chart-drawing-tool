import { useRef, useCallback } from 'react'
import { Download, ZoomIn, ZoomOut, Plus, Calendar, HelpCircle, Trash2 } from 'lucide-react'
import { TimeScale } from '../../types'
import { useGanttExport } from '../../hooks/useGanttExport'
import dayjs from 'dayjs'

interface ToolbarProps {
  onAddTask: () => void
  onToggleScale: () => void
  onToggleTodayLine: () => void
  onShowHelp: () => void
  onReset?: () => void
  scale: TimeScale
  showTodayLine: boolean
  exportRef: React.RefObject<HTMLDivElement | null>
  projectName?: string
  projectStartDate?: string
  projectEndDate?: string
  totalDays?: number
}

export default function Toolbar({
  onAddTask,
  onToggleScale,
  onToggleTodayLine,
  onShowHelp,
  onReset,
  scale,
  showTodayLine,
  exportRef,
  projectName = '',
  projectStartDate = '',
  projectEndDate = '',
  totalDays = 0,
}: ToolbarProps) {
  const { exportGanttAsImage } = useGanttExport()

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
      })
    }
  }, [exportRef, exportGanttAsImage, projectName, projectStartDate, projectEndDate, totalDays])

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

      <button
        onClick={onShowHelp}
        className={`${btnBase} bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 hover:border-indigo-300`}
        title="帮助"
      >
        <HelpCircle size={15} />
        帮助
      </button>

      {onReset && (
        <button
          onClick={() => {
            if (window.confirm('确定要重置所有数据吗？将恢复为初始示例数据，当前修改会丢失。')) {
              onReset()
            }
          }}
          className={`${btnBase} bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200`}
          title="重置数据（恢复初始示例）"
        >
          <Trash2 size={14} />
          重置
        </button>
      )}
    </div>
  )
}
