import { Pencil } from 'lucide-react'

interface ProjectHeaderProps {
  projectName: string
  onNameChange: (name: string) => void
  totalDays: number
  projectStartDate: string
  projectEndDate: string
  toolbar?: React.ReactNode
}

export default function ProjectHeader({
  projectName,
  onNameChange,
  totalDays,
  projectStartDate,
  projectEndDate,
  toolbar,
}: ProjectHeaderProps) {
  return (
    <div className="bg-white px-4 md:px-6 shadow-sm shrink-0 border-b border-slate-200">
      {/* 第一行：工具栏 */}
      <div className="h-11 flex items-center justify-end">
        {toolbar && toolbar}
      </div>

      {/* 第二行：项目名称 + 开始时间 + 结束时间 + 计划工期 */}
      <div className="h-9 flex items-center gap-2 px-[26px] md:px-[34px] border-t border-slate-200 text-xs">
        <div className="flex items-center gap-1 shrink-0">
          <Pencil size={12} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={projectName}
            onChange={(e) => onNameChange(e.target.value)}
            className="bg-transparent text-gray-800 font-semibold outline-none border-b border-transparent hover:border-gray-300 focus:border-blue-400 transition-colors min-w-[40px]"
            style={{ width: Math.max(projectName.length * 12 + 6, 40) + 'px' }}
            placeholder="项目名称"
          />
        </div>

        {projectStartDate && projectEndDate ? (
          <>
            <span className="text-gray-500 shrink-0 whitespace-nowrap">
              开始时间：<span className="text-gray-700">{projectStartDate}</span>
            </span>
            <span className="text-gray-500 shrink-0 whitespace-nowrap">
              结束时间：<span className="text-gray-700">{projectEndDate}</span>
            </span>
            <span className="text-gray-600 shrink-0 whitespace-nowrap py-1.5">
              计划工期：<span className="text-amber-600 font-semibold">{totalDays}</span>
              <span className="ml-0.5">天</span>
            </span>
          </>
        ) : (
          <span className="text-gray-400">暂无任务数据</span>
        )}
      </div>
    </div>
  )
}
