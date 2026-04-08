import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Task, TaskColor, TASK_COLORS, TASK_COLOR_MAP } from '../../types'
import { addDays, getDaysBetween } from '../../utils/dateUtils'

interface TaskEditModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, data: Partial<Task>) => void
  onDelete?: (id: string) => void
}

export default function TaskEditModal({ task, isOpen, onClose, onSave, onDelete }: TaskEditModalProps) {
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [duration, setDuration] = useState<number>(1)
  const [color, setColor] = useState<TaskColor>('red')

  useEffect(() => {
    if (task) {
      setName(task.name)
      setStartDate(task.startDate)
      setEndDate(task.endDate)
      setDuration(task.duration > 0 ? task.duration : getDaysBetween(task.startDate, task.endDate))
      setColor(task.color)
    }
  }, [task])

  if (!isOpen || !task) return null

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
    if (!startDate || !endDate || !task) return
    onSave(task.id, { name, startDate, endDate, color, duration })
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
          <h3 className="text-base font-semibold text-slate-800">编辑任务</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* 表单内容 */}
        <div className="p-6 space-y-4">
          {/* 工作名称 */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">工作名称</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
            />
          </div>

          {/* 开始时间 + 持续时间 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">开始时间</label>
              <input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                className="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">持续时间（天）</label>
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
              <label className="text-xs font-medium text-slate-600">结束时间</label>
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
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50/80 border-t border-slate-200 gap-3">
          {onDelete && (
            <button
              onClick={() => { onDelete(task.id); onClose(); }}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              删除任务
            </button>
          )}
          {!onDelete && <div />}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-sm text-white bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition-colors cursor-pointer"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
