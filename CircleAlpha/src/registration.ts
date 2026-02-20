/**
 * registration.ts — Alpha waitlist form submission.
 *
 * Posts to sleptonapi.thegeeknetwork.co.za/api/os/waitlist
 *
 * circle_waitlist schema (migration 054):
 *   email, device_brand, device_model, country, is_developer
 */

const API_BASE = 'https://sleptonapi.thegeeknetwork.co.za';

// Maps the device radio value to brand/model fields expected by the API
const DEVICE_META: Record<string, { device_brand: string; device_model: string }> = {
  pixel6:       { device_brand: 'google', device_model: 'Pixel 6' },
  redmi_note12: { device_brand: 'xiaomi', device_model: 'Redmi Note 12' },
};

async function submitForm(): Promise<void> {
  const deviceInput   = document.querySelector<HTMLInputElement>('input[name="device"]:checked');
  const emailInput    = document.getElementById('email')        as HTMLInputElement;
  const countryInput  = document.getElementById('country')      as HTMLInputElement;
  const devCheckbox   = document.getElementById('is-developer') as HTMLInputElement;
  const btn           = document.getElementById('btn-submit')   as HTMLButtonElement;
  const errEl         = document.getElementById('msg-error')!;

  if (!deviceInput || !emailInput || !countryInput) return;

  const deviceKey = deviceInput.value;
  const meta      = DEVICE_META[deviceKey];
  const email     = emailInput.value.trim();
  const country   = countryInput.value.trim();

  if (!meta || !email || !country) return;

  errEl.style.display = 'none';
  btn.disabled        = true;
  btn.textContent     = 'Submitting…';

  try {
    const res = await fetch(`${API_BASE}/api/os/waitlist`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        device_brand:  meta.device_brand,
        device_model:  meta.device_model,
        country,
        is_developer:  devCheckbox?.checked ?? false,
      }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({})) as { message?: string };
      throw new Error(json.message ?? `Server error (${res.status})`);
    }

    // Show confirmation screen
    (document.getElementById('confirmed-email') as HTMLElement).textContent = email;
    (document.getElementById('reg-card')        as HTMLElement).style.display = 'none';
    (document.getElementById('confirmation')    as HTMLElement).style.display = '';

  } catch (err) {
    errEl.textContent   = `Something went wrong: ${(err as Error).message}`;
    errEl.style.display = 'block';
    btn.disabled        = false;
    btn.textContent     = 'Join Waitlist';
  }
}

(window as any).submitForm = submitForm;
