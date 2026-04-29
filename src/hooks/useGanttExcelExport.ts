import * as XLSX from 'xlsx'
import { useCallback } from 'react'
import { Task, TASK_COLOR_MAP, calcTaskNumber } from '../types'

interface HeaderInfo {
  projectName: string
  startDate: string
  endDate: string
  totalDays: number
}

const COLOR_LABELS: Record<string, string> = {
  red: '红色',
  blue: '蓝色',
  green: '绿色',
  orange: '橙色',
  purple: '紫色',
}

export function useGanttExcelExport() {
  const exportGanttAsExcel = useCallback((
    tasks: Task[],
    headerInfo: HeaderInfo,
    filename: string = 'project-plan.xlsx'
  ) => {
    // ── 1. 项目信息区（前4行）──────────────────────────────
    const infoRows = [
      [`项目名称：${headerInfo.projectName}`, '', '', '', '', ''],
      [`开始时间：${headerInfo.startDate}`, '', '', '', '', ''],
      [`结束时间：${headerInfo.endDate}`, '', '', '', '', ''],
      [`计划工期：${headerInfo.totalDays} 天`, '', '', '', '', ''],
      [], // 空行作为分隔
    ]

    // ── 2. 列标题行 ────────────────────────────────────────
    const headerRow = [
      { v: '序号', t: 's' },
      { v: '任务名称', t: 's' },
      { v: '开始日期', t: 's' },
      { v: '结束日期', t: 's' },
      { v: '工期(天)', t: 's' },
      { v: '颜色', t: 's' },
      { v: '前置任务', t: 's' },
    ]

    // ── 3. 按层级编号排序任务 ───────────────────────────────
    const sortedTasks = [...tasks].sort((a, b) => {
      const numA = calcTaskNumber(a.id, tasks)
      const numB = calcTaskNumber(b.id, tasks)
      const partsA = numA.split('.').map(Number)
      const partsB = numB.split('.').map(Number)
      const len = Math.max(partsA.length, partsB.length)
      for (let i = 0; i < len; i++) {
        const pa = partsA[i] ?? 0
        const pb = partsB[i] ?? 0
        if (pa !== pb) return pa - pb
      }
      return 0
    })

    // ── 4. 任务数据行 ────────────────────────────────────────
    const taskRows = sortedTasks.map((task) => {
      const colorHex = TASK_COLOR_MAP[task.color] || '#64748B'
      const colorLabel = COLOR_LABELS[task.color] || task.color
      const taskNum = calcTaskNumber(task.id, tasks)
      const predNames = (task.predecessors || [])
        .map(pid => {
          const pt = tasks.find(t => t.id === pid)
          return pt ? `${calcTaskNumber(pt.id, tasks)} ${pt.name}` : pid
        })
        .join('、')
      return [
        { v: taskNum, t: 's' },
        { v: task.name, t: 's' },
        { v: task.startDate, t: 's' },
        { v: task.endDate, t: 's' },
        { v: task.duration, t: 'n' },
        { v: colorLabel, t: 's', color: colorHex },
        { v: predNames, t: 's' },
      ]
    })

    // ── 4. 合并构建完整数据 ─────────────────────────────────
    const allData = [...infoRows, headerRow, ...taskRows]

    // ── 5. 创建工作表 ────────────────────────────────────────
    const ws = XLSX.utils.aoa_to_sheet(allData)

    // 设置列宽
    ws['!cols'] = [
      { wch: 6 },   // A: 序号
      { wch: 30 },  // B: 任务名称
      { wch: 14 },  // C: 开始日期
      { wch: 14 },  // D: 结束日期
      { wch: 10 },  // E: 工期
      { wch: 10 },  // F: 颜色
      { wch: 30 },  // G: 前置任务
    ]

    // ── 6. 设置标题行样式 ───────────────────────────────────
    // 项目信息区 4 行加粗
    for (let r = 0; r < 4; r++) {
      const addr = `A${r + 1}`
      if (!ws[addr]) continue
      ws[addr].s = { font: { bold: true, sz: 12, color: { rgb: '1E293B' } } }
      ws['!merges'] = ws['!merges'] || []
    }

    // 合并信息区（A1:G1 ~ A4:G4）
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 6 } },
    ]

    // 列标题行（第6行）样式
    const headerRowIdx = 5
    for (let c = 0; c < 7; c++) {
      const addr = XLSX.utils.encode_cell({ r: headerRowIdx, c })
      if (!ws[addr]) continue
      ws[addr].s = {
        font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '5B8DEF' }, patternType: 'solid' },
        alignment: { horizontal: 'center', vertical: 'center' },
      }
    }

    // 任务数据行样式
    for (let i = 0; i < taskRows.length; i++) {
      const rowIdx = headerRowIdx + 1 + i
      const task = sortedTasks[i]
      const colorHex = TASK_COLOR_MAP[task.color] || '#64748b'

      for (let c = 0; c < 7; c++) {
        const addr = XLSX.utils.encode_cell({ r: rowIdx, c })
        if (!ws[addr]) continue

        const isColorCol = c === 5
        ws[addr].s = {
          alignment: {
            horizontal: c === 1 || c === 6 ? 'left' : 'center',
            vertical: 'center',
          },
          font: { sz: 11, color: { rgb: isColorCol ? colorHex : '374151' } },
          ...(isColorCol ? {
            fill: { fgColor: { rgb: colorHex + '33' }, patternType: 'solid' },
          } : {}),
        }
      }
    }

    // ── 7. 创建工作簿并写入 ─────────────────────────────────
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '项目计划')

    // 直接触发下载
    XLSX.writeFile(wb, filename)
  }, [])

  return { exportGanttAsExcel }
}
