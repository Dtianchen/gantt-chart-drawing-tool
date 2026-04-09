import { toPng } from 'html-to-image'
import { useCallback } from 'react'

interface HeaderInfo {
  projectName: string
  startDate: string
  endDate: string
  totalDays: number
}

/**
 * 精准清除溢出裁剪限制（仅处理 overflow/max-height），保留所有布局属性
 */
function removeOverflowClipping(root: HTMLElement): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT)
  const els: HTMLElement[] = []
  let node: Node | null
  while ((node = walker.nextNode())) {
    els.push(node as HTMLElement)
  }
  for (const el of els) {
    // 只移除溢出裁剪，保留 height/flex/grid 等布局属性不变
    el.style.setProperty('overflow', 'visible', 'important')
    el.style.setProperty('max-height', 'none', 'important')
    el.style.setProperty('max-width', 'none', 'important')
    el.style.setProperty('clip', 'auto', 'important')
    el.style.setProperty('clip-path', 'none', 'important')
  }
}

function esc(str: string): string {
  const d = document.createElement('div')
  d.textContent = str
  return d.innerHTML
}

export function useGanttExport() {
  const exportGanttAsImage = useCallback(async (
    element: HTMLElement | null,
    filename: string = 'gantt-chart.png',
    headerInfo?: HeaderInfo | null,
    taskCount: number = 0
  ): Promise<void> => {
    if (!element) return

    // ── 1. 深度克隆 ──
    const clone = element.cloneNode(true) as HTMLElement

    // ── 2. 仅移除溢出裁剪（保留布局结构完整）──
    removeOverflowClipping(clone)

    // ── 3. 获取时间轴宽度 ──
    const origContent = element.querySelector('.gantt-timeline-content') as HTMLElement
    let actualWidth = 6000
    if (origContent) {
      const cs = getComputedStyle(origContent)
      const w = parseInt(cs.width, 10) || parseInt(origContent.style.width, 10)
      if (w > 0) actualWidth = w
    }

    // ── 4. 构建头部信息行 ──
    const headerHeight = headerInfo && headerInfo.startDate ? 40 : 0
    const headerRowEl = headerHeight > 0 ? (() => {
      const row = document.createElement('div')
      row.style.cssText = `
        width:100%;height:${headerHeight}px;display:flex;align-items:center;
        gap:8px;padding:0 34px;border-bottom:1px solid #e5e7eb;
        font-size:12px;flex-shrink:0;background:#fff;
      `
      row.innerHTML = `
        <span style="font-weight:600;color:#1f2937;white-space:nowrap">${esc(headerInfo!.projectName)}</span>
        <span style="color:#6b7280;white-space:nowrap">开始时间：<span style="color:#374151">${esc(headerInfo!.startDate)}</span></span>
        <span style="color:#6b7280;white-space:nowrap">结束时间：<span style="color:#374151">${esc(headerInfo!.endDate)}</span></span>
        <span style="color:#4b5563;white-space:nowrap">计划工期：<span style="color:#d97706;font-weight:600;margin-left:2px">${headerInfo!.totalDays}</span>天</span>
      `
      return row
    })() : null

    // ── 5. 计算容器尺寸（基于任务数 + 时间轴宽度）──
    const ROW_H = 30
    const TIME_HEADER_H = 46
    const safeCount = Math.max(taskCount, 1)
    const totalH = headerHeight + TIME_HEADER_H + (safeCount * ROW_H) + 20
    const totalW = Math.max(actualWidth + 540 + 80, element.scrollWidth + 100)

    // ── 6. 包装容器（固定精确尺寸）──
    const wrapper = document.createElement('div')
    wrapper.style.cssText = `
      position:fixed;top:0;left:0;z-index:999999;
      background:#fff;display:flex;flex-direction:column;
      width:${totalW}px;height:${totalH}px;
      overflow:hidden;
    `

    if (headerRowEl) wrapper.appendChild(headerRowEl)

    // 克隆根：保持 grid 布局，只设 overflow visible
    clone.style.cssText = `
      display:grid;grid-template-columns:540px ${actualWidth}px;
      overflow:visible;width:100%;height:auto;flex:none;
    `
    wrapper.appendChild(clone)
    document.body.appendChild(wrapper)

    // ── 7. 等待渲染 ──
    await new Promise(r => setTimeout(r, 300))

    try {
      console.log('[导出]', { 任务数: safeCount, 宽度: totalW, 高度: totalH })

      // ── 8. 截图 ──
      const dataUrl = await toPng(wrapper, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        cacheBust: true,
        width: totalW,
        height: totalH,
      })

      // ── 9. 下载 ──
      const link = document.createElement('a')
      link.download = filename
      link.href = dataUrl
      link.click()

    } catch (error) {
      console.error('导出失败:', error)
    } finally {
      if (wrapper.parentNode === document.body) {
        document.body.removeChild(wrapper)
      }
    }
  }, [])

  return { exportGanttAsImage }
}
