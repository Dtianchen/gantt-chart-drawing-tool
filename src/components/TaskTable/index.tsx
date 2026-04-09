import React from 'react'
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

interface TaskTableProps {
  tasks: Task[]
  scale: TimeScale
  onDelete: (id: string) => void
  onReorder: (oldIndex: number, newIndex: number) => void
  onEditTask?: (task: Task) => void
}

export default function TaskTable({ tasks, scale, onDelete, onReorder, onEditTask }: TaskTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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
    <div className="border-r border-slate-200 bg-white flex flex-col overflow-hidden">
      {/* 表头 */}
      <div className={`flex items-center gantt-table-header font-semibold text-slate-600 uppercase shrink-0 ${scale === 'month' ? 'text-[10px]' : 'text-xs'}`}>
        <div className="w-10 flex items-center justify-center shrink-0 border-r border-black h-full task-cell">编号</div>
        <div className="flex-1 px-2 flex items-center justify-center min-w-0 border-r border-black h-full task-cell">工作名称</div>
        <div className="w-20 flex items-center justify-center shrink-0 border-r border-black h-full task-cell">持续时间</div>
        <div className="w-20 flex items-center justify-center shrink-0 border-r border-black h-full task-cell">开始时间</div>
        <div className="w-20 flex items-center justify-center shrink-0 border-r border-black h-full task-cell">结束时间</div>
      </div>

      {/* 表体 */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="flex-1 overflow-y-auto gantt-scroll">
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <TaskRow key={task.id} task={task} index={index} scale={scale} onEdit={onEditTask} />
              ))
            ) : (
              <div className={`flex items-center justify-center h-full text-slate-400 ${scale === 'month' ? 'text-xs' : 'text-sm'}`}>
                暂无任务，点击上方"添加任务"按钮开始或选择模板填充数据
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
