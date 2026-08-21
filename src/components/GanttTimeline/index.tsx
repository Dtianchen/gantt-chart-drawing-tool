import React, { useMemo, useRef, useState, useEffect } from 'react'
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
  /** 嵌入 GanttChart 同一滚动容器：去掉自身滚动容器与表头，只渲染甘特体，与左侧逐行严格对齐 */
  embedded?: boolean
  /** 由 GanttChart 统一计算并传入，确保与左侧任务列表行数/日期范围严格一致 */
  rowCount?: number
  baseRange?: { startDate: string; endDate: string }
}

const ROW_HEIGHT = 30

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
  embedded = false,
  rowCount,
  baseRange: baseRangeProp,
}: GanttTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null)

  const isDayView = scale === 'day'
  const activeDaysPerUnit = scale === 'custom' ? customDays : 1

  // 基础日期范围：优先使用 GanttChart 统一传入，保证与左侧范围完全一致
  const baseRange = useMemo(() => {
    if (baseRangeProp) return baseRangeProp
    if (tasks.length === 0) return { startDate: '2026-04-01', endDate: '2026-05-30' }
    const sortedByStart = [...tasks].sort((a, b) => dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf())
    const sortedByEnd = [...tasks].sort((a, b) => dayjs(b.endDate).valueOf() - dayjs(a.endDate).valueOf())
    const startDate = dayjs(sortedByStart[0].startDate).subtract(1, 'day')
    const endDate = dayjs(sortedByEnd[0].endDate).add(3, 'day')
    return {
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
    }
  }, [baseRangeProp, tasks])

  const allDates = useMemo(() => generateDateRange(baseRange.startDate, baseRange.endDate), [baseRange])
  const units = useMemo(
    () => generateDateUnits(baseRange.startDate, baseRange.endDate, activeDaysPerUnit),
    [baseRange, activeDaysPerUnit]
  )

  const totalDays = allDates.length
  const totalWidth = (totalDays / activeDaysPerUnit) * UNIT_WIDTH

  // 今日线位置：今天在轴范围内则落在对应横坐标；
  // 今天在轴范围外（早于开始/晚于结束）时，仍返回贴着轴边缘的位置并标记“范围外”，
  // 保证今日线（开关默认开启）始终可见，且不改动时间轴本身的范围。
  const { todayPosition, todayOutOfRange } = useMemo(() => {
    const idx = allDates.findIndex(d => isToday(d))
    if (idx >= 0) {
      return { todayPosition: (idx * UNIT_WIDTH) / activeDaysPerUnit, todayOutOfRange: false }
    }
    const today = dayjs()
    if (today.isBefore(dayjs(baseRange.startDate), 'day')) {
      return { todayPosition: 0, todayOutOfRange: true }
    }
    return { todayPosition: totalWidth, todayOutOfRange: true }
  }, [allDates, activeDaysPerUnit, baseRange, totalWidth])

  const visibleTasks = getVisibleTasks(tasks, expandedIds, searchQuery)
  // 总行数：优先 GanttChart 统一传入，保证与左侧完全一致
  const totalRows = rowCount ?? visibleTasks.length
  const totalHeight = totalRows * ROW_HEIGHT

  // 依赖连线坐标 - 基于 DOM 元素位置（无 transform，offsetTop 即真实行位置）
  const [dependencyLines, setDependencyLines] = useState<DependencyLine[]>([])
  const dependencyCalcRef = useRef<number>(0)

  useEffect(() => {
    const calculateDependencyLines = (): DependencyLine[] => {
      const lines: DependencyLine[] = []
      // timelineRef 本身即 .gantt-timeline-content 容器
      const container = timelineRef.current
      if (!container) return lines

      for (let vIdx = 0; vIdx < visibleTasks.length; vIdx++) {
        const { task } = visibleTasks[vIdx]
        if (!task.predecessors || task.predecessors.length === 0) continue

        const toRow = container.querySelector(`[data-task-id="${task.id}"]`) as HTMLElement
        if (!toRow) continue
        const toBar = toRow.querySelector('.gantt-task-bar') as HTMLElement
        if (!toBar) continue

        const toRowOffsetTop = toRow.offsetTop
        // 任务条通过 top:50% + translateY(-50%) 垂直居中，offsetTop 即视觉中心
        const toBarCenterY = toRowOffsetTop + toBar.offsetTop
        const toBarLeft = parseFloat(toBar.style.left) || 0
        const toX = toBarLeft

        for (const predId of task.predecessors) {
          const fromRow = container.querySelector(`[data-task-id="${predId}"]`) as HTMLElement
          if (!fromRow) continue
          const fromBar = fromRow.querySelector('.gantt-task-bar') as HTMLElement
          if (!fromBar) continue

          const fromRowOffsetTop = fromRow.offsetTop
          // 同上：offsetTop 已是视觉中心，无需再加 offsetHeight/2
          const fromBarCenterY = fromRowOffsetTop + fromBar.offsetTop
          const fromBarLeft = parseFloat(fromBar.style.left) || 0
          const fromBarWidth = fromBar.offsetWidth
          const fromX = fromBarLeft + fromBarWidth

          lines.push({ fromX, fromY: fromBarCenterY, toX, toY: toBarCenterY, fromTaskId: predId, toTaskId: task.id })
        }
      }
      return lines
    }

    if (dependencyCalcRef.current) cancelAnimationFrame(dependencyCalcRef.current)
    dependencyCalcRef.current = requestAnimationFrame(() => {
      setDependencyLines(calculateDependencyLines())
    })
    return () => {
      if (dependencyCalcRef.current) cancelAnimationFrame(dependencyCalcRef.current)
    }
  }, [visibleTasks, totalHeight])

  const gridAndBars = (
    <div ref={timelineRef} className="relative gantt-timeline-content" style={{ width: totalWidth, height: totalHeight }}>
      {/* 今日标记线：开关默认开启即显示；今天在轴范围外时贴轴边缘并标注“范围外”，仍保持可见 */}
      {showTodayLine && (
        <div
          className="absolute w-0.5 bg-red-500 z-20 pointer-events-none"
          style={{ left: todayPosition, top: 0, height: '100%' }}
        >
          <div
            className={`absolute -top-1 bg-red-500 text-white px-1 py-0.5 rounded whitespace-nowrap text-[10px] ${
              todayOutOfRange
                ? todayPosition === 0
                  ? 'left-0'
                  : 'right-0'
                : 'left-1/2 -translate-x-1/2'
            }`}
          >
            今日{todayOutOfRange ? '(范围外)' : ''}
          </div>
        </div>
      )}

      {/* 网格线 */}
      <div className="absolute inset-0 top-0 pointer-events-none">
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
            {units.map((_, i) => (
              <div key={`line-${i}`} className="absolute top-0 bottom-0 border-r border-slate-200" style={{ left: i * UNIT_WIDTH, height: totalHeight }} />
            ))}
            {units.map((unit, i) => {
              const endDay = dayjs(unit.endDate)
              const isWeekend = endDay.day() === 0 || endDay.day() === 6
              return isWeekend ? (
                <div key={`bg-${i}`} className="absolute top-0 bg-red-50/30" style={{ left: i * UNIT_WIDTH, width: UNIT_WIDTH, height: totalHeight, zIndex: 0 }} />
              ) : null
            })}
          </>
        )}

        {[...Array(totalRows + 1)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute border-t border-slate-200"
            style={{ top: i * ROW_HEIGHT, left: 0, right: 0, zIndex: 1 }}
          />
        ))}
      </div>

      {/* 任务条列表 - 全量渲染，行高与左侧严格一致 */}
      <div className="relative" style={{ zIndex: 1 }}>
        {visibleTasks.map(({ task }) => (
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

      {/* 依赖关系连线（SVG 层）：置于任务条之上，避免被遮挡 */}
      <svg
        className="absolute pointer-events-none"
        style={{ zIndex: 10, top: 0, left: 0, height: totalHeight, width: totalWidth }}
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        preserveAspectRatio="none"
      >
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#dc2626" />
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
            <g key={i}>
              <path d={path} fill="none" stroke="#ffffff" strokeWidth={2} opacity={0.25} strokeDasharray="4,2" />
              <path d={path} fill="none" stroke="url(#lineGradient)" strokeWidth={1.5} markerEnd="url(#arrowhead)" strokeDasharray="4,2" />
            </g>
          )
        })}
      </svg>
    </div>
  )

  // 嵌入模式：只渲染甘特体，由 GanttChart 外层滚动容器统一滚动，横向由外层同步表头
  if (embedded) {
    return gridAndBars
  }

  // 独立模式（保留原行为，避免破坏其它调用/导出）
  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden">
      <div className="shrink-0 overflow-hidden">
        <TimeScaleHeader startDate={baseRange.startDate} endDate={baseRange.endDate} scale={scale} dayWidth={dayWidth} customDays={customDays} />
      </div>
      <div className="flex-1 min-h-0 overflow-auto gantt-scroll relative">
        {gridAndBars}
      </div>
    </div>
  )
}
