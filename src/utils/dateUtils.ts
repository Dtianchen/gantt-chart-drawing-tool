import dayjs from 'dayjs'

export function getDaysBetween(start: string, end: string): number {
  return dayjs(end).diff(dayjs(start), 'day') + 1
}

export function generateDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = []
  let current = dayjs(startDate)
  const end = dayjs(endDate)
  while (current.isBefore(end) || current.isSame(end, 'day')) {
    dates.push(current.format('YYYY-MM-DD'))
    current = current.add(1, 'day')
  }
  return dates
}

export function formatDate(dateStr: string, format = 'YYYY-MM-DD'): string {
  return dayjs(dateStr).format(format)
}

export function formatShortDate(dateStr: string): string {
  return dayjs(dateStr).format('MM-DD')
}

export function formatFullDate(dateStr: string): string {
  return dayjs(dateStr).format('YYYY-MM-DD')
}

export function getWeekDay(dateStr: string): string {
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return weekdays[dayjs(dateStr).day()]
}

export function addDays(dateStr: string, days: number): string {
  return dayjs(dateStr).add(days, 'day').format('YYYY-MM-DD')
}

export function isToday(dateStr: string): boolean {
  return dayjs(dateStr).isSame(dayjs(), 'day')
}

export function getTotalDuration(tasks: { startDate: string; endDate: string }[]): number {
  if (tasks.length === 0) return 0
  const sorted = [...tasks].sort((a, b) =>
    dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf()
  )
  const minStart = sorted[0].startDate
  const latestEnd = [...tasks].sort((a, b) =>
    dayjs(b.endDate).valueOf() - dayjs(a.endDate).valueOf()
  )[0].endDate
  return dayjs(latestEnd).diff(dayjs(minStart), 'day') + 1
}
