import dayjs from 'dayjs'
import { TimeScale, UNIT_WIDTH } from '../../types'
import { getWeekDay, generateDateUnits } from '../../utils/dateUtils'

interface TimeScaleHeaderProps {
  startDate: string
  endDate: string
  scale: TimeScale
  dayWidth: number
  customDays?: number
}

export default function TimeScaleHeader({ startDate, endDate, scale, dayWidth, customDays = 2 }: TimeScaleHeaderProps) {
  if (scale === 'day') {
    return <DayViewHeader startDate={startDate} endDate={endDate} cellWidth={dayWidth} />
  }

  // custom → 单元模式，每格28px，双行表头 + 工程标尺行
  return <CustomViewHeader startDate={startDate} endDate={endDate} cellWidth={UNIT_WIDTH} customDays={customDays} />
}

/** 日视图表头（三行：月份 | 日期+星期 | 工程标尺） */
function DayViewHeader({ startDate, endDate, cellWidth }: { startDate: string; endDate: string; cellWidth: number }) {
  const start = dayjs(startDate)
  const end = dayjs(endDate)

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
      {/* 第一行：月份分组 */}
      <div className="flex h-[14px] border-b border-slate-200">
        {months.map(month => (
          <div key={month.label} className="shrink-0 flex items-center justify-center border-r border-slate-200 last:border-r-0" style={{ width: month.width }}>
            <span className="font-semibold text-slate-700 text-xs">{month.label}</span>
          </div>
        ))}
      </div>
      {/* 第二行：日期+星期 */}
      <div className="flex h-[16px] border-b border-slate-200 relative">
        {dates.map((date, i) => {
          const d = dayjs(date)
          const isWeekend = d.day() === 0 || d.day() === 6
          return (
            <div
              key={i}
              className={`shrink-0 flex flex-col items-center justify-end border-r border-slate-200 last:border-r-0 ${isWeekend ? 'bg-red-100/40' : ''}`}
              style={{ width: cellWidth, height: '100%' }}
            >
              <div className="flex flex-col items-center">
                <span className={`text-[10px] leading-none ${isWeekend ? 'text-red-500' : 'text-slate-700'}`}>{d.date()}</span>
                <span className={`text-[9px] leading-none ${isWeekend ? 'text-red-400' : 'text-slate-500'}`}>{getWeekDay(date)}</span>
              </div>
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
        {dates.map((_, i) => {
          // 每5天显示一次天数数字（第0天=0, 第5天=5, 第10天=10...）
          const showRuler = i % 5 === 0
          return (
            <div key={i} className="shrink-0 flex items-center justify-center border-r border-slate-200 last:border-r-0" style={{ width: cellWidth }}>
              {showRuler && (
                <span className="text-[11px] font-semibold text-blue-500">{i}</span>
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
}: {
  startDate: string
  endDate: string
  cellWidth: number
  customDays?: number
}) {
  const daysPerUnit = customDays ?? 2
  const units = generateDateUnits(startDate, endDate, daysPerUnit)

  // 上层：按年月分组（跨单元合并同年同月）
  const yearMonthGroups: { label: string; width: number }[] = []
  units.forEach(unit => {
    const ymLabel = dayjs(unit.endDate).format('YYYY年M月')
    if (yearMonthGroups.length === 0 || yearMonthGroups[yearMonthGroups.length - 1].label !== ymLabel) {
      yearMonthGroups.push({ label: ymLabel, width: 0 })
    }
    yearMonthGroups[yearMonthGroups.length - 1].width += cellWidth
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
      {/* 第一行：年月 */}
      <div className="flex h-[14px] border-b border-slate-200">
        {yearMonthGroups.map(g => (
          <div key={g.label} className="shrink-0 flex items-center justify-center border-r border-slate-200 last:border-r-0" style={{ width: g.width }}>
            <span className="font-semibold text-slate-700 text-xs">{g.label}</span>
          </div>
        ))}
      </div>

      {/* 第二行：每格的末尾日期+星期 */}
      <div className="flex h-[16px] border-b border-slate-200 relative">
        {units.map((unit, i) => {
          const endDate = dayjs(unit.endDate)
          return (
            <div
              key={i}
              className={`shrink-0 flex flex-col items-center justify-end border-r border-slate-200 last:border-r-0 ${endDate.day() === 0 || endDate.day() === 6 ? 'bg-red-100/40' : ''}`}
              style={{ width: cellWidth, height: '100%' }}
            >
              <div className="flex flex-col items-center">
                <span className={`text-[10px] leading-none ${endDate.day() === 0 || endDate.day() === 6 ? 'text-red-500' : 'text-slate-700'}`}>{endDate.date()}</span>
                <span className={`text-[9px] leading-none ${endDate.day() === 0 || endDate.day() === 6 ? 'text-red-400' : 'text-slate-500'}`}>{getWeekDay(unit.endDate)}</span>
              </div>
            </div>
          )
        })}

        <div className="absolute bottom-0 left-0 right-0 flex">
          {units.map((_, i) => (
            <div key={i} className="border-l border-slate-200 shrink-0" style={{ width: cellWidth, height: '1px' }} />
          ))}
        </div>
      </div>

      {/* 第三行：工程标尺（每5天显示刻度数字） */}
      <div className="flex h-[20px] relative">
        {units.map((_, i) => {
          const dayNum = cumulativeDays[i]
          // 每5天显示一次刻度数字
          const showRuler = dayNum % 5 === 0 || i === 0
          return (
            <div key={i} className="shrink-0 flex items-center justify-center border-r border-slate-200 last:border-r-0" style={{ width: cellWidth }}>
              {showRuler && (
                <span className="text-[11px] font-semibold text-blue-500">{dayNum}</span>
              )}
            </div>
          )
        })}

        <div className="absolute bottom-0 left-0 right-0 flex">
          {units.map((_, i) => (
            <div key={i} className="border-l border-slate-200 shrink-0" style={{ width: cellWidth, height: '1px' }} />
          ))}
        </div>
      </div>
    </div>
  )
}
