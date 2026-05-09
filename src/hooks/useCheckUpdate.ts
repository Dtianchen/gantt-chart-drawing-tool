import { useState, useCallback } from 'react'

export interface UpdateInfo {
  hasUpdate: boolean
  latestVersion: string
  currentVersion: string
  releaseNotes: string
  source: 'gitee' | 'github'
}

export interface CheckUpdateResult {
  giteeUpdate: UpdateInfo | null
  githubUpdate: UpdateInfo | null
  isChecking: boolean
  checkGiteeUpdate: () => void
  checkGithubUpdate: () => void
  checkAllUpdates: () => void
}

export function useCheckUpdate(currentVersion: string): CheckUpdateResult {
  const [giteeUpdate, setGiteeUpdate] = useState<UpdateInfo | null>(null)
  const [githubUpdate, setGithubUpdate] = useState<UpdateInfo | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const compareVersions = useCallback((v1: string, v2: string): number => {
    const parts1 = v1.split('.').map(Number)
    const parts2 = v2.split('.').map(Number)
    for (let i = 0; i < 3; i++) {
      if (parts1[i] > parts2[i]) return 1
      if (parts1[i] < parts2[i]) return -1
    }
    return 0
  }, [])

  const checkGiteeUpdate = useCallback(async () => {
    setIsChecking(true)
    try {
      const response = await fetch('https://gitee.com/api/v5/repos/Dtianchen/gantt-chart-drawing-tool/releases/latest')
      if (!response.ok) {
        throw new Error('Gitee API 请求失败')
      }
      const data = await response.json()
      const latestVersion = data.tag_name?.replace('v', '') || currentVersion
      const hasUpdate = compareVersions(latestVersion, currentVersion) > 0

      setGiteeUpdate({
        hasUpdate,
        latestVersion,
        currentVersion,
        releaseNotes: data.body || '',
        source: 'gitee'
      })
    } catch (error) {
      console.error('检查 Gitee 更新失败:', error)
    } finally {
      setIsChecking(false)
    }
  }, [currentVersion, compareVersions])

  const checkGithubUpdate = useCallback(async () => {
    setIsChecking(true)
    try {
      const response = await fetch('https://api.github.com/repos/Dtianchen/gantt-chart-drawing-tool/releases/latest')
      if (!response.ok) {
        throw new Error('GitHub API 请求失败')
      }
      const data = await response.json()
      const latestVersion = data.tag_name?.replace('v', '') || currentVersion
      const hasUpdate = compareVersions(latestVersion, currentVersion) > 0

      setGithubUpdate({
        hasUpdate,
        latestVersion,
        currentVersion,
        releaseNotes: data.body || '',
        source: 'github'
      })
    } catch (error) {
      console.error('检查 GitHub 更新失败:', error)
    } finally {
      setIsChecking(false)
    }
  }, [currentVersion, compareVersions])

  const checkAllUpdates = useCallback(async () => {
    setIsChecking(true)
    // 并行检查两个仓库
    await Promise.all([
      checkGiteeUpdate(),
      checkGithubUpdate()
    ])
    setIsChecking(false)
  }, [checkGiteeUpdate, checkGithubUpdate])

  return {
    giteeUpdate,
    githubUpdate,
    isChecking,
    checkGiteeUpdate,
    checkGithubUpdate,
    checkAllUpdates
  }
}
