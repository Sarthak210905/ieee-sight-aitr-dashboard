// Pre-Deployment Verification Script
// Run this before deploying to catch any issues
// Usage: node verify-deployment.js

const fs = require('fs');
const path = require('path');

console.log('🔍 IEEE SIGHT AITR Dashboard - Pre-Deployment Verification\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

let errors = 0;
let warnings = 0;
let checks = 0;

function success(message) {
  console.log(`✅ ${message}`);
  checks++;
}

function error(message) {
  console.log(`❌ ${message}`);
  errors++;
}

function warning(message) {
  console.log(`⚠️  ${message}`);
  warnings++;
}

function info(message) {
  console.log(`ℹ️  ${message}`);
}

console.log('📋 Checking File Structure...\n');

// Check critical files exist
const criticalFiles = [
  'package.json',
  'next.config.js',
  'tsconfig.json',
  'tailwind.config.ts',
  '.env.example',
  'app/layout.tsx',
  'app/page.tsx',
];

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    success(`Found ${file}`);
  } else {
    error(`Missing ${file}`);
  }
});

console.log('\n📦 Checking Dependencies...\n');

// Check package.json
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredDeps = [
    'next',
    'react',
    'react-dom',
    'mongodb',
    'mongoose',
    'googleapis',
    'lucide-react',
  ];
  
  requiredDeps.forEach(dep => {
    if (pkg.dependencies[dep]) {
      success(`Dependency found: ${dep}`);
    } else {
      error(`Missing dependency: ${dep}`);
    }
  });
  
  const requiredScripts = ['dev', 'build', 'start'];
  requiredScripts.forEach(script => {
    if (pkg.scripts[script]) {
      success(`Script found: ${script}`);
    } else {
      error(`Missing script: ${script}`);
    }
  });
} catch (e) {
  error('Failed to read package.json');
}

console.log('\n🔧 Checking Configuration...\n');

// Check next.config.js
try {
  const nextConfig = fs.readFileSync('next.config.js', 'utf8');
  
  if (nextConfig.includes('reactStrictMode')) {
    success('React Strict Mode enabled');
  } else {
    warning('React Strict Mode not enabled');
  }
  
  if (nextConfig.includes('headers')) {
    success('Security headers configured');
  } else {
    warning('Security headers not configured');
  }
} catch (e) {
  error('Failed to read next.config.js');
}

console.log('\n🔐 Checking Environment Variables...\n');

// Check .env.example
try {
  const envExample = fs.readFileSync('.env.example', 'utf8');
  
  const requiredEnvVars = [
    'MONGODB_URI',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REFRESH_TOKEN',
    'GOOGLE_DRIVE_FOLDER_ID',
    'NEXTAUTH_SECRET',
  ];
  
  requiredEnvVars.forEach(envVar => {
    if (envExample.includes(envVar)) {
      success(`Environment variable documented: ${envVar}`);
    } else {
      warning(`Missing in .env.example: ${envVar}`);
    }
  });
} catch (e) {
  error('Failed to read .env.example');
}

console.log('\n📄 Checking Critical Pages...\n');

const criticalPages = [
  'app/page.tsx',
  'app/members/page.tsx',
  'app/events/page.tsx',
  'app/leaderboard/page.tsx',
  'app/progress/page.tsx',
  'app/certificates/page.tsx',
  'app/submit/page.tsx',
  'app/admin/approvals/page.tsx',
  'app/admin/reports/page.tsx',
  'app/profile/[id]/page.tsx',
];

criticalPages.forEach(page => {
  if (fs.existsSync(page)) {
    const content = fs.readFileSync(page, 'utf8');
    
    // Check for 'use client' in client components
    if (content.includes("'use client'")) {
      success(`${page} - Client component`);
    }
    
    // Check for error handling
    if (content.includes('try') && content.includes('catch')) {
      success(`${page} - Has error handling`);
    } else {
      warning(`${page} - Missing error handling`);
    }
    
    // Check for loading states
    if (content.includes('loading') || content.includes('Loading')) {
      success(`${page} - Has loading states`);
    } else {
      warning(`${page} - Missing loading states`);
    }
  } else {
    error(`Missing page: ${page}`);
  }
});

console.log('\n📚 Checking Documentation...\n');

const docs = [
  'README.md',
  'DEPLOYMENT.md',
  'PRODUCTION_READY.md',
  'TROUBLESHOOTING.md',
  'DEPLOYMENT_SUMMARY.md',
];

docs.forEach(doc => {
  if (fs.existsSync(doc)) {
    success(`Found ${doc}`);
  } else {
    warning(`Missing ${doc}`);
  }
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('📊 Verification Summary:\n');
console.log(`✅ Successful checks: ${checks}`);
console.log(`❌ Errors: ${errors}`);
console.log(`⚠️  Warnings: ${warnings}`);
console.log('');

if (errors === 0 && warnings === 0) {
  console.log('🎉 Perfect! Your application is ready for deployment.\n');
  console.log('Next steps:');
  console.log('1. Run: npm run build');
  console.log('2. Test: npm start');
  console.log('3. Deploy: vercel --prod\n');
  process.exit(0);
} else if (errors === 0) {
  console.log('✅ No critical errors found!');
  console.log(`⚠️  However, there are ${warnings} warning(s) to review.\n`);
  console.log('You can proceed with deployment, but consider addressing warnings.\n');
  process.exit(0);
} else {
  console.log(`❌ Found ${errors} error(s) that should be fixed before deployment.\n`);
  console.log('Please address the errors above and run this script again.\n');
  process.exit(1);
}
