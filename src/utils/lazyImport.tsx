import React, { lazy, Suspense, ComponentType, ReactNode } from 'react'

const defaultFallback: ReactNode = (
  <div className="flex items-center justify-center h-full">
    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
)

export function lazyWithFallback<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback: ReactNode = defaultFallback
) {
  const LazyComponent = lazy(importFn)
  
  return function LazyWithFallback(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

export const LazyTaskEditModal = lazyWithFallback(() => import('../components/TaskEditModal'))
export const LazyTaskAddModal = lazyWithFallback(() => import('../components/TaskAddModal'))
export const LazyHelpModal = lazyWithFallback(() => import('../components/HelpModal'))
