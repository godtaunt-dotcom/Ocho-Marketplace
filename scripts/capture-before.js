import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9222;
const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = path.resolve('design/before');
const CROPS_DIR = path.resolve('design/before/crops');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(CROPS_DIR)) fs.mkdirSync(CROPS_DIR, { recursive: true });

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHttp(url, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch (e) {}
    await sleep(200);
  }
  throw new Error(`Timeout waiting for ${url}`);
}

async function run() {
  console.log('🚀 Spawning Chrome...');
  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--window-size=1440,900',
    BASE_URL
  ]);

  try {
    await waitForHttp(`http://localhost:${DEBUG_PORT}/json/version`);
    console.log('✅ Chrome remote debugging active.');

    // Query existing tabs from /json
    const listRes = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`);
    const tabs = await listRes.json();
    console.log('Available targets:', tabs.length);
    let target = tabs.find((t) => t.type === 'page');
    if (!target) {
      const newRes = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/new?${encodeURIComponent(BASE_URL)}`, { method: 'PUT' });
      target = await newRes.json();
    }
    const wsUrl = target.webSocketDebuggerUrl;

    console.log('🔌 Connecting to CDP WebSocket:', wsUrl);
    const ws = new WebSocket(wsUrl);

    let messageId = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        const { resolve, reject } = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };

    await new Promise((resolve) => (ws.onopen = resolve));

    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = messageId++;
        callbacks.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');

    async function evaluate(expression) {
      const res = await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      return res.result?.value;
    }

    async function capture(filename, clip = null) {
      const params = { format: 'png' };
      if (clip) params.clip = clip;
      const res = await send('Page.captureScreenshot', params);
      const buffer = Buffer.from(res.data, 'base64');
      fs.writeFileSync(filename, buffer);
      console.log(`📸 Saved: ${path.relative(process.cwd(), filename)} (${buffer.length} bytes)`);
    }

    async function setViewport(width, height) {
      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: width === 390,
      });
      await sleep(300);
    }

    async function navigate(hash) {
      await evaluate(`window.location.hash = '${hash}'`);
      await sleep(1000);
    }

    // Let page load initially
    await sleep(2000);

    // Get item ID
    const itemId = await evaluate(`
      fetch('/api/items')
        .then(r => r.json())
        .then(d => d.data && d.data[0] ? d.data[0].id : null)
        .catch(() => null)
    `);
    console.log('Target item ID for detail page:', itemId);

    const widths = [
      { w: 390, h: 844, name: '390' },
      { w: 768, h: 1024, name: '768' },
      { w: 1440, h: 900, name: '1440' },
    ];

    // --- 1. HOME & ITEM LIST ---
    for (const { w, h, name } of widths) {
      await setViewport(w, h);
      await navigate('#/');
      await sleep(800);
      await capture(path.join(OUTPUT_DIR, `home-${name}.png`));

      // Item list (scroll down or filter to item list)
      await evaluate(`
        const el = document.getElementById('product-list') || document.querySelector('section');
        if (el) el.scrollIntoView();
      `);
      await sleep(500);
      await capture(path.join(OUTPUT_DIR, `item-list-${name}.png`));
    }

    // --- 2. ITEM DETAIL ---
    if (itemId) {
      for (const { w, h, name } of widths) {
        await setViewport(w, h);
        await navigate(`#/items/${itemId}`);
        await sleep(1000);
        await capture(path.join(OUTPUT_DIR, `item-detail-${name}.png`));
      }
    }

    // --- 3. CHECKOUT ---
    // Let's open checkout on item detail or modal
    if (itemId) {
      for (const { w, h, name } of widths) {
        await setViewport(w, h);
        await navigate(`#/items/${itemId}`);
        await sleep(800);
        // Scroll to checkout section or trigger checkout
        await evaluate(`
          const buyBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Beli Sekarang'));
          if (buyBtn) {
            buyBtn.scrollIntoView({ behavior: 'instant', block: 'center' });
          }
        `);
        await sleep(500);
        await capture(path.join(OUTPUT_DIR, `checkout-${name}.png`));
      }
    }

    // --- 4. LOGIN MODAL ---
    for (const { w, h, name } of widths) {
      await setViewport(w, h);
      await navigate('#/');
      await sleep(500);
      await evaluate(`
        const loginBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Masuk'));
        if (loginBtn) loginBtn.click();
      `);
      await sleep(600);
      await capture(path.join(OUTPUT_DIR, `login-${name}.png`));
      // Close modal
      await evaluate(`
        const closeBtn = document.querySelector('[aria-label="Close"], button.absolute');
        if (closeBtn) closeBtn.click();
      `);
      await sleep(300);
    }

    // --- 5. SELLER UPLOAD (SELL MODAL) ---
    for (const { w, h, name } of widths) {
      await setViewport(w, h);
      await navigate('#/');
      await sleep(500);
      await evaluate(`
        const sellBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Jual') || b.textContent.includes('+ Jual'));
        if (sellBtn) sellBtn.click();
      `);
      await sleep(600);
      await capture(path.join(OUTPUT_DIR, `seller-upload-${name}.png`));
      // Close modal
      await evaluate(`
        const closeBtn = document.querySelector('[aria-label="Close"], button.absolute');
        if (closeBtn) closeBtn.click();
      `);
      await sleep(300);
    }

    // --- 6. ORDERS PAGE ---
    // Log in first so orders page shows real order UI
    await evaluate(`
      localStorage.setItem('ocho_auth_token', 'mock_token');
      localStorage.setItem('ocho_auth_user', JSON.stringify({
        id: 'user-unpad-1',
        name: 'Pasha Ramadhan',
        email: 'pasha@mail.unpad.ac.id',
        role: 'STUDENT',
        isVerified: true
      }));
    `);
    for (const { w, h, name } of widths) {
      await setViewport(w, h);
      await navigate('#/orders');
      await sleep(800);
      await capture(path.join(OUTPUT_DIR, `orders-${name}.png`));
    }

    // --- 7. LOGO CLOSE-UP CROPS ---
    await setViewport(1440, 900);
    await navigate('#/');
    await sleep(800);

    // Crop Header Logo
    const headerLogoRect = await evaluate(`
      (() => {
        const el = document.querySelector('header svg[aria-label="Ocho Logo"]') || document.querySelector('svg[aria-label="Ocho Logo"]');
        if (el) {
          const r = el.getBoundingClientRect();
          return { x: Math.max(0, r.x - 10), y: Math.max(0, r.y - 10), width: r.width + 20, height: r.height + 20, scale: 1 };
        }
        return null;
      })()
    `);
    console.log('Header logo rect:', headerLogoRect);
    if (headerLogoRect) {
      await capture(path.join(CROPS_DIR, 'logo-header-crop.png'), headerLogoRect);
    }

    // Crop Footer Logo
    await evaluate(`
      (() => {
        const el = document.querySelector('footer svg[aria-label="Ocho Logo"]');
        if (el) el.scrollIntoView({ block: 'center' });
      })()
    `);
    await sleep(500);
    const footerLogoRect = await evaluate(`
      (() => {
        const el = document.querySelector('footer svg[aria-label="Ocho Logo"]');
        if (el) {
          const r = el.getBoundingClientRect();
          return { x: Math.max(0, r.x - 10), y: Math.max(0, r.y - 10), width: r.width + 20, height: r.height + 20, scale: 1 };
        }
        return null;
      })()
    `);
    console.log('Footer logo rect:', footerLogoRect);
    if (footerLogoRect) {
      await capture(path.join(CROPS_DIR, 'logo-footer-crop.png'), footerLogoRect);
    }

    // Crop Showcase Logo
    await navigate('#/showcase');
    await sleep(800);
    await evaluate(`
      (() => {
        const el = document.querySelector('svg[aria-label="Ocho Icon"]');
        if (el) el.scrollIntoView({ block: 'center' });
      })()
    `);
    await sleep(500);
    const showcaseLogoRect = await evaluate(`
      (() => {
        const el = document.querySelector('svg[aria-label="Ocho Icon"]');
        if (el) {
          const r = el.getBoundingClientRect();
          return { x: Math.max(0, r.x - 10), y: Math.max(0, r.y - 10), width: r.width + 20, height: r.height + 20, scale: 1 };
        }
        return null;
      })()
    `);
    console.log('Showcase logo rect:', showcaseLogoRect);
    if (showcaseLogoRect) {
      await capture(path.join(CROPS_DIR, 'logo-showcase-crop.png'), showcaseLogoRect);
    }

    console.log('🎉 All before screenshots and logo crops captured successfully!');
    ws.close();
  } finally {
    chromeProcess.kill();
  }
}

run().catch((err) => {
  console.error('Error running capture:', err);
  process.exit(1);
});
