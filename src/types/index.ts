export type TaskColor = 'red' | 'blue' | 'green' | 'orange' | 'purple'

export interface Task {
  id: string
  parentId?: string
  name: string
  duration: number
  startDate: string
  endDate: string
  color: TaskColor
}

export interface Project {
  name: string
  tasks: Task[]
}

export type TimeScale = 'day' | 'custom'

export const UNIT_WIDTH = 28 // 所有视图的刻度格子统一宽度

export interface ScaleConfig {
  label: string
  daysPerUnit: number
}

export const SCALE_CONFIG: Record<TimeScale, ScaleConfig> = {
  day: { label: '日视图', daysPerUnit: 1 },
  custom: { label: '自定义', daysPerUnit: 0 }, // daysPerUnit 由运行时注入
}

export const TASK_COLORS: { value: TaskColor; label: string; bgClass: string }[] = [
  { value: 'red', label: '红色', bgClass: 'bg-task-red' },
  { value: 'blue', label: '蓝色', bgClass: 'bg-task-blue' },
  { value: 'green', label: '绿色', bgClass: 'bg-task-green' },
  { value: 'orange', label: '橙色', bgClass: 'bg-task-orange' },
  { value: 'purple', label: '紫色', bgClass: 'bg-task-purple' },
]

export const TASK_COLOR_MAP: Record<TaskColor, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#10b981',
  orange: '#f59e0b',
  purple: '#8b5cf6',
}

// ── 父子任务工具函数 ────────────────────────────────────────

/** 计算单个任务的层级编号（如 1、1.1、1.1.1），tasks 为全部任务列表 */
export function calcTaskNumber(taskId: string, tasks: Task[]): string {
  const segments: string[] = []
  let current: Task | undefined = tasks.find(t => t.id === taskId)
  while (current) {
    const siblings = tasks.filter(t => t.parentId === current!.parentId)
    const idx = siblings.findIndex(t => t.id === current!.id) + 1
    segments.unshift(String(idx))
    current = current.parentId ? tasks.find(t => t.id === current!.parentId) : undefined
  }
  return segments.join('.')
}

/** 根据子任务自动计算并更新所有父任务的 startDate/endDate，返回新任务列表 */
export function calcParentDates(tasks: Task[]): Task[] {
  const taskMap = new Map(tasks.map(t => [t.id, { ...t }]))
  const parents = tasks.filter(t => !t.parentId)

  for (const parent of parents) {
    const children = tasks.filter(t => t.parentId === parent.id)
    if (children.length > 0) {
      const dates = children.map(c => new Date(c.startDate).getTime())
      const dateEnd = children.map(c => new Date(c.endDate).getTime())
      const minStart = new Date(Math.min(...dates)).toISOString().split('T')[0]
      const maxEnd = new Date(Math.max(...dateEnd)).toISOString().split('T')[0]
      const mapped = taskMap.get(parent.id)
      if (mapped) {
        taskMap.set(parent.id, { ...mapped, startDate: minStart, endDate: maxEnd })
      }
    }
  }

  return Array.from(taskMap.values())
}

/** 判断某任务是否有子任务 */
export function taskHasChildren(taskId: string, tasks: Task[]): boolean {
  return tasks.some(t => t.parentId === taskId)
}

/** 获取任务在扁平列表中的深度（根级=0） */
export function taskDepth(taskId: string, tasks: Task[]): number {
  let depth = 0
  let current = tasks.find(t => t.id === taskId)
  while (current?.parentId) {
    depth++
    current = tasks.find(t => t.id === current!.parentId)
  }
  return depth
}

/** 收集某个任务的所有子孙 ID */
export function taskAllChildren(taskId: string, tasks: Task[]): string[] {
  const result: string[] = []
  const stack = [taskId]
  while (stack.length > 0) {
    const id = stack.pop()!
    const children = tasks.filter(t => t.parentId === id)
    for (const c of children) {
      result.push(c.id)
      stack.push(c.id)
    }
  }
  return result
}
