import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, ChevronRight, ChevronDown, Plus } from 'lucide-react'
import { Task, TimeScale, calcTaskNumber, taskHasChildren } from '../../types'
import { formatFullDate } from '../../utils/dateUtils'

interface TaskRowProps {
  task: Task
  index: number
  scale: TimeScale
  onEdit?: (task: Task) => void
  depth?: number
  isExpanded?: boolean
  onToggle?: (taskId: string) => void
  isSelected?: boolean
  onSelect?: (task: Task) => void
  onAddSubTask?: (parentTask: Task) => void
  allTasks?: Task[]
}

export default function TaskRow({
  task,
  index,
  scale,
  onEdit,
  depth = 0,
  isExpanded = false,
  onToggle,
  isSelected = false,
  onSelect,
  onAddSubTask,
  allTasks = [],
}: TaskRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  }

  const hasChildren = taskHasChildren(task.id, allTasks)
  const taskNumber = calcTaskNumber(task.id, allTasks)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`grid grid-cols-[40px_var(--name-col)_64px_80px_80px] items-center h-[30px] min-h-0 overflow-hidden gantt-row group cursor-pointer hover:bg-blue-50/60 transition-colors ${
        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
      } ${isDragging ? 'opacity-80 shadow-lg rounded-sm bg-primary-50' : ''} shadow-[inset_0_-1px_0_0_#e2e8f0] ${
        isSelected ? 'bg-blue-100/70' : ''
      }`}
      onDoubleClick={() => onEdit?.(task)}
      onClick={() => onSelect?.(task)}
      title={`双击编辑：${task.name}`}
    >
      <div className={`w-10 flex items-center justify-center text-black font-mono shrink-0 border-r border-slate-200 task-cell relative text-xs`}>
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity absolute left-1"
        >
          <GripVertical size={14} />
        </button>
        <span className="font-mono">{taskNumber}</span>
      </div>

      <div className="flex items-center px-2 border-r border-slate-200 task-cell relative whitespace-nowrap overflow-hidden">
        {/* 展开/收起图标（仅父任务显示，不占位，无缩进） */}
        {hasChildren && (
          <button
            onClick={e => { e.stopPropagation(); onToggle?.(task.id) }}
            className="mr-1 p-0.5 hover:bg-slate-200 rounded transition-colors cursor-pointer text-slate-500 shrink-0"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}

        <span
          title={task.name}
          className={`${hasChildren ? 'font-bold' : 'font-medium'} text-black task-name-cell chinese-text text-xs truncate`}
        >
          {task.name}
        </span>

        {/* 添加子任务按钮（hover 显示，绝对定位不占宽度） */}
        <button
          onClick={e => { e.stopPropagation(); onAddSubTask?.(task) }}
          className="absolute right-1 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 hover:bg-emerald-100 rounded transition-all cursor-pointer text-emerald-600"
          title="添加子任务"
        >
          <Plus size={12} />
        </button>
      </div>

      <div className={`w-16 flex items-center justify-center text-black shrink-0 border-r border-slate-200 task-cell text-xs gap-1`}>
        {task.isMilestone ? (
          <span className="text-amber-600 font-medium">里程碑</span>
        ) : (
          <>
            <span>{task.duration}天</span>
            {task.progress !== undefined && task.progress < 100 && (
              <span className="text-[10px] text-amber-600 font-medium">{task.progress}%</span>
            )}
          </>
        )}
      </div>

      <div className={`w-20 flex items-center justify-center text-black font-mono shrink-0 border-r border-slate-200 task-cell text-xs`}>
        {formatFullDate(task.startDate)}
      </div>

      <div className={`w-20 flex items-center justify-center text-black font-mono shrink-0 font-mono border-r border-slate-200 task-cell text-xs`}>
        {task.isMilestone ? (
          <span className="text-slate-400">—</span>
        ) : (
          formatFullDate(task.endDate)
        )}
      </div>
    </div>
  )
}
