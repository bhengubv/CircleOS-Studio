/**
 * api.ts — Fetches build manifest from ota.circleos.co.za
 *
 * Response shape from GET /api/os/releases/latest (LatestReleaseResponse):
 *   { hasUpdate: boolean, release: OsReleaseSummaryDto | null }
 *
 * OsReleaseSummaryDto:
 *   { id, version, channel, manifestUrl, rolloutPercent, minVersion }
 *
 * manifestUrl is the CDN URL for the full payload.bin.
 */

const OTA_BASE = 'https://ota.circleos.co.za';

export interface BuildManifest {
  id:             number;
  version:        string;
  channel:        string;
  payloadUrl:     string;  // = release.manifestUrl from the API
  rolloutPercent: number;
  minVersion:     string | null;
}

/**
 * Fetch the latest manifest for the given device codename and channel.
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

  const body = await res.json() as { hasUpdate: boolean; release: {
    id: number;
    version: string;
    channel: string;
    manifestUrl: string;
    rolloutPercent: number;
    minVersion: string | null;
  } | null };

  if (!body.hasUpdate || !body.release) {
    throw new Error('No update available for this device/channel combination.');
  }

  return {
    id:             body.release.id,
    version:        body.release.version,
    channel:        body.release.channel,
    payloadUrl:     body.release.manifestUrl,
    rolloutPercent: body.release.rolloutPercent,
    minVersion:     body.release.minVersion ?? null,
  };
}
