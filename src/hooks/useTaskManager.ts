import { useCallback } from 'react'
import { Task, TaskColor, calcParentDates, taskAllChildren } from '../types'
import { useLocalStorage } from './useLocalStorage'
import { mockProject } from '../data/mockData'
import { TEMPLATES } from '../data/templates'
import { addDays, getDaysBetween } from '../utils/dateUtils'

let taskCounter = 100

function generateId(): string {
  return `task-${++taskCounter}-${Date.now()}`
}

export function useTaskManager() {
  const [project, setProject] = useLocalStorage('project', mockProject)

  const addTask = useCallback((taskData?: Omit<Task, 'id'>) => {
    if (taskData) {
      const newTask: Task = {
        id: generateId(),
        ...taskData,
      }
      setProject(prev => {
        const tasksWithNew = [...prev.tasks, newTask]
        return {
          ...prev,
          tasks: calcParentDates(tasksWithNew),
        }
      })
    }
  }, [setProject])

  const updateTask = useCallback((id: string, data: Partial<Task>) => {
    setProject(prev => {
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
  }, [setProject])

  const deleteTask = useCallback((id: string) => {
    setProject(prev => {
      // 收集要删除的 ID（包括子孙）
      const idsToRemove = new Set([id, ...taskAllChildren(id, prev.tasks)])
      const tasksAfterDelete = prev.tasks.filter(task => !idsToRemove.has(task.id))
      return {
        ...prev,
        tasks: calcParentDates(tasksAfterDelete),
      }
    })
  }, [setProject])

  const reorderTasks = useCallback((oldIndex: number, newIndex: number) => {
    setProject(prev => {
      const tasks = [...prev.tasks]
      const [removed] = tasks.splice(oldIndex, 1)
      tasks.splice(newIndex, 0, removed)
      return { ...prev, tasks }
    })
  }, [setProject])

  const resizeTask = useCallback((id: string, newStartDate: string, newEndDate: string) => {
    setProject(prev => {
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
  }, [setProject])

  const updateProjectName = useCallback((name: string) => {
    setProject(prev => ({ ...prev, name }))
  }, [setProject])

  const resetProject = useCallback(() => {
    window.localStorage.removeItem('gantt_project')
    setProject(mockProject)
  }, [setProject])

  const loadTemplate = useCallback((templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId)
    if (template) {
      // 清除旧数据，加载新模板
      window.localStorage.removeItem('gantt_project')
      setProject({ ...template.project })
    }
  }, [setProject])

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
  }
}
