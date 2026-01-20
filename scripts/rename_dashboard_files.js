const fs = require('fs');
const path = require('path');

const dashboardPath = '/home/cave/Desktop/fencepoint/components/dashboard';

const fileMap = {
  'aicoachtips.jsx': 'AICoachTips.jsx',
  'performancechart.jsx': 'PerformanceChart.jsx',
  'recentmatches.jsx': 'RecentMatches.jsx',
  'statsoverview.jsx': 'StatsOverview.jsx',
  'targetzoneanalysis.jsx': 'TargetZoneAnalysis.jsx'
};

function updateImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  Object.entries(fileMap).forEach(([oldFile, newFile]) => {
    if (oldFile !== newFile) {
      const oldImport = oldFile.replace(/\.jsx$/, '');
      const newImport = newFile.replace(/\.jsx$/, '');
      
      const importRegex = new RegExp(`(['"]\\.*[\\/])${oldImport}(['"]|\\/|\\.)`, 'g');
      content = content.replace(importRegex, `$1${newImport}$2`);
    }
  });
  
  fs.writeFileSync(filePath, content, 'utf8');
}

fs.readdirSync(dashboardPath).forEach(file => {
  const oldPath = path.join(dashboardPath, file);
  
  if (fileMap[file]) {
    const newPath = path.join(dashboardPath, fileMap[file]);
    
    if (fs.existsSync(newPath)) {
      fs.unlinkSync(newPath);
    }
    
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed ${file} to ${fileMap[file]}`);
    
    updateImports(newPath);
  }
});

console.log('File renaming and import updates complete!');
