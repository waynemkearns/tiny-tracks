import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create reports directory if it doesn't exist
const reportDir = path.join(__dirname, '../lighthouse-reports');
if (!fs.existsSync(reportDir)){
  fs.mkdirSync(reportDir, { recursive: true });
}

// Format date for filename
const date = new Date();
const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}-${String(date.getMinutes()).padStart(2, '0')}`;

// Define pages to test
const pages = [
  {
    name: 'home',
    url: 'http://localhost:3000/'
  },
  {
    name: 'pregnancy',
    url: 'http://localhost:3000/pregnancy'
  },
  {
    name: 'pregnancy-health',
    url: 'http://localhost:3000/pregnancy/health'
  }
];

// Run Lighthouse audits
async function runAudits() {
  console.log('Starting Lighthouse audits...');
  
  for (const page of pages) {
    console.log(`Running audit for ${page.name}...`);
    
    const outputPath = path.join(reportDir, `${page.name}-${dateString}`);
    
    // Run desktop audit
    await runLighthouse(page.url, `${outputPath}-desktop.html`, '--preset=desktop');
    
    // Run mobile audit
    await runLighthouse(page.url, `${outputPath}-mobile.html`, '--preset=mobile');
  }
  
  console.log('Lighthouse audits complete! Reports saved in ./lighthouse-reports/');
}

function runLighthouse(url, outputPath, additionalFlags) {
  return new Promise((resolve, reject) => {
    const cmd = `lighthouse ${url} --output=html --output-path="${outputPath}" --chrome-flags="--headless" ${additionalFlags}`;
    
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error running Lighthouse: ${error}`);
        reject(error);
        return;
      }
      
      console.log(`Report generated at: ${outputPath}`);
      resolve();
    });
  });
}

// Check if development server is running
function checkServerRunning() {
  return new Promise((resolve, reject) => {
    exec('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000', (error, stdout, stderr) => {
      if (error || stdout !== '200') {
        console.error('Development server is not running. Please start it with "npm run dev" first.');
        reject();
        return;
      }
      
      resolve();
    });
  });
}

// Execute
checkServerRunning()
  .then(runAudits)
  .catch(err => {
    if (err) console.error(err);
    process.exit(1);
  });
