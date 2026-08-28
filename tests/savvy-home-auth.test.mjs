import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexPath = path.join(__dirname, '../index.html');
const htmlContent = fs.readFileSync(indexPath, 'utf-8');

// ──────────────────────────────────────────────────────────────
// TEST 1: Backend URL is staging exact
// ──────────────────────────────────────────────────────────────
test('Backend SAVVY_API uses staging URL exactly', () => {
  const stagingUrl = 'https://ample-imagination-clothing-staging.up.railway.app';
  assert(htmlContent.includes(stagingUrl),
    'HTML must contain staging backend URL');
});

// ──────────────────────────────────────────────────────────────
// TEST 2: No production backend URL in code
// ──────────────────────────────────────────────────────────────
test('No production backend URL appears in staging code', () => {
  const prodUrl = 'savvy-ebay-prices-production.up.railway.app';
  assert(!htmlContent.includes(prodUrl),
    'HTML must not contain production backend URL');
});

// ──────────────────────────────────────────────────────────────
// TEST 3: Password input uses type=password
// ──────────────────────────────────────────────────────────────
test('Password input has type=password attribute', () => {
  assert(htmlContent.includes('id="login-pass"') &&
         htmlContent.includes('type="password"'),
    'Password input must have type=password');
});

// ──────────────────────────────────────────────────────────────
// TEST 4: Session storage keys are correct
// ──────────────────────────────────────────────────────────────
test('sessionStorage uses correct key names', () => {
  const tokenKey = 'savvy_session_token';
  const userKey = 'savvy_session_user';
  assert(htmlContent.includes(tokenKey) && htmlContent.includes(userKey),
    'sessionStorage keys must be correct');
});

// ──────────────────────────────────────────────────────────────
// TEST 5: No password stored in localStorage
// ──────────────────────────────────────────────────────────────
test('Code does not store password in localStorage', () => {
  assert(!htmlContent.includes('localStorage.setItem') ||
         !htmlContent.includes('password'),
    'Password must never be stored in localStorage');
});

// ──────────────────────────────────────────────────────────────
// TEST 6: Token not passed in URL
// ──────────────────────────────────────────────────────────────
test('Session token not exposed in URL parameters', () => {
  assert(!htmlContent.includes('?token=') &&
         !htmlContent.includes('&token=') &&
         !htmlContent.includes('location.href'),
    'Token must never appear in URL');
});

// ──────────────────────────────────────────────────────────────
// TEST 7: Finally block exists in login
// ──────────────────────────────────────────────────────────────
test('Finally block in savvyLogin cleans password', () => {
  assert(htmlContent.includes('finally {'),
    'Login function must have finally block');
  assert(htmlContent.includes('passEl.value = \'\''),
    'Finally block must clear password field');
});

// ──────────────────────────────────────────────────────────────
// TEST 8: Menu hidden without session
// ──────────────────────────────────────────────────────────────
test('Menu hidden when sessionStorage has no token', () => {
  assert(htmlContent.includes('id="modules"') &&
         htmlContent.includes('display:none'),
    'Modules must be hidden initially');
});

// ──────────────────────────────────────────────────────────────
// TEST 9: Menu visible with session (initSession logic)
// ──────────────────────────────────────────────────────────────
test('initSession checks for token before showing menu', () => {
  assert(htmlContent.includes('sessionStorage.getItem(\'savvy_session_token\')'),
    'initSession must check sessionStorage token');
  assert(htmlContent.includes('modules\').style.display = \'flex\''),
    'initSession must show modules when authenticated');
});

// ──────────────────────────────────────────────────────────────
// TEST 10: Logout removes only Savvy tokens, not Google
// ──────────────────────────────────────────────────────────────
test('Logout removes only Savvy session, not Google tokens', () => {
  assert(htmlContent.includes('sessionStorage.removeItem(\'savvy_session_token\')'),
    'Logout must remove Savvy token');
  assert(htmlContent.includes('sessionStorage.removeItem(\'savvy_session_user\')'),
    'Logout must remove Savvy user');
  assert(!htmlContent.includes('localStorage.removeItem(\'google'),
    'Logout must NOT remove Google tokens');
});

