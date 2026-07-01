exports.default = async function(context) {
  const { appOutDir, artifactPaths } = context;
  const path = require('path');
  const fs = require('fs');
  
  console.log('=== afterAllArtifactBuild hook ===');
  console.log('appOutDir:', appOutDir);
  console.log('artifactPaths:', artifactPaths);
  
  const iconPath = path.join(__dirname, '..', 'build', 'icon.ico');
  
  if (!fs.existsSync(iconPath)) {
    console.error('ERROR: Icon file not found:', iconPath);
    return;
  }
  
  try {
    const { rcedit } = require('rcedit');
    
    for (const artifact of artifactPaths) {
      if (artifact.endsWith('.exe')) {
        console.log('Processing:', artifact);
        
        const beforeSize = fs.statSync(artifact).size;
        console.log('  Before:', beforeSize);
        
        await rcedit(artifact, { 'set-icon': iconPath });
        
        const afterSize = fs.statSync(artifact).size;
        console.log('  After:', afterSize);
        console.log('  Size changed:', afterSize !== beforeSize);
      }
    }
    
    console.log('✓ All artifacts processed');
    
  } catch (error) {
    console.error('ERROR:', error.message);
  }
};
