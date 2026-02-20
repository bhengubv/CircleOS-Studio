/**
 * installer.ts — WebUSB fastboot wrapper, device detection, slot management.
 *
 * Uses the `android-fastboot` (fastboot.js) library for WebUSB fastboot commands.
 * Exposes two global objects:
 *   window.app    — install flow (7 steps)
 *   window.revert — restore-slot-A flow
 */

import * as Fastboot from 'android-fastboot';
import { fetchLatestManifest, BuildManifest } from './api';
import {
  initStepBar,
  goToStep,
  appendLog,
  setFlashProgress,
  setText,
  setVisible,
  setEnabled,
} from './steps';

// ── Device codename map ────────────────────────────────────────────────────────
// Maps fastboot product string → CircleOS device codename
const DEVICE_MAP: Record<string, string> = {
  oriole: 'pixel6',
  sky:    'redmi_note12',
};

// ── State ──────────────────────────────────────────────────────────────────────
let fastbootDevice: Fastboot.FastbootDevice | null = null;
let manifest: BuildManifest | null = null;
let detectedDevice: string | null = null;

// ── Initialise ─────────────────────────────────────────────────────────────────
initStepBar();
goToStep(0);

// ── Install flow ───────────────────────────────────────────────────────────────

const app = {

  /** Step 0 → Step 1 */
  start(): void {
    goToStep(1);
  },

  /** Step 1: WebUSB device connect + identify */
  async connectDevice(): Promise<void> {
    try {
      fastbootDevice = new Fastboot.FastbootDevice();
      await fastbootDevice.connect();

      const product: string = await fastbootDevice.getVariable('product');
      const codename = DEVICE_MAP[product];

      if (!codename) {
        alert(`Unsupported device: ${product}. CircleOS alpha supports Pixel 6 (oriole) and Redmi Note 12 (sky).`);
        return;
      }

      detectedDevice = codename;
      const friendlyName = product === 'oriole' ? 'Pixel 6' : 'Redmi Note 12';
      setText('device-name', friendlyName);
      setVisible('device-info', true);

      appendLog(`Detected: ${friendlyName} (${product})`, 'log-ok');
      goToStep(2);
      setEnabled('btn-fetch', true);

    } catch (err) {
      appendLog(`Connection failed: ${(err as Error).message}`, 'log-err');
      alert('Could not connect. Make sure USB debugging is enabled and you are in fastboot mode.');
    }
  },

  /** Step 2: Fetch manifest from ota.circleos.co.za */
  async fetchManifest(): Promise<void> {
    if (!detectedDevice) return;
    try {
      setEnabled('btn-fetch', false);
      appendLog('Fetching build manifest…');

      manifest = await fetchLatestManifest(detectedDevice, 'alpha');

      setText('build-version', manifest.version);
      setText('build-date', manifest.buildDate);
      setVisible('manifest-info', true);

      appendLog(`Found: CircleOS ${manifest.version} (${manifest.buildDate})`, 'log-ok');
      goToStep(3);

    } catch (err) {
      appendLog(`Manifest fetch failed: ${(err as Error).message}`, 'log-err');
      setEnabled('btn-fetch', true);
    }
  },

  /** Step 3: Unlock bootloader (wipes device data) */
  async unlockBootloader(): Promise<void> {
    if (!fastbootDevice) return;
    const confirmed = confirm(
      'This will ERASE ALL DATA on your device and unlock the bootloader.\n\nAre you absolutely sure?'
    );
    if (!confirmed) return;

    try {
      appendLog('Sending unlock command…');
      await fastbootDevice.runCommand('flashing unlock');
      appendLog('Bootloader unlocked. Device rebooting to fastboot…', 'log-ok');

      // Re-connect after reboot into fastboot
      await fastbootDevice.waitForConnect();
      appendLog('Reconnected after unlock reboot', 'log-ok');
      goToStep(4);

    } catch (err) {
      appendLog(`Unlock failed: ${(err as Error).message}`, 'log-err');
    }
  },

  /** Step 3 → Step 4 skip: bootloader was already unlocked */
  skipIfAlreadyUnlocked(): void {
    appendLog('Skipping unlock — bootloader already unlocked', 'log-warn');
    goToStep(4);
  },

  /** Step 4: Stream payload.bin from CDN and flash to slot B */
  async flashDevice(): Promise<void> {
    if (!fastbootDevice || !manifest) return;

    setEnabled('btn-flash', false);
    appendLog(`Downloading payload from CDN: ${manifest.payloadUrl}`);
    setFlashProgress(0, 'Starting download…');

    try {
      // Fetch payload as a blob (streaming download)
      const res = await fetch(manifest.payloadUrl);
      if (!res.ok) throw new Error(`CDN returned ${res.status}`);

      const contentLength = Number(res.headers.get('content-length') ?? manifest.payloadSize);
      const reader = res.body!.getReader();
      const chunks: Uint8Array[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        const pct = Math.round((received / contentLength) * 50); // download = 0–50%
        setFlashProgress(pct, `Downloading… ${pct * 2}%`);
      }

      appendLog(`Download complete (${(received / 1024 / 1024).toFixed(1)} MB)`, 'log-ok');

      const blob = new Blob(chunks);
      setFlashProgress(50, 'Flashing to slot B…');
      appendLog('Flashing payload.bin to slot B…');

      // Flash via fastboot.js — uses `fastboot flash` under the hood
      await (fastbootDevice as any).flashBlob('system_b', blob, (progress: number) => {
        const total = 50 + Math.round(progress * 50); // flash = 50–100%
        setFlashProgress(total, `Flashing… ${total}%`);
      });

      setFlashProgress(100, 'Flash complete');
      appendLog('Slot B flashed successfully!', 'log-ok');
      goToStep(5);

    } catch (err) {
      appendLog(`Flash failed: ${(err as Error).message}`, 'log-err');
      setEnabled('btn-flash', true);
    }
  },

  /** Step 5: fastboot set_active b → reboot */
  async setActiveAndReboot(): Promise<void> {
    if (!fastbootDevice) return;
    try {
      appendLog('Setting active slot to B…');
      await fastbootDevice.runCommand('set_active b');
      appendLog('Slot B active. Rebooting…', 'log-ok');
      await fastbootDevice.runCommand('reboot');
      goToStep(6);
    } catch (err) {
      appendLog(`Set active failed: ${(err as Error).message}`, 'log-err');
    }
  },
};

