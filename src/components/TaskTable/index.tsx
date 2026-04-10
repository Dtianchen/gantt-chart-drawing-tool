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
      {/* 表头（两行：列标题 / 工程标尺，总高50px与时间轴对齐） */}
      <div className={`gantt-table-header font-semibold text-slate-700 uppercase shrink-0 flex flex-col text-xs`}>
        {/* 第一行：合并原第一、二行（30px = 14+16），显示列标题 */}
        <div className="flex items-center h-[30px] border-b border-slate-200">
          <div className="w-10 flex items-center justify-center shrink-0 border-r border-slate-200 h-full">编号</div>
          <div className="flex-1 px-2 flex items-center justify-center min-w-0 border-r border-slate-200 h-full">工作名称</div>
          <div className="w-20 flex items-center justify-center shrink-0 border-r border-slate-200 h-full">持续时间</div>
          <div className="w-20 flex items-center justify-center shrink-0 border-r border-slate-200 h-full">开始时间</div>
          <div className="w-20 flex items-center justify-center shrink-0 h-full">结束时间</div>
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
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <TaskRow key={task.id} task={task} index={index} scale={scale} onEdit={onEditTask} />
              ))
            ) : (
              <div className={`flex items-center justify-center h-full text-slate-400 text-sm`}>
                暂无任务，点击上方"添加任务"按钮开始或选择模板填充数据
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
