import React, { useMemo, useRef, useEffect } from 'react'
import TimeScaleHeader from '../TimeScaleHeader'
import TaskBar from '../TaskBar'
import { Task, TimeScale } from '../../types'
import { generateDateRange, isToday } from '../../utils/dateUtils'
import dayjs from 'dayjs'

interface GanttTimelineProps {
  tasks: Task[]
  scale: TimeScale
  dayWidth: number
  showTodayLine: boolean
  onUpdateTask: (id: string, data: Partial<Task>) => void
  onResizeTask: (id: string, start: string, end: string) => void
  onEditTask: (task: Task) => void
}

export default function GanttTimeline({
  tasks,
  scale,
  dayWidth,
  showTodayLine,
  onUpdateTask,
  onResizeTask,
  onEditTask,
}: GanttTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null)

  const { startDate, endDate, totalDays } = useMemo(() => {
    if (tasks.length === 0) {
      return { startDate: '2026-04-01', endDate: '2026-05-30', totalDays: 60 }
    }

    // 用 dayjs 解析避免时区问题，找到最早开始和最晚结束
    const sortedByStart = [...tasks].sort((a, b) =>
      dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf()
    )
    const sortedByEnd = [...tasks].sort((a, b) =>
      dayjs(b.endDate).valueOf() - dayjs(a.endDate).valueOf()
    )
    const minStart = sortedByStart[0].startDate
    const maxEnd = sortedByEnd[0].endDate

    // 前后各加留白（开始前1天，结束后3天）
    const s = dayjs(minStart).subtract(1, 'day').format('YYYY-MM-DD')
    const e = dayjs(maxEnd).add(3, 'day').format('YYYY-MM-DD')

    const allDates = generateDateRange(s, e)
    return { startDate: s, endDate: e, totalDays: allDates.length }
  }, [tasks])

  const todayPosition = useMemo(() => {
    const dates = generateDateRange(startDate, endDate)
    const idx = dates.findIndex(d => isToday(d))
    return idx >= 0 ? idx * dayWidth : null
  }, [startDate, endDate, dayWidth])

  const totalWidth = totalDays * dayWidth

  return (
    <div ref={timelineRef} className="h-full overflow-auto gantt-scroll relative">
      <div className="inline-block min-w-full gantt-timeline-content" style={{ width: totalWidth }}>
        {/* 时间刻度头 */}
        <TimeScaleHeader startDate={startDate} endDate={endDate} scale={scale} dayWidth={dayWidth} />

        {/* 任务条区域 */}
        <div className="relative">
          {/* 今日标记线 */}
          {showTodayLine && todayPosition !== null && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
              style={{ left: todayPosition }}
            >
              <div className={`absolute -top-1 -translate-x-1/2 bg-red-500 text-white px-1 py-0.5 rounded whitespace-nowrap ${scale === 'month' ? 'text-[8px]' : 'text-[9px]'}`}>
                今日
              </div>
            </div>
          )}

          {/* 网格线 */}
          <div className="absolute inset-0 top-0 pointer-events-none">
            {/* 垂直线（日期网格线） */}
            {[...Array(totalDays)].map((_, i) => (
              <div key={i} className="absolute top-0 bottom-0 border-r border-black" style={{ left: i * dayWidth }} />
            ))}
            
            {/* 水平线（任务行分隔线） */}
            {[...Array(tasks.length + 1)].map((_, i) => (
              <div
                key={`h-${i}`}
                className="absolute border-t border-black"
                style={{
                  top: i * 30,
                  left: 0,
                  right: 0,
                  zIndex: 1
                }}
              />
            ))}
            
            {/* 周末背景色 */}
            {generateDateRange(startDate, endDate).map((date, i) => {
              const d = new Date(date)
              const isWeekend = d.getDay() === 0 || d.getDay() === 6
              return isWeekend ? (
                <div key={`bg-${i}`} className="absolute top-0 bottom-0 bg-red-50/30" style={{ left: i * dayWidth, width: dayWidth }} />
              ) : null
            })}
          </div>

          {/* 任务条列表 */}
          <div className="relative">
            {tasks.map(task => (
              <div key={task.id} className="gantt-timeline-task relative">
                <TaskBar
                  task={task}
                  startDate={startDate}
                  endDate={endDate}
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
