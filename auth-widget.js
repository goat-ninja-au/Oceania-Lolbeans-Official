// Oceania LOLBeans Official: "Log in / Sign up" in the top-right corner of every page.
// Signed out: Log in + Sign up buttons open a small pop-up that walks through the whole sign-up
// (Google or email -> confirm email -> pick a username + link your ranking).
// Signed in: your picture + a small menu (Community, My ranking, Sign out).
const FIREBASE = {
  apiKey: "AIzaSyBNKv8QM7kR4Y_yA0djMPo87y7fqw2jseA",
  authDomain: "oceania-lolbeans.firebaseapp.com",
  databaseURL: "https://oceania-lolbeans-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "oceania-lolbeans",
  appId: "1:186827295273:web:530769127fde65c829ea38"
};
const SDK = "https://www.gstatic.com/firebasejs/10.12.2/";
const RANKINGS_CSV = "https://docs.google.com/spreadsheets/d/1YvEz4x895BCXkqYMpjMuMLij_cuPH6Lndmhr36V_jmo/gviz/tq?tqx=out:csv&gid=0";
const PHOTOS_CSV = "https://docs.google.com/spreadsheets/d/12D4wvMVKNqAoot5Ytk2ttgE-CZPNSUCPfktiAiGIE6w/gviz/tq?tqx=out:csv&sheet=Photos";
const BAD = ["fuck", "shit", "bitch", "cunt", "dick", "pussy", "nigger", "nigga", "faggot", "fag", "retard", "slut", "whore", "porn", "sex"];
const ON_COMMUNITY = /community\.html$/.test(location.pathname);

