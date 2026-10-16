(() => {
'use strict';
const cfg = window.MEDATHON_CONFIG || {};
const h = (tag, props, ...kids) => { const e = document.createElement(tag); Object.assign(e, props || {}); e.append(...kids); return e; };
const MS = () => window.MS, cache = () => (MS().data.profile = MS().data.profile || {});
const ok = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase);
const sb = ok ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } }) : null;
let user = null, gate = null;

const box = (...kids) => { if (!gate) { gate = h('div', { id: 'gate', role: 'dialog', ariaLabel: 'Medathon account' }); document.body.append(gate); }
  gate.textContent = ''; gate.append(h('h2', { textContent: 'Medathon' }), ...kids); };
const msg = () => h('p', { className: 'muted', role: 'alert' });
const inp = (type, ph, ac, x) => h('input', Object.assign({ type, placeholder: ph, autocomplete: ac }, x || {}));
const link = (t, fn) => h('a', { textContent: t, onclick: fn });
const friendly = e => /network|fetch/i.test(e.message) ? 'No internet connection. Try again when you are online.' : /Invalid login/i.test(e.message) ? 'Wrong email or password.' : e.message;
const isEmail = v => /^\S+@\S+\.\S+$/.test(v);

function signup() {
  const em = inp('email', 'Email', 'email'), pw = inp('password', 'Password (8+ characters)', 'new-password'), uni = inp('text', 'University', 'organization', { maxLength: 100 }), er = msg();
  const lv = h('select', {}, h('option', { value: '', textContent: 'Level in school' }), ...Menu.LEVELS.map(l => h('option', { value: l, textContent: l })));
  const btn = h('button', { className: 'primary', textContent: 'Create account', onclick: async () => {
    const e = em.value.trim();
    if (!isEmail(e)) return er.textContent = 'Enter a valid email address.';
    if (pw.value.length < 8) return er.textContent = 'Password must be at least 8 characters.';
    if (!uni.value.trim() || !lv.value) return er.textContent = 'Add your university and level.';
    btn.disabled = true; er.textContent = '';
    const { data, error } = await sb.auth.signUp({ email: e, password: pw.value, options: { data: { university: uni.value.trim(), level: lv.value } } });
    btn.disabled = false;
    if (error) return er.textContent = friendly(error);
    if (data.session) signedIn(data.session.user); else verify(e);
  } });
  box(h('p', { className: 'muted', textContent: 'Create your account to get started.' }), h('div', { className: 'f' }, em, pw, uni, lv), btn, er, link('I already have an account', login));
}

function verify(email) {
  const code = inp('text', 'Code from your email', 'one-time-code', { inputMode: 'numeric', maxLength: 10 }), er = msg();
  const btn = h('button', { className: 'primary', textContent: 'Verify', onclick: async () => {
    btn.disabled = true; er.textContent = '';
    const { data, error } = await sb.auth.verifyOtp({ email, token: code.value.trim(), type: 'signup' });
    btn.disabled = false;
    if (error) return er.textContent = friendly(error);
    signedIn(data.session.user);
  } });
  box(h('p', { className: 'muted', textContent: `We sent a code to ${email}. Enter it to confirm your email.` }), h('div', { className: 'f' }, code), btn, er,
    link('Send the code again', async () => { const { error } = await sb.auth.resend({ type: 'signup', email }); er.textContent = error ? friendly(error) : 'A new code is on its way.'; }),
    link('Back', signup));
}

function login() {
  const em = inp('email', 'Email', 'email'), pw = inp('password', 'Password', 'current-password'), er = msg();
  const btn = h('button', { className: 'primary', textContent: 'Log in', onclick: async () => {
    const e = em.value.trim(); if (!isEmail(e) || !pw.value) return er.textContent = 'Enter your email and password.';
    btn.disabled = true; er.textContent = '';
    const { data, error } = await sb.auth.signInWithPassword({ email: e, password: pw.value });
    btn.disabled = false;
    if (error) {
      if (/not confirmed/i.test(error.message)) { await sb.auth.resend({ type: 'signup', email: e }); return verify(e); }
      return er.textContent = friendly(error);
    }
    signedIn(data.user);
  } });
  box(h('p', { className: 'muted', textContent: 'Welcome back.' }), h('div', { className: 'f' }, em, pw), btn, er, link('Forgot password?', forgot), link('Create an account', signup));
}

