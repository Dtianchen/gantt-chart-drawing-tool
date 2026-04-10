import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { Task, TimeScale } from '../../types'
import { formatFullDate } from '../../utils/dateUtils'

interface TaskRowProps {
  task: Task
  index: number
  scale: TimeScale
  onEdit?: (task: Task) => void
}

export default function TaskRow({ task, index, scale, onEdit }: TaskRowProps) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gantt-row group cursor-pointer hover:bg-blue-50/60 transition-colors ${
        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
      } ${isDragging ? 'opacity-80 shadow-lg rounded-sm bg-primary-50' : ''} border-b border-black`}
      onDoubleClick={() => onEdit?.(task)}
      title={`双击编辑：${task.name}`}
    >
      <div className={`w-10 flex items-center justify-center text-black font-mono shrink-0 border-r border-black task-cell relative text-xs`}>
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity absolute left-1"
        >
          <GripVertical size={14} />
        </button>
        <span>{index + 1}</span>
      </div>

      <div className="flex-1 px-2 min-w-0 border-r border-black task-cell">
        <div className="flex items-center h-full">
          <span 
            title={task.name} 
            className={`font-medium text-black flex-1 min-w-0 max-w-full task-name-cell chinese-text text-xs`}
          >
            {task.name}
          </span>
        </div>
      </div>

      <div className={`w-20 flex items-center justify-center text-black shrink-0 border-r border-black task-cell text-xs`}>
        {task.duration}<span className="ml-0.5">天</span>
      </div>

      <div className={`w-20 flex items-center justify-center text-black shrink-0 font-mono border-r border-black task-cell text-xs`}>
        {formatFullDate(task.startDate)}
      </div>

      <div className={`w-20 flex items-center justify-center text-black shrink-0 font-mono border-r border-black task-cell text-xs`}>
        {formatFullDate(task.endDate)}
      </div>
    </div>
  )
}