const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const COLORS = ["#1478c2", "#2f9e08", "#7a5cf0", "#d99a00", "#d9505c", "#0f9aa8", "#c27a3a", "#4b5bdc", "#b0479a"];
const color = n => { let h = 0; for (const ch of String(n)) h = (h * 31 + ch.codePointAt(0)) >>> 0; return COLORS[h % COLORS.length]; };
const badRe = BAD.map(w => new RegExp("(?<![a-z])" + w.split("").join("[\\W_]*"), "gi"));
const isBad = s => badRe.some(r => { r.lastIndex = 0; return r.test(s); });
function parseCSV(s) {
  const rows = []; let row = [], f = "", q = false;
  for (let i = 0; i < s.length; i++) { const c = s[i];
    if (q) { if (c === '"') { if (s[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true; else if (c === ",") { row.push(f); f = ""; } else if (c === "\n") { row.push(f); rows.push(row); row = []; f = ""; } else if (c !== "\r") f += c; }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows;
}

// ---------- styles (use each page's own colours, with fallbacks) ----------
const css = `
.olb-acct { display: inline-flex; align-items: center; gap: 6px; position: relative; flex: none; }
.olb-acct.corner { position: absolute; z-index: 5; }
.olb-acct .ab { height: 40px; padding: 0 14px; border-radius: 10px; font: inherit; font-weight: 700; font-size: .92rem; cursor: pointer; border: 1px solid var(--line, #98c5e2); background: var(--panel, #fff); color: var(--text, #0c2a43); white-space: nowrap; }
.olb-acct .ab.primary { background: var(--blue, #1478c2); border-color: var(--blue, #1478c2); color: #fff; }
.olb-acct .ab:hover { filter: brightness(1.05); border-color: var(--blue, #1478c2); }
.olb-acct .chip { display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 10px 0 4px; border-radius: 999px; border: 1px solid var(--line, #98c5e2); background: var(--panel, #fff); color: var(--text, #0c2a43); font: inherit; font-weight: 700; font-size: .9rem; cursor: pointer; max-width: 190px; }
.olb-acct .chip span.n { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.olb-av { width: 32px; height: 32px; border-radius: 50%; display: inline-grid; place-items: center; color: #fff; font-weight: 800; font-size: .85rem; background-size: cover; background-position: center; flex: none; }
.olb-menu { position: absolute; right: 0; top: calc(100% + 8px); min-width: 210px; background: var(--panel, #fff); color: var(--text, #0c2a43); border: 1px solid var(--line, #98c5e2); border-radius: 12px; box-shadow: 0 14px 34px rgba(7,17,28,.22); padding: 6px; z-index: 60; display: grid; }
.olb-menu .who { padding: 8px 10px 10px; border-bottom: 1px solid var(--line, #98c5e2); margin-bottom: 4px; font-size: .85rem; }
.olb-menu .who b { display: block; font-size: .95rem; }
.olb-menu a, .olb-menu button { text-align: left; padding: 9px 10px; border-radius: 8px; text-decoration: none; color: inherit; font: inherit; font-size: .92rem; font-weight: 600; background: none; border: 0; cursor: pointer; }
.olb-menu a:hover, .olb-menu button:hover { background: var(--soft, rgba(20,120,194,.08)); }
.olb-dlg-wrap { position: fixed; inset: 0; z-index: 90; background: rgba(7,17,28,.55); display: grid; place-items: center; padding: 16px; }
.olb-dlg { position: relative; width: min(400px, 100%); max-height: calc(100vh - 32px); overflow-y: auto; background: var(--panel, #fff); color: var(--text, #0c2a43); border: 1px solid var(--line, #98c5e2); border-radius: 16px; padding: 24px; display: grid; gap: 12px; font-family: inherit; box-shadow: 0 24px 60px rgba(7,17,28,.35); }
.olb-dlg h2 { margin: 0; font-size: 1.35rem; font-weight: 800; line-height: 1.2; }
.olb-dlg p { margin: 0; }
.olb-dlg .x { position: absolute; right: 12px; top: 10px; background: none; border: 0; font-size: 1.4rem; color: var(--muted, #3a5a73); cursor: pointer; }
.olb-dlg .steps { display: flex; gap: 6px; }
.olb-dlg .steps i { flex: 1; height: 4px; border-radius: 4px; background: var(--line, #98c5e2); }
.olb-dlg .steps i.on { background: var(--blue, #1478c2); }
.olb-dlg .sub { color: var(--muted, #3a5a73); font-size: .9rem; }
.olb-dlg label { display: grid; gap: 4px; font-size: .85rem; font-weight: 700; }
.olb-dlg input { font: inherit; color: inherit; background: var(--soft, #eef7fd); border: 1px solid var(--line, #98c5e2); border-radius: 10px; padding: 10px 12px; width: 100%; box-sizing: border-box; }
.olb-dlg .btnx { display: inline-flex; align-items: center; justify-content: center; gap: 8px; font: inherit; font-weight: 700; padding: 11px 16px; border-radius: 10px; border: 1px solid var(--line, #98c5e2); background: var(--panel, #fff); color: inherit; cursor: pointer; width: 100%; box-sizing: border-box; }
.olb-dlg .btnx.primary { background: var(--blue, #1478c2); border-color: var(--blue, #1478c2); color: #fff; }
.olb-dlg .btnx.google { background: #fff; color: #1f1f1f; border-color: #dadce0; }
.olb-dlg .btnx:disabled { opacity: .55; cursor: default; }
.olb-dlg .or { display: flex; align-items: center; gap: 10px; color: var(--muted, #3a5a73); font-size: .82rem; }
.olb-dlg .or::before, .olb-dlg .or::after { content: ""; flex: 1; border-top: 1px solid var(--line, #98c5e2); }
.olb-dlg .small { font-size: .82rem; color: var(--muted, #3a5a73); }
.olb-dlg .lnk { background: none; border: 0; padding: 0; color: var(--blue, #1478c2); font: inherit; font-weight: 700; cursor: pointer; }
.olb-dlg .err { color: #c0352b; font-weight: 700; }
.olb-dlg .ok { color: #22a447; font-weight: 700; }
.olb-dlg .row2 { display: flex; gap: 8px; }
.olb-dlg .row2 .btnx { width: auto; flex: 1; }
.olb-dlg ul { margin: 0; padding-left: 18px; color: var(--muted, #3a5a73); font-size: .88rem; display: grid; gap: 4px; }
@media (max-width: 760px) {
  .olb-acct .ab.login { display: none; }
  .olb-acct .ab { padding: 0 11px; font-size: .86rem; }
  .olb-acct .chip { padding: 0 3px; border-radius: 50%; width: 40px; justify-content: center; }
  .olb-acct .chip span.n, .olb-acct .chip .car { display: none; }
}
`;
const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

// ---------- put the widget at the far right of the top bar ----------
const modeBtn = document.getElementById("mode");
if (modeBtn) {
  const box = document.createElement("div");
  box.className = "olb-acct"; box.id = "olb-acct";
  modeBtn.insertAdjacentElement("afterend", box);
  // Desktop: when the menu wraps under the logo, pin the buttons to the top-right corner of the logo row.
  const wrapEl = modeBtn.closest(".wrap") || modeBtn.parentElement, brand = wrapEl.querySelector(".brand");
  const place = () => {
    box.classList.remove("corner"); box.style.top = box.style.right = "";
    if (window.innerWidth <= 760 || !brand) return;
    const nav = wrapEl.querySelector('nav[aria-label="Main"]');
    if (nav && Math.abs(nav.getBoundingClientRect().top - brand.getBoundingClientRect().top) < 20) return;   // all on one line already
    const cs = getComputedStyle(wrapEl);
    wrapEl.style.position = "relative";
    box.classList.add("corner");
    box.style.right = cs.paddingRight;
    box.style.top = (brand.offsetTop + (brand.offsetHeight - 40) / 2) + "px";
  };
  place(); window.addEventListener("resize", place); new MutationObserver(() => requestAnimationFrame(place)).observe(box, { childList: true });
  init(box);
}

async function init(box) {
  let A, L, auth, db, user = null, profile = null, RANK = [], RANKSET = {}, PHOTOS = {}, creating = true, ranksLoaded = false;
  const G = '<svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.2l7.9 6.2C12.5 13.5 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.3 5.7c4.3-3.9 7-9.8 7-17.1z"/><path fill="#FBBC05" d="M10.6 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6l-7.9-6.2A24 24 0 0 0 0 24c0 3.9.9 7.5 2.7 10.8l7.9-6.2z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.7c-2 1.4-4.7 2.3-8.6 2.3-6.2 0-11.5-4-13.4-9.6l-7.9 6.2C6.6 42.6 14.6 48 24 48z"/></svg>';

  // quick first paint (before Firebase loads) so the corner never jumps
  const cached = (() => { try { return JSON.parse(localStorage.getItem("olb-acct") || "null"); } catch (e) { return null; } })();
  drawSignedOut(); if (cached && cached.name) drawChip(cached);

  try {
    // same app + sign-in as the Community page (the full database library there, the small one elsewhere)
    const [app, a, l] = await Promise.all([import(SDK + "firebase-app.js"), import(SDK + "firebase-auth.js"), import(SDK + (ON_COMMUNITY ? "firebase-firestore.js" : "firebase-firestore-lite.js"))]);
    A = a; L = l;
    const fapp = app.getApps().length ? app.getApp() : app.initializeApp(FIREBASE);
    auth = a.getAuth(fapp); db = l.getFirestore(fapp);
  } catch (e) {}   // offline: keep the buttons, they just won't sign in

  if (auth) A.onAuthStateChanged(auth, async u => {
    user = u && !u.isAnonymous ? u : null; profile = null;
    if (!user) { save(null); drawSignedOut(); return; }
    if (needsVerify()) { drawSignedOut(); if (dlgOpen()) stepVerify(); return; }
    try { const s = await L.getDoc(L.doc(db, "users", user.uid)); profile = s.exists() ? s.data() : null; } catch (e) {}
    if (!profile) { drawSignedOut(true); if (dlgOpen() || sessionStorage.getItem("olb-setup")) openDlg(stepSetup); return; }
    loadPhotos().then(() => drawChip(chipData()));
    drawChip(chipData()); save(chipData());
    if (dlgOpen()) stepDone();
  });

  function save(d) { try { if (d) localStorage.setItem("olb-acct", JSON.stringify(d)); else localStorage.removeItem("olb-acct"); } catch (e) {} }
  function needsVerify() { return user && !user.emailVerified && !user.providerData.some(p => p.providerId === "google.com"); }
  function chipData() { const pl = (profile.player || "").toLowerCase(); return { name: profile.name, player: profile.player || "", photo: (pl && PHOTOS[pl]) || profile.photo || "" }; }
  function av(d) { return '<span class="olb-av" style="background-color:' + color(d.name) + (d.photo ? ";background-image:url('" + esc(d.photo) + "')" : "") + '">' + (d.photo ? "" : esc((Array.from(d.name || "?")[0] || "?").toUpperCase())) + "</span>"; }

  // ---------- corner ----------
  function drawSignedOut(unfinished) {
    if (ON_COMMUNITY && !unfinished) { box.innerHTML = ""; return; }   // the Community page has its own sign-in
    box.innerHTML = unfinished
      ? '<button class="ab primary" type="button" data-a="finish">Finish sign-up</button>'
      : '<button class="ab login" type="button" data-a="login">Log in</button><button class="ab primary" type="button" data-a="signup">Sign up</button>';
  }
  function drawChip(d) {
    box.innerHTML = '<button class="chip" type="button" data-a="menu" aria-haspopup="true" aria-expanded="false" title="Your account">' + av(d) + '<span class="n">' + esc(d.name) + '</span><span class="car">▾</span></button>';
  }
  function openMenu() {
    const old = box.querySelector(".olb-menu"); if (old) { old.remove(); box.querySelector(".chip").setAttribute("aria-expanded", "false"); return; }
    const d = profile ? chipData() : cached || { name: "" };
    const m = document.createElement("div"); m.className = "olb-menu"; m.setAttribute("role", "menu");
    m.innerHTML = '<div class="who"><b>' + esc(d.name) + "</b>" + (d.player ? esc(d.player) : "Not linked to the rankings") + "</div>" +
      '<a href="community.html" role="menuitem">💬 Community</a>' +
      (d.player ? '<a href="rankings.html?player=' + encodeURIComponent(d.player) + '" role="menuitem">🏆 My ranking</a>' : "") +
      '<a href="community.html#profile" role="menuitem">✏️ Edit profile</a>' +
      '<button type="button" data-a="signout" role="menuitem">↪ Sign out</button>';
    box.appendChild(m); box.querySelector(".chip").setAttribute("aria-expanded", "true");
  }
  document.addEventListener("click", e => { if (!box.contains(e.target)) { const m = box.querySelector(".olb-menu"); if (m) m.remove(); } });
  box.addEventListener("click", async e => {
    const b = e.target.closest("[data-a]"); if (!b) return;
    const a = b.dataset.a;
    if (a === "login") { creating = false; openDlg(stepStart); }
    else if (a === "signup") { creating = true; openDlg(stepStart); }
    else if (a === "finish") openDlg(needsVerify() ? stepVerify : stepSetup);
    else if (a === "menu") openMenu();
    else if (a === "signout") { if (auth) await A.signOut(auth); save(null); if (ON_COMMUNITY) location.reload(); }
  });

  // ---------- pop-up ----------
  let wrap = null;
  const dlgOpen = () => !!(wrap && wrap.isConnected);
  function openDlg(step) {
    if (!auth && !/olb-demo/.test(location.hash)) { alert("Sign-in isn't available right now. Check your connection and refresh."); return; }
    if (!dlgOpen()) {
      wrap = document.createElement("div"); wrap.className = "olb-dlg-wrap";
      wrap.innerHTML = '<div class="olb-dlg" role="dialog" aria-modal="true" aria-labelledby="olb-t"></div>';
      wrap.addEventListener("click", e => { if (e.target === wrap || e.target.closest(".x")) closeDlg(); });
      document.body.appendChild(wrap);
      document.addEventListener("keydown", esc1);
    }
    step();
  }
  function esc1(e) { if (e.key === "Escape") closeDlg(); }
  function closeDlg() { if (wrap) wrap.remove(); wrap = null; document.removeEventListener("keydown", esc1); }
  const dlg = () => wrap.querySelector(".olb-dlg");
  const steps = n => '<div class="steps" aria-label="Step ' + n + ' of 3"><i class="' + (n >= 1 ? "on" : "") + '"></i><i class="' + (n >= 2 ? "on" : "") + '"></i><i class="' + (n >= 3 ? "on" : "") + '"></i></div>';
  const X = '<button class="x" type="button" aria-label="Close">×</button>';

  function stepStart() {
    dlg().innerHTML = X + (creating ? steps(1) : "") +
      '<h2 id="olb-t">' + (creating ? "Join the Oceania community" : "Welcome back") + "</h2>" +
      (creating ? '<p class="sub">Make a free account to chat, add friends, send DMs, make group chats and call people.</p>' : '<p class="sub">Log in to your Oceania LOLBeans account.</p>') +
      '<button class="btnx google" type="button" id="olb-g">' + G + "Continue with Google</button>" +
      '<div class="or">or use your email</div>' +
      '<form id="olb-f" style="display:grid;gap:10px">' +
      '<label>Email<input type="email" id="olb-em" autocomplete="email" required></label>' +
      '<label>Password<input type="password" id="olb-pw" minlength="6" autocomplete="' + (creating ? "new-password" : "current-password") + '" required></label>' +
      '<button class="btnx primary" type="submit" id="olb-go">' + (creating ? "Create account" : "Log in") + "</button></form>" +
      '<p class="small">' + (creating ? 'Already have an account? <button class="lnk" type="button" id="olb-sw">Log in</button>' : 'New here? <button class="lnk" type="button" id="olb-sw">Sign up</button> · <button class="lnk" type="button" id="olb-fp">Forgot password</button>') + "</p>" +
      '<p id="olb-msg" class="small" aria-live="polite"></p>' +
      (creating ? '<ul><li>Step 1: sign in with Google or an email</li><li>Step 2: confirm your email (Google skips this)</li><li>Step 3: pick your username and link your ranking</li></ul><p class="small">Be kind. Bullying, spam or anything inappropriate gets you banned.</p>' : "");
    const msg = h => { dlg().querySelector("#olb-msg").innerHTML = h; };
    dlg().querySelector("#olb-sw").onclick = () => { creating = !creating; stepStart(); };
    const fp = dlg().querySelector("#olb-fp");
    if (fp) fp.onclick = async () => { const em = dlg().querySelector("#olb-em").value.trim(); if (!em) { msg('<span class="err">Type your email first.</span>'); return; } try { await A.sendPasswordResetEmail(auth, em); } catch (e) {} msg('<span class="ok">If that email has an account, a reset link is on its way.</span>'); };
    dlg().querySelector("#olb-g").onclick = async () => {
      sessionStorage.setItem("olb-setup", "1");
      const p = new A.GoogleAuthProvider();
      try { await A.signInWithPopup(auth, p); } catch (e) { if (/popup/.test(e.code || "")) A.signInWithRedirect(auth, p); else msg('<span class="err">Google sign-in didn\'t work. Try again.</span>'); }
    };
    dlg().querySelector("#olb-f").onsubmit = async e => {
      e.preventDefault();
      const em = dlg().querySelector("#olb-em").value.trim(), pw = dlg().querySelector("#olb-pw").value, go = dlg().querySelector("#olb-go");
      go.disabled = true; msg("");
      try {
        sessionStorage.setItem("olb-setup", "1");
        if (creating) { const c = await A.createUserWithEmailAndPassword(auth, em, pw); await A.sendEmailVerification(c.user); stepVerify(); }
        else await A.signInWithEmailAndPassword(auth, em, pw);
      } catch (err) {
        const c = err.code || "";
        msg('<span class="err">' + (c.includes("email-already") ? "That email already has an account. Log in instead." : c.includes("weak-password") ? "Use at least 6 characters for your password." : c.includes("invalid-email") ? "That email doesn't look right." : c.includes("invalid") || c.includes("wrong") || c.includes("not-found") ? "Wrong email or password." : c.includes("too-many") ? "Too many tries. Wait a minute and try again." : "That didn't work. Try again.") + "</span>");
      } finally { go.disabled = false; }
    };
  }

  function stepVerify() {
    if (!dlgOpen()) return;
    dlg().innerHTML = X + steps(2) + '<h2 id="olb-t">Check your email</h2><p>We sent a link to <b>' + esc(user ? user.email : "") + '</b>. Open it to confirm your account, then come back here.</p><p class="small">Can\'t see it? Check your spam folder.</p>' +
      '<div class="row2"><button class="btnx primary" type="button" id="olb-done">I\'ve confirmed it</button><button class="btnx" type="button" id="olb-again">Send again</button></div><p id="olb-msg" class="small" aria-live="polite"></p><p class="small"><button class="lnk" type="button" id="olb-out">Use a different account</button></p>';
    const msg = h => { dlg().querySelector("#olb-msg").innerHTML = h; };
    dlg().querySelector("#olb-done").onclick = async () => { await user.reload(); await user.getIdToken(true); if (auth.currentUser.emailVerified) { user = auth.currentUser; stepSetup(); } else msg('<span class="err">Not confirmed yet. Open the link in the email first.</span>'); };
    dlg().querySelector("#olb-again").onclick = async () => { try { await A.sendEmailVerification(user); msg('<span class="ok">Sent. Check your inbox.</span>'); } catch (e) { msg('<span class="err">Wait a minute before sending again.</span>'); } };
    dlg().querySelector("#olb-out").onclick = async () => { await A.signOut(auth); creating = true; stepStart(); };
  }

  async function loadRanks() {
    if (ranksLoaded) return; ranksLoaded = true;
    try {
      const rows = parseCSV(await (await fetch(RANKINGS_CSV)).text()); let started = false;
      for (const r of rows) { const place = String(r[1] || "").trim(), name = String(r[2] || "").trim();
        if (/^\d+$/.test(place) && name && !/record times/i.test(name)) { started = true; RANK.push({ name, place: +place }); RANKSET[name.toLowerCase()] = { name, place: +place }; }
        else if (started && !name) break; }
    } catch (e) {}
  }
  async function loadPhotos() {
    try {
      const rows = parseCSV(await (await fetch(PHOTOS_CSV)).text());
      rows.slice(1).forEach(r => { if (!/^true$/i.test(String(r[4] || "").trim())) return; let nm = String(r[2] || "").trim(); if (!nm || nm[0] === "(") nm = String(r[1] || "").trim(); if (/^https:\/\//.test(r[3] || "")) PHOTOS[nm.toLowerCase()] = String(r[3]).trim(); });
    } catch (e) {}
  }

  async function stepSetup() {
    if (!user) { stepStart(); return; }
    if (needsVerify()) { stepVerify(); return; }
    dlg().innerHTML = X + steps(3) + '<h2 id="olb-t">Set up your profile</h2>' +
      '<form id="olb-s" style="display:grid;gap:10px"><label>Username<input id="olb-un" maxlength="20" placeholder="3 to 20 characters" required></label>' +
      '<label>Are you on the Oceania rankings? (optional)<input id="olb-pl" list="olb-ranks" placeholder="Start typing your rankings name"></label><datalist id="olb-ranks"></datalist>' +
      '<p class="small">Linking shows your rank and a "See ranking" button on your profile. Each ranked name can only be linked to one account. Your username can\'t be changed later.</p>' +
      '<button class="btnx primary" type="submit" id="olb-save">Finish</button></form><p id="olb-msg" class="small" aria-live="polite"></p>';
    dlg().querySelector("#olb-un").value = (user.displayName || "").replace(/[^A-Za-z0-9_ .()-]/g, "").slice(0, 20);
    const msg = h => { dlg().querySelector("#olb-msg").innerHTML = h; };
    loadRanks().then(() => { const dl = wrap && wrap.querySelector("#olb-ranks"); if (dl) dl.innerHTML = RANK.map(p => '<option value="' + esc(p.name) + '">').join(""); });
    dlg().querySelector("#olb-s").onsubmit = async e => {
      e.preventDefault();
      const name = dlg().querySelector("#olb-un").value.trim().replace(/\s+/g, " "), pl = dlg().querySelector("#olb-pl").value.trim();
      if (!/^[A-Za-z0-9_ .()\-]{3,20}$/.test(name)) { msg('<span class="err">Use 3 to 20 letters, numbers, spaces or _ . ( ) -</span>'); return; }
      if (isBad(name)) { msg('<span class="err">Pick a different username.</span>'); return; }
      await loadRanks();
      const player = pl ? (RANKSET[pl.toLowerCase()] || {}).name : "";
      if (pl && !player) { msg('<span class="err">That name isn\'t on the rankings. Pick it from the list, or leave it empty.</span>'); return; }
      const sv = dlg().querySelector("#olb-save"); sv.disabled = true;
      const b = L.writeBatch(db);
      b.set(L.doc(db, "usernames", name.toLowerCase()), { uid: user.uid });
      if (player) b.set(L.doc(db, "playerClaims", player.toLowerCase()), { uid: user.uid });
      b.set(L.doc(db, "users", user.uid), { name, nameLower: name.toLowerCase(), photo: user.photoURL || "", player: player || "", playerLower: (player || "").toLowerCase(), createdAt: L.serverTimestamp(), lastSeen: L.serverTimestamp() });
      try {
        await b.commit();
        profile = { name, player: player || "", playerLower: (player || "").toLowerCase(), photo: user.photoURL || "" };
        sessionStorage.removeItem("olb-setup"); save(chipData()); drawChip(chipData()); stepDone();
      } catch (err) {
        const taken = await L.getDoc(L.doc(db, "usernames", name.toLowerCase())).then(s => s.exists()).catch(() => false);
        const claimed = player ? await L.getDoc(L.doc(db, "playerClaims", player.toLowerCase())).then(s => s.exists()).catch(() => false) : false;
        msg('<span class="err">' + (taken ? "That username is taken." : claimed ? "That rankings name is already linked to another account. Message the server owner if it's yours." : "Couldn't save. Try again.") + "</span>");
      } finally { sv.disabled = false; }
    };
  }

  function stepDone() {
    sessionStorage.removeItem("olb-setup");
    if (!dlgOpen()) return;
    const d = chipData();
    dlg().innerHTML = X + '<div style="display:grid;justify-items:center;gap:10px;text-align:center">' + av(d).replace('class="olb-av"', 'class="olb-av" style="width:64px;height:64px;font-size:1.5rem"').replace('style="width:64px;height:64px;font-size:1.5rem" style="', 'style="width:64px;height:64px;font-size:1.5rem;') +
      '<h2 id="olb-t">You\'re in, ' + esc(d.name) + "!</h2><p class=\"sub\">Say hi in the main chat, add friends and set up your profile.</p></div>" +
      (ON_COMMUNITY ? '<button class="btnx primary" type="button" id="olb-go2">Start chatting</button>' : '<a class="btnx primary" href="community.html" style="text-decoration:none">Go to Community</a>') +
      '<button class="btnx" type="button" id="olb-stay">' + (ON_COMMUNITY ? "Close" : "Stay on this page") + "</button>";
    const go2 = dlg().querySelector("#olb-go2"); if (go2) go2.onclick = () => location.reload();
    dlg().querySelector("#olb-stay").onclick = () => { closeDlg(); if (ON_COMMUNITY) location.reload(); };
  }

  // came back from a Google redirect sign-in: carry on with the steps
  if (auth && sessionStorage.getItem("olb-setup")) { try { await A.getRedirectResult(auth); } catch (e) {} }
}
