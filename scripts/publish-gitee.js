import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

async function createGiteeRelease() {
  const token = process.env.GITEE_TOKEN
  const owner = 'Dtianchen'
  const repo = 'gantt-chart-drawing-tool'
  const version = process.argv[2] || '1.0.0'
  const releaseNotes = process.argv[3] || '自动发布'

  if (!token) {
    console.error('请设置环境变量 GITEE_TOKEN')
    process.exit(1)
  }

  const uploadUrl = `https://gitee.com/api/v5/repos/${owner}/${repo}/releases`
  
  const body = {
    tag_name: `v${version}`,
    name: `v${version}`,
    body: releaseNotes,
    draft: false,
    prerelease: false
  }

  try {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const result = await response.json()
    console.log('Gitee Release 创建成功:', result)
    
    // 上传安装包
    const assetsPath = path.join(__dirname, '../gantt-exe')
    const files = fs.readdirSync(assetsPath)
    
    for (const file of files) {
      if (file.endsWith('.exe') || file.endsWith('.zip')) {
        await uploadAsset(result.id, path.join(assetsPath, file), file)
      }
    }
    
  } catch (error) {
    console.error('创建 Release 失败:', error)
    process.exit(1)
  }
}

async function uploadAsset(releaseId, filePath, fileName) {
  const token = process.env.GITEE_TOKEN
  const owner = 'Dtianchen'
  const repo = 'gantt-chart-drawing-tool'
  
  const uploadUrl = `https://gitee.com/api/v5/repos/${owner}/${repo}/releases/${releaseId}/assets`
  
  const fileBuffer = fs.readFileSync(filePath)
  
  try {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/octet-stream'
      },
      body: fileBuffer
    })
    
    const result = await response.json()
    console.log(`上传 ${fileName} 成功`)
  } catch (error) {
    console.error(`上传 ${fileName} 失败:`, error)
  }
}

createGiteeRelease()