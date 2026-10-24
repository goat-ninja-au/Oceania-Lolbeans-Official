/* Oceania LOLBeans – shared top bar
   Upgrades the header on every page: glass bar, Rankings ▾ / Community ▾ menus, a neon underline
   on the current tab, a LIVE dot when the community chat is active, instant search (press / ),
   and a grouped menu on phones. Add to a page with:  <script src="site-nav.js?v=1" defer></script> */
(function () {
  "use strict";
  var header = document.querySelector("header .brand") && document.querySelector("header .brand").closest("header");
  if (!header || header.classList.contains("olbx")) return;
  var wrap = header.querySelector(".wrap") || header;

  var SHEET = "https://docs.google.com/spreadsheets/d/1YvEz4x895BCXkqYMpjMuMLij_cuPH6Lndmhr36V_jmo/gviz/tq?tqx=out:csv&gid=0";
  var FS = "https://firestore.googleapis.com/v1/projects/oceania-lolbeans/databases/(default)/documents/messages?orderBy=createdAt%20desc&pageSize=1&key=AIzaSyBNKv8QM7kR4Y_yA0djMPo87y7fqw2jseA";
  var MAPS = ["Beacon Bay", "Boulder Hill", "Circus Contest", "Devil's Trick", "Escape Tsunami", "Dash Cup", "Lava Lake", "Gravity Gates", "Hammer Ville", "Jungle Temple", "Kittie Kegs", "Mecha Maze", "Mill Valley", "Monster Manor", "Nasty Seals", "Neon City", "Polar Path", "1-2-3 Red Light", "Rickety Run", "Risky Cliffs", "Shark Park", "Silly Slide", "Spiky Slopes", "Splash Dash", "Tricky Traps", "Tumble Town", "UFO Attack"];
  // [icon, title, description, link, isNew, search words]
  var G = [
    { id: "home", label: "Home", href: "index.html", icon: "🏠" },
    { id: "rank", label: "Rankings", items: [
      ["🏆", "Rankings", "Every Oceania player, ranked by total time", "rankings.html", false, "leaderboard list total"],
      ["👥", "Players", "Player cards, profiles and tracking", "players.html", true, "profiles cards everyone"],
      ["⏱️", "Records", "Oceania and world records on every map", "rankings.html?s=records", false, "or wr world record"],
      ["🗺️", "Map Records", "Top times on each of the 27 maps", "rankings.html?s=maps", false, "maps best times"],
      ["👑", "Hall of Fame", "Legends and past champions", "rankings.html?s=fame", false, "legends champions history"]] },
    { id: "acad", label: "Academy", href: "academy.html", icon: "🎓", words: "tutorials guides learn" },
    { id: "tour", label: "Tournaments", href: "index.html#tournaments", icon: "🏟️", words: "championships events comp" },
    { id: "comm", label: "Community", items: [
      ["💬", "Chat", "Talk with the Oceania community", "community.html", false, "community messages dm friends"],
      ["📰", "News", "Updates, results and announcements", "news.html", false, "updates announcements"],
      ["🤝", "Join", "Get into the Discord server", "join.html", false, "discord invite server"],
      ["📝", "Apply", "Get ranked, or update your times", "apply.html", false, "application ranked pb update"],
      ["📱", "Get the app", "Install the website as an app", "app.html", false, "install phone pwa"]] }
  ];

  // ---------- which tab is this page? ----------
  var file = (location.pathname.split("/").pop() || "index.html").toLowerCase(), qs = new URLSearchParams(location.search), sec = qs.get("s") || "";
  function activeGroup() {
    if (/^(rankings|rankings-test|players|applications)\.html$/.test(file)) return "rank";
    if (/^(community|chat|news|join|apply|app)\.html$/.test(file)) return "comm";
    if (file === "academy.html") return "acad";
    if (file === "index.html" && location.hash === "#tournaments") return "tour";
    if (file === "index.html" || file === "") return "home";
    return "";
  }
  function activeItem(href) {
    var f = href.split("?")[0], s = (href.split("s=")[1] || "");
    if (f !== file && !(f === "rankings.html" && file === "rankings-test.html")) return false;
    if (f === "rankings.html") return s === sec || (!s && (sec === "" || sec === "list"));
    return true;
  }
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var SVG_S = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>';

  // ---------- styles ----------
  var css = [
    "html{--nv:#2f9e1c;--nv-glow:rgba(47,158,28,.45);--gl-bg:rgba(255,255,255,.66);--gl-line:rgba(20,120,194,.22);--gl-text:#0c2a43;--gl-sub:#4d6f88;--gl-pop:rgba(255,255,255,.97);--gl-hl:rgba(47,158,28,.10);--gl-btn:rgba(255,255,255,.75)}",
    "header.olbx{position:sticky;top:0;z-index:60;background:transparent!important;border:0!important;box-shadow:none!important;padding:10px 12px 0!important;margin:0!important}",
    "html[data-mode=dark]{--nv:#9bf04a;--nv-glow:rgba(155,240,74,.7);--gl-bg:rgba(10,24,38,.62);--gl-line:rgba(255,255,255,.13);--gl-text:#e6f1f9;--gl-sub:#8fb0c6;--gl-pop:rgba(13,29,44,.97);--gl-hl:rgba(155,240,74,.10);--gl-btn:rgba(255,255,255,.06)}",
    "header.olbx>.wrap{max-width:1240px!important;margin:0 auto!important;display:flex!important;flex-wrap:nowrap!important;align-items:center!important;justify-content:flex-start!important;gap:14px!important;padding:8px 10px 8px 14px!important;border-radius:18px;background:var(--gl-bg);-webkit-backdrop-filter:blur(16px) saturate(1.4);backdrop-filter:blur(16px) saturate(1.4);border:1px solid var(--gl-line);box-shadow:0 12px 32px rgba(7,17,28,.16);color:var(--gl-text);position:relative;min-height:0!important}",
    "header.olbx .brand{flex:none;white-space:nowrap;color:var(--gl-text)!important;margin-right:0!important}",
    "header.olbx nav.olb-oldnav,header.olbx #menu,header.olbx .head-right{display:none!important}",
    "header.olbx .olb-tabs{display:flex;flex-wrap:nowrap;align-items:center;gap:2px;flex:none;position:relative;margin-left:4px}",
    "header.olbx .olb-it{position:relative}",
    ".olb-tab{position:relative;display:flex;align-items:center;gap:6px;padding:9px 13px;border-radius:12px;font-family:inherit;font-weight:700;font-size:15px;line-height:1.2;color:var(--gl-text);opacity:.86;text-decoration:none!important;background:none;border:0;cursor:pointer;white-space:nowrap}",
    ".olb-tab:hover,.olb-tab[aria-expanded=true]{opacity:1;background:var(--gl-btn)}",
    ".olb-tab.on{opacity:1;background:var(--gl-hl)}",
    ".olb-tab .chev{width:7px;height:7px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:translateY(-2px) rotate(45deg);opacity:.6;margin-left:2px;transition:transform .15s}",
    ".olb-tab[aria-expanded=true] .chev{transform:translateY(1px) rotate(-135deg)}",
    ".olb-ink{position:absolute;bottom:-1px;height:3px;border-radius:3px;background:var(--nv);box-shadow:0 0 10px var(--nv-glow),0 0 22px var(--nv-glow);transition:left .22s ease,width .22s ease,opacity .2s;pointer-events:none}",
    ".olb-live{display:inline-flex;align-items:center;gap:5px;font-size:10.5px;font-weight:900;letter-spacing:.06em;color:#ff5d5d;background:rgba(255,93,93,.13);border-radius:999px;padding:2px 7px}",
    ".olb-live:before{content:'';width:6px;height:6px;border-radius:50%;background:#ff5d5d;box-shadow:0 0 8px #ff5d5d;animation:olbpulse 1.6s infinite}",
    "@keyframes olbpulse{50%{opacity:.35}}",
    ".olb-menu{position:absolute;top:calc(100% + 12px);left:-8px;width:400px;max-width:calc(100vw - 24px);background:var(--gl-pop);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);border:1px solid var(--gl-line);border-radius:16px;padding:8px;box-shadow:0 24px 50px rgba(7,17,28,.35);display:grid;gap:2px;z-index:70}",
    ".olb-menu[hidden]{display:none}",
    ".olb-menu a{display:grid;grid-template-columns:42px 1fr auto;gap:12px;align-items:center;padding:8px 10px;border-radius:12px;color:var(--gl-text)!important;text-decoration:none!important}",
    ".olb-menu a:hover,.olb-menu a:focus-visible{background:var(--gl-btn);outline:none}",
    ".olb-menu a.on{background:var(--gl-hl);box-shadow:inset 3px 0 0 var(--nv)}",
    ".olb-menu .e{width:42px;height:42px;border-radius:11px;background:var(--gl-btn);border:1px solid var(--gl-line);display:grid;place-items:center;font-size:20px}",
    ".olb-menu b{display:block;font-size:15px}.olb-menu small{display:block;color:var(--gl-sub);font-size:13px;line-height:1.3}",
    ".olb-new{font-size:10px;font-weight:900;color:#0b1622;background:var(--nv);border-radius:999px;padding:2px 7px}",
    "header.olbx .olb-right{display:flex;align-items:center;gap:8px;margin-left:auto;flex:none}",
    ".olb-sbtn{display:flex;align-items:center;gap:9px;height:40px;padding:0 9px 0 12px;border-radius:12px;border:1px solid var(--gl-line);background:var(--gl-btn);color:var(--gl-sub);font-family:inherit;font-weight:500;font-size:14px;width:180px;cursor:pointer}",
    ".olb-sbtn svg,.olb-sp svg{width:17px;height:17px;stroke:var(--nv);fill:none;stroke-width:2.4;stroke-linecap:round;flex:none}",
    ".olb-sbtn kbd{margin-left:auto;font-family:inherit;font-weight:700;font-size:11px;border:1px solid var(--gl-line);border-radius:5px;padding:0 6px;color:var(--gl-sub)}",
    "header.olbx .olb-right .mode,.olb-burger{width:40px;height:40px;border-radius:12px!important;border:1px solid var(--gl-line)!important;background:var(--gl-btn)!important;color:var(--gl-text)!important;display:grid!important;place-items:center;padding:0!important;font-size:17px;cursor:pointer;flex:none}",
    ".olb-burger{display:none!important}",
    "header.olbx .olb-acct.corner{position:static!important}",
    // search panel
    ".olb-sov{position:fixed;inset:0;z-index:80;background:rgba(5,12,20,.35)}",
    ".olb-sov[hidden]{display:none}",
    ".olb-sp{position:fixed;top:78px;right:max(14px,calc((100vw - 1240px)/2 + 14px));width:440px;max-width:calc(100vw - 20px);max-height:calc(100vh - 100px);overflow:auto;background:var(--gl-pop);border:1px solid var(--gl-line);border-radius:16px;padding:10px;box-shadow:0 24px 50px rgba(7,17,28,.45);color:var(--gl-text)}",
    ".olb-sp .box{display:flex;gap:10px;align-items:center;border:1px solid var(--nv);border-radius:12px;padding:0 12px;box-shadow:0 0 0 3px var(--gl-hl);background:var(--gl-btn)}",
    ".olb-sp input{flex:1;min-width:0;border:0;background:none;outline:none;font-family:inherit;font-weight:500;font-size:16px;color:var(--gl-text);padding:11px 0}",
    ".olb-sp h6{font-size:11px;letter-spacing:.12em;color:var(--gl-sub);margin:12px 6px 4px;text-transform:uppercase}",
    ".olb-r{display:flex;align-items:center;gap:10px;padding:7px 8px;border-radius:10px;font-size:14px;color:var(--gl-text)!important;text-decoration:none!important}",
    ".olb-r.hl{background:var(--gl-hl)}",
    ".olb-r .av{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;color:#fff;font-weight:900;font-size:12px;flex:none}",
    ".olb-r .mp{width:42px;height:28px;border-radius:6px;object-fit:cover;background:var(--gl-btn);flex:none}",
    ".olb-r .pi{width:30px;text-align:center;font-size:18px;flex:none}",
    ".olb-r small{color:var(--gl-sub)}",
    ".olb-r em{margin-left:auto;font-style:normal;color:var(--nv);font-weight:800;font-size:13px;white-space:nowrap}",
    ".olb-sp .none{padding:14px 8px;color:var(--gl-sub);font-size:14px}",
    ".olb-sp .foot{display:flex;gap:14px;color:var(--gl-sub);font-size:12px;border-top:1px solid var(--gl-line);margin-top:8px;padding:8px 6px 2px}",
    ".olb-sp .foot kbd{font-family:inherit;font-weight:700;font-size:11px;border:1px solid var(--gl-line);border-radius:4px;padding:0 5px;margin-right:4px}",
    // phone drawer
    ".olb-drawer{position:absolute;top:calc(100% + 8px);left:0;right:0;max-height:calc(100vh - 100px);overflow:auto;background:var(--gl-pop);border:1px solid var(--gl-line);border-radius:18px;padding:8px;box-shadow:0 20px 40px rgba(7,17,28,.4)}",
    ".olb-drawer[hidden]{display:none}",
    ".olb-drawer h6{font-size:11px;letter-spacing:.12em;color:var(--gl-sub);margin:10px 10px 4px;text-transform:uppercase}",
    ".olb-drawer a{display:flex;align-items:center;gap:10px;padding:11px 10px;border-radius:10px;font-weight:700;font-size:15px;color:var(--gl-text)!important;text-decoration:none!important}",
    ".olb-drawer a.on{background:var(--gl-hl);box-shadow:inset 3px 0 0 var(--nv)}",
    ".olb-drawer a .i{width:28px;text-align:center}",
    "@media (max-width:1480px){.olb-sbtn{width:40px;padding:0;justify-content:center}.olb-sbtn span,.olb-sbtn kbd{display:none}}",
    "@media (max-width:1180px){.olb-tab{padding:9px 9px;font-size:14.5px}header.olbx .brand{font-size:15px}}",
    "@media (max-width:980px){header.olbx .olb-tabs{display:none}.olb-burger{display:grid!important}header.olbx>.wrap{gap:8px!important;padding:7px 8px 7px 10px!important}header.olbx .brand{min-width:0;overflow:hidden;text-overflow:ellipsis;font-size:15px}.olb-sp{top:72px;left:10px;right:10px;width:auto}}",
    "@media (max-width:420px){header.olbx .brand{font-size:0!important}header.olbx .brand img,header.olbx .brand .mark{font-size:14px}header.olbx{padding:8px 8px 0!important}}",
    "@media (prefers-reduced-motion:reduce){.olb-ink{transition:none}.olb-live:before{animation:none}}"
  ].join("\n");
  var st = document.createElement("style"); st.id = "olb-nav-css"; st.textContent = css; document.head.appendChild(st);

  // ---------- build the bar ----------
  header.classList.add("olbx", "olb-top");
  var old = header.querySelector('nav[aria-label="Main"]');
  if (old) { old.classList.add("olb-oldnav"); old.setAttribute("aria-label", "Main (old)"); old.setAttribute("aria-hidden", "true"); }
  var act = activeGroup();
  var tabs = document.createElement("nav"); tabs.className = "olb-tabs"; tabs.setAttribute("aria-label", "Main");
  var th = "";
  G.forEach(function (g) {
    var on = g.id === act ? " on" : "", live = g.id === "comm" ? '<span class="olb-live" hidden>LIVE</span>' : "";
    if (!g.items) { th += '<div class="olb-it"><a class="olb-tab' + on + '" href="' + g.href + '"' + (on ? ' aria-current="page"' : "") + ">" + g.label + "</a></div>"; return; }
    th += '<div class="olb-it"><button type="button" class="olb-tab' + on + '" aria-expanded="false" aria-haspopup="true" data-dd="' + g.id + '">' + g.label + live + '<span class="chev"></span></button>' +
      '<div class="olb-menu" id="olb-m-' + g.id + '" role="menu" hidden>' + g.items.map(function (it) {
        var o = activeItem(it[3]);
        return '<a role="menuitem" href="' + it[3] + '"' + (o ? ' class="on" aria-current="page"' : "") + '><span class="e">' + it[0] + "</span><span><b>" + esc(it[1]) + (it[1] === "Chat" ? ' <span class="olb-live" hidden>LIVE</span>' : "") + "</b><small>" + esc(it[2]) + "</small></span>" + (it[4] ? '<span class="olb-new">NEW</span>' : "<span></span>") + "</a>";
      }).join("") + "</div></div>";
  });
  tabs.innerHTML = th + '<span class="olb-ink" style="opacity:0"></span>';
  var brand = header.querySelector(".brand");
  brand.insertAdjacentElement("afterend", tabs);

  var right = document.createElement("div"); right.className = "olb-right";
  right.innerHTML = '<button type="button" class="olb-sbtn" aria-label="Search the site (press /)">' + SVG_S + "<span>Search…</span><kbd>/</kbd></button>";
  tabs.insertAdjacentElement("afterend", right);
  var mode = document.getElementById("mode");
  function pullAcct() { var a = document.getElementById("olb-acct"); if (a && a.parentElement !== right) right.insertBefore(a, burger); }
  if (mode) right.appendChild(mode);
  var burger = document.createElement("button"); burger.type = "button"; burger.className = "olb-burger"; burger.setAttribute("aria-label", "Open menu"); burger.setAttribute("aria-expanded", "false"); burger.textContent = "☰";
  right.appendChild(burger);
  pullAcct(); new MutationObserver(pullAcct).observe(header, { childList: true, subtree: true });

  // ---------- neon underline ----------
  var ink = tabs.querySelector(".olb-ink");
  function inkTo(el) {
    if (!el) { ink.style.opacity = "0"; return; }
    ink.style.left = (el.offsetParent === tabs ? el.offsetLeft : el.parentElement.offsetLeft + el.offsetLeft) + 12 + "px";
    ink.style.width = Math.max(10, el.offsetWidth - 24) + "px"; ink.style.opacity = "1";
  }
  var activeTab = tabs.querySelector(".olb-tab.on");
  function inkHome() { inkTo(activeTab); }
  requestAnimationFrame(inkHome); window.addEventListener("resize", inkHome);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(inkHome);
  tabs.addEventListener("mouseover", function (e) { var t = e.target.closest(".olb-tab"); if (t) inkTo(t); });
  tabs.addEventListener("mouseleave", function () { if (!tabs.querySelector('.olb-tab[aria-expanded="true"]')) inkHome(); });

  // ---------- dropdowns ----------
  var closeT = null;
  function openMenu(btn, on) {
    tabs.querySelectorAll("[data-dd]").forEach(function (b) {
      var o = on && b === btn; b.setAttribute("aria-expanded", String(o)); document.getElementById("olb-m-" + b.dataset.dd).hidden = !o;
    });
    if (!on) inkHome(); else inkTo(btn);
  }
  tabs.addEventListener("click", function (e) {
    var b = e.target.closest("[data-dd]"); if (!b) return;
    e.stopPropagation(); openMenu(b, b.getAttribute("aria-expanded") !== "true");
  });
  if (matchMedia("(hover: hover)").matches) {
    tabs.querySelectorAll(".olb-it").forEach(function (it) {
      var b = it.querySelector("[data-dd]"); if (!b) return;
      it.addEventListener("mouseenter", function () { clearTimeout(closeT); openMenu(b, true); });
      it.addEventListener("mouseleave", function () { clearTimeout(closeT); closeT = setTimeout(function () { openMenu(b, false); }, 220); });
    });
  }
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".olb-tabs")) openMenu(null, false);
    if (!e.target.closest(".olb-drawer") && !e.target.closest(".olb-burger")) setDrawer(false);
  });

  // ---------- phone menu ----------
  var drawer = document.createElement("div"); drawer.className = "olb-drawer"; drawer.hidden = true;
  drawer.innerHTML = G.map(function (g) {
    if (!g.items) return '<a href="' + g.href + '"' + (g.id === act ? ' class="on"' : "") + '><span class="i">' + g.icon + "</span>" + g.label + "</a>";
    return "<h6>" + g.label + "</h6>" + g.items.map(function (it) { return '<a href="' + it[3] + '"' + (activeItem(it[3]) ? ' class="on"' : "") + '><span class="i">' + it[0] + "</span>" + esc(it[1]) + (it[1] === "Chat" ? ' <span class="olb-live" hidden>LIVE</span>' : "") + (it[4] ? ' <span class="olb-new">NEW</span>' : "") + "</a>"; }).join("");
  }).join("");
  wrap.appendChild(drawer);
  function setDrawer(o) { drawer.hidden = !o; burger.textContent = o ? "✕" : "☰"; burger.setAttribute("aria-expanded", String(o)); burger.setAttribute("aria-label", o ? "Close menu" : "Open menu"); if (o) document.documentElement.classList.remove("olb-hidden"); }
  burger.addEventListener("click", function (e) { e.stopPropagation(); setDrawer(drawer.hidden); });

  // ---------- LIVE dot ----------
  function showLive(t) { if (t && Date.now() - t < 10 * 60000) document.querySelectorAll(".olb-live").forEach(function (x) { x.hidden = false; }); }
  setTimeout(function () {
    var c = null; try { c = JSON.parse(sessionStorage.getItem("olb-live") || "null"); } catch (e) {}
    if (c && Date.now() - c.at < 120000) { showLive(c.t); return; }
    fetch(FS).then(function (r) { return r.json(); }).then(function (j) {
      var d = (j.documents || [])[0], t = d && d.fields && d.fields.createdAt ? Date.parse(d.fields.createdAt.timestampValue) : 0;
      try { sessionStorage.setItem("olb-live", JSON.stringify({ at: Date.now(), t: t })); } catch (e) {}
      showLive(t);
    }).catch(function () {});
  }, 1200);

  // ---------- search ----------
  var sov = document.createElement("div"); sov.className = "olb-sov"; sov.hidden = true;
  sov.innerHTML = '<div class="olb-sp" role="dialog" aria-label="Search"><div class="box">' + SVG_S + '<input type="search" placeholder="Search players, maps and pages" aria-label="Search" autocomplete="off" spellcheck="false"></div><div class="olb-res" role="listbox"></div>' +
    '<div class="foot"><span><kbd>↑</kbd><kbd>↓</kbd>move</span><span><kbd>Enter</kbd>open</span><span><kbd>Esc</kbd>close</span></div></div>';
  document.body.appendChild(sov);
  var inp = sov.querySelector("input"), res = sov.querySelector(".olb-res"), sel = 0, players = null, OR = null, loading = null;
  var COLORS = ["#2b8fd6", "#7a5cf0", "#e0a21b", "#d9505c", "#22a447", "#e14b8a", "#14a3a3", "#c26b1e"];
  function colorOf(n) { var h = 0; for (var i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) >>> 0; return COLORS[h % COLORS.length]; }
  function parseCSV(t) {
    var R = [], r = [], f = "", q = false;
    for (var i = 0; i < t.length; i++) { var c = t[i];
      if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true; else if (c === ",") { r.push(f); f = ""; } else if (c === "\n") { r.push(f); R.push(r); r = []; f = ""; } else if (c !== "\r") f += c; }
    r.push(f); R.push(r); return R;
  }
  function loadPlayers() {
    if (loading) return loading;
    loading = fetch(SHEET).then(function (r) { return r.text(); }).then(function (t) {
      var rows = parseCSV(t), out = [], started = false;
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i], name = String(r[2] || "").trim(), place = String(r[1] || "").trim();
        if (/oceania record times/i.test(name)) { OR = r.slice(3, 30); continue; }
        if (/^\d+$/.test(place) && name && !/record times/i.test(name)) { started = true; out.push({ name: name, place: +place, nz: /nz/i.test(r[0] || ""), total: parseFloat(r[30]) }); }
        else if (started && !name) break;
      }
      players = out; render();
    }).catch(function () { players = []; render(); });
    return loading;
  }
  var PAGES = [{ i: "🏠", t: "Home", h: "index.html", w: "home start" }];
  G.forEach(function (g) { if (g.items) g.items.forEach(function (it) { PAGES.push({ i: it[0], t: it[1], h: it[3], w: (it[5] || "") + " " + it[2] }); }); else if (g.id !== "home") PAGES.push({ i: g.icon, t: g.label, h: g.href, w: g.words || "" }); });
  function mapFile(m) { return "maps/" + m.replace(/[\s']/g, "") + ".png"; }
  function render() {
    var q = inp.value.trim().toLowerCase(), html = "", links = [];
    function sect(title, items) { if (!items.length) return; html += "<h6>" + title + "</h6>" + items.join(""); }
    var ps = [];
    if (players) {
      var list = q ? players.filter(function (p) { return p.name.toLowerCase().indexOf(q) === 0; }).concat(players.filter(function (p) { var n = p.name.toLowerCase(); return n.indexOf(q) > 0; })) : players.slice(0, 5);
      ps = list.slice(0, q ? 6 : 5).map(function (p) {
        links.push("rankings.html?player=" + encodeURIComponent(p.name));
        return '<a class="olb-r" href="' + links[links.length - 1] + '"><span class="av" style="background:' + colorOf(p.name) + '">' + esc(p.name.replace(/[^A-Za-z0-9]/g, "").charAt(0).toUpperCase() || "?") + "</span>" + esc(p.name) + " <small>" + (p.nz ? "🇳🇿" : "🇦🇺") + "</small><em>#" + p.place + "</em></a>";
      });
    }
    sect(q ? "Players" : "Top players", ps);
    if (!players && q) html += '<div class="none">Loading players…</div>';
    var ms = q ? MAPS.filter(function (m) { return m.toLowerCase().indexOf(q) >= 0 || m.toLowerCase().replace(/[^a-z0-9]/g, "").indexOf(q.replace(/[^a-z0-9]/g, "")) >= 0; }).slice(0, 4) : [];
    sect("Maps", ms.map(function (m) {
      var k = MAPS.indexOf(m), or = OR && parseFloat(OR[k]);
      links.push("rankings.html?s=maps&map=" + encodeURIComponent(m));
      return '<a class="olb-r" href="' + links[links.length - 1] + '"><img class="mp" src="' + mapFile(m) + '" alt="" loading="lazy" onerror="this.style.visibility=\'hidden\'">' + esc(m) + (or ? " <small>· OR " + or.toFixed(3) + "</small>" : "") + "</a>";
    }));
    var pg = (q ? PAGES.filter(function (p) { return (p.t + " " + p.w).toLowerCase().indexOf(q) >= 0; }) : PAGES.filter(function (p) { return /Players|Records|Chat|Apply/.test(p.t); })).slice(0, q ? 5 : 4);
    sect(q ? "Pages" : "Jump to", pg.map(function (p) { links.push(p.h); return '<a class="olb-r" href="' + p.h + '"><span class="pi">' + p.i + "</span>" + esc(p.t) + "</a>"; }));
    if (!html) html = '<div class="none">No results for “' + esc(inp.value.trim()) + '”</div>';
    res.innerHTML = html;
    var as = res.querySelectorAll(".olb-r"); sel = Math.min(sel, Math.max(0, as.length - 1)); if (as[sel]) as[sel].classList.add("hl");
  }
  function openSearch() { sov.hidden = false; setDrawer(false); openMenu(null, false); inp.value = ""; sel = 0; inp.focus(); render(); loadPlayers(); }
  function closeSearch() { sov.hidden = true; }
  right.querySelector(".olb-sbtn").addEventListener("click", function (e) { e.stopPropagation(); openSearch(); });
  sov.addEventListener("click", function (e) { if (e.target === sov) closeSearch(); });
  inp.addEventListener("input", function () { sel = 0; render(); });
  inp.addEventListener("keydown", function (e) {
    var as = res.querySelectorAll(".olb-r");
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); if (!as.length) return; sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + as.length) % as.length; as.forEach(function (a, i) { a.classList.toggle("hl", i === sel); }); as[sel].scrollIntoView({ block: "nearest" }); }
    else if (e.key === "Enter") { if (as[sel]) { e.preventDefault(); location.href = as[sel].getAttribute("href"); } }
    else if (e.key === "Escape") closeSearch();
  });
  res.addEventListener("mousemove", function (e) { var a = e.target.closest(".olb-r"); if (!a) return; var as = Array.prototype.slice.call(res.querySelectorAll(".olb-r")); sel = as.indexOf(a); as.forEach(function (x, i) { x.classList.toggle("hl", i === sel); }); });
  document.addEventListener("keydown", function (e) {
    var t = e.target, typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
    if ((e.key === "/" && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) { e.preventDefault(); openSearch(); return; }
    if (e.key === "Escape") { openMenu(null, false); setDrawer(false); if (!sov.hidden) closeSearch(); }
  });
})();
