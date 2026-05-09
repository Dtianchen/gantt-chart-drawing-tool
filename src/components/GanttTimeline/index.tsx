import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react'
import TimeScaleHeader from '../TimeScaleHeader'
import TaskBar from '../TaskBar'
import { Task, TimeScale, UNIT_WIDTH } from '../../types'
import { generateDateRange, generateDateUnits, isToday } from '../../utils/dateUtils'
import { getVisibleTasks } from '../../utils/taskUtils'
import dayjs from 'dayjs'

interface DependencyLine {
  fromX: number
  fromY: number
  toX: number
  toY: number
  fromTaskId: string
  toTaskId: string
}

interface GanttTimelineProps {
  tasks: Task[]
  scale: TimeScale
  customDays?: number
  dayWidth: number
  showTodayLine: boolean
  expandedIds?: Set<string>
  onUpdateTask: (id: string, data: Partial<Task>) => void
  onResizeTask: (id: string, start: string, end: string) => void
  onEditTask: (task: Task) => void
  searchQuery?: string
}

const ROW_HEIGHT = 30
const HEADER_HEIGHT = 50
const BUFFER_COUNT = 5

export default function GanttTimeline({
  tasks,
  scale,
  customDays = 2,
  dayWidth,
  showTodayLine,
  expandedIds = new Set(),
  onUpdateTask,
  onResizeTask,
  onEditTask,
  searchQuery,
}: GanttTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(600)
  const isDayView = scale === 'day'

  // 自定义视图每格天数
  const activeDaysPerUnit = scale === 'custom' ? customDays : 1

  // 基础日期范围（始终基于日精度计算）
  const baseRange = useMemo(() => {
    if (tasks.length === 0) {
      return { startDate: '2026-04-01', endDate: '2026-05-30' }
    }
    const sortedByStart = [...tasks].sort((a, b) =>
      dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf()
    )
    const sortedByEnd = [...tasks].sort((a, b) =>
      dayjs(b.endDate).valueOf() - dayjs(a.endDate).valueOf()
    )
    return {
      startDate: dayjs(sortedByStart[0].startDate).subtract(1, 'day').format('YYYY-MM-DD'),
      endDate: dayjs(sortedByEnd[0].endDate).add(3, 'day').format('YYYY-MM-DD'),
    }
  }, [tasks])

  // 逐日日期数组（用于日视图和今日线定位）
  const allDates = useMemo(() => generateDateRange(baseRange.startDate, baseRange.endDate), [baseRange])
  // 单元数组（用于自定义视图）
  const units = useMemo(
    () => generateDateUnits(baseRange.startDate, baseRange.endDate, activeDaysPerUnit),
    [baseRange, activeDaysPerUnit]
  )

  // 总宽度：基于日期范围计算，根据视图缩放调整
  const totalDays = allDates.length
  const totalWidth = (totalDays / activeDaysPerUnit) * UNIT_WIDTH

  // SVG 坐标系宽度 = 总宽度
  const svgViewBoxWidth = totalWidth

  // 今日线位置（根据视图缩放调整）
  const todayPosition = useMemo(() => {
    const idx = allDates.findIndex(d => isToday(d))
    if (idx < 0) return null
    return (idx * UNIT_WIDTH) / activeDaysPerUnit
  }, [allDates, activeDaysPerUnit])

  const visibleTasks = getVisibleTasks(tasks, expandedIds, searchQuery)
  const totalHeight = visibleTasks.length * ROW_HEIGHT

  const handleScroll = useCallback(() => {
    if (timelineRef.current) {
      setScrollTop(timelineRef.current.scrollTop)
    }
  }, [])

  useEffect(() => {
    const el = timelineRef.current
    if (!el) return
    setViewportHeight(el.clientHeight)
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_COUNT)
  const endIndex = Math.min(
    visibleTasks.length,
    Math.ceil((scrollTop + viewportHeight) / ROW_HEIGHT) + BUFFER_COUNT
  )
  const virtualTasks = visibleTasks.slice(startIndex, endIndex)
  const offsetY = startIndex * ROW_HEIGHT

  // 计算依赖连线坐标 - 基于 DOM 元素位置
  const [dependencyLines, setDependencyLines] = useState<DependencyLine[]>([])
  const dependencyCalcRef = useRef<number>(0)
  
  useEffect(() => {
    const calculateDependencyLines = () => {
      const lines: DependencyLine[] = []
      const container = timelineRef.current?.querySelector('.gantt-timeline-content') as HTMLElement
      if (!container) return lines

      for (let vIdx = 0; vIdx < visibleTasks.length; vIdx++) {
        const { task } = visibleTasks[vIdx]
        if (!task.predecessors || task.predecessors.length === 0) continue

        // 获取当前任务行和任务条
        const toRow = container.querySelector(`[data-task-id="${task.id}"]`) as HTMLElement
        if (!toRow) continue
        const toBar = toRow.querySelector('.gantt-task-bar') as HTMLElement
        if (!toBar) continue

        // 计算当前任务条的 Y 坐标（减去 HEADER_HEIGHT，因为 SVG viewBox 从 0 开始）
        const toRowOffsetTop = toRow.offsetTop
        const toBarCenterY = toRowOffsetTop - HEADER_HEIGHT + toBar.offsetHeight / 2

        // 计算当前任务条的 X 坐标（直接使用任务条的 left 样式值）
        const toBarLeft = parseFloat(toBar.style.left) || 0
        const toX = toBarLeft

        for (const predId of task.predecessors) {
          // 获取前置任务行和任务条
          const fromRow = container.querySelector(`[data-task-id="${predId}"]`) as HTMLElement
          if (!fromRow) continue
          const fromBar = fromRow.querySelector('.gantt-task-bar') as HTMLElement
          if (!fromBar) continue

          // 计算前置任务条的 Y 坐标（减去 HEADER_HEIGHT，因为 SVG viewBox 从 0 开始）
          const fromRowOffsetTop = fromRow.offsetTop
          const fromBarCenterY = fromRowOffsetTop - HEADER_HEIGHT + fromBar.offsetHeight / 2

          // 计算前置任务条的 X 坐标（任务条左边界 + 宽度 = 右边界）
          const fromBarLeft = parseFloat(fromBar.style.left) || 0
          const fromBarWidth = fromBar.offsetWidth
          const fromX = fromBarLeft + fromBarWidth  // 前置任务条右边界

          lines.push({ fromX, fromY: fromBarCenterY, toX, toY: toBarCenterY, fromTaskId: predId, toTaskId: task.id })
        }
      }

      return lines
    }

    // 使用 requestAnimationFrame 确保 DOM 已更新，并实现防抖
    if (dependencyCalcRef.current) {
      cancelAnimationFrame(dependencyCalcRef.current)
    }
    
    dependencyCalcRef.current = requestAnimationFrame(() => {
      setDependencyLines(calculateDependencyLines())
    })

    return () => {
      if (dependencyCalcRef.current) {
        cancelAnimationFrame(dependencyCalcRef.current)
      }
    }
  }, [visibleTasks, scrollTop])

  return (
    <div ref={timelineRef} className="h-full overflow-auto gantt-scroll relative">
      <div className="inline-block min-w-full gantt-timeline-content" style={{ width: totalWidth, height: totalHeight + HEADER_HEIGHT }}>
        {/* 时间刻度头 */}
        <TimeScaleHeader startDate={baseRange.startDate} endDate={baseRange.endDate} scale={scale} dayWidth={dayWidth} customDays={customDays} />

        {/* 虚拟滚动容器 */}
        <div className="relative" style={{ height: totalHeight, overflow: 'hidden' }}>
          {/* 今日标记线 */}
          {showTodayLine && todayPosition !== null && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
              style={{ left: todayPosition, top: 0, height: '100%' }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-red-500 text-white px-1 py-0.5 rounded whitespace-nowrap text-[10px]">
                今日
              </div>
            </div>
          )}

          {/* 网格线 - 虚拟滚动区域 */}
          <div className="absolute inset-0 top-0 pointer-events-none" style={{ transform: `translateY(${offsetY}px)` }}>
            {isDayView ? (
              <>
                {[...Array(totalDays)].map((_, i) => (
                  <div key={i} className="absolute top-0 bottom-0 border-r border-slate-200" style={{ left: i * UNIT_WIDTH, height: totalHeight }} />
                ))}
                {allDates.map((date, i) => {
                  const d = new Date(date)
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6
                  return isWeekend ? (
                    <div key={`bg-${i}`} className="absolute top-0 bg-red-50/30" style={{ left: i * UNIT_WIDTH, width: UNIT_WIDTH, height: totalHeight }} />
                  ) : null
                })}
              </>
            ) : (
              <>
                {units.map((_, i) => {
                  const unitWidth = UNIT_WIDTH
                  return (
                    <div key={`line-${i}`} className="absolute top-0 bottom-0 border-r border-slate-200" style={{ left: i * unitWidth, height: totalHeight }} />
                  )
                })}
                {units.map((unit, i) => {
                  const unitWidth = UNIT_WIDTH
                  const endDay = dayjs(unit.endDate)
                  const isWeekend = endDay.day() === 0 || endDay.day() === 6
                  return isWeekend ? (
                    <div key={`bg-${i}`} className="absolute top-0 bg-red-50/30" style={{ left: i * unitWidth, width: unitWidth, height: totalHeight, zIndex: 0 }} />
                  ) : null
                })}
              </>
            )}

            {[...Array(Math.ceil(totalHeight / ROW_HEIGHT) + 1)].map((_, i) => (
              <div
                key={`h-${i}`}
                className="absolute border-t border-slate-200"
                style={{
                  top: i * ROW_HEIGHT,
                  left: 0,
                  right: 0,
                  zIndex: 1
                }}
              />
            ))}
          </div>

          {/* 依赖关系连线（SVG 层）- 基于 DOM 计算的坐标，不需要 transform */}
          <svg
            className="absolute pointer-events-none"
            style={{ zIndex: 5, top: HEADER_HEIGHT, left: 0, height: totalHeight, width: totalWidth }}
            viewBox={`0 0 ${totalWidth} ${totalHeight}`}
            preserveAspectRatio="none"
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon
                  points="0 0, 8 3, 0 6"
                  fill="#dc2626"
                />
              </marker>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f87171" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#dc2626" stopOpacity="1" />
              </linearGradient>
            </defs>

            {dependencyLines.map((line, i) => {
              const midX = line.fromX + (line.toX - line.fromX) / 2
              const path = `M ${line.fromX} ${line.fromY} L ${midX} ${line.fromY} L ${midX} ${line.toY} L ${line.toX} ${line.toY}`

              return (
                <g
                  key={i}
                >
                  <path
                    d={path}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={2}
                    opacity={0.25}
                    strokeDasharray="4,2"
                  />
                  <path
                    d={path}
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth={1.5}
                    markerEnd="url(#arrowhead)"
                    strokeDasharray="4,2"
                  />
                </g>
              )
            })}
          </svg>

          {/* 任务条列表 - 虚拟滚动 */}
          <div className="relative" style={{ transform: `translateY(${offsetY}px)` }}>
            {virtualTasks.map(({ task }) => (
              <div key={task.id} data-task-id={task.id} className="gantt-timeline-task relative" style={{ height: ROW_HEIGHT }}>
                <TaskBar
                  task={task}
                  tasks={tasks}
                  startDate={baseRange.startDate}
                  endDate={baseRange.endDate}
                  dayWidth={dayWidth}
                  scale={scale}
                  onResize={onResizeTask}
                  onEdit={onEditTask}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