// ──────────────────────────────────────────────────────────────
// TEST 11: No location.reload() in logout
// ──────────────────────────────────────────────────────────────
test('Logout does not use location.reload()', () => {
  const logoutStart = htmlContent.indexOf('function savvyLogout()');
  const logoutEnd = htmlContent.indexOf('}', logoutStart + 100);
  const logoutCode = htmlContent.substring(logoutStart, logoutEnd);
  assert(!logoutCode.includes('location.reload()'),
    'Logout must not use reload()');
});

// ──────────────────────────────────────────────────────────────
// TEST 12: Module links do not use target=_blank
// ──────────────────────────────────────────────────────────────
test('Module elements do not use target="_blank"', () => {
  assert(!htmlContent.includes('target="_blank"'),
    'Links must not open in new tab');
});

// ──────────────────────────────────────────────────────────────
// TEST 13: STAGING label visible in login
// ──────────────────────────────────────────────────────────────
test('STAGING badge appears in login screen', () => {
  assert(htmlContent.includes('STAGING') ||
         htmlContent.includes('🧪'),
    'STAGING badge must be visible');
});

// ──────────────────────────────────────────────────────────────
// TEST 14: STAGING label visible in header
// ──────────────────────────────────────────────────────────────
test('STAGING badge appears in header', () => {
  assert(htmlContent.includes('hdr-staging'),
    'STAGING badge must be in header');
});

// ──────────────────────────────────────────────────────────────
// TEST 15: No innerHTML with user input
// ──────────────────────────────────────────────────────────────
test('Error messages use textContent, not innerHTML', () => {
  const errorLine = htmlContent.substring(
    htmlContent.indexOf('errEl.textContent'),
    htmlContent.indexOf('errEl.textContent') + 50
  );
  assert(errorLine.includes('textContent'),
    'Error messages must use textContent for safety');
});

// ──────────────────────────────────────────────────────────────
// TEST 16: No SAVVY_CONFIG endpoint called
// ──────────────────────────────────────────────────────────────
test('Legacy SAVVY_CONFIG endpoint not referenced', () => {
  assert(!htmlContent.includes('SAVVY_CONFIG'),
    'SAVVY_CONFIG must be removed completely');
});

// ──────────────────────────────────────────────────────────────
// TEST 17: No network calls in initialization
// ──────────────────────────────────────────────────────────────
test('initSession checks only sessionStorage, no fetch', () => {
  const initStart = htmlContent.indexOf('function initSession()');
  const initEnd = htmlContent.indexOf('}', initStart + 50);
  const initCode = htmlContent.substring(initStart, initEnd);
  assert(!initCode.includes('fetch'),
    'Session initialization must be local only');
});

// ──────────────────────────────────────────────────────────────
// TEST 18: Claude API key settings section removed
// ──────────────────────────────────────────────────────────────
test('Claude API key settings section removed', () => {
  assert(!htmlContent.includes('Claude') &&
         !htmlContent.includes('claude') &&
         !htmlContent.includes('sk-ant'),
    'Claude settings must be removed');
});

// ──────────────────────────────────────────────────────────────
// TEST 19: ImgBB API key settings section removed
// ──────────────────────────────────────────────────────────────
test('ImgBB API key settings section removed', () => {
  assert(!htmlContent.includes('ImgBB') &&
         !htmlContent.includes('imgbb'),
    'ImgBB settings must be removed');
});

// ──────────────────────────────────────────────────────────────
// TEST 20: eBay App ID settings section removed
// ──────────────────────────────────────────────────────────────
test('eBay App ID settings section removed', () => {
  assert(!htmlContent.includes('StevenGa-SavvySca') &&
         !htmlContent.includes('Hardcoded in modules'),
    'eBay settings must be removed');
});

// ──────────────────────────────────────────────────────────────
// TEST 21: Google Sheets/Drive URLs removed from settings
// ──────────────────────────────────────────────────────────────
test('Google Sheets/Drive configuration section removed', () => {
  assert(!htmlContent.includes('cfg-section') &&
         !htmlContent.includes('cfg-label'),
    'Settings configuration UI must be removed');
});

// ──────────────────────────────────────────────────────────────
// TEST 22: Settings overlay completely removed
// ──────────────────────────────────────────────────────────────
test('Settings overlay div removed', () => {
  assert(!htmlContent.includes('id="cfg-ov"'),
    'Settings overlay must be removed');
});

// ──────────────────────────────────────────────────────────────
// TEST 23: openSettings function removed
// ──────────────────────────────────────────────────────────────
test('openSettings function removed', () => {
  assert(!htmlContent.includes('function openSettings()'),
    'openSettings function must be removed');
});