// ── Revert flow (Restore Previous OS tab) ─────────────────────────────────────

let revertDevice: Fastboot.FastbootDevice | null = null;

const revert = {

  async connect(): Promise<void> {
    try {
      revertDevice = new Fastboot.FastbootDevice();
      await revertDevice.connect();

      const product = await revertDevice.getVariable('product');
      const logEl = document.getElementById('log-revert');
      if (logEl) {
        logEl.style.display = '';
        const line = document.createElement('div');
        line.className = 'log-ok';
        line.textContent = `Connected: ${product}`;
        logEl.appendChild(line);
      }

      setText('revert-device-name', product);
      setVisible('revert-device-info', true);
      setVisible('btn-revert-go', true);

    } catch (err) {
      alert(`Connection failed: ${(err as Error).message}`);
    }
  },

  async restoreSlotA(): Promise<void> {
    if (!revertDevice) return;
    const confirmed = confirm(
      'This will reboot your device into slot A (your original Android OS).\n\nContinue?'
    );
    if (!confirmed) return;

    try {
      const logEl = document.getElementById('log-revert');
      const log = (msg: string, cls?: string) => {
        if (!logEl) return;
        const line = document.createElement('div');
        if (cls) line.className = cls;
        line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
        logEl.appendChild(line);
        logEl.scrollTop = logEl.scrollHeight;
      };

      log('Setting active slot to A…');
      await revertDevice.runCommand('set_active a');
      log('Slot A active. Rebooting into stock Android…', 'log-ok');
      await revertDevice.runCommand('reboot');
      log('Done. Your original OS is booting.', 'log-ok');

      setVisible('btn-revert-go', false);

    } catch (err) {
      alert(`Restore failed: ${(err as Error).message}`);
    }
  },
};

// Expose to HTML onclick handlers
(window as any).app    = app;
(window as any).revert = revert;
