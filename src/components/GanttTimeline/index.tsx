import React, { useMemo, useRef } from 'react'
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

  // 总宽度：日视图逐日，自定义视图按单元(28px/格)
  const totalDays = allDates.length
  const totalWidth = isDayView ? totalDays * dayWidth : units.length * UNIT_WIDTH

  // SVG 坐标系宽度 = 所有任务使用的实际最大 X 坐标
  // 任务条定位使用 dateIndex * dayWidth，最大 X 为 totalDays * dayWidth
  const svgViewBoxWidth = totalDays * dayWidth

  // 今日线位置（始终基于日精度）
  const todayPosition = useMemo(() => {
    const idx = allDates.findIndex(d => isToday(d))
    if (idx < 0) return null
    return idx * dayWidth
  }, [allDates, dayWidth])

  const visibleTasks = getVisibleTasks(tasks, expandedIds, searchQuery)

  // 计算依赖连线坐标
  const dependencyLines = useMemo<DependencyLine[]>(() => {
    const lines: DependencyLine[] = []
    const rowHeight = 30

    // 建立任务ID到可见行索引的映射
    const visibleIndexMap = new Map<string, number>()
    visibleTasks.forEach(({ task }, idx) => {
      visibleIndexMap.set(task.id, idx)
    })

    for (const { task, index: vIdx } of visibleTasks) {
      if (!task.predecessors || task.predecessors.length === 0) continue
      const toY = vIdx * rowHeight + rowHeight / 2

      for (const predId of task.predecessors) {
        const fromIdx = visibleIndexMap.get(predId)
        if (fromIdx === undefined) continue // 前置任务不在可见列表中

        const predTask = tasks.find(t => t.id === predId)
        if (!predTask) continue

        const fromY = fromIdx * rowHeight + rowHeight / 2

        // 前置任务条右边缘 X（endDate 是包含在内的，所以 +1）
        const fromEndIndex = allDates.indexOf(predTask.endDate)
        if (fromEndIndex < 0) continue
        const fromX = (fromEndIndex + 1) * dayWidth

        // 当前任务条左边缘 X
        const toStartIndex = allDates.indexOf(task.startDate)
        if (toStartIndex < 0) continue
        const toX = toStartIndex * dayWidth

        lines.push({ fromX, fromY, toX, toY })
      }
    }

    return lines
  }, [visibleTasks, tasks, allDates, dayWidth])

  return (
    <div ref={timelineRef} className="h-full overflow-auto gantt-scroll relative">
      <div className="inline-block min-w-full gantt-timeline-content" style={{ width: totalWidth }}>
        {/* 时间刻度头 */}
        <TimeScaleHeader startDate={baseRange.startDate} endDate={baseRange.endDate} scale={scale} dayWidth={dayWidth} customDays={customDays} />

        {/* 任务条区域 */}
        <div className="relative" style={{ height: visibleTasks.length * 30 }}>
          {/* 今日标记线 */}
          {showTodayLine && todayPosition !== null && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
              style={{ left: todayPosition }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-red-500 text-white px-1 py-0.5 rounded whitespace-nowrap text-[10px]">
                今日
              </div>
            </div>
          )}

          {/* 网格线 */}
          <div className="absolute inset-0 top-0 pointer-events-none">
            {isDayView ? (
              <>
                {/* 日视图：逐日垂直线 */}
                {[...Array(totalDays)].map((_, i) => (
                  <div key={i} className="absolute top-0 bottom-0 border-r border-slate-200" style={{ left: i * dayWidth }} />
                ))}
                {/* 周末背景色 */}
                {allDates.map((date, i) => {
                  const d = new Date(date)
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6
                  return isWeekend ? (
                    <div key={`bg-${i}`} className="absolute top-0 bottom-0 bg-red-50/30" style={{ left: i * dayWidth, width: dayWidth }} />
                  ) : null
                })}
              </>
            ) : (
              /* 自定义视图：按单元垂直线 + 周末背景色 */
              <>
                {units.map((_, i) => (
                  <div key={`line-${i}`} className="absolute top-0 bottom-0 border-r border-slate-200" style={{ left: i * UNIT_WIDTH }} />
                ))}
                {units.map((unit, i) => {
                  const endDay = dayjs(unit.endDate)
                  const isWeekend = endDay.day() === 0 || endDay.day() === 6
                  return isWeekend ? (
                    <div key={`bg-${i}`} className="absolute top-0 bottom-0 bg-red-50/30" style={{ left: i * UNIT_WIDTH, width: UNIT_WIDTH, zIndex: 0 }} />
                  ) : null
                })}
              </>
            )}

            {/* 水平分隔线（任务行） */}
            {[...Array(visibleTasks.length + 1)].map((_, i) => (
              <div
                key={`h-${i}`}
                className="absolute border-t border-slate-200"
                style={{
                  top: i * 30,
                  left: 0,
                  right: 0,
                  zIndex: 1
                }}
              />
            ))}
          </div>

          {/* 依赖关系连线（SVG层） */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 5 }}
            viewBox={`0 0 ${svgViewBoxWidth} ${visibleTasks.length * 30}`}
          >
            {dependencyLines.map((line, i) => {
              const midX = line.fromX + (line.toX - line.fromX) / 2
              const path = `M ${line.fromX} ${line.fromY} C ${midX} ${line.fromY}, ${midX} ${line.toY}, ${line.toX} ${line.toY}`
              return (
                <g key={i}>
                  <path
                    d={path}
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    strokeDasharray="4 2"
                  />
                  {/* 箭头 */}
                  <polygon
                    points={`${line.toX},${line.toY} ${line.toX - 5},${line.toY - 3} ${line.toX - 5},${line.toY + 3}`}
                    fill="#94a3b8"
                  />
                </g>
              )
            })}
          </svg>

          {/* 任务条列表 */}
          <div className="relative">
            {visibleTasks.map(({ task }) => (
              <div key={task.id} className="gantt-timeline-task relative">
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