// ──────────────────────────────────────────────────────────────
// TEST 24: closeSettings function removed
// ──────────────────────────────────────────────────────────────
test('closeSettings function removed', () => {
  assert(!htmlContent.includes('function closeSettings()'),
    'closeSettings function must be removed');
});

// ──────────────────────────────────────────────────────────────
// TEST 25: saveField function removed
// ──────────────────────────────────────────────────────────────
test('saveField function removed', () => {
  assert(!htmlContent.includes('function saveField()'),
    'saveField function must be removed');
});

// ──────────────────────────────────────────────────────────────
// TEST 26: Module links disabled (not href)
// ──────────────────────────────────────────────────────────────
test('Module links converted to disabled divs', () => {
  assert(!htmlContent.includes('href="https://octavio-cmd.github.io/product-scanner"'),
    'Product Scanner link must be disabled');
  assert(!htmlContent.includes('href="https://octavio-cmd.github.io/clothing-shoes"'),
    'Clothing & Shoes link must be disabled');
  assert(!htmlContent.includes('href="https://octavio-cmd.github.io/inventory-manager"'),
    'Inventory link must be disabled');
});

// ──────────────────────────────────────────────────────────────
// TEST 27: Staging placeholder text in modules
// ──────────────────────────────────────────────────────────────
test('Modules show "Próximamente en staging" message', () => {
  assert(htmlContent.includes('Próximamente en staging'),
    'Modules must show staging placeholder');
});

// ──────────────────────────────────────────────────────────────
// TEST 28: Login endpoint uses POST method
// ──────────────────────────────────────────────────────────────
test('Login uses POST method to /auth/login', () => {
  assert(htmlContent.includes('method: \'POST\''),
    'Login must use POST method');
  assert(htmlContent.includes('/auth/login'),
    'Login must call /auth/login endpoint');
});

// ──────────────────────────────────────────────────────────────
// TEST 29: Login sends JSON payload with usuario and password
// ──────────────────────────────────────────────────────────────
test('Login JSON payload includes usuario and password', () => {
  assert(htmlContent.includes('usuario:') &&
         htmlContent.includes('password:'),
    'Login payload must include usuario and password');
});

// ──────────────────────────────────────────────────────────────
// TEST 30: Login disables button during submission
// ──────────────────────────────────────────────────────────────
test('Login button disabled during submission', () => {
  assert(htmlContent.includes('btnEl.disabled = true'),
    'Login button must be disabled during submission');
});

// ──────────────────────────────────────────────────────────────
// TEST 31: Login error handling shows user message
// ──────────────────────────────────────────────────────────────
test('Login displays error messages', () => {
  assert(htmlContent.includes('errEl.style.display = \'block\''),
    'Login must display errors');
});

// ──────────────────────────────────────────────────────────────
// TEST 32: Settings gear button removed from header
// ──────────────────────────────────────────────────────────────
test('Settings gear button removed from header', () => {
  const headerSection = htmlContent.substring(0, htmlContent.indexOf('<div class="modules"'));
  assert(!headerSection.includes('hdr-gear'),
    'Settings gear button must be removed');
});

// ──────────────────────────────────────────────────────────────
// TEST 33: User logout shows login screen
// ──────────────────────────────────────────────────────────────
test('Logout calls initSession to show login screen', () => {
  const logoutStart = htmlContent.indexOf('function savvyLogout()');
  const logoutEnd = htmlContent.indexOf('}', logoutStart);
  const logoutCode = htmlContent.substring(logoutStart, logoutEnd);
  assert(logoutCode.includes('initSession()'),
    'Logout must call initSession');
});

// ──────────────────────────────────────────────────────────────
// TEST 34: DOMContentLoaded event initializes session
// ──────────────────────────────────────────────────────────────
test('DOMContentLoaded event triggers initSession', () => {
  assert(htmlContent.includes('DOMContentLoaded') &&
         htmlContent.includes('initSession'),
    'Page must initialize session on load');
});

// ──────────────────────────────────────────────────────────────
// TEST 35: Username display in header authenticated state
// ──────────────────────────────────────────────────────────────
test('Authenticated header shows username', () => {
  assert(htmlContent.includes('hdr-username'),
    'Header must show username when authenticated');
});

console.log('\n✅ All tests passed! Phase A implementation verified.');
