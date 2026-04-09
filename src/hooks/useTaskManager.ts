import { useCallback } from 'react'
import { Task, TaskColor } from '../types'
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
      setProject(prev => ({
        ...prev,
        tasks: [...prev.tasks, newTask],
      }))
    }
  }, [setProject])

  const updateTask = useCallback((id: string, data: Partial<Task>) => {
    setProject(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === id
          ? {
              ...task,
              ...data,
              duration: data.startDate && data.endDate
                ? getDaysBetween(data.startDate, data.endDate)
                : task.duration,
            }
          : task
      ),
    }))
  }, [setProject])

  const deleteTask = useCallback((id: string) => {
    setProject(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== id),
    }))
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
    setProject(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === id
          ? { ...task, startDate: newStartDate, endDate: newEndDate, duration: getDaysBetween(newStartDate, newEndDate) }
          : task
      ),
    }))
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
