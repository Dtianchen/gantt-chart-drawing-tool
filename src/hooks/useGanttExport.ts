import { toPng } from 'html-to-image'
import { useCallback } from 'react'

interface HeaderInfo {
  projectName: string
  startDate: string
  endDate: string
  totalDays: number
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
    taskCount: number = 0,
    beforeExport?: () => void | Promise<void>,
    afterExport?: () => void
  ): Promise<void> => {
    if (!element) return

    // 触发离屏副本挂载（GanttChart 仅在 exporting=true 时渲染），等待其完成布局
    await beforeExport?.()

    // 把离屏副本临时移入视口内（fixed + left:0/top:0），并置于底层 z-index:-1。
    // 浏览器会渲染它，因此 html-to-image 能截到真实像素；但它位于真实 UI 之后，
    // 配合全屏遮罩，用户看不到这个过渡画面。
    const saved = {
      position: element.style.position,
      left: element.style.left,
      top: element.style.top,
      zIndex: element.style.zIndex,
    }
    element.style.position = 'fixed'
    element.style.left = '0px'
    element.style.top = '0px'
    element.style.zIndex = '-1'

    const ROW_H = 30
    const TIME_HEADER_H = 50
    const safeCount = Math.max(taskCount, 1)
    const headerHeight = headerInfo && headerInfo.startDate ? 40 : 0
    const totalH = TIME_HEADER_H + (safeCount * ROW_H) + headerHeight + 150

    let headerRowEl: HTMLDivElement | null = null
    if (headerHeight > 0) {
      headerRowEl = document.createElement('div')
      headerRowEl.style.cssText = `
        width:100%;height:${headerHeight}px;display:flex;align-items:center;
        gap:8px;padding:0 34px;border-bottom:1px solid #e5e7eb;
        font-size:12px;flex-shrink:0;background:#fff;
      `
      headerRowEl.innerHTML = `
        <span style="font-weight:600;color:#1f2937;white-space:nowrap">${esc(headerInfo!.projectName)}</span>
        <span style="color:#6b7280;white-space:nowrap">开始时间：<span style="color:#374151">${esc(headerInfo!.startDate)}</span></span>
        <span style="color:#6b7280;white-space:nowrap">结束时间：<span style="color:#374151">${esc(headerInfo!.endDate)}</span></span>
        <span style="color:#4b5563;white-space:nowrap">计划工期：<span style="color:#d97706;font-weight:600;margin-left:2px">${headerInfo!.totalDays}</span>天</span>
      `
      element.prepend(headerRowEl)
    }

    // 全屏遮罩：遮住移入视口的副本，视觉风格与项目页面（蓝紫渐变 + 圆角卡片）保持一致
    const overlay = document.createElement('div')
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:2147483646;
      background:rgba(248,250,252,.82);
      backdrop-filter:blur(2px);
      display:flex;align-items:center;justify-content:center;
      pointer-events:auto;
    `
    const spinner = document.createElement('div')
    spinner.style.cssText = `
      background:linear-gradient(135deg,#3742fa,#4361ee 50%,#5b7cf6);
      color:#fff;
      padding:22px 34px;border-radius:16px;
      font-size:14px;font-weight:600;letter-spacing:.02em;
      display:flex;align-items:center;gap:14px;
      box-shadow:0 10px 40px rgba(55,66,250,.3);
    `
    spinner.innerHTML = `
      <style>@keyframes ganttExportSpin{to{transform:rotate(360deg)}}</style>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style="animation:ganttExportSpin 1s linear infinite">
        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.35)" stroke-width="4"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
      </svg>
      正在生成图片，请稍候…
    `
    overlay.appendChild(spinner)
    document.body.appendChild(overlay)

    // 等待浏览器完成离屏副本布局
    await new Promise<void>((r) => {
      requestAnimationFrame(() => requestAnimationFrame(() => r()))
    })

    const rect = element.getBoundingClientRect()
    const totalW = Math.max(1, Math.round(rect.width))
    const exportH = Math.max(1, Math.round(totalH))

    try {
      const dataUrl = await toPng(element, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        cacheBust: true,
        width: totalW,
        height: exportH,
        style: {
          transform: 'none',
          margin: '0',
          boxShadow: 'none',
        },
        filter: (node) => {
          const el = node as HTMLElement
          // 跳过阴影装饰节点，减少绘制成本
          if (el && el.style && el.style.boxShadow && el.style.boxShadow.includes('2px')) return false
          return true
        },
      })

      const link = document.createElement('a')
      link.download = filename
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('导出失败:', error)
      const errorMsg = error instanceof Error ? error.message : '未知错误'
      window.alert(`导出失败：${errorMsg}\n\n请尝试缩小视图范围后重试。`)
    } finally {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
      if (headerRowEl && element.contains(headerRowEl)) {
        element.removeChild(headerRowEl)
      }
      // 移回离屏
      element.style.position = saved.position
      element.style.left = saved.left
      element.style.top = saved.top
      element.style.zIndex = saved.zIndex
      // 卸载离屏副本，恢复平时零开销
      afterExport?.()
    }
  }, [])

  return { exportGanttAsImage }
}
