/**
 * api.ts — Fetches build manifest from ota.circleos.co.za
 */

const OTA_BASE = 'https://ota.circleos.co.za';

export interface BuildManifest {
  version:     string;
  buildDate:   string;
  device:      string;
  channel:     string;
  payloadUrl:  string;
  payloadSize: number;
  payloadHash: string;
}

/**
 * Fetch the latest alpha manifest for the given device codename and channel.
 * @param device  e.g. "pixel6" or "redmi_note12"
 * @param channel e.g. "alpha" | "stable"
 */
export async function fetchLatestManifest(
  device: string,
  channel = 'alpha',
): Promise<BuildManifest> {
  const url = `${OTA_BASE}/api/os/releases/latest?device=${device}&channel=${channel}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Manifest fetch failed: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  if (!json.payloadUrl) {
    throw new Error('No update available for this device/channel combination.');
  }
  return json as BuildManifest;
}
