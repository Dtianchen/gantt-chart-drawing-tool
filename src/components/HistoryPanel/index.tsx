import { useState } from 'react'
import { Clock, Trash2, RotateCcw, X } from 'lucide-react'
import dayjs from 'dayjs'
import { HistorySnapshot } from '../../types'

interface HistoryPanelProps {
  snapshots: HistorySnapshot[]
  onRestore: (id: string) => void
  onDelete: (id: string) => void
}

export default function HistoryPanel({ snapshots, onRestore, onDelete }: HistoryPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
        title="历史记录"
      >
        <Clock size={16} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={() => setIsOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          
          <div 
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* 标题栏 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Clock size={16} className="text-blue-500" />
                历史记录
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg"
              >
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            {/* 列表 */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {snapshots.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Clock size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">暂无历史记录</p>
                </div>
              ) : (
                snapshots.map(snapshot => (
                  <div 
                    key={snapshot.id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {snapshot.description}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {dayjs(snapshot.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => { onRestore(snapshot.id); setIsOpen(false) }}
                          className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                          title="恢复"
                        >
                          <RotateCcw size={14} />
                        </button>
                        <button
                          onClick={() => onDelete(snapshot.id)}
                          className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                          title="删除"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 底部 */}
            <div className="px-4 py-3 border-t border-slate-200">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium text-sm"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}