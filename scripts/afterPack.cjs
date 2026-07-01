exports.default = async function(context) {
  const { appOutDir } = context;
  const path = require('path');
  const fs = require('fs');
  
  const exePath = path.join(appOutDir, 'Gantt-Tool.exe');
  const iconPath = path.join(__dirname, '..', 'build', 'icon.ico');
  const destIconPath = path.join(appOutDir, 'icon.ico');
  
  console.log('=== afterPack hook ===');
  console.log('EXE path:', exePath);
  console.log('Icon path:', iconPath);
  console.log('Dest icon path:', destIconPath);
  
  if (!fs.existsSync(exePath)) {
    console.error('ERROR: EXE file not found');
    return;
  }
  
  if (!fs.existsSync(iconPath)) {
    console.error('ERROR: Icon file not found');
    return;
  }
  
  try {
    const { rcedit } = require('rcedit');
    
    console.log('Copying icon to output directory...');
    fs.copyFileSync(iconPath, destIconPath);
    
    console.log('Setting icon on EXE...');
    await rcedit(exePath, { icon: iconPath });
    
    console.log('✓ Icon set successfully');
    console.log('EXE size:', fs.statSync(exePath).size);
    
  } catch (error) {
    console.error('ERROR:', error.message);
  }
};