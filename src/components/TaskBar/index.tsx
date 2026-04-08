import React, { useCallback, useState, useRef, useEffect } from 'react'
import { Task, TASK_COLOR_MAP, TimeScale } from '../../types'
import { generateDateRange, addDays } from '../../utils/dateUtils'

interface TaskBarProps {
  task: Task
  startDate: string
  endDate: string
  dayWidth: number
  scale: TimeScale
  onResize: (id: string, newStart: string, newEnd: string) => void
  onEdit: (task: Task) => void
}

export default function TaskBar({ task, startDate, endDate, dayWidth, scale, onResize, onEdit }: TaskBarProps) {
  const [resizing, setResizing] = useState<'left' | 'right' | null>(null)
  const [dragging, setDragging] = useState(false)
  const didDragRef = useRef(false)
  const startXRef = useRef(0)
  const originalStartRef = useRef('')
  const originalEndRef = useRef('')

  const dateRange = generateDateRange(startDate, endDate)
  const startIndex = dateRange.indexOf(task.startDate)
  const endIndex = dateRange.indexOf(task.endDate)
  const leftPx = startIndex * dayWidth
  const widthPx = (endIndex - startIndex + 1) * dayWidth
  const color = TASK_COLOR_MAP[task.color] || '#ef4444'

  const handleMouseDown = useCallback((side: 'left' | 'right') => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setResizing(side)
    startXRef.current = e.clientX
    originalStartRef.current = task.startDate
    originalEndRef.current = task.endDate
  }, [task.startDate, task.endDate])

  // 整体拖拽移动（保持持续时间不变）
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('cursor-col-resize')) return
    e.preventDefault()
    e.stopPropagation()
    setDragging(true)
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
        const deltaDays = Math.round(deltaX / dayWidth)

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
          // 整体移动：保持持续时间不变，同时偏移起止时间
          if (deltaDays !== 0) {
            didDragRef.current = true
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
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizing, dragging, dayWidth, dateRange, startIndex, endIndex, task.id, task.startDate, task.endDate, onResize])

  return (
    <div className="relative h-full flex items-center justify-center px-0.5 group">
      <div
        onMouseDown={handleDragStart}
        onClick={() => !didDragRef.current && onEdit(task)}
        className="absolute rounded shadow-sm cursor-grab active:cursor-grabbing transition-all hover:shadow-md hover:brightness-110"
        style={{
          left: leftPx,
          width: Math.max(widthPx, 8),
          height: 20,
          backgroundColor: color,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      >
        <div className="h-full flex items-center justify-center px-2 overflow-visible whitespace-nowrap select-none min-w-0">
          <div className="relative w-full h-full flex items-center justify-center pointer-events-none min-w-0">
            <span 
              className={`text-black font-medium ${scale === 'month' ? 'text-[10px]' : 'text-xs'} whitespace-nowrap flex-shrink-0`}
              style={{ 
                maxWidth: 'none',
                lineHeight: '1.2'
              }}
            >
              {task.name}
            </span>
          </div>
        </div>

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
    </div>
  )
}