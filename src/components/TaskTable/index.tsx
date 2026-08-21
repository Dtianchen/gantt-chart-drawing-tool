import React, { useState, useRef } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import TaskRow from '../TaskRow'
import { Task, TimeScale } from '../../types'
import { getVisibleTasks } from '../../utils/taskUtils'

interface TaskTableProps {
  tasks: Task[]
  scale: TimeScale
  onDelete: (id: string) => void
  onReorder: (oldIndex: number, newIndex: number) => void
  onEditTask?: (task: Task) => void
  onAddSubTask?: (parentTask: Task) => void
  expandedIds?: Set<string>
  onToggleExpand?: (taskId: string) => void
  selectedTaskId?: string | null
  onSelectTask?: (task: Task) => void
  searchQuery?: string
  /** 仅渲染表头（由 GanttChart 固定在外层，不随滚动） */
  headerOnly?: boolean
  /** 仅渲染数据行（由 GanttChart 放入同一滚动容器，无自身滚动条） */
  bodyOnly?: boolean
  /** 工作名称列宽度（受控，由 GanttChart 统管，保证表头与数据列一致） */
  nameColWidth?: number
  /** 列宽调整回调（仅表头使用） */
  onResizeCol?: (width: number) => void
}

export default function TaskTable({
  tasks,
  scale,
  onDelete,
  onReorder,
  onEditTask,
  onAddSubTask,
  expandedIds: externalExpandedIds,
  onToggleExpand: externalToggleExpand,
  selectedTaskId: externalSelectedId,
  onSelectTask,
  searchQuery,
  headerOnly,
  bodyOnly,
  nameColWidth,
  onResizeCol,
}: TaskTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 内部展开状态（外部未传入时使用内部状态）
  const [internalExpandedIds, setInternalExpandedIds] = useState<Set<string>>(new Set())
  const expandedIds = externalExpandedIds ?? internalExpandedIds

  function toggleExpand(taskId: string) {
    if (externalToggleExpand) {
      externalToggleExpand(taskId)
    } else {
      setInternalExpandedIds(prev => {
        const next = new Set(prev)
        if (next.has(taskId)) {
          next.delete(taskId)
        } else {
          next.add(taskId)
        }
        return next
      })
    }
  }

  const visibleTasks = getVisibleTasks(tasks, expandedIds, searchQuery)

  // 工作名称列宽度：由 GanttChart 受控统一管理（保证表头与数据列同源）
  const colWidth = nameColWidth ?? 160

  function handleResizeStart(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startWidth = colWidth
    let finalWidth = startWidth
    function onMove(ev: MouseEvent) {
      finalWidth = Math.max(120, Math.min(startWidth + ev.clientX - startX, 520))
      onResizeCol?.(finalWidth)
    }
    function onUp() {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = tasks.findIndex(t => t.id === active.id)
    const newIndex = tasks.findIndex(t => t.id === over.id)
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(oldIndex, newIndex)
    }
  }

  const header = (
    <div className={`gantt-table-header font-semibold text-slate-700 uppercase shrink-0 flex flex-col text-xs border-r border-slate-200`}>
      {/* 第一行：合并原第一、二行（30px = 14+16），显示列标题 */}
      <div className="grid grid-cols-[40px_var(--name-col)_64px_80px_80px] items-center h-[30px] border-b border-slate-200">
        <div className="flex items-center justify-center border-r border-slate-200 h-full">编号</div>
        <div className="flex items-center px-2 border-r border-slate-200 h-full whitespace-nowrap relative">
          工作名称
          <div
            className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-blue-400/60 z-10"
            onMouseDown={handleResizeStart}
            title="拖动调整列宽"
          />
        </div>
        <div className="flex items-center justify-center border-r border-slate-200 h-full">持续时间</div>
        <div className="flex items-center justify-center border-r border-slate-200 h-full">开始时间</div>
        <div className="flex items-center justify-center h-full">结束时间</div>
      </div>
      {/* 第三行（20px）：工程标尺 */}
      <div className="flex items-center h-[20px]">
        <span className="w-full text-center text-[11px] font-semibold text-blue-500">工程标尺</span>
      </div>
    </div>
  )

  const body = (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col">
          {visibleTasks.length > 0 ? (
            visibleTasks.map(({ task, depth, index }) => (
              <TaskRow
                key={task.id}
                task={task}
                index={index}
                scale={scale}
                onEdit={onEditTask}
                depth={depth}
                isExpanded={expandedIds.has(task.id)}
                onToggle={toggleExpand}
                isSelected={externalSelectedId === task.id}
                onSelect={onSelectTask}
                onAddSubTask={onAddSubTask}
                allTasks={tasks}
              />
            ))
          ) : (
            <div className="flex items-center justify-center h-[60vh] text-slate-400 text-sm">
              {searchQuery ? '未找到匹配的任务' : '暂无任务，点击上方"添加任务"按钮开始或选择模板填充数据'}
            </div>
          )}
        </div>
      </SortableContext>
    </DndContext>
  )

  if (headerOnly) {
    return (
      <div style={{ ['--name-col' as any]: `${nameColWidth}px` }}>{header}</div>
    )
  }

  if (bodyOnly) {
    return (
      <div
        className="bg-white"
        style={{ ['--name-col' as any]: `${nameColWidth}px` }}
      >
        {body}
      </div>
    )
  }

  return (
    <div
      className="border-r border-slate-200 bg-white flex flex-col min-h-0 overflow-hidden"
      style={{ ['--name-col' as any]: `${nameColWidth}px` }}
    >
      {header}
      <div className="flex-1 min-h-0 overflow-y-auto gantt-scroll">{body}</div>
    </div>
  )
}
