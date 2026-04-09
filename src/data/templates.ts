import { Project, Task } from '../types'
import dayjs from 'dayjs'

// ========== 模板类型定义 ==========
export interface Template {
  id: string
  name: string
  description: string
  duration: string
  project: Project
}

// ========== 辅助：生成从今天开始的日期 ==========
const BASE_DATE = '2026-04-09'

function offsetDays(days: number): string {
  return dayjs(BASE_DATE).add(days, 'day').format('YYYY-MM-DD')
}

// ========== 模板一：空白模板 ==========
const blankTemplate: Template = {
  id: 'blank',
  name: '空白模板',
  description: '不填充任何数据，从零开始创建项目',
  duration: '-',
  project: { name: '新建项目', tasks: [] },
}

// ========== 模板二：系统集成项目（3 个月）==========
const systemIntegrationTemplate: Template = {
  id: 'system-integration',
  name: '系统集成项目',
  description: '7 个阶段，计划工期 3 个月',
  duration: '3 个月',
  project: {
    name: '系统集成项目',
    tasks: [
      // 阶段 1：前期准备与立项（~13天）
      { id: 'si-1', name: '前期准备与立项阶段', duration: 13, startDate: offsetDays(0), endDate: offsetDays(12), color: 'purple' },

      // 阶段 2：方案设计（~18天）
      { id: 'si-2', name: '方案设计阶段', duration: 18, startDate: offsetDays(13), endDate: offsetDays(30), color: 'blue' },

      // 阶段 3：采购与到货（~21天）
      { id: 'si-3', name: '采购与到货阶段', duration: 21, startDate: offsetDays(31), endDate: offsetDays(51), color: 'orange' },

      // 阶段 4：实施部署（~26天）
      { id: 'si-4', name: '实施部署阶段', duration: 26, startDate: offsetDays(52), endDate: offsetDays(77), color: 'green' },

      // 阶段 5：测试与验证（~18天）
      { id: 'si-5', name: '测试与验证阶段', duration: 18, startDate: offsetDays(68), endDate: offsetDays(85), color: 'red' },

      // 阶段 6：上线与交付（~11天）
      { id: 'si-6', name: '上线与交付阶段', duration: 11, startDate: offsetDays(86), endDate: offsetDays(96), color: 'purple' },

      // 阶段 7：运维与售后（持续）
      { id: 'si-7', name: '运维与售后阶段', duration: 12, startDate: offsetDays(87), endDate: offsetDays(98), color: 'orange' },
    ],
  },
}

