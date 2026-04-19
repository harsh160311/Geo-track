/* ════════════════════════════════════════════
   contact.js  —  Contact Form Logic (EmailJS)
   GeoTrack v2.0
════════════════════════════════════════════ */
'use strict';

/* ── INIT EMAILJS ────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  if (typeof emailjs !== 'undefined' && EJS_PK !== 'YOUR_PUBLIC_KEY') {
    emailjs.init(EJS_PK);
  }

  var submitBtn = document.getElementById('cf-submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', sendContactForm);
  }
});

/* ── SEND FORM ───────────────────────────── */
function sendContactForm() {
  var name    = getVal('cf-name');
  var email   = getVal('cf-email');
  var subject = getVal('cf-subject');
  var message = getVal('cf-msg');

  /* Validate */
  if (!name || !email || !message) {
    toast('Name, email aur message required hai', true);
    return;
  }
  if (!email.includes('@')) {
    toast('Valid email address daalo', true);
    return;
  }

  var btn = document.getElementById('cf-submit');
  btn.disabled    = true;
  btn.textContent = 'SENDING...';
  hideEl('cf-ok');
  hideEl('cf-err');

  /* EmailJS not configured */
  if (typeof emailjs === 'undefined' || EJS_PK === 'YOUR_PUBLIC_KEY') {
    setTimeout(function () {
      btn.disabled    = false;
      btn.textContent = 'SEND MESSAGE';
      toast('EmailJS keys configure karo (config.js)', true);
    }, 600);
    return;
  }

  emailjs.send(EJS_SID, EJS_TID, {
    from_name:  name,
    from_email: email,
    subject:    subject || '(no subject)',
    message:    message
  })
  .then(function () {
    btn.disabled    = false;
    btn.textContent = 'SEND MESSAGE';
    showEl('cf-ok');
    hideEl('cf-err');
    toast('Message sent successfully!');

    /* Clear form */
    ['cf-name','cf-email','cf-subject','cf-msg'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = '';
    });
  })
  .catch(function (err) {
    btn.disabled    = false;
    btn.textContent = 'SEND MESSAGE';
    showEl('cf-err');
    hideEl('cf-ok');
    toast('Send failed — check EmailJS config', true);
    console.error('EmailJS error:', err);
  });
}
