import React, { useCallback, useState, useRef, useEffect } from 'react'
import { Task, TASK_COLOR_MAP, TimeScale, taskHasChildren, getEffectiveStatus, TASK_STATUS_CONFIG, UNIT_WIDTH } from '../../types'
import { generateDateRange, addDays } from '../../utils/dateUtils'
import { Diamond } from 'lucide-react'

interface TaskBarProps {
  task: Task
  tasks: Task[]
  startDate: string
  endDate: string
  dayWidth: number
  scale: TimeScale
  onResize: (id: string, newStart: string, newEnd: string) => void
  onEdit: (task: Task) => void
}

export default function TaskBar({ task, tasks, startDate, endDate, dayWidth, scale, onResize, onEdit }: TaskBarProps) {
  const [resizing, setResizing] = useState<'left' | 'right' | null>(null)
  const [dragging, setDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const didDragRef = useRef(false)
  const startXRef = useRef(0)
  const originalStartRef = useRef('')
  const originalEndRef = useRef('')

  const dateRange = generateDateRange(startDate, endDate)
  const startIndex = dateRange.indexOf(task.startDate)
  const endIndex = dateRange.indexOf(task.endDate)
  
  // 根据视图类型计算每格代表的天数
  const daysPerUnit = scale === 'day' ? 1 : (dayWidth ? UNIT_WIDTH / dayWidth : 1)
  
  // 任务条位置和宽度根据视图缩放
  const leftPx = startIndex * UNIT_WIDTH / daysPerUnit
  const widthPx = (endIndex - startIndex + 1) * UNIT_WIDTH / daysPerUnit
  const isParent = taskHasChildren(task.id, tasks)
  const effectiveStatus = getEffectiveStatus(task)
  const statusConfig = TASK_STATUS_CONFIG[effectiveStatus]

  const parentTask = task.parentId ? tasks.find(t => t.id === task.parentId) : undefined
  const effectiveColor = parentTask?.color ?? task.color
  const color = TASK_COLOR_MAP[effectiveColor] || '#ef4444'

  const handleMouseDown = useCallback((side: 'left' | 'right') => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setResizing(side)
    startXRef.current = e.clientX
    originalStartRef.current = task.startDate
    originalEndRef.current = task.endDate
  }, [task.startDate, task.endDate])

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('cursor-col-resize')) return
    e.preventDefault()
    e.stopPropagation()
    setDragging(true)
    setDragOffset(0)
    didDragRef.current = false
    startXRef.current = e.clientX
    originalStartRef.current = task.startDate
    originalEndRef.current = task.endDate
  }, [task.startDate, task.endDate])

  useEffect(() => {
    if (!resizing && !dragging) return

    let rafId: number
    function handleMouseMove(e: MouseEvent) {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const deltaX = e.clientX - startXRef.current
        const deltaDays = Math.round(deltaX / UNIT_WIDTH)

        if (resizing === 'left') {
          const newStart = addDays(originalStartRef.current, deltaDays)
          const newStartIdx = dateRange.indexOf(newStart)
          if (newStartIdx >= 0 && newStartIdx <= endIndex - 1) {
            onResize(task.id, newStart, task.endDate)
          }
        } else if (resizing === 'right') {
          const newEnd = addDays(originalEndRef.current, deltaDays)
          const newEndIdx = dateRange.indexOf(newEnd)
          if (newEndIdx >= 0 && newEndIdx < dateRange.length && newEndIdx >= startIndex + 1) {
            onResize(task.id, task.startDate, newEnd)
          }
        } else if (dragging) {
          if (deltaDays !== 0) {
            didDragRef.current = true
            setDragOffset(deltaDays * UNIT_WIDTH)
            const newStart = addDays(originalStartRef.current, deltaDays)
            const newEnd = addDays(originalEndRef.current, deltaDays)
            const startIdx = dateRange.indexOf(newStart)
            const endIdx = dateRange.indexOf(newEnd)
            if (startIdx >= 0 && endIdx > 0 && endIdx <= dateRange.length - 1) {
              onResize(task.id, newStart, newEnd)
            }
          }
        }
      })
    }

    function handleMouseUp() {
      setResizing(null)
      setDragging(false)
      setDragOffset(0)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizing, dragging, dateRange, startIndex, endIndex, task.id, task.startDate, task.endDate, onResize])

  const barWidth = Math.max(widthPx, 8)

  const barStyle: React.CSSProperties = dragging
    ? {
        left: leftPx,
        width: barWidth,
        height: 20,
        backgroundColor: isParent ? 'transparent' : `${color}33`,
        backgroundImage: isParent
          ? `repeating-linear-gradient(45deg, ${color}88, ${color}88 4px, ${color}55 4px, ${color}55 8px)`
          : 'none',
        border: isParent ? 'none' : `1px solid ${color}88`,
        top: '50%',
        transform: 'translateY(-50%) scale(1.05)',
        boxShadow: `0 8px 24px ${color}60`,
        opacity: 0.9,
        zIndex: 100,
      }
    : {
        left: leftPx,
        width: barWidth,
        height: 20,
        backgroundColor: isParent ? 'transparent' : `${color}33`,
        backgroundImage: isParent
          ? `repeating-linear-gradient(45deg, ${color}88, ${color}88 4px, ${color}55 4px, ${color}55 8px)`
          : 'none',
        border: isParent ? 'none' : `1px solid ${color}88`,
        top: '50%',
        transform: 'translateY(-50%)',
      }

  if (task.isMilestone) {
    return (
      <div className="relative h-full flex items-center justify-center">
        <div
          className="gantt-task-bar absolute cursor-pointer transition-transform hover:scale-125"
          style={{
            left: leftPx + UNIT_WIDTH / 2,  // 里程碑居中显示在日期格子中间
            width: 16,
            height: 16,
            top: '50%',
            transform: 'translateY(-50%) translateX(-50%)',
            zIndex: 20,
          }}
          onClick={() => onEdit(task)}
          title={`${task.name} (里程碑)`}
        >
          <Diamond
            size={16}
            fill={color}
            color={color}
            strokeWidth={2}
          />
        </div>
        {effectiveStatus !== 'in-progress' && (
          <div
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: leftPx + UNIT_WIDTH / 2 - 16,
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: statusConfig.color,
              border: '1px solid white',
              zIndex: 21,
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="relative h-full flex items-center justify-center px-0.5 group">
      {/* 占位指示线（拖拽时显示） */}
      {dragging && (
        <div
          className="absolute h-[26px] border-2 border-dashed border-blue-400 bg-blue-50/50 rounded"
          style={{
            left: leftPx,
            width: barWidth,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 5,
          }}
        />
      )}

      {/* 任务条背景 */}
      <div
        onMouseDown={handleDragStart}
        onClick={() => !didDragRef.current && onEdit(task)}
        className="gantt-task-bar absolute rounded shadow-sm cursor-grab active:cursor-grabbing transition-all overflow-hidden"
        style={barStyle}
      >
        {/* 状态指示条 */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ backgroundColor: statusConfig.color }}
        />

        {/* 实际完成进度条 */}
        {!isParent && (
          <div
            className="absolute top-0 left-0 h-full pointer-events-none"
            style={{
              width: `${task.progress ?? 100}%`,
              backgroundColor: color,
              opacity: 0.85,
            }}
          />
        )}

        {/* 左拖拽手柄 */}
        <div
          onMouseDown={handleMouseDown('left')}
          className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize rounded-l hover:bg-white/20"
          style={{ zIndex: 10 }}
        />

        {/* 右拖拽手柄 */}
        <div
          onMouseDown={handleMouseDown('right')}
          className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize rounded-r hover:bg-white/20"
          style={{ zIndex: 10 }}
        />
      </div>

      {/* 任务名称文字层 */}
      <div
        className="absolute flex items-center justify-center whitespace-nowrap select-none pointer-events-none"
        style={{
          left: leftPx,
          width: barWidth,
          height: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 15,
        }}
      >
        <span
          className="text-black font-medium text-xs whitespace-nowrap"
          style={{ lineHeight: '1.2' }}
        >
          {task.name}
        </span>
      </div>

      {/* 状态图标（右侧） */}
      {!isParent && effectiveStatus !== 'in-progress' && (
        <div
          className="absolute w-2 h-2 rounded-full border border-white"
          style={{
            left: leftPx + barWidth - 4,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: statusConfig.color,
            zIndex: 16,
          }}
        />
      )}
    </div>
  )
}