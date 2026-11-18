import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function main() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9225',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,900',
    'http://localhost:5173/#/'
  ]);
  await new Promise((r) => setTimeout(r, 2000));
  const res = await fetch('http://127.0.0.1:9225/json');
  const tabs = await res.json();
  const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));

  let id = 1;
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const cur = id++;
      const handler = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.id === cur) {
          ws.removeEventListener('message', handler);
          resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: cur, method, params }));
    });

  await send('Page.enable');
  await send('DOM.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Scroll down to footer
  await send('Runtime.evaluate', {
    expression: 'window.scrollTo(0, document.body.scrollHeight)',
  });
  await new Promise((r) => setTimeout(r, 1000));

  const rect = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const el = document.querySelector('footer svg[aria-label="Ocho Logo"]');
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          x: r.x + window.scrollX - 5,
          y: r.y + window.scrollY - 5,
          width: r.width + 10,
          height: r.height + 10,
          scale: 1
        };
      })()
    `,
    returnByValue: true,
  });

  console.log('Footer logo bounding box:', rect.result?.value);
  if (rect.result?.value) {
    const shot = await send('Page.captureScreenshot', {
      format: 'png',
      clip: rect.result?.value,
    });
    fs.writeFileSync('design/before/crops/logo-footer-crop.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved logo-footer-crop.png size:', Buffer.from(shot.data, 'base64').length);
  }

  // Also full footer screenshot to see context
  const fullFooterRect = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const el = document.querySelector('footer');
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height, scale: 1 };
      })()
    `,
    returnByValue: true,
  });
  if (fullFooterRect.result?.value) {
    const shot = await send('Page.captureScreenshot', {
      format: 'png',
      clip: fullFooterRect.result?.value,
    });
    fs.writeFileSync('design/before/crops/footer-section.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved footer-section.png size:', Buffer.from(shot.data, 'base64').length);
  }

  ws.close();
  chrome.kill();
}

main().catch(console.error);
