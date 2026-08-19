import React, { useState, useLayoutEffect, useRef, useEffect } from 'react'
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
import { Task, TimeScale, taskHasChildren } from '../../types'
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

  // 工作名称列宽度：优先使用用户手动调整并保存的宽度，否则按所有任务名最大宽度自动测量
  const savedWidthRaw = typeof window !== 'undefined' ? localStorage.getItem('gantt_name_col_width') : null
  const savedWidth = savedWidthRaw ? parseInt(savedWidthRaw, 10) : NaN
  const [nameColWidth, setNameColWidth] = useState<number>(
    !Number.isNaN(savedWidth) && savedWidth > 0 ? savedWidth : 160
  )
  const isManualRef = useRef(!Number.isNaN(savedWidth) && savedWidth > 0)
  const measureSpanRef = useRef<HTMLSpanElement | null>(null)

  useLayoutEffect(() => {
    if (isManualRef.current) return // 用户手动调整过，尊重用户选择

    if (!measureSpanRef.current) {
      const span = document.createElement('span')
      // 字体样式与实际渲染的名称单元格保持一致（text-xs font-medium）
      span.className = 'text-xs font-medium'
      span.style.cssText =
        'position:absolute;visibility:hidden;white-space:nowrap;'
      document.body.appendChild(span)
      measureSpanRef.current = span
    }
    const span = measureSpanRef.current
    let max = 120 // 最小可读宽度
    for (const t of tasks) {
      span.textContent = t.name
      const w = span.offsetWidth + 16 // px-2 左右内边距
      const extra = taskHasChildren(t.id, tasks) ? 28 : 0 // 父任务展开按钮占位
      max = Math.max(max, w + extra)
    }
    setNameColWidth(Math.round(max))
  }, [tasks])

  useEffect(() => {
    return () => {
      if (measureSpanRef.current?.parentNode) {
        measureSpanRef.current.parentNode.removeChild(measureSpanRef.current)
      }
    }
  }, [])

  function handleResizeStart(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startWidth = nameColWidth
    let finalWidth = startWidth
    function onMove(ev: MouseEvent) {
      finalWidth = Math.max(80, startWidth + ev.clientX - startX)
      setNameColWidth(finalWidth)
    }
    function onUp() {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      localStorage.setItem('gantt_name_col_width', String(finalWidth))
      isManualRef.current = true
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

  return (
    <div
      className="border-r border-slate-200 bg-white flex flex-col overflow-hidden"
      style={{ ['--name-col' as any]: `${nameColWidth}px` }}
    >
      {/* 表头（两行：列标题 / 工程标尺，总高50px与时间轴对齐） */}
      <div className={`gantt-table-header font-semibold text-slate-700 uppercase shrink-0 flex flex-col text-xs`}>
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

      {/* 表体 */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="flex-1 overflow-y-auto gantt-scroll">
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
              <div className={`flex items-center justify-center h-full text-slate-400 text-sm`}>
                {searchQuery ? '未找到匹配的任务' : '暂无任务，点击上方"添加任务"按钮开始或选择模板填充数据'}
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
