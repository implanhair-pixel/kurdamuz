import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';
const LOCALE = 'en';

const routes = [
  { path: '/', name: 'Landing Page' },
  { path: '/login', name: 'Login' },
  { path: '/signup', name: 'Signup' },
  { path: '/forgot-password', name: 'Forgot Password' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/learning', name: 'Learning' },
  { path: '/courses', name: 'Courses' },
  { path: '/srs', name: 'SRS' },
  { path: '/vocabulary', name: 'Vocabulary' },
  { path: '/grammar', name: 'Grammar' },
  { path: '/stories', name: 'Stories' },
  { path: '/challenges', name: 'Challenges' },
  { path: '/achievements', name: 'Achievements' },
  { path: '/streaks', name: 'Streaks' },
  { path: '/leaderboard', name: 'Leaderboard' },
  { path: '/dialects', name: 'Dialects' },
  { path: '/community', name: 'Community' },
  { path: '/admin', name: 'Admin' },
  { path: '/learning-paths', name: 'Learning Paths' },
  { path: '/placement-test', name: 'Placement Test' },
  { path: '/owner', name: 'Owner' },
];

const results = [];

async function testRoute(browser, route) {
  const fullUrl = `${BASE_URL}/${LOCALE}${route.path}`;
  console.log(`\n=== Testing: ${route.name} (${fullUrl}) ===`);
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  
  const page = await context.newPage();
  const consoleErrors = [];
  
  // Capture console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location() ? `${msg.location().url}:${msg.location().lineNumber}` : 'unknown'
      });
    } else if (msg.type() === 'warning') {
      consoleErrors.push({
        type: msg.type(),
        text: msg.text(),
        location: 'console'
      });
    }
  });
  
  // Capture uncaught exceptions
  page.on('pageerror', error => {
    consoleErrors.push({
      type: 'uncaught',
      text: error.message,
      location: error.stack
    });
  });
  
  // Capture failed requests
  page.on('requestfailed', request => {
    consoleErrors.push({
      type: 'requestfailed',
      text: `${request.url()} failed: ${request.failure().errorText}`,
      location: 'network'
    });
  });
  
  try {
    const response = await page.goto(fullUrl, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for async components to settle
    await page.waitForTimeout(3000);
    
    const httpStatus = response ? response.status() : 'none';
    const title = await page.title().catch(() => 'No title');
    
    // Get visible text for verification
    const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 200) || 'Empty body');
    
    // Check for 404 or error pages
    const isErrorPage = httpStatus >= 400 || bodyText.includes('404') || bodyText.includes('Not Found');
    
    // Check page source for error boundaries
    const htmlContent = await page.content();
    const hasNextData = htmlContent.includes('__NEXT_DATA__');
    
    const routeResult = {
      name: route.name,
      path: route.path,
      url: fullUrl,
      httpStatus,
      title,
      consoleErrors: [...consoleErrors],
      isErrorPage,
      bodyPreview: bodyText,
    };
    
    results.push(routeResult);
    
    if (routeResult.consoleErrors.length > 0 || routeResult.isErrorPage) {
      console.log(`❌ FAILED - Status: ${httpStatus}, Errors: ${consoleErrors.length}`);
      consoleErrors.forEach(err => {
        console.log(`   [${err.type}] ${err.text.substring(0, 300)}`);
      });
    } else {
      console.log(`✅ PASSED - Status: ${httpStatus}, Title: ${title.substring(0, 60)}`);
    }
    
  } catch (error) {
    results.push({
      name: route.name,
      path: route.path,
      url: fullUrl,
      httpStatus: 'CRASH',
      title: 'N/A',
      consoleErrors: [{ type: 'navigation', text: error.message, location: error.stack }],
      isErrorPage: true,
      bodyPreview: 'Navigation failed'
    });
    console.log(`❌ CRASHED - ${error.message}`);
  }
  
  await context.close();
  return results[results.length - 1];
}

async function main() {
  console.log('Starting route tests...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Locale: ${LOCALE}`);
  console.log(`Routes to test: ${routes.length}`);
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  for (const route of routes) {
    await testRoute(browser, route);
  }
  
  await browser.close();
  
  // Generate report
  console.log('\n\n========================================');
  console.log('         TEST RESULTS REPORT');
  console.log('========================================\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const r of results) {
    const hasError = r.consoleErrors.length > 0 || r.isErrorPage || r.httpStatus === 'CRASH';
    if (hasError) {
      failed++;
      console.log(`❌ ${r.name} (${r.path})`);
      console.log(`   Status: ${r.httpStatus}`);
      r.consoleErrors.forEach(e => console.log(`   Error: [${e.type}] ${e.text.substring(0, 200)}`));
    } else {
      passed++;
      console.log(`✅ ${r.name} (${r.path})`);
    }
  }
  
  console.log(`\n--- Summary ---`);
  console.log(`Total: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  const status = failed === 0 ? 'STABLE' : 'UNSTABLE';
  console.log(`Status: ${status}`);
  
  return { results, passed, failed, status };
}

main()
  .then(({ results, passed, failed, status }) => {
    console.log(`\nFinal project status: ${status}`);
    process.exit(failed > 0 ? 1 : 0);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });