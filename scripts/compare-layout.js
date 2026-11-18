import { spawn } from 'child_process';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9228;
const BASE_URL = 'http://localhost:5173';

async function main() {
  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,900',
    BASE_URL,
  ]);

  try {
    await new Promise((r) => setTimeout(r, 2000));
    const listRes = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`);
    const tabs = await listRes.json();
    const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
    await new Promise((r) => (ws.onopen = r));

    let id = 1;
    const send = (method, params = {}) =>
      new Promise((res) => {
        const cur = id++;
        const handler = (e) => {
          const msg = JSON.parse(e.data);
          if (msg.id === cur) {
            ws.removeEventListener('message', handler);
            res(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: cur, method, params }));
      });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await new Promise((r) => setTimeout(r, 1000));

    const metrics = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const header = document.querySelector('header');
          const hr = header ? header.getBoundingClientRect() : null;
          const logo = document.querySelector('svg[aria-label="Ocho Logo"]');
          const lr = logo ? logo.getBoundingClientRect() : null;
          const search = document.querySelector('header input');
          const sr = search ? search.getBoundingClientRect() : null;
          const sellBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Jual'));
          const br = sellBtn ? sellBtn.getBoundingClientRect() : null;
          const footer = document.querySelector('footer');
          const fr = footer ? footer.getBoundingClientRect() : null;

          return {
            headerHeight: hr ? hr.height : null,
            logoWidth: lr ? lr.width : null,
            logoHeight: lr ? lr.height : null,
            searchHeight: sr ? sr.height : null,
            sellBtnHeight: br ? br.height : null,
          };
        })()
      `,
      returnByValue: true,
    });

    console.log('Layout Metrics (After):', JSON.stringify(metrics.result?.value, null, 2));
    ws.close();
  } finally {
    chromeProcess.kill();
  }
}

main().catch(console.error);
