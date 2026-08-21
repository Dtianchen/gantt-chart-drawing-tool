import React, { useRef, useEffect, useState } from 'react'
import TaskTable from '../TaskTable'
import GanttTimeline from '../GanttTimeline'
import TimeScaleHeader from '../TimeScaleHeader'
import { Task, TimeScale, UNIT_WIDTH } from '../../types'
import { getVisibleTasks } from '../../utils/taskUtils'
import dayjs from 'dayjs'

interface GanttChartProps {
  children: React.ReactNode
  exportRef: React.RefObject<HTMLDivElement>
  tasks: Task[]
  scale: TimeScale
  customDays?: number
  dayWidth: number
  showTodayLine: boolean
  expandedIds?: Set<string>
  searchQuery?: string
  /** 是否处于导出中：仅导出时临时挂载离屏副本，平时零开销，避免双份渲染卡顿 */
  exporting?: boolean
}

/**
 * 左右合并为同一个滚动容器：
 * - 顶部一行固定表头（左侧任务列表表头 + 右侧时间刻度表头），不随滚动。
 * - 下方唯一滚动容器同时纵向+横向滚动；每一"行"由左侧数据列(sticky 冻结)与右侧甘特体组成，
 *   纵向天然一起滚动，左右逐行严格对齐，不存在两条滚动条、也不存在同步问题。
 */
