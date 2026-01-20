const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  '/home/cave/Desktop/fencepoint/pages/dashboard.js',
  '/home/cave/Desktop/fencepoint/pages/dashboard/index.js'
];

filesToUpdate.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    content = content.replace(
      /from ['"]\.\.\/components\/dashboard\/([a-z])([a-zA-Z]+)['"]/g,
      (match, firstChar, rest) => {
        const componentName = firstChar.toUpperCase() + rest;
        return `from '../components/dashboard/${componentName}'`;
      }
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated imports in ${filePath}`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
});

console.log('Import updates complete!');
