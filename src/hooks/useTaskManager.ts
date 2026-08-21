import { useCallback, useRef, useState } from 'react'
import { Task, TaskColor, Project, HistorySnapshot, calcParentDates, taskAllChildren } from '../types'
import { useLocalStorage } from './useLocalStorage'
import { TEMPLATES, systemIntegrationTemplate, createProjectFromTemplate } from '../data/templates'
import { addDays, getDaysBetween } from '../utils/dateUtils'

const MAX_SNAPSHOTS = 100

let taskCounter = 100

// 生成与模板 id 相同风格的短 id（如 task-101），不带时间戳
// 传入现有任务列表，自动取已有 task-N 序号的最大值，避免与导入/模板数据冲突
function generateId(tasks: Task[]): string {
  let maxNum = taskCounter
  for (const t of tasks) {
    const m = /^task-(\d+)$/.exec(t.id)
    if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10))
  }
  taskCounter = maxNum
  return `task-${++taskCounter}`
}

const MAX_HISTORY = 50

// 默认项目：系统集成模板（时间自动对齐到当前时间的前两天）
const DEFAULT_PROJECT = createProjectFromTemplate(systemIntegrationTemplate)

// 迁移：清除旧版 180 天软件开发模拟数据（task-1..task-62），避免历史遗留数据覆盖新的默认值
const LEGACY_PROJECT_KEY = 'gantt_project'
function migrateLegacyMockData() {
  try {
    const raw = window.localStorage.getItem(LEGACY_PROJECT_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    const isLegacyMock =
      parsed &&
      parsed.name === '软件开发项目' &&
      Array.isArray(parsed.tasks) &&
      parsed.tasks.length >= 60 &&
      parsed.tasks.every((t: any) => /^(task|milestone)-\d+$/.test(String(t.id)))
    if (isLegacyMock) {
      window.localStorage.removeItem(LEGACY_PROJECT_KEY)
    }
  } catch {
    // 忽略解析错误
  }
}
migrateLegacyMockData()

export function useTaskManager() {
  const [project, setProject] = useLocalStorage('project', DEFAULT_PROJECT)
  const [historyVersion, setHistoryVersion] = useState(0)
  const [snapshots, setSnapshots] = useLocalStorage<HistorySnapshot[]>('history_snapshots', [])

  // 撤销/重做历史栈
  const historyRef = useRef<Project[]>([project])
  const historyIndexRef = useRef<number>(0)

  // 添加快照
  const addSnapshot = useCallback((description: string) => {
    const snapshot: HistorySnapshot = {
      id: `snapshot-${Date.now()}`,
      timestamp: Date.now(),
      description,
      project: JSON.parse(JSON.stringify(project)),
    }

    setSnapshots(prev => {
      const updated = [...prev, snapshot]
      if (updated.length > MAX_SNAPSHOTS) {
        return updated.slice(-MAX_SNAPSHOTS)
      }
      return updated
    })
  }, [project, setSnapshots])

  // 从快照恢复
  const restoreFromSnapshot = useCallback((snapshotId: string) => {
    const snapshot = snapshots.find(s => s.id === snapshotId)
    if (snapshot) {
      const next = JSON.parse(JSON.stringify(snapshot.project))
      wrappedSetProject(next)
    }
  }, [snapshots])

  // 删除快照
  const deleteSnapshot = useCallback((snapshotId: string) => {
    setSnapshots(prev => prev.filter(s => s.id !== snapshotId))
  }, [setSnapshots])

  const syncVersion = useCallback(() => {
    setHistoryVersion(v => v + 1)
  }, [])

  const pushHistory = useCallback((nextProject: Project) => {
    const idx = historyIndexRef.current

    // 若当前不在栈顶，截断后面的历史
    if (idx < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, idx + 1)
    }

    historyRef.current.push(nextProject)
    historyIndexRef.current = historyRef.current.length - 1

    // 超出限制时移除最旧的
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift()
      historyIndexRef.current = historyRef.current.length - 1
    }

    syncVersion()
  }, [syncVersion])

  const wrappedSetProject = useCallback((updater: Project | ((prev: Project) => Project)) => {
    setProject(prev => {
      const next = typeof updater === 'function' ? (updater as (p: Project) => Project)(prev) : updater
      pushHistory(next)
      return next
    })
  }, [setProject, pushHistory])

  const addTask = useCallback((taskData?: Omit<Task, 'id'>, insertAfterId?: string) => {
    if (taskData) {
      wrappedSetProject(prev => {
        const newTask: Task = {
          id: generateId(prev.tasks),
          ...taskData,
        }
        let tasksWithNew: Task[]
        
        if (insertAfterId) {
          // 插入任务：找到指定任务的位置，在其后插入
          const insertIndex = prev.tasks.findIndex(t => t.id === insertAfterId)
          if (insertIndex >= 0) {
            tasksWithNew = [...prev.tasks]
            tasksWithNew.splice(insertIndex + 1, 0, newTask)
          } else {
            // 如果找不到指定任务，添加到末尾
            tasksWithNew = [...prev.tasks, newTask]
          }
        } else {
          // 普通添加：添加到末尾
          tasksWithNew = [...prev.tasks, newTask]
        }
        
        return {
          ...prev,
          tasks: calcParentDates(tasksWithNew),
        }
      })
      addSnapshot(`添加任务: ${taskData.name || '新任务'}`)
    }
  }, [wrappedSetProject, addSnapshot])

  const updateTask = useCallback((id: string, data: Partial<Task>) => {
    const taskName = project.tasks.find(t => t.id === id)?.name || '任务'
    wrappedSetProject(prev => {
      const tasksAfterUpdate = prev.tasks.map(task =>
        task.id === id
          ? {
              ...task,
              ...data,
              duration: data.startDate && data.endDate
                ? getDaysBetween(data.startDate, data.endDate)
                : task.duration,
            }
          : task
      )
      return {
        ...prev,
        tasks: calcParentDates(tasksAfterUpdate),
      }
    })
    addSnapshot(`修改任务: ${taskName}`)
  }, [wrappedSetProject, project.tasks, addSnapshot])

  const deleteTask = useCallback((id: string) => {
    const taskName = project.tasks.find(t => t.id === id)?.name || '任务'
    const childCount = taskAllChildren(id, project.tasks).length
    wrappedSetProject(prev => {
      // 收集要删除的 ID（包括子孙）
      const idsToRemove = new Set([id, ...taskAllChildren(id, prev.tasks)])
      const tasksAfterDelete = prev.tasks
        .filter(task => !idsToRemove.has(task.id))
        .map(task => ({
          ...task,
          predecessors: task.predecessors?.filter(pid => !idsToRemove.has(pid)),
        }))
      return {
        ...prev,
        tasks: calcParentDates(tasksAfterDelete),
      }
    })
    addSnapshot(`删除任务: ${taskName}${childCount > 0 ? ` (含${childCount}个子任务)` : ''}`)
  }, [wrappedSetProject, project.tasks, addSnapshot])

  const reorderTasks = useCallback((oldIndex: number, newIndex: number) => {
    wrappedSetProject(prev => {
      const tasks = [...prev.tasks]
      const [removed] = tasks.splice(oldIndex, 1)
      tasks.splice(newIndex, 0, removed)
      return { ...prev, tasks }
    })
  }, [wrappedSetProject])

  const resizeTask = useCallback((id: string, newStartDate: string, newEndDate: string) => {
    const taskName = project.tasks.find(t => t.id === id)?.name || '任务'
    wrappedSetProject(prev => {
      const tasksAfterResize = prev.tasks.map(task =>
        task.id === id
          ? { ...task, startDate: newStartDate, endDate: newEndDate, duration: getDaysBetween(newStartDate, newEndDate) }
          : task
      )
      return {
        ...prev,
        tasks: calcParentDates(tasksAfterResize),
      }
    })
    addSnapshot(`调整任务日期: ${taskName}`)
  }, [wrappedSetProject, project.tasks, addSnapshot])

  const updateProjectName = useCallback((name: string) => {
    wrappedSetProject(prev => ({ ...prev, name }))
    addSnapshot(`修改项目名称: ${name}`)
  }, [wrappedSetProject, addSnapshot])

  const loadTemplate = useCallback((templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId)
    if (template) {
      // 清除旧数据，加载新模板（时间自动偏移到当前时间的前两天）
      window.localStorage.removeItem('gantt_project')

      const next = createProjectFromTemplate(template)
      setProject(next)
      historyRef.current = [next]
      historyIndexRef.current = 0
      syncVersion()
      addSnapshot(`加载模板: ${template.name}`)
    }
  }, [setProject, syncVersion, addSnapshot])

  // ── 撤销 / 重做 ────────────────────────────────────────────

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1
      const prev = historyRef.current[historyIndexRef.current]
      setProject(prev)
      syncVersion()
    }
  }, [setProject, syncVersion])

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1
      const next = historyRef.current[historyIndexRef.current]
      setProject(next)
      syncVersion()
    }
  }, [setProject, syncVersion])

  const canUndo = historyIndexRef.current > 0
  const canRedo = historyIndexRef.current < historyRef.current.length - 1

  // ── JSON 导入 / 导出 ───────────────────────────────────────

  const exportProject = useCallback(() => {
    const dataStr = JSON.stringify(project, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    // 文件名：项目名_日期_时分秒，避免同一天多次导出同名覆盖
    const d = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const datePart = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
    const timePart = `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
    a.download = `${project.name || '项目'}_${datePart}_${timePart}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [project])

  const importProject = useCallback((jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString)
      if (!parsed.name || !Array.isArray(parsed.tasks)) {
        return false
      }
      const next: Project = {
        name: String(parsed.name),
        tasks: parsed.tasks.map((t: any) => ({
          id: String(t.id),
          name: String(t.name),
          duration: Number(t.duration) || 1,
          startDate: String(t.startDate),
          endDate: String(t.endDate),
          color: String(t.color) || 'blue',
          parentId: t.parentId ? String(t.parentId) : undefined,
          progress: t.progress !== undefined ? Number(t.progress) : undefined,
          predecessors: Array.isArray(t.predecessors)
            ? t.predecessors.map((p: any) => String(p))
            : undefined,
        })),
      }
      wrappedSetProject(next)
      addSnapshot(`导入项目: ${next.name}`)
      return true
    } catch {
      return false
    }
  }, [wrappedSetProject, addSnapshot])

  return {
    projectName: project.name,
    tasks: project.tasks,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    resizeTask,
    updateProjectName,
    loadTemplate,
    undo,
    redo,
    canUndo,
    canRedo,
    exportProject,
    importProject,
    snapshots,
    restoreFromSnapshot,
    deleteSnapshot,
  }
}
