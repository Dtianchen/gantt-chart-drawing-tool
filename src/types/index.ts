export type TaskColor = 'red' | 'blue' | 'green' | 'orange' | 'purple'

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'overdue'

export const TASK_STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  'pending': { label: '待开始', color: '#6b7280', bgColor: '#f3f4f6' },
  'in-progress': { label: '进行中', color: '#f59e0b', bgColor: '#fef3c7' },
  'completed': { label: '已完成', color: '#10b981', bgColor: '#d1fae5' },
  'overdue': { label: '已延期', color: '#ef4444', bgColor: '#fee2e2' },
}

export interface Task {
  id: string
  parentId?: string
  name: string
  duration: number
  startDate: string
  endDate: string
  color: TaskColor
  progress?: number   // 任务完成百分比（0-100），默认 100
  predecessors?: string[]  // 前置任务ID列表（依赖关系）
  status?: TaskStatus  // 任务状态
  isMilestone?: boolean  // 是否为里程碑
}

export interface Project {
  name: string
  tasks: Task[]
}

export type TimeScale = 'day' | 'custom'

export const UNIT_WIDTH = 28 // 所有视图的刻度格子统一宽度

export interface ScaleConfig {
  label: string
  daysPerUnit: number | undefined
}

export const SCALE_CONFIG: Record<TimeScale, ScaleConfig> = {
  day: { label: '日视图', daysPerUnit: 1 },
  custom: { label: '自定义', daysPerUnit: undefined }, // daysPerUnit 由运行时通过 customDays prop 注入
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
  
  // 构建父任务到子任务的映射
  const childrenMap = new Map<string, Task[]>()
  for (const task of tasks) {
    if (task.parentId) {
      if (!childrenMap.has(task.parentId)) {
        childrenMap.set(task.parentId, [])
      }
      childrenMap.get(task.parentId)!.push(task)
    }
  }

  // 使用队列进行 BFS，从叶子节点向上更新
  const updateQueue: string[] = []
  
  // 找出所有叶子节点（没有子任务的任务）的父节点
  for (const task of tasks) {
    if (task.parentId && !childrenMap.has(task.id)) {
      if (!updateQueue.includes(task.parentId)) {
        updateQueue.push(task.parentId)
      }
    }
  }

  // 处理根节点（没有父任务但有子任务的任务）
  for (const task of tasks) {
    if (!task.parentId && childrenMap.has(task.id)) {
      if (!updateQueue.includes(task.id)) {
        updateQueue.push(task.id)
      }
    }
  }

  // 按层级从低到高更新父任务日期
  const visited = new Set<string>()
  while (updateQueue.length > 0) {
    const parentId = updateQueue.shift()!
    if (visited.has(parentId)) continue
    visited.add(parentId)

    const children = childrenMap.get(parentId)
    if (!children || children.length === 0) continue

    const childDates = children.map(c => new Date(c.startDate).getTime())
    const childEndDates = children.map(c => new Date(c.endDate).getTime())
    const minStart = new Date(Math.min(...childDates)).toISOString().split('T')[0]
    const maxEnd = new Date(Math.max(...childEndDates)).toISOString().split('T')[0]
    
    const parent = taskMap.get(parentId)
    if (parent) {
      // 只有当日期发生变化时才更新
      if (parent.startDate !== minStart || parent.endDate !== maxEnd) {
        taskMap.set(parentId, { ...parent, startDate: minStart, endDate: maxEnd })
        
        // 如果父任务还有上层父任务，加入队列继续更新
        if (parent.parentId && !updateQueue.includes(parent.parentId)) {
          updateQueue.push(parent.parentId)
        }
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

/** 获取任务的实际状态（考虑日期自动判断延期） */
export function getEffectiveStatus(task: Task): TaskStatus {
  if (task.status === 'overdue') return 'overdue'
  if (task.progress === 100) return 'completed'
  if (task.status === 'in-progress') return 'in-progress'

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const startDate = new Date(task.startDate)
  const endDate = new Date(task.endDate)

  if (today < startDate) return 'pending'
  if (today > endDate && task.progress !== 100) return 'overdue'
  if (task.status === 'pending') return 'pending'
  return 'in-progress'
}