export default function GanttChart({
  children,
  exportRef,
  tasks,
  scale,
  customDays = 2,
  dayWidth,
  showTodayLine,
  expandedIds = new Set(),
  searchQuery,
  exporting = false,
}: GanttChartProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const leftHeaderRef = useRef<HTMLDivElement>(null)
  const rightHeaderInnerRef = useRef<HTMLDivElement>(null)
  // 工作名称列宽度：提升到 GanttChart 统一管理，保证表头与数据列同源、随调整一起变化
  const [nameColWidth, setNameColWidth] = useState<number>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('gantt_name_col_width') : null
    const w = saved ? parseInt(saved, 10) : NaN
    return !Number.isNaN(w) && w > 0 ? w : 160
  })
  const handleResizeCol = (w: number) => {
    const next = Math.max(120, Math.min(w, 520))
    setNameColWidth(next)
    try { localStorage.setItem('gantt_name_col_width', String(next)) } catch { /* ignore */ }
  }

  const activeDaysPerUnit = scale === 'custom' ? customDays : 1

  const baseRange = (() => {
    if (tasks.length === 0) return { startDate: '2026-04-01', endDate: '2026-05-30' }
    const sortedByStart = [...tasks].sort((a, b) => dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf())
    const sortedByEnd = [...tasks].sort((a, b) => dayjs(b.endDate).valueOf() - dayjs(a.endDate).valueOf())
    const startDate = dayjs(sortedByStart[0].startDate).subtract(1, 'day')
    const endDate = dayjs(sortedByEnd[0].endDate).add(3, 'day')
    return {
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
    }
  })()

  const visibleTasks = getVisibleTasks(tasks, expandedIds, searchQuery)
  const rowCount = visibleTasks.length

  const allDates = (() => {
    const dates: string[] = []
    const start = dayjs(baseRange.startDate)
    const end = dayjs(baseRange.endDate)
    let cur = start
    while (cur.isBefore(end) || cur.isSame(end, 'day')) {
      dates.push(cur.format('YYYY-MM-DD'))
      cur = cur.add(1, 'day')
    }
    return dates
  })()
  const totalDays = allDates.length
  const totalWidth = (totalDays / activeDaysPerUnit) * UNIT_WIDTH

  const leftTotalWidth = nameColWidth + 264 // 40 + nameCol + 64 + 80 + 80

  // 同步横向滚动：滚动容器的 scrollLeft 同时驱动左右表头的 translateX
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const x = -el.scrollLeft
      // 左侧表头是冻结列，横向不平移；仅右侧时间刻度表头内容随横向滚动平移
      if (rightHeaderInnerRef.current) rightHeaderInnerRef.current.style.transform = `translateX(${x}px)`
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  // 预生成 UI 与导出所需的 children 克隆，避免重复 children.map 逻辑
  const taskTable = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.type === TaskTable
  ) as React.ReactElement<any> | undefined

  const ganttTimeline = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.type === GanttTimeline
  ) as React.ReactElement<any> | undefined

  // 每次渲染都用 cloneElement 生成全新实例，避免同一元素被挂载到多个父节点导致冲突
  const cloneTaskTable = (extra: Record<string, unknown>) =>
    taskTable ? React.cloneElement(taskTable, extra) : null
  const cloneGantt = (extra: Record<string, unknown>) =>
    ganttTimeline ? React.cloneElement(ganttTimeline, extra) : null

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white border-t border-slate-200 overflow-hidden">
      {/* 可交互 UI 区域 */}
      <div className="flex-1 min-h-0 flex flex-col">
        {/* 顶部固定表头行：左侧表头 + 右侧时间刻度表头 */}
        <div className="flex shrink-0">
          <div ref={leftHeaderRef} className="shrink-0 z-[60] bg-white shadow-[2px_0_6px_-2px_rgba(0,0,0,0.08)]">
            {cloneTaskTable({ headerOnly: true, nameColWidth, onResizeCol: handleResizeCol })}
          </div>
          <div className="flex-1 min-w-0 overflow-hidden z-10 bg-slate-50">
            <div ref={rightHeaderInnerRef} className="min-w-max" style={{ width: totalWidth }}>
              <TimeScaleHeader
                startDate={baseRange.startDate}
                endDate={baseRange.endDate}
                scale={scale}
                dayWidth={dayWidth}
                customDays={customDays}
              />
            </div>
          </div>
        </div>

        {/* 唯一滚动容器：纵向+横向一起滚 */}
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-auto gantt-scroll relative">
          <div className="flex min-w-max" style={{ minHeight: rowCount * 30, paddingBottom: 150 }}>
            {/* 左侧数据列：sticky 冻结首列，高 z-index + 白色背景 + 右侧阴影，遮挡横向滚动时从下方穿过的甘特图 */}
            <div className="sticky left-0 z-50 bg-white shadow-[2px_0_8px_-2px_rgba(0,0,0,0.1)] border-r border-slate-200" style={{ alignSelf: 'stretch' }}>
              {cloneTaskTable({ bodyOnly: true, nameColWidth })}
            </div>
            {/* 右侧甘特体 */}
            <div className="relative" style={{ flex: '0 0 auto' }}>
              {cloneGantt({ embedded: true, rowCount, baseRange, showTodayLine })}
            </div>
          </div>
        </div>
      </div>

      {/* 导出专用离屏副本：结构简单，左右严格对齐，无滚动/sticky/transform，避免导出错位。
          平时不渲染子内容（由 exporting 控制挂载），避免双份完整甘特图导致页面卡顿 */}
      <div
        ref={exportRef}
        style={{
          position: 'absolute',
          left: -999999,
          top: 0,
          width: 'auto',
          height: 'auto',
          overflow: 'visible',
          background: '#fff',
          visibility: 'visible',
        } as React.CSSProperties}
      >
        {exporting && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: `${leftTotalWidth}px ${totalWidth}px`, width: leftTotalWidth + totalWidth }}>
              <div style={{ width: leftTotalWidth, height: 50, overflow: 'visible' }}>
                {cloneTaskTable({ headerOnly: true, nameColWidth, onResizeCol: handleResizeCol })}
              </div>
              <div style={{ width: totalWidth, height: 50, overflow: 'visible' }}>
                <TimeScaleHeader
                  startDate={baseRange.startDate}
                  endDate={baseRange.endDate}
                  scale={scale}
                  dayWidth={dayWidth}
                  customDays={customDays}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `${leftTotalWidth}px ${totalWidth}px`, width: leftTotalWidth + totalWidth, minHeight: rowCount * 30, paddingBottom: 150 }}>
              <div style={{ width: leftTotalWidth, overflow: 'visible' }}>
                {cloneTaskTable({ bodyOnly: true, nameColWidth })}
              </div>
              <div style={{ width: totalWidth, overflow: 'visible' }}>
                {cloneGantt({ embedded: true, rowCount, baseRange, showTodayLine })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
