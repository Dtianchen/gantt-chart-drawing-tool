import { toPng } from 'html-to-image'
import { useCallback } from 'react'

interface HeaderInfo {
  projectName: string
  startDate: string
  endDate: string
  totalDays: number
}

export function useGanttExport() {
  const exportGanttAsImage = useCallback(async (
    element: HTMLElement | null,
    filename: string = 'gantt-chart.png',
    headerInfo?: HeaderInfo | null
  ): Promise<void> => {
    if (!element) return

    // 1. 先从原始元素获取真实任务行数（避免克隆时滚动容器裁剪导致数量不准）
    const realTaskRows = element.querySelectorAll('.gantt-row')
    const realRowCount = realTaskRows.length || 8

    // 2. 克隆元素
    const clone = element.cloneNode(true) as HTMLElement

    // 3. 从克隆元素中找到时间轴内容，获取真实宽度
    const timelineContent = clone.querySelector('.gantt-timeline-content') as HTMLElement
    let actualWidth: number
    if (timelineContent) {
      const styleWidth = timelineContent.style.width
      actualWidth = styleWidth ? parseInt(styleWidth, 10) : 5000 + 540
    } else {
      actualWidth = 6000
    }

    // 4. 计算完整尺寸
    const headerHeight = headerInfo ? 40 : 0
    const timeScaleHeaderHeight = 46
    const fullWidth = Math.max(actualWidth + 540 + 100, element.scrollWidth)
    const fullHeight = headerHeight + timeScaleHeaderHeight + (realRowCount * 30) + 20

    // 5. 创建容器，包含头部信息行 + 甘特图内容
    const wrapper = document.createElement('div')
    wrapper.style.cssText = `
      width: ${fullWidth}px;
      height: ${fullHeight}px;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 99999;
      background: #fff;
      display: flex;
      flex-direction: column;
      overflow: visible !important;
    `

    // 6. 如果有头部信息，构建头部行
    if (headerInfo && headerInfo.startDate && headerInfo.endDate) {
      const headerRow = document.createElement('div')
      headerRow.style.cssText = `
        width: 100%;
        height: ${headerHeight}px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 34px;
        border-bottom: 1px solid #e5e7eb;
        font-size: 12px;
        flex-shrink: 0;
      `
      headerRow.innerHTML = `
        <span style="font-weight: 600; color: #1f2937; white-space: nowrap;">${escapeHtml(headerInfo.projectName)}</span>
        <span style="color: #6b7280; white-space: nowrap;">开始时间：<span style="color: #374151">${escapeHtml(headerInfo.startDate)}</span></span>
        <span style="color: #6b7280; white-space: nowrap;">结束时间：<span style="color: #374151">${escapeHtml(headerInfo.endDate)}</span></span>
        <span style="color: #4b5563; white-space: nowrap;">计划工期：<span style="color: #d97706; font-weight: 600; margin-left: 2px">${headerInfo.totalDays}</span>天</span>
      `
      wrapper.appendChild(headerRow)
    }

    // 7. 设置克隆的甘特图内容样式
    clone.style.cssText = `
      width: 100%;
      flex: 1;
      display: grid;
      grid-template-columns: 540px auto;
      overflow: visible !important;
    `

    // 8. 处理所有子元素移除限制，并展开滚动容器确保所有任务行可见
    const fixChildren = (el: HTMLElement) => {
      el.style.overflow = 'visible'
      el.style.maxWidth = 'none'
      el.style.maxHeight = 'none'
      el.style.minWidth = ''

      // 展开滚动容器（任务列表区域）
      if (el.classList.contains('gantt-scroll')) {
        el.style.overflow = 'visible'
        el.style.height = 'auto'
        el.style.maxHeight = 'none'
        el.style.flex = '0 0 auto'
      }

      Array.from(el.children).forEach(child => {
        if (child instanceof HTMLElement) {
          fixChildren(child)
        }
      })
    }
    fixChildren(clone)

    wrapper.appendChild(clone)

    // 9. 添加到body并等待渲染完成
    document.body.appendChild(wrapper)
    await new Promise(r => setTimeout(r, 300))

    try {
      console.log('导出尺寸:', { fullWidth, fullHeight, taskCount: realRowCount, hasHeader: !!headerInfo })

      // 10. 截图 - 使用 wrapper 作为目标
      const dataUrl = await toPng(wrapper, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        cacheBust: true,
        width: fullWidth,
        height: fullHeight,
      })

      // 11. 下载
      const link = document.createElement('a')
      link.download = filename
      link.href = dataUrl
      link.click()

    } catch (error) {
      console.error('导出失败:', error)
    } finally {
      // 12. 清理
      if (wrapper.parentNode === document.body) {
        document.body.removeChild(wrapper)
      }
    }
  }, [])

  return { exportGanttAsImage }
}

function escapeHtml(str: string): string {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}
