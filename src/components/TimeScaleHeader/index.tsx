import dayjs from 'dayjs'
import { TimeScale, UNIT_WIDTH, DisplayMode } from '../../types'
import { getWeekDay, generateDateUnits } from '../../utils/dateUtils'

interface TimeScaleHeaderProps {
  startDate: string
  endDate: string
  scale: TimeScale
  dayWidth?: number
  customDays?: number
  displayMode?: DisplayMode
  projectStartDate?: string
}

export default function TimeScaleHeader({
  startDate,
  endDate,
  scale,
  customDays = 2,
  displayMode = 'date',
  projectStartDate = '',
}: TimeScaleHeaderProps) {
  const isProjectDay = displayMode === 'project-day' && !!projectStartDate

  if (scale === 'day') {
    return (
      <DayViewHeader
        startDate={startDate}
        endDate={endDate}
        cellWidth={UNIT_WIDTH}
        isProjectDay={isProjectDay}
        projectStartDate={projectStartDate}
      />
    )
  }

  // custom → 单元模式，每格固定显示28px
  return (
    <CustomViewHeader
      startDate={startDate}
      endDate={endDate}
      cellWidth={UNIT_WIDTH}
      customDays={customDays}
      isProjectDay={isProjectDay}
      projectStartDate={projectStartDate}
    />
  )
}

/** 预解析一次项目基准日，返回项目天数数字（自然日、1-based 含首尾；基准日前返回 0） */
function createProjectDayFormatter(projectStartDate: string, enabled: boolean) {
  const base = enabled && projectStartDate ? dayjs(projectStartDate) : null
  return (date: string): number => {
    if (!base || !base.isValid()) return 0
    const target = dayjs(date)
    if (!target.isValid()) return 0
    return Math.max(0, target.diff(base, 'day') + 1)
  }
}