function forgot() {
  const em = inp('email', 'Email', 'email'), er = msg();
  const btn = h('button', { className: 'primary', textContent: 'Send reset code', onclick: async () => {
    const e = em.value.trim(); if (!isEmail(e)) return er.textContent = 'Enter a valid email address.';
    btn.disabled = true; const { error } = await sb.auth.resetPasswordForEmail(e); btn.disabled = false;
    if (error) return er.textContent = friendly(error);
    reset(e);
  } });
  box(h('p', { className: 'muted', textContent: 'We will email you a code to set a new password.' }), h('div', { className: 'f' }, em), btn, er, link('Back to log in', login));
}

function reset(email) {
  const code = inp('text', 'Code from your email', 'one-time-code', { inputMode: 'numeric', maxLength: 10 }), pw = inp('password', 'New password (8+ characters)', 'new-password'), er = msg();
  const btn = h('button', { className: 'primary', textContent: 'Set new password', onclick: async () => {
    if (pw.value.length < 8) return er.textContent = 'Password must be at least 8 characters.';
    btn.disabled = true; er.textContent = '';
    const v = await sb.auth.verifyOtp({ email, token: code.value.trim(), type: 'recovery' });
    if (v.error) { btn.disabled = false; return er.textContent = friendly(v.error); }
    const u = await sb.auth.updateUser({ password: pw.value }); btn.disabled = false;
    if (u.error) return er.textContent = friendly(u.error);
    signedIn(v.data.session.user);
  } });
  box(h('p', { className: 'muted', textContent: `Enter the code we sent to ${email} and choose a new password.` }), h('div', { className: 'f' }, code, pw), btn, er, link('Back to log in', login));
}

async function loadProfile() {
  try {
    const { data } = await sb.from('profiles').select('email,university,level,avatar').eq('id', user.id).maybeSingle();
    if (!data) return;
    Object.assign(cache(), { email: data.email || user.email, uni: data.university || '', level: data.level || '', pic: data.avatar || '' });
    MS().save(); Menu.paintAvatar();
  } catch {}
}

function signedIn(u) {
  const d = MS().data;
  if (d.owner && d.owner !== u.id) {          // a different person logged in on this phone: start clean
    localStorage.removeItem('medathon.studymode.v2'); indexedDB.deleteDatabase('medathon-lib'); return location.reload();
  }
  user = u; d.owner = u.id; cache().email = cache().email || u.email; MS().save();
  if (gate) { gate.remove(); gate = null; }
  Menu.paintAvatar(); loadProfile();
}

window.Auth = {
  get user() { return user; },
  async updateProfile(patch) {
    const { error } = await sb.from('profiles').update({ university: patch.uni, level: patch.level, avatar: patch.pic === undefined ? undefined : (patch.pic || null), updated_at: new Date().toISOString() }).eq('id', user.id);
    if (error) throw error;
    Object.assign(cache(), patch); MS().save();
  },
  async changePassword(pw) { const { error } = await sb.auth.updateUser({ password: pw }); if (error) throw error; },
  async signOut() { await sb.auth.signOut(); location.reload(); }
};

if (!ok) {
  box(h('p', { className: 'muted', textContent: 'Accounts are not set up yet. Add your Supabase details in config.js (see SETUP.md).' }),
    h('button', { className: 'ghost', textContent: 'Continue without an account (testing only)', onclick: () => { gate.remove(); gate = null; } }));
} else {
  box(h('p', { className: 'muted', textContent: 'Loading…' }));
  sb.auth.getSession().then(({ data }) => data.session ? signedIn(data.session.user) : signup()).catch(signup);
  sb.auth.onAuthStateChange(ev => { if (ev === 'SIGNED_OUT' && user) location.reload(); });
}
})();
