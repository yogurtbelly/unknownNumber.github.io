// ==========================================
// CONTACT PAGE LOGIC
// ==========================================

// Loading Screen
const loadScreen = document.getElementById('loader');
const loadBar = document.getElementById('loader-bar');

function playLoader() {
  if (!loadScreen || !loadBar) return;
  loadScreen.style.transition = 'none';
  loadScreen.classList.remove('is-hidden');
  loadBar.classList.remove('is-loading');

  void loadScreen.offsetWidth;
  void loadBar.offsetWidth;

  loadScreen.style.transition = '';

  const onEnd = (event) => {
    if (event.target !== loadBar || event.animationName !== 'load-bar') return;
    loadBar.removeEventListener('animationend', onEnd);
    setTimeout(() => {
      loadScreen.classList.add('is-hidden');
    }, 100);
  };

  loadBar.addEventListener('animationend', onEnd);
  loadBar.classList.add('is-loading');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', playLoader);
} else {
  playLoader();
}

// Navigation Menu
const nav = document.getElementById('nav');
const toggle = document.getElementById('nav-toggle');

function setNavOpen(open) {
  if (!nav || !toggle) return;
  nav.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}

if (toggle) {
  toggle.addEventListener('click', () => {
    setNavOpen(!nav.classList.contains('is-open'));
  });
}

document.addEventListener('click', (e) => {
  if (nav && !nav.contains(e.target)) {
    setNavOpen(false);
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav && nav.classList.contains('is-open')) {
    setNavOpen(false);
    toggle.focus();
  }
});

// Contact Form & Transmission Dispatch
const form = document.getElementById('contact-form');
const receipt = document.getElementById('contact-receipt');
const msgInput = document.getElementById('contact-message');
const charCount = document.getElementById('contact-char-count');
const statusText = document.getElementById('status-text');
const btnSubmit = document.getElementById('btn-submit');
const btnReset = document.getElementById('btn-reset');
const btnNewMsg = document.getElementById('btn-new-msg');
const audioSent = document.getElementById('audio-sent');

// Character counter
if (msgInput && charCount) {
  msgInput.addEventListener('input', () => {
    charCount.textContent = `${msgInput.value.length} / 1000`;
  });
}

// Play sound safely
function playChime() {
  if (!audioSent) return;
  audioSent.currentTime = 0;
  audioSent.volume = 0.6;
  audioSent.play().catch(() => {});
}

// Generate Transmission ID
function generateTxId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TX-${rand}-LIA`;
}

// Format local date time
function getTimestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const year = d.getFullYear();
  let hours = d.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const minutes = pad(d.getMinutes());
  return `${month}/${day}/${year} // ${pad(hours)}:${minutes} ${ampm}`;
}

// Form Submission
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contact-name').value.trim() || 'Anonymous Stranger';
    const email = document.getElementById('contact-email').value.trim();
    const topic = document.getElementById('contact-topic').value;
    const body = msgInput.value.trim();

    if (!name || !email || !topic || !body) return;

    // Simulate sending dispatch
    btnSubmit.disabled = true;
    if (statusText) statusText.textContent = 'TRANSMITTING FREQUENCY... ENCRYPTING PAYLOAD';

    playChime();

    setTimeout(() => {
      // Populate receipt
      document.getElementById('receipt-id').textContent = generateTxId();
      document.getElementById('receipt-time').textContent = getTimestamp();
      document.getElementById('receipt-sender').textContent = `${name} <${email}>`;

      // Hide form, show receipt
      form.hidden = true;
      receipt.hidden = false;
      receipt.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      btnSubmit.disabled = false;
    }, 650);
  });
}

// Clear / Reset
if (btnReset) {
  btnReset.addEventListener('click', () => {
    setTimeout(() => {
      if (charCount) charCount.textContent = '0 / 1000';
      if (statusText) statusText.textContent = 'TRANSMITTER READY // WAITING FOR INPUT';
    }, 10);
  });
}

// New message
if (btnNewMsg) {
  btnNewMsg.addEventListener('click', () => {
    form.reset();
    if (charCount) charCount.textContent = '0 / 1000';
    if (statusText) statusText.textContent = 'TRANSMITTER READY // WAITING FOR INPUT';
    receipt.hidden = true;
    form.hidden = false;
  });
}
