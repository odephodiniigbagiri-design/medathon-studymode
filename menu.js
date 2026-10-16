(() => {
'use strict';
const $ = s => document.querySelector(s);
const h = (tag, props, ...kids) => { const e = document.createElement(tag); Object.assign(e, props || {}); e.append(...kids); return e; };
const MS = () => window.MS;
const P = () => (MS().data.profile = MS().data.profile || {});
const LEVELS = ['100 Level', '200 Level', '300 Level', '400 Level', '500 Level', '600 Level', 'Intern / House officer', 'Other'];

function toDataUrl(file) {
  return new Promise((res, rej) => {
    const img = new Image(), u = URL.createObjectURL(file);
    img.onload = () => { const c = document.createElement('canvas'), n = 256, r = Math.min(img.width, img.height); c.width = c.height = n;
      c.getContext('2d').drawImage(img, (img.width - r) / 2, (img.height - r) / 2, r, r, 0, 0, n, n); URL.revokeObjectURL(u); res(c.toDataURL('image/jpeg', .82)); };
    img.onerror = rej; img.src = u;
  });
}
function paintAvatar() {
  const a = $('#avatar'), p = P(); a.textContent = '';
  if (p.pic) a.append(h('img', { src: p.pic, alt: '' }));
  else if (p.email) a.textContent = p.email[0].toUpperCase();
  else a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>';
}
// Save to the account when signed in; otherwise just keep it on the device.
async function persist(patch) {
  if (window.Auth && Auth.user) { try { await Auth.updateProfile(patch); } catch { MS().toast('Could not save. Check your internet connection.'); throw 0; } }
  else { Object.assign(P(), patch); MS().save(); }
}
const field = (label, input) => h('label', {}, label, input);

function render() {
  const body = $('#menu-body'), p = P(), A = window.Auth; body.textContent = '';
  const big = h('div', { className: 'av-big' });
  if (p.pic) big.append(h('img', { src: p.pic, alt: 'Profile picture' })); else big.textContent = p.email ? p.email[0].toUpperCase() : '?';
  const pic = h('input', { type: 'file', accept: 'image/*', hidden: true, onchange: async () => {
    if (!pic.files[0]) return;
    try { await persist({ pic: await toDataUrl(pic.files[0]) }); paintAvatar(); render(); } catch {}
  } });
  body.append(h('div', { className: 'av-row' }, big, h('div', {},
    h('button', { className: 'ghost', textContent: p.pic ? 'Change photo' : 'Add photo', onclick: () => pic.click() }),
    p.pic ? h('button', { className: 'ghost', textContent: 'Remove', style: 'margin-left:8px', onclick: async () => { try { await persist({ pic: '' }); paintAvatar(); render(); } catch {} } }) : ''), pic));
  body.append(h('p', { className: 'muted', textContent: A && A.user ? 'Signed in as ' + (A.user.email || p.email) : 'Not signed in. Accounts are not set up yet.' }));

  const uni = h('input', { type: 'text', value: p.uni || '', placeholder: 'University', maxLength: 100 });
  const lvl = h('select', {}, h('option', { value: '', textContent: 'Select level' }), ...LEVELS.map(l => h('option', { value: l, textContent: l, selected: p.level === l })));
  body.append(h('div', { className: 'f' }, field('University', uni), field('Level in school', lvl)),
    h('button', { className: 'primary', textContent: 'Save profile', onclick: async () => {
      try { await persist({ uni: uni.value.trim(), level: lvl.value }); MS().toast('Profile saved.'); } catch {}
    } }));

  if (A && A.user) {
    const n1 = h('input', { type: 'password', autocomplete: 'new-password', placeholder: 'New password (8+ characters)' });
    const n2 = h('input', { type: 'password', autocomplete: 'new-password', placeholder: 'Confirm new password' });
    body.append(h('div', { className: 'msec' }, h('h2', { textContent: 'Change password' }), h('div', { className: 'f' }, n1, n2),
      h('button', { className: 'primary', textContent: 'Update password', onclick: async () => {
        if (n1.value.length < 8) return MS().toast('Use at least 8 characters.');
        if (n1.value !== n2.value) return MS().toast('The passwords do not match.');
        try { await A.changePassword(n1.value); MS().toast('Password updated.'); n1.value = n2.value = ''; } catch (e) { MS().toast(e.message || 'Could not update password.'); }
      } }),
      h('button', { className: 'ghost', textContent: 'Sign out', style: 'margin-top:12px;width:100%', onclick: () => A.signOut() })));
  }
}
window.Menu = { render, paintAvatar, LEVELS };
paintAvatar();
})();
