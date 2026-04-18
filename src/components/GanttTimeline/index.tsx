import React, { useMemo, useRef } from 'react'
import TimeScaleHeader from '../TimeScaleHeader'
import TaskBar from '../TaskBar'
import { Task, TimeScale, UNIT_WIDTH } from '../../types'
import { generateDateRange, generateDateUnits, isToday } from '../../utils/dateUtils'
import dayjs from 'dayjs'

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

  // 今日线位置（始终基于日精度）
  const todayPosition = useMemo(() => {
    const idx = allDates.findIndex(d => isToday(d))
    if (idx < 0) return null
    return isDayView ? idx * dayWidth : Math.floor(idx / activeDaysPerUnit) * UNIT_WIDTH + (idx % activeDaysPerUnit) * (UNIT_WIDTH / activeDaysPerUnit)
  }, [allDates, dayWidth, isDayView, activeDaysPerUnit])

  return (
    <div ref={timelineRef} className="h-full overflow-auto gantt-scroll relative">
      <div className="inline-block min-w-full gantt-timeline-content" style={{ width: totalWidth }}>
        {/* 时间刻度头 */}
        <TimeScaleHeader startDate={baseRange.startDate} endDate={baseRange.endDate} scale={scale} dayWidth={dayWidth} customDays={customDays} />

        {/* 任务条区域 */}
        <div className="relative">
          {/* 今日标记线 */}
          {showTodayLine && todayPosition !== null && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
              style={{ left: todayPosition }}
            >
              <div className={`absolute -top-1 -translate-x-1/2 bg-red-500 text-white px-1 py-0.5 rounded whitespace-nowrap text-[10px]`}>
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
                  // 与表头一致：仅根据末尾日期是否为周末来决定高亮
                  const endDay = dayjs(unit.endDate)
                  const isWeekend = endDay.day() === 0 || endDay.day() === 6
                  return isWeekend ? (
                    <div key={`bg-${i}`} className="absolute top-0 bottom-0 bg-red-50/30" style={{ left: i * UNIT_WIDTH, width: UNIT_WIDTH, zIndex: 0 }} />
                  ) : null
                })}
              </>
            )}

            {/* 水平分隔线（任务行） */}
            {[...Array(tasks.length + 1)].map((_, i) => (
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

          {/* 任务条列表（与 TaskTable 保持一致的可见性过滤） */}
          {(() => {
            const visibleTasks: Task[] = []
            for (const task of tasks.filter(t => !t.parentId)) {
              visibleTasks.push(task)
              if (expandedIds.has(task.id)) {
                const children = tasks.filter(t => t.parentId === task.id)
                for (const child of children) {
                  visibleTasks.push(child)
                  if (expandedIds.has(child.id)) {
                    visibleTasks.push(...tasks.filter(t => t.parentId === child.id))
                  }
                }
              }
            }
            return (
              <div className="relative">
                {visibleTasks.map(task => (
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
            )
          })()}
        </div>
      </div>
    </div>
  )
}
