/**
 * registration.ts — Alpha waitlist form submission.
 *
 * Posts to sleptonapi.thegeeknetwork.co.za/api/os/waitlist
 * (migration 054 created the waitlist table).
 */

const API_BASE = 'https://sleptonapi.thegeeknetwork.co.za';

async function submitForm(): Promise<void> {
  const deviceInput = document.querySelector<HTMLInputElement>('input[name="device"]:checked');
  const emailInput  = document.getElementById('email') as HTMLInputElement;
  const btn         = document.getElementById('btn-submit') as HTMLButtonElement;
  const errEl       = document.getElementById('msg-error')!;
  const successEl   = document.getElementById('msg-success')!;

  if (!deviceInput || !emailInput) return;

  const device = deviceInput.value;
  const email  = emailInput.value.trim();

  if (!device || !email) return;

  // Reset messages
  errEl.style.display     = 'none';
  successEl.style.display = 'none';
  btn.disabled            = true;
  btn.textContent         = 'Submitting…';

  try {
    const res = await fetch(`${API_BASE}/api/os/waitlist`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, device }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({})) as { message?: string };
      throw new Error(json.message ?? `Server error (${res.status})`);
    }

    // Show confirmation screen
    (document.getElementById('confirmed-email') as HTMLElement).textContent = email;
    (document.getElementById('reg-card') as HTMLElement).style.display      = 'none';
    (document.getElementById('confirmation') as HTMLElement).style.display  = '';

  } catch (err) {
    errEl.textContent    = `Something went wrong: ${(err as Error).message}`;
    errEl.style.display  = 'block';
    btn.disabled         = false;
    btn.textContent      = 'Join Waitlist';
  }
}

// Expose to inline onclick
(window as any).submitForm = submitForm;
