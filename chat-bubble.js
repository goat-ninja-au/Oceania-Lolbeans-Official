/* Oceania LOLBeans chat bubble
   Adds a 💬 button to the bottom-right of any page. Tapping it opens the Oceania community chat
   (same accounts, main chat, DMs and groups as the Oceania LOLBeans Official website).

   To use it on a page, paste this one line just before </body>:
     <script src="https://goat-ninja-au.github.io/Oceania-Lolbeans-Official/chat-bubble.js" data-view="champs"></script>

   Options (attributes on that script tag):
     data-view="champs"   open on the Championships channel (or "main" for the main chat)
     data-label="Chat"    text next to the 💬 icon (use data-label="" for just the icon)
     data-side="left"     put the button on the bottom-left instead
*/
(function () {
  if (window.__olbBubble) return; window.__olbBubble = true;
  var me = document.currentScript || document.querySelector('script[src*="chat-bubble.js"]');
  var opt = function (k, d) { var v = me && me.getAttribute("data-" + k); return v == null ? d : v; };
  var BASE = (me && me.src ? me.src.replace(/chat-bubble\.js.*$/, "") : "https://goat-ninja-au.github.io/Oceania-Lolbeans-Official/");
  var view = opt("view", "champs"), label = opt("label", "Chat"), side = opt("side", "right") === "left" ? "left" : "right";

  var css = "" +
    ".olb-bub{position:fixed;bottom:calc(18px + env(safe-area-inset-bottom,0px));" + side + ":18px;z-index:2147483000;display:inline-flex;align-items:center;gap:8px;height:56px;padding:0 20px 0 16px;border-radius:999px;border:0;cursor:pointer;background:#1478c2;color:#fff;font:700 15px/1 system-ui,-apple-system,'Segoe UI',Arial,sans-serif;box-shadow:0 10px 28px rgba(7,17,28,.35);transition:transform .15s}" +
    ".olb-bub:hover{transform:translateY(-2px)}.olb-bub .i{font-size:22px}.olb-bub.only{width:56px;padding:0;justify-content:center}" +
    ".olb-bub .dot{position:absolute;top:6px;" + (side === "left" ? "left" : "right") + ":8px;width:12px;height:12px;border-radius:50%;background:#d9505c;border:2px solid #fff;display:none}" +
    ".olb-panel{position:fixed;bottom:calc(86px + env(safe-area-inset-bottom,0px));" + side + ":18px;z-index:2147483000;width:min(400px,calc(100vw - 24px));height:min(640px,calc(100vh - 110px));border-radius:16px;overflow:hidden;box-shadow:0 24px 60px rgba(7,17,28,.4);border:1px solid rgba(20,120,194,.35);background:#c3e1f4;display:none;flex-direction:column}" +
    ".olb-panel.open{display:flex}.olb-panel iframe{border:0;width:100%;flex:1;background:transparent}" +
    ".olb-ptop{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px 8px 14px;background:#0c2a43;color:#fff;font:700 14px system-ui,-apple-system,'Segoe UI',Arial,sans-serif}" +
    ".olb-ptop a{color:#9fd0f5;font-weight:600;font-size:12px;text-decoration:none;margin-left:auto}.olb-ptop button{background:none;border:0;color:#fff;font-size:20px;cursor:pointer;width:32px;height:32px;border-radius:8px}.olb-ptop button:hover{background:rgba(255,255,255,.12)}" +
    "@media (max-width:520px){.olb-panel{left:0;right:0;bottom:0;top:0;width:100%;height:100%;border-radius:0;border:0}.olb-panel.open+.olb-bub,.olb-panel.open~.olb-bub{display:none}}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  var panel = document.createElement("div"); panel.className = "olb-panel"; panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Oceania community chat");
  panel.innerHTML = '<div class="olb-ptop"><span>💬 Oceania community</span><a href="' + BASE + 'community.html?view=' + encodeURIComponent(view) + '" target="_blank" rel="noopener">Open full chat ↗</a><button type="button" aria-label="Close chat">×</button></div>';
  var btn = document.createElement("button"); btn.type = "button"; btn.className = "olb-bub" + (label ? "" : " only");
  btn.setAttribute("aria-label", "Open the Oceania community chat"); btn.setAttribute("aria-expanded", "false");
  btn.innerHTML = '<span class="i">💬</span>' + (label ? "<span>" + label.replace(/[<>&]/g, "") + "</span>" : "") + '<span class="dot"></span>';
  document.body.appendChild(panel); document.body.appendChild(btn);

  var frame = null;
  function setOpen(o) {
    if (o && !frame) { frame = document.createElement("iframe"); frame.title = "Oceania community chat"; frame.allow = "microphone; camera; autoplay; clipboard-write"; frame.src = BASE + "community.html?embed=bubble&view=" + encodeURIComponent(view); panel.appendChild(frame); }
    panel.classList.toggle("open", o); btn.setAttribute("aria-expanded", String(o));
    btn.querySelector(".i").textContent = o ? "✕" : "💬";
    if (o) btn.querySelector(".dot").style.display = "none";
  }
  btn.addEventListener("click", function () { setOpen(!panel.classList.contains("open")); });
  panel.querySelector(".olb-ptop button").addEventListener("click", function () { setOpen(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && panel.classList.contains("open")) setOpen(false); });
})();
