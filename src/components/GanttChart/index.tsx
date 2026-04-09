import React from 'react'

interface GanttChartProps {
  children: React.ReactNode
  exportRef: React.RefObject<HTMLDivElement>
}

export default function GanttChart({ children, exportRef }: GanttChartProps) {
  return (
    <div className="h-[calc(100dvh-56px)] flex flex-col bg-white border-t border-slate-200">
      <div ref={exportRef} className="flex-1 grid grid-cols-[460px_auto]">
        {children}
      </div>
    </div>
  )
}
