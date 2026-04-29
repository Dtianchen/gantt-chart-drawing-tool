import { useCallback, useRef, useState } from 'react'
import { Task, TaskColor, Project, calcParentDates, taskAllChildren } from '../types'
import { useLocalStorage } from './useLocalStorage'
import { mockProject } from '../data/mockData'
import { TEMPLATES } from '../data/templates'
import { addDays, getDaysBetween } from '../utils/dateUtils'

let taskCounter = 100

function generateId(): string {
  return `task-${++taskCounter}-${Date.now()}`
}

const MAX_HISTORY = 50

export function useTaskManager() {
  const [project, setProject] = useLocalStorage('project', mockProject)
  const [historyVersion, setHistoryVersion] = useState(0)

  // 撤销/重做历史栈
  const historyRef = useRef<Project[]>([project])
  const historyIndexRef = useRef<number>(0)

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

  const addTask = useCallback((taskData?: Omit<Task, 'id'>) => {
    if (taskData) {
      const newTask: Task = {
        id: generateId(),
        ...taskData,
      }
      wrappedSetProject(prev => {
        const tasksWithNew = [...prev.tasks, newTask]
        return {
          ...prev,
          tasks: calcParentDates(tasksWithNew),
        }
      })
    }
  }, [wrappedSetProject])

  const updateTask = useCallback((id: string, data: Partial<Task>) => {
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
  }, [wrappedSetProject])

  const deleteTask = useCallback((id: string) => {
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
  }, [wrappedSetProject])

  const reorderTasks = useCallback((oldIndex: number, newIndex: number) => {
    wrappedSetProject(prev => {
      const tasks = [...prev.tasks]
      const [removed] = tasks.splice(oldIndex, 1)
      tasks.splice(newIndex, 0, removed)
      return { ...prev, tasks }
    })
  }, [wrappedSetProject])

  const resizeTask = useCallback((id: string, newStartDate: string, newEndDate: string) => {
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
  }, [wrappedSetProject])

  const updateProjectName = useCallback((name: string) => {
    wrappedSetProject(prev => ({ ...prev, name }))
  }, [wrappedSetProject])

  const resetProject = useCallback(() => {
    window.localStorage.removeItem('gantt_project')
    setProject(mockProject)
    historyRef.current = [mockProject]
    historyIndexRef.current = 0
    syncVersion()
  }, [setProject, syncVersion])

  const loadTemplate = useCallback((templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId)
    if (template) {
      // 清除旧数据，加载新模板
      window.localStorage.removeItem('gantt_project')
      const next = { ...template.project }
      setProject(next)
      historyRef.current = [next]
      historyIndexRef.current = 0
      syncVersion()
    }
  }, [setProject, syncVersion])

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
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    a.download = `${project.name || '项目'}_${timestamp}.json`
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
      return true
    } catch {
      return false
    }
  }, [wrappedSetProject])

  return {
    projectName: project.name,
    tasks: project.tasks,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    resizeTask,
    updateProjectName,
    resetProject,
    loadTemplate,
    undo,
    redo,
    canUndo,
    canRedo,
    exportProject,
    importProject,
  }
}