/** 日视图表头（三行：月份 | 日期+星期或项目天数 | 工程标尺） */
function DayViewHeader({
  startDate,
  endDate,
  cellWidth,
  isProjectDay,
  projectStartDate,
}: {
  startDate: string
  endDate: string
  cellWidth: number
  isProjectDay: boolean
  projectStartDate: string
}) {
  const start = dayjs(startDate)
  const end = dayjs(endDate)
  const projectDayOf = createProjectDayFormatter(projectStartDate, isProjectDay)

  const dates: string[] = []
  let current = start
  while (current.isBefore(end) || current.isSame(end, 'day')) {
    dates.push(current.format('YYYY-MM-DD'))
    current = current.add(1, 'day')
  }

  // 按月分组（第一排）
  const months: { label: string; width: number }[] = []
  dates.forEach((date) => {
    const monthLabel = dayjs(date).format('YYYY.M')
    if (months.length === 0 || months[months.length - 1].label !== monthLabel) {
      months.push({ label: monthLabel, width: 0 })
    }
      months[months.length - 1].width += cellWidth
  })

  return (
    <div className="shrink-0 bg-slate-50 border-b border-slate-200">
      {/* 第一行：月份分组（项目天数模式整行留白，仅保留行高与分隔线） */}
      <div className="flex h-[14px] border-b border-slate-200">
        {!isProjectDay && months.map(month => (
          <div key={month.label} className="shrink-0 flex items-center justify-center border-r border-slate-200 last:border-r-0" style={{ width: month.width }}>
            <span className="font-semibold text-slate-700 text-xs">{month.label}</span>
          </div>
        ))}
      </div>
      {/* 第二行：日期+星期 / 项目天数 */}
      <div className="flex h-[16px] border-b border-slate-200 relative">
        {dates.map((date, i) => {
          const d = dayjs(date)
          const isWeekend = d.day() === 0 || d.day() === 6
          const projectDay = isProjectDay ? projectDayOf(date) : 0
          const isPreStart = isProjectDay && projectDay < 1
          return (
            <div
              key={i}
              className={`shrink-0 flex flex-col items-center justify-end border-r border-slate-200 last:border-r-0 ${isWeekend ? 'bg-red-100/40' : ''}`}
              style={{ width: cellWidth, height: '100%' }}
            >
              {isProjectDay ? (
                <span className={`text-[10px] leading-none ${isPreStart ? 'text-slate-400' : isWeekend ? 'text-red-500' : 'text-slate-700'}`}>
                  {projectDay}
                </span>
              ) : (
                <div className="flex flex-col items-center">
                  <span className={`text-[10px] leading-none ${isWeekend ? 'text-red-500' : 'text-slate-700'}`}>{d.date()}</span>
                  <span className={`text-[9px] leading-none ${isWeekend ? 'text-red-400' : 'text-slate-500'}`}>{getWeekDay(date)}</span>
                </div>
              )}
            </div>
          )
        })}
        <div className="absolute bottom-0 left-0 right-0 flex">
          {dates.map((_, i) => (
            <div key={i} className="border-l border-slate-200 shrink-0" style={{ width: cellWidth, height: '1px' }} />
          ))}
        </div>
      </div>
      {/* 第三行：工程标尺（每5天显示刻度数字） */}
      <div className="flex h-[20px] relative">
        {dates.map((date, i) => {
          // 日期模式沿用轴起点计数；天数模式按项目基准日重算，基准日前显示数字 0
          const showRuler = i % 5 === 0
          const projectDay = isProjectDay ? projectDayOf(date) : 0
          const isPreStart = isProjectDay && projectDay < 1
          return (
            <div key={i} className="shrink-0 flex items-center justify-center border-r border-slate-200 last:border-r-0" style={{ width: cellWidth }}>
              {showRuler && (
                <span className={`text-[11px] font-semibold ${isPreStart ? 'text-slate-400' : 'text-blue-500'}`}>
                  {isProjectDay ? projectDay : i}
                </span>
              )}
            </div>
          )
        })}
        <div className="absolute bottom-0 left-0 right-0 flex">
          {dates.map((_, i) => (
            <div key={i} className="border-l border-slate-200 shrink-0" style={{ width: cellWidth, height: '1px' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * 自定义视图表头（三行：年月 | 末尾日期+星期 | 工程标尺）
 */
function CustomViewHeader({
  startDate,
  endDate,
  cellWidth,
  customDays,
  isProjectDay,
  projectStartDate,
}: {
  startDate: string
  endDate: string
  cellWidth: number
  customDays?: number
  isProjectDay: boolean
  projectStartDate: string
}) {
  const daysPerUnit = customDays ?? 2
  const units = generateDateUnits(startDate, endDate, daysPerUnit)
  const projectDayOf = createProjectDayFormatter(projectStartDate, isProjectDay)
  
  // 每个单元的宽度固定为 UNIT_WIDTH(28px)，与视图无关
  const unitWidth = UNIT_WIDTH

  // 上层：按年月分组（跨单元合并同年同月）
  const yearMonthGroups: { label: string; width: number }[] = []
  units.forEach(unit => {
    const ymLabel = dayjs(unit.endDate).format('YYYY年M月')
    if (yearMonthGroups.length === 0 || yearMonthGroups[yearMonthGroups.length - 1].label !== ymLabel) {
      yearMonthGroups.push({ label: ymLabel, width: 0 })
    }
    yearMonthGroups[yearMonthGroups.length - 1].width += unitWidth
  })

  // 计算每个单元结束时的累计天数（用于工程标尺）
  const cumulativeDays: number[] = []
  let acc = 0
  units.forEach(unit => {
    acc += daysPerUnit
    cumulativeDays.push(acc - 1) // 累计到该单元最后一天的天数索引
  })

  return (
    <div className="shrink-0 bg-slate-50 border-b border-slate-200">
      {/* 第一行：年月（项目天数模式整行留白，仅保留行高与分隔线） */}
      <div className="flex h-[14px] border-b border-slate-200">
        {!isProjectDay && yearMonthGroups.map(g => (
          <div key={g.label} className="shrink-0 flex items-center justify-center border-r border-slate-200 last:border-r-0" style={{ width: g.width }}>
            <span className="font-semibold text-slate-700 text-xs">{g.label}</span>
          </div>
        ))}
      </div>

      {/* 第二行：每格的末尾日期+星期 / 项目天数 */}
      <div className="flex h-[16px] border-b border-slate-200 relative">
        {units.map((unit, i) => {
          const endDate = dayjs(unit.endDate)
          const isWeekend = endDate.day() === 0 || endDate.day() === 6
          const projectDay = isProjectDay ? projectDayOf(unit.endDate) : 0
          const isPreStart = isProjectDay && projectDay < 1
          return (
            <div
              key={i}
              className={`shrink-0 flex flex-col items-center justify-end border-r border-slate-200 last:border-r-0 ${isWeekend ? 'bg-red-100/40' : ''}`}
              style={{ width: unitWidth, height: '100%' }}
            >
              {isProjectDay ? (
                <span className={`text-[10px] leading-none ${isPreStart ? 'text-slate-400' : isWeekend ? 'text-red-500' : 'text-slate-700'}`}>
                  {projectDay}
                </span>
              ) : (
                <div className="flex flex-col items-center">
                  <span className={`text-[10px] leading-none ${isWeekend ? 'text-red-500' : 'text-slate-700'}`}>{endDate.date()}</span>
                  <span className={`text-[9px] leading-none ${isWeekend ? 'text-red-400' : 'text-slate-500'}`}>{getWeekDay(unit.endDate)}</span>
                </div>
              )}
            </div>
          )
        })}

        <div className="absolute bottom-0 left-0 right-0 flex">
          {units.map((_, i) => (
            <div key={i} className="border-l border-slate-200 shrink-0" style={{ width: unitWidth, height: '1px' }} />
          ))}
        </div>
      </div>

      {/* 第三行：工程标尺（每5天显示刻度数字） */}
      <div className="flex h-[20px] relative">
        {units.map((unit, i) => {
          const dayNum = cumulativeDays[i]
          // 每5天显示一次刻度数字；天数模式按项目基准日重算
          const showRuler = dayNum % 5 === 0 || i === 0
          const projectDay = isProjectDay ? projectDayOf(unit.endDate) : 0
          const isPreStart = isProjectDay && projectDay < 1
          return (
            <div key={i} className="shrink-0 flex items-center justify-center border-r border-slate-200 last:border-r-0" style={{ width: unitWidth }}>
              {showRuler && (
                <span className={`text-[11px] font-semibold ${isPreStart ? 'text-slate-400' : 'text-blue-500'}`}>
                  {isProjectDay ? projectDay : dayNum}
                </span>
              )}
            </div>
          )
        })}

        <div className="absolute bottom-0 left-0 right-0 flex">
          {units.map((_, i) => (
            <div key={i} className="border-l border-slate-200 shrink-0" style={{ width: unitWidth, height: '1px' }} />
          ))}
        </div>
      </div>
    </div>
  )
}
