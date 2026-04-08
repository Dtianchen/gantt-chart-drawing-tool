export type TaskColor = 'red' | 'blue' | 'green' | 'orange' | 'purple'

export interface Task {
  id: string
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

export type TimeScale = 'week' | 'month'

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
