import React, { useRef, useCallback, useState } from 'react'
import GanttChart from './components/GanttChart'
import ProjectHeader from './components/ProjectHeader'
import Toolbar from './components/Toolbar'
import TaskTable from './components/TaskTable'
import GanttTimeline from './components/GanttTimeline'
import TaskEditModal from './components/TaskEditModal'
import TaskAddModal from './components/TaskAddModal'
import HelpModal from './components/HelpModal'
import { useTaskManager } from './hooks/useTaskManager'
import { addDays } from './utils/dateUtils'
import dayjs from 'dayjs'
import { Task, TimeScale } from './types'

const DAY_WIDTH_WEEK = 28
const DAY_WIDTH_MONTH = 12

export default function App() {
  const exportRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState<TimeScale>('week')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [addingTask, setAddingTask] = useState<boolean>(false)
  const [showTodayLine, setShowTodayLine] = useState<boolean>(true)
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false)

  const {
    projectName,
    tasks,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    resizeTask,
    updateProjectName,
  } = useTaskManager()

  const dayWidth = scale === 'week' ? DAY_WIDTH_WEEK : DAY_WIDTH_MONTH
  const totalDays = tasks.length > 0 ? getTotalDuration(tasks) : 0

  // 计算新任务默认开始时间：上一个任务的结束时间 + 1天
  const defaultTaskStartDate: string | undefined = React.useMemo(() => {
    if (tasks.length === 0) return undefined
    const sortedByEnd = [...tasks].sort((a, b) =>
      dayjs(b.endDate).valueOf() - dayjs(a.endDate).valueOf()
    )
    return addDays(sortedByEnd[0].endDate, 1)
  }, [tasks])

  // 计算项目起止时间（所有任务的最早开始和最晚结束）
  const projectDateRange = React.useMemo(() => {
    if (tasks.length === 0) return { startDate: '', endDate: '' }
    const sortedByStart = [...tasks].sort((a, b) =>
      dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf()
    )
    const sortedByEnd = [...tasks].sort((a, b) =>
      dayjs(b.endDate).valueOf() - dayjs(a.endDate).valueOf()
    )
    return {
      startDate: sortedByStart[0]?.startDate || '',
      endDate: sortedByEnd[0]?.endDate || '',
    }
  }, [tasks])

  function getTotalDuration(tasks: { startDate: string; endDate: string }[]): number {
    if (tasks.length === 0) return 0
    const sortedByStart = [...tasks].sort((a, b) =>
      dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf()
    )
    const sortedByEnd = [...tasks].sort((a, b) =>
      dayjs(b.endDate).valueOf() - dayjs(a.endDate).valueOf()
    )
    const minStart = sortedByStart[0].startDate
    const maxEnd = sortedByEnd[0].endDate
    return dayjs(maxEnd).diff(dayjs(minStart), 'day') + 1
  }

  const toggleScale = useCallback(() => {
    setScale(prev => (prev === 'week' ? 'month' : 'week'))
  }, [])

  const toggleTodayLine = useCallback(() => {
    setShowTodayLine(prev => !prev)
  }, [])

  const handleShowHelp = useCallback(() => {
    setShowHelpModal(true)
  }, [])

  const handleAddTaskClick = useCallback(() => {
    setAddingTask(true)
  }, [])

  const handleCloseAddTaskModal = useCallback(() => {
    setAddingTask(false)
  }, [])

  const handleSaveNewTask = useCallback((taskData: Omit<Task, 'id'>) => {
    addTask(taskData)
    setAddingTask(false)
  }, [addTask])

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task)
  }, [])

  const handleCloseModal = useCallback(() => {
    setEditingTask(null)
  }, [])

  return (
    <div className="h-dvh flex flex-col bg-white">
      {/* 顶部标题 */}
      <div className="shrink-0 text-center py-2.5 px-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
        <h1 className="text-base font-bold text-slate-800 tracking-wide">进度计划甘特图绘制工具</h1>
      </div>

      {/* 头部 */}
      <ProjectHeader
        projectName={projectName}
        onNameChange={updateProjectName}
        totalDays={totalDays}
        projectStartDate={projectDateRange.startDate}
        projectEndDate={projectDateRange.endDate}
        toolbar={
          <Toolbar
            onAddTask={handleAddTaskClick}
            onToggleScale={toggleScale}
            onToggleTodayLine={toggleTodayLine}
            onShowHelp={handleShowHelp}
            scale={scale}
            showTodayLine={showTodayLine}
            exportRef={exportRef}
            projectName={projectName}
            projectStartDate={projectDateRange.startDate}
            projectEndDate={projectDateRange.endDate}
            totalDays={totalDays}
          />
        }
      />

      {/* 主区域 */}
      <GanttChart exportRef={exportRef}>
        <TaskTable
          tasks={tasks}
          scale={scale}
          onDelete={deleteTask}
          onReorder={reorderTasks}
          onEditTask={handleEditTask}
        />
        <GanttTimeline
          tasks={tasks}
          scale={scale}
          dayWidth={dayWidth}
          showTodayLine={showTodayLine}
          onUpdateTask={updateTask}
          onResizeTask={resizeTask}
          onEditTask={handleEditTask}
        />
      </GanttChart>

      {/* 编辑弹窗 */}
      <TaskEditModal
        task={editingTask}
        isOpen={!!editingTask}
        onClose={handleCloseModal}
        onSave={updateTask}
        onDelete={deleteTask}
      />

      {/* 添加任务弹窗 */}
      <TaskAddModal
        isOpen={addingTask}
        onClose={handleCloseAddTaskModal}
        onSave={handleSaveNewTask}
        defaultStartDate={defaultTaskStartDate}
      />

      {/* 帮助弹窗 */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </div>
  )
}
