import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Task, TaskColor, TASK_COLORS, TASK_COLOR_MAP } from '../../types'
import { addDays, getDaysBetween } from '../../utils/dateUtils'
import dayjs from 'dayjs'

interface TaskAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (taskData: Omit<Task, 'id'>) => void
  defaultStartDate?: string
  parentId?: string
  allTasks?: Task[]
}

export default function TaskAddModal({ isOpen, onClose, onSave, defaultStartDate, parentId, allTasks = [] }: TaskAddModalProps) {
  const [name, setName] = useState('新任务')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [duration, setDuration] = useState<number>(5)
  const [color, setColor] = useState<TaskColor>('blue')
  const [taskParentId, setTaskParentId] = useState<string>('')

  // 设置默认日期（子任务：上一个子任务结束+1；第一个子任务用父任务开始时间；普通任务：上一个任务结束+1或明天）
  useEffect(() => {
    if (isOpen) {
      let defaultStart: string
      const parent = allTasks.find(t => t.id === parentId)
      if (parentId && parent) {
        // 子任务：查找同父任务的已有子任务，取最晚结束时间+1
        const siblings = allTasks.filter(t => t.parentId === parentId)
        if (siblings.length > 0) {
          const latestEnd = [...siblings].sort((a, b) =>
            dayjs(b.endDate).valueOf() - dayjs(a.endDate).valueOf()
          )[0].endDate
          defaultStart = addDays(latestEnd, 1)
        } else {
          defaultStart = parent.startDate
        }
      } else {
        defaultStart = defaultStartDate || addDays(new Date().toISOString().split('T')[0], 1)
      }
      const calcEnd = addDays(defaultStart, 4)

      setStartDate(defaultStart)
      setEndDate(calcEnd)
      setDuration(5)
      setName('新任务')
      setColor('blue')
      setTaskParentId(parentId || '')
    }
  }, [isOpen, defaultStartDate, parentId, allTasks])

  if (!isOpen) return null

  // 持续时间变化 → 自动更新结束时间
  function handleDurationChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value) || 0
    const newDuration = val > 0 ? val : 1
    setDuration(newDuration)
    if (startDate) {
      setEndDate(addDays(startDate, newDuration - 1))
    }
  }

  // 开始时间变化 → 自动更新结束时间（保持持续时间不变）
  function handleStartDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newStart = e.target.value
    setStartDate(newStart)
    if (newStart && duration > 0) {
      setEndDate(addDays(newStart, duration - 1))
    }
  }

  // 结束时间手动修改 → 反向计算持续时间
  function handleEndDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newEnd = e.target.value
    setEndDate(newEnd)
    if (startDate && newEnd) {
      const days = getDaysBetween(startDate, newEnd)
      setDuration(days >= 1 ? days : 1)
    }
  }

  function handleSave() {
    if (!name.trim()) {
      alert('请输入任务名称')
      return
    }
    if (!startDate || !endDate) {
      alert('请选择起止时间')
      return
    }
    if (new Date(endDate) < new Date(startDate)) {
      alert('结束时间不能早于开始时间')
      return
    }

    onSave({
      name: name.trim(),
      startDate,
      endDate,
      color,
      duration: getDaysBetween(startDate, endDate),
      ...(taskParentId ? { parentId: taskParentId } : {}),
    })
    onClose()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose()
    if (e.key === 'Enter') handleSave()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* 弹窗 */}
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-base font-semibold text-slate-800">添加新任务</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* 表单内容 */}
        <div className="p-6 space-y-4">
          {/* 工作名称 */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">
              工作名称 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
              placeholder="请输入任务名称"
              autoFocus
            />
          </div>

          {/* 开始时间 + 持续时间 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">
                开始时间 <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">
                持续时间（天）<span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={duration}
                onChange={handleDurationChange}
                min={1}
                max={999}
                className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
              />
            </div>
          </div>

          {/* 结束时间（可手动选择或自动计算） */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-medium text-slate-600">
                结束时间 <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                min={startDate || undefined}
                className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
              />
            </div>
            {startDate && endDate && (
              <div className="flex items-end justify-center text-xs text-emerald-600 font-medium pb-[9px]">
                共 {getDaysBetween(startDate, endDate)} 天
              </div>
            )}
          </div>

          {/* 父任务选择 */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">父任务</label>
            <select
              value={taskParentId}
              onChange={e => setTaskParentId(e.target.value)}
              className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all bg-white"
            >
              <option value="">无（顶级任务）</option>
              {allTasks
                .filter(t => !t.parentId)
                .map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
            </select>
          </div>

          {/* 颜色选择 */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">任务颜色</label>
            <div className="flex gap-3">
              {TASK_COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all cursor-pointer ${
                    color === c.value ? 'border-slate-800 scale-110 shadow-md' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: TASK_COLOR_MAP[c.value] }}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end px-6 py-4 bg-slate-50/80 border-t border-slate-200 gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors cursor-pointer"
          >
            创建任务
          </button>
        </div>
      </div>
    </div>
  )
}