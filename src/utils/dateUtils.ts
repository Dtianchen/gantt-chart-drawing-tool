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

export interface DateUnit {
  startDate: string
  endDate: string
  label: string
}

/**
 * 按粒度生成时间单元数组（用于周/月/季度/自定义视图）
 * 每个单元包含起止日期和显示标签，标签根据 daysPerUnit 智能选择格式
 */
export function generateDateUnits(startDate: string, endDate: string, daysPerUnit: number): DateUnit[] {
  const units: DateUnit[] = []
  let current = dayjs(startDate)
  const end = dayjs(endDate)

  while (current.isBefore(end) || current.isSame(end, 'day')) {
    const unitStart = current
    const unitEnd = current.add(daysPerUnit - 1, 'day').isBefore(end)
      ? current.add(daysPerUnit - 1, 'day')
      : end

    // 根据 daysPerUnit 智能选择标签格式
    const label = buildUnitLabel(unitStart, unitEnd, daysPerUnit)

    units.push({
      startDate: unitStart.format('YYYY-MM-DD'),
      endDate: unitEnd.format('YYYY-MM-DD'),
      label,
    })

    current = unitEnd.add(1, 'day')
  }

  return units
}

/**
 * 根据粒度大小智能选择单元标签的显示格式：
 * - ≤7天：日期范围 "04/01~04/07"
 * - 8~31天：起止日期 "4/1~4/30"
 * - 32~90天：月份 "4月"
 * - 91~180天：季度 "2026Q2"
 * - >180天：年份 "2026年"
 */
function buildUnitLabel(start: dayjs.Dayjs, end: dayjs.Dayjs, daysPerUnit: number): string {
  if (daysPerUnit <= 7) {
    // 精细粒度：显示完整日期范围
    return `${start.format('MM/DD')}~${end.format('MM/DD')}`
  }
  if (daysPerUnit <= 31) {
    // 月级以内：显示起止日
    return `${start.format('M/D')}~${end.format('M/D')}`
  }
  if (daysPerUnit <= 90) {
    // 季级以内：显示月份
    return `${start.format('M')}月`
  }
  if (daysPerUnit <= 180) {
    // 半年级：显示季度
    const q = Math.ceil((start.month() + 1) / 3)
    return `${start.year()}Q${q}`
  }
  // 年级及以上：显示年
  return `${start.year()}年`
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

/**
 * 项目第 1 天的基准日：全部任务中最早的开始日期。
 * YYYY-MM-DD 字典序即可比较，与 calcParentDates 保持一致；空项目返回空字符串。
 */
export function getProjectStartDate(tasks: { startDate: string }[]): string {
  if (tasks.length === 0) return ''
  let earliest = ''
  for (const task of tasks) {
    if (!task.startDate) continue
    if (!earliest || task.startDate < earliest) earliest = task.startDate
  }
  return earliest
}

/**
 * 相对项目基准日的项目天数：基准日当天为第 1 天，按自然日、含首尾计数。
 * 基准日前返回 0 或负数；缺少基准日、日期为空或非法时安全返回 0。
 */
export function getProjectDay(date: string, projectStartDate: string): number {
  if (!date || !projectStartDate) return 0
  const start = dayjs(projectStartDate)
  const target = dayjs(date)
  if (!start.isValid() || !target.isValid()) return 0
  return target.diff(start, 'day') + 1
}

/** 项目天数显示文本：第 1 天起显示「第N天」，基准日之前显示「准备期」 */
export function formatProjectDay(date: string, projectStartDate: string): string {
  const day = getProjectDay(date, projectStartDate)
  return day >= 1 ? `第${day}天` : '准备期'
}
