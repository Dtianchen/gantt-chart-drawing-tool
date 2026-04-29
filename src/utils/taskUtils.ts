import { Task } from '../types'

export interface VisibleTaskItem {
  task: Task
  depth: number
  index: number
}

/**
 * 获取可见任务列表（支持展开状态和搜索过滤）
 * - 按层级展开（expandedIds 控制）
 * - 搜索时自动保留匹配的父任务路径
 */
export function getVisibleTasks(
  tasks: Task[],
  expandedIds: Set<string>,
  searchQuery?: string
): VisibleTaskItem[] {
  const query = searchQuery?.trim().toLowerCase()

  // 若存在搜索词，先找出所有匹配的任务 ID，以及它们的祖先 ID
  const matchedIds = new Set<string>()
  const ancestorIds = new Set<string>()

  if (query) {
    for (const task of tasks) {
      if (task.name.toLowerCase().includes(query)) {
        matchedIds.add(task.id)
        // 向上收集祖先
        let current: Task | undefined = task
        while (current?.parentId) {
          ancestorIds.add(current.parentId)
          current = tasks.find(t => t.id === current!.parentId)
        }
      }
    }
  }

  const visibleTasks: VisibleTaskItem[] = []

  function traverse(taskList: Task[], depth: number) {
    for (const task of taskList) {
      const hasChildren = tasks.some(t => t.parentId === task.id)

      // 搜索模式下：只显示匹配项及其路径上的父任务
      if (query) {
        const isMatchOrAncestor = matchedIds.has(task.id) || ancestorIds.has(task.id)
        if (!isMatchOrAncestor) continue
      }

      visibleTasks.push({ task, depth, index: tasks.indexOf(task) })

      const shouldExpand = query
        ? matchedIds.has(task.id) || Array.from(matchedIds).some(mid => {
            // 若该任务的后代中有匹配项，也需要展开
            const mtask = tasks.find(t => t.id === mid)
            let cur = mtask
            while (cur?.parentId) {
              if (cur.parentId === task.id) return true
              cur = tasks.find(t => t.id === cur!.parentId)
            }
            return false
          })
        : expandedIds.has(task.id)

      if (hasChildren && shouldExpand) {
        const children = tasks.filter(t => t.parentId === task.id)
        traverse(children, depth + 1)
      }
    }
  }

  const topLevelTasks = tasks.filter(t => !t.parentId)
  traverse(topLevelTasks, 0)

  return visibleTasks
}

/** 获取某任务的所有祖先 ID（从直接父到根） */
export function getAncestorIds(taskId: string, tasks: Task[]): string[] {
  const ancestors: string[] = []
  let current = tasks.find(t => t.id === taskId)
  while (current?.parentId) {
    ancestors.push(current.parentId)
    current = tasks.find(t => t.id === current!.parentId)
  }
  return ancestors
}
