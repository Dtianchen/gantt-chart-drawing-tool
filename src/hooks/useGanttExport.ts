import { toPng } from 'html-to-image'
import { useCallback } from 'react'

interface HeaderInfo {
  projectName: string
  startDate: string
  endDate: string
  totalDays: number
}

/**
 * 用 TreeWalker 遍历所有子元素，强制移除所有尺寸和溢出限制
 * 确保克隆后的 DOM 内容完整可见，不被任何容器裁剪
 */
function forceAllVisible(root: HTMLElement): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT)
  const els: HTMLElement[] = []
  let node: Node | null
  while ((node = walker.nextNode())) {
    els.push(node as HTMLElement)
  }
  for (const el of els) {
    el.style.setProperty('overflow', 'visible', 'important')
    el.style.setProperty('max-height', 'none', 'important')
    el.style.setProperty('max-width', 'none', 'important')
    // 移除固定高度约束，让内容自然展开
    if (!el.classList.contains('gantt-row') && !el.classList.contains('gantt-timeline-task')) {
      el.style.height = 'auto'
    }
    el.style.minHeight = ''
    el.style.flexShrink = '0'
    el.style.flexGrow = '0'
    el.style.flexBasis = 'auto'
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

    // ── 1. 深度克隆整个甘特图容器 ──
    const clone = element.cloneNode(true) as HTMLElement

    // ── 2. 强制所有子元素可见（关键修复）──
    forceAllVisible(clone)

    // ── 3. 获取时间轴宽度（优先从原始元素的 getComputedStyle 读取）──
    const origContent = element.querySelector('.gantt-timeline-content') as HTMLElement
    const timelineContent = clone.querySelector('.gantt-timeline-content') as HTMLElement
    let actualWidth = 6000
    if (timelineContent && origContent) {
      const cs = getComputedStyle(origContent)
      const w = parseInt(cs.width, 10) || parseInt(origContent.style.width, 10)
      if (w > 0) actualWidth = w
    }

    // ── 4. 构建头部信息行（项目名称、起止时间、工期）──
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

    // ── 5. 计算初始容器尺寸（估算值，后面会实测修正）──
    const ROW_H = 30
    const HEADER_H = 46
    const safeTaskCount = Math.max(taskCount, 1)
    const estimatedH = headerHeight + HEADER_H + (safeTaskCount * ROW_H) + 40
    const estimatedW = Math.max(actualWidth + 540 + 120, element.scrollWidth + 200)

    // ── 6. 创建包装容器并挂载到 body ──
    const wrapper = document.createElement('div')
    wrapper.style.cssText = `
      position:fixed;top:0;left:0;z-index:999999;
      background:#fff;display:flex;flex-direction:column;
      width:${estimatedW}px;height:${estimatedH}px;
      overflow:visible !important;
    `

    if (headerRowEl) wrapper.appendChild(headerRowEl)

    // 设置克隆根样式
    clone.style.cssText = `
      width:100%;display:grid;grid-template-columns:540px auto;
      overflow:visible !important;flex:none;height:auto;
    `
    wrapper.appendChild(clone)
    document.body.appendChild(wrapper)

    // ── 7. 等待渲染完成（首次）──
    await new Promise(r => setTimeout(r, 300))

    // ── 8. 实测渲染尺寸（关键修复！以实际为准而非公式估算）──
    let finalW = Math.max(wrapper.scrollWidth, wrapper.offsetWidth, estimatedW)
    let finalH = Math.max(wrapper.scrollHeight, wrapper.offsetHeight, estimatedH)

    // 如果实测大于估算 → 更新容器尺寸并再次等待
    if (finalW > estimatedW || finalH > estimatedH) {
      wrapper.style.width = finalW + 60 + 'px'
      wrapper.style.height = finalH + 60 + 'px'
      await new Promise(r => setTimeout(r, 300))
      finalW = Math.max(wrapper.scrollWidth, wrapper.offsetWidth)
      finalH = Math.max(wrapper.scrollHeight, wrapper.offsetHeight)
    }

    try {
      console.log('[导出]', { 任务数: safeTaskCount, 宽度: finalW, 高度: finalH, 时间轴宽度: actualWidth })

      // ── 9. 截图（使用实测的精确尺寸）──
      const dataUrl = await toPng(wrapper, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        cacheBust: true,
        width: finalW,
        height: finalH,
      })

      // ── 10. 触发下载 ──
      const link = document.createElement('a')
      link.download = filename
      link.href = dataUrl
      link.click()

    } catch (error) {
      console.error('导出失败:', error)
    } finally {
      // ── 11. 清理临时 DOM 节点 ──
      if (wrapper.parentNode === document.body) {
        document.body.removeChild(wrapper)
      }
    }
  }, [])

  return { exportGanttAsImage }
}
