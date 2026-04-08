import { Project, Task } from '../types'

export const DEFAULT_PROJECT_NAME = '项目进度计划'

export const mockTasks: Task[] = [
  {
    id: 'task-0',
    name: '软件开发项目',
    duration: 180,
    startDate: '2026-04-08',
    endDate: '2026-10-04', // 4月8日 + 179天 = 10月4日
    color: 'blue',
  },
  {
    id: 'task-1',
    name: '实施前准备工作',
    duration: 10,
    startDate: '2026-04-01',
    endDate: '2026-04-10',
    color: 'red',
  },
  {
    id: 'task-2',
    name: 'HIS及相关系统接口的初步提供',
    duration: 10,
    startDate: '2026-04-11',
    endDate: '2026-04-20',
    color: 'red',
  },
  {
    id: 'task-3',
    name: '现场实施',
    duration: 5,
    startDate: '2026-04-21',
    endDate: '2026-04-25',
    color: 'red',
  },
  {
    id: 'task-4',
    name: '系统接口测试与系统联调',
    duration: 10,
    startDate: '2026-04-26',
    endDate: '2026-05-05',
    color: 'red',
  },
  {
    id: 'task-5',
    name: '试运行',
    duration: 10,
    startDate: '2026-05-06',
    endDate: '2026-05-15',
    color: 'red',
  },
  {
    id: 'task-6',
    name: '系统正式上线',
    duration: 10,
    startDate: '2026-05-16',
    endDate: '2026-05-25',
    color: 'red',
  },
  {
    id: 'task-7',
    name: '项目验收与交接',
    duration: 5,
    startDate: '2026-05-26',
    endDate: '2026-05-30',
    color: 'red',
  },
]

export const mockProject: Project = {
  name: DEFAULT_PROJECT_NAME,
  tasks: mockTasks,
}