// ========== 模板三：软件开发项目（2 个月）==========
const softwareDevTemplate: Template = {
  id: 'software-dev',
  name: '软件开发项目',
  description: '8 个阶段，计划工期 2 个月',
  duration: '2 个月',
  project: {
    name: '软件开发项目',
    tasks: [
      // ---- 阶段 1：项目启动与规划（第 1-7 天）----
      { id: 'sd-1', name: '项目启动与目标对齐', duration: 3, startDate: offsetDays(0), endDate: offsetDays(2), color: 'purple' },
      { id: 'sd-2', name: '团队组建与环境搭建', duration: 4, startDate: offsetDays(3), endDate: offsetDays(6), color: 'purple' },
      { id: 'sd-3', name: '项目计划与 WBS 制定', duration: 2, startDate: offsetDays(5), endDate: offsetDays(6), color: 'purple' },

      // ---- 阶段 2：需求分析（第 6-15 天）----
      { id: 'sd-4', name: '需求调研与用户访谈', duration: 6, startDate: offsetDays(5), endDate: offsetDays(10), color: 'red' },
      { id: 'sd-5', name: '需求规格说明书编写', duration: 5, startDate: offsetDays(10), endDate: offsetDays(14), color: 'red' },
      { id: 'sd-6', name: '需求评审与确认', duration: 2, startDate: offsetDays(14), endDate: offsetDays(15), color: 'red' },

      // ---- 阶段 3：设计阶段（第 14-24 天）----
      { id: 'sd-7', name: '系统架构设计', duration: 5, startDate: offsetDays(13), endDate: offsetDays(17), color: 'blue' },
      { id: 'sd-8', name: '数据库设计与 API 设计', duration: 5, startDate: offsetDays(17), endDate: offsetDays(21), color: 'blue' },
      { id: 'sd-9', name: 'UI/UX 原型设计', duration: 4, startDate: offsetDays(19), endDate: offsetDays(22), color: 'blue' },
      { id: 'sd-10', name: '设计评审与技术方案确认', duration: 3, startDate: offsetDays(22), endDate: offsetDays(24), color: 'blue' },

      // ---- 阶段 4：开发实现（第 23-43 天）----
      { id: 'sd-11', name: '前端框架搭建与公共组件开发', duration: 6, startDate: offsetDays(22), endDate: offsetDays(27), color: 'green' },
      { id: 'sd-12', name: '后端框架搭建与基础服务开发', duration: 7, startDate: offsetDays(25), endDate: offsetDays(31), color: 'green' },
      { id: 'sd-13', name: '核心业务模块开发 A', duration: 10, startDate: offsetDays(30), endDate: offsetDays(39), color: 'green' },
      { id: 'sd-14', name: '核心业务模块开发 B', duration: 8, startDate: offsetDays(36), endDate: offsetDays(43), color: 'green' },
      { id: 'sd-15', name: '接口联调与前后端集成', duration: 5, startDate: offsetDays(41), endDate: offsetDays(45), color: 'green' },

      // ---- 阶段 5：测试阶段（第 44-54 天）----
      { id: 'sd-16', name: '单元测试编写与执行', duration: 5, startDate: offsetDays(43), endDate: offsetDays(47), color: 'orange' },
      { id: 'sd-17', name: '集成测试与端到端测试', duration: 6, startDate: offsetDays(46), endDate: offsetDays(51), color: 'orange' },
      { id: 'sd-18', name: 'Bug 修复与回归测试', duration: 5, startDate: offsetDays(50), endDate: offsetDays(54), color: 'orange' },

      // ---- 阶段 6：部署与上线（第 53-58 天）----
      { id: 'sd-19', name: '生产环境部署与配置', duration: 3, startDate: offsetDays(52), endDate: offsetDays(54), color: 'blue' },
      { id: 'sd-20', name: '数据迁移与初始化', duration: 2, startDate: offsetDays(55), endDate: offsetDays(56), color: 'blue' },
      { id: 'sd-21', name: '灰度发布与全量上线', duration: 2, startDate: offsetDays(57), endDate: offsetDays(58), color: 'blue' },

      // ---- 阶段 7：验收与交付（第 57-62 天）----
      { id: 'sd-22', name: '用户验收测试（UAT）', duration: 3, startDate: offsetDays(56), endDate: offsetDays(58), color: 'purple' },
      { id: 'sd-23', name: '用户培训与操作手册交付', duration: 3, startDate: offsetDays(59), endDate: offsetDays(61), color: 'purple' },
      { id: 'sd-24', name: '项目验收签字与交付', duration: 2, startDate: offsetDays(61), endDate: offsetDays(62), color: 'purple' },

      // ---- 阶段 8：运维与迭代（第 60-72 天）----
      { id: 'sd-25', name: '线上监控与运维支持', duration: 7, startDate: offsetDays(59), endDate: offsetDays(65), color: 'orange' },
      { id: 'sd-26', name: '首轮优化迭代', duration: 7, startDate: offsetDays(66), endDate: offsetDays(72), color: 'orange' },
    ],
  },
}

// ========== 导出 ==========
export const TEMPLATES: Template[] = [
  blankTemplate,
  systemIntegrationTemplate,
  softwareDevTemplate,
]
