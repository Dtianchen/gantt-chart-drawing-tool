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
import { Task, TimeScale, SCALE_CONFIG, UNIT_WIDTH } from './types'

export default function App() {
  const exportRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState<TimeScale>('day')
  const [customDays, setCustomDays] = useState<number>(2) // 自定义视图：每格代表的天数，默认2天
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [addingTask, setAddingTask] = useState<boolean>(false)
  const [addingSubTaskOf, setAddingSubTaskOf] = useState<Task | null>(null)
  const [showTodayLine, setShowTodayLine] = useState<boolean>(true)
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false)
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set())
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const {
    projectName,
    tasks,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    resizeTask,
    updateProjectName,
    loadTemplate,
  } = useTaskManager()

  const scaleConfig = SCALE_CONFIG[scale]
  const activeDaysPerUnit = scale === 'custom' ? customDays : scaleConfig.daysPerUnit
  const effectiveDayWidth = UNIT_WIDTH / activeDaysPerUnit
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

  const handleScaleChange = useCallback((newScale: TimeScale) => {
    setScale(newScale)
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

  const handleAddSubTaskClick = useCallback((parentTask: Task) => {
    setAddingTask(true)
    setAddingSubTaskOf(parentTask)
  }, [])

  const handleCloseAddTaskModal = useCallback(() => {
    setAddingTask(false)
    setAddingSubTaskOf(null)
  }, [])

  const handleSaveNewTask = useCallback((taskData: Omit<Task, 'id'>) => {
    addTask(taskData)
    setAddingTask(false)
    setAddingSubTaskOf(null)
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
      <div className="shrink-0 mx-2 mt-2 rounded-xl bg-gradient-to-r from-[#5b8def] via-[#7c6fd6] to-[#9366c9] px-4 py-4 text-center shadow-sm">
        <h1 className="text-lg font-bold text-white tracking-wider">进度计划甘特图绘制工具</h1>
        <p className="text-xs text-white/80 mt-1 tracking-wide">让绘制甘特图变得简单</p>
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
            onScaleChange={handleScaleChange}
            onCustomDaysChange={setCustomDays}
            customDays={customDays}
            onToggleTodayLine={toggleTodayLine}
            onShowHelp={handleShowHelp}
            onLoadTemplate={loadTemplate}
            scale={scale}
            showTodayLine={showTodayLine}
            exportRef={exportRef}
            projectName={projectName}
            projectStartDate={projectDateRange.startDate}
            projectEndDate={projectDateRange.endDate}
            totalDays={totalDays}
            taskCount={tasks.length}
            tasks={tasks}
            selectedTaskId={selectedTaskId}
            onAddSubTask={handleAddSubTaskClick}
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
          onAddSubTask={handleAddSubTaskClick}
          expandedIds={expandedTaskIds}
          onToggleExpand={id => {
            setExpandedTaskIds(prev => {
              const next = new Set(prev)
              if (next.has(id)) next.delete(id)
              else next.add(id)
              return next
            })
          }}
          selectedTaskId={selectedTaskId}
          onSelectTask={t => setSelectedTaskId(t.id)}
        />
        <GanttTimeline
          tasks={tasks}
          scale={scale}
          customDays={customDays}
          dayWidth={effectiveDayWidth}
          showTodayLine={showTodayLine}
          expandedIds={expandedTaskIds}
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
        allTasks={tasks}
      />

      {/* 添加任务弹窗 */}
      <TaskAddModal
        isOpen={addingTask}
        onClose={handleCloseAddTaskModal}
        onSave={handleSaveNewTask}
        defaultStartDate={defaultTaskStartDate}
        allTasks={tasks}
        parentId={addingSubTaskOf?.id}
      />

      {/* 帮助弹窗 */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </div>
  )
}
