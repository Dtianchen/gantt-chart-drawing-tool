import dayjs from 'dayjs'
import { TimeScale } from '../../types'
import { getWeekDay } from '../../utils/dateUtils'

interface TimeScaleHeaderProps {
  startDate: string
  endDate: string
  scale: TimeScale
  dayWidth: number
}

export default function TimeScaleHeader({ startDate, endDate, scale, dayWidth }: TimeScaleHeaderProps) {
  const start = dayjs(startDate)
  const end = dayjs(endDate)
  const totalDays = end.diff(start, 'day') + 1

  const dates: string[] = []
  let current = start
  while (current.isBefore(end) || current.isSame(end, 'day')) {
    dates.push(current.format('YYYY-MM-DD'))
    current = current.add(1, 'day')
  }

  // 按月分组
  const months: { label: string; days: string[]; width: number }[] = []
  dates.forEach(date => {
    const monthLabel = dayjs(date).format('YYYY.M')
    if (months.length === 0 || months[months.length - 1].label !== monthLabel) {
      months.push({ label: monthLabel, days: [], width: 0 })
    }
    months[months.length - 1].days.push(date)
    months[months.length - 1].width += dayWidth
  })

  const cellWidth = scale === 'week' ? dayWidth : dayWidth * 7

  return (
    <div className="shrink-0 bg-slate-50 border-b border-slate-200">
      {/* 月份行 */}
      <div className="flex h-[14px] border-b border-slate-200">
        {months.map(month => (
          <div key={month.label} className="shrink-0 flex items-center justify-center border-r border-slate-200 last:border-r-0" style={{ width: month.width }}>
            <span className={`font-semibold text-slate-700 ${scale === 'month' ? 'text-[10px]' : 'text-xs'}`}>{month.label}</span>
          </div>
        ))}
      </div>

      {/* 日期行 */}
      <div className="flex h-[16px] relative">
        {dates.map((date, i) => {
          const d = dayjs(date)
          const isWeekend = d.day() === 0 || d.day() === 6
          const showScale = i % 5 === 0 || i === dates.length - 1
          return (
            <div
              key={i}
              className={`shrink-0 flex flex-col items-center justify-end border-r border-slate-200 last:border-r-0 ${
                isWeekend ? 'bg-red-100/40' : ''
              }`}
              style={{ width: dayWidth, height: '100%' }}
            >
              <div className="flex flex-col items-center">
                <span className={`${scale === 'month' ? 'text-[9px]' : 'text-[10px]'} leading-none ${isWeekend ? 'text-red-500' : 'text-slate-700'}`}>
                  {d.date()}
                </span>
                <span className={`${scale === 'month' ? 'text-[8px]' : 'text-[9px]'} leading-none ${isWeekend ? 'text-red-400' : 'text-slate-500'}`}>
                  {getWeekDay(date)}
                </span>
              </div>
              {showScale && i !== 0 && (
                <span className={`absolute bottom-[-22px] ${scale === 'month' ? 'text-[8px]' : 'text-[9px]'} text-black`}>
                  {i}
                </span>
              )}
            </div>
          )
        })}

        {/* 底部刻度线 */}
        <div className="absolute bottom-0 left-0 right-0 flex">
          {dates.map((_, i) => (
            <div key={i} className="border-l border-slate-200 shrink-0" style={{ width: dayWidth, height: '1px' }} />
          ))}
        </div>
      </div>
    </div>
  )
}
