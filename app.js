// Page behaviour: renders the steps from steps.js and runs the practice screens.
const stage = document.getElementById("stage");
const backBtn = document.getElementById("back");
const nextBtn = document.getElementById("next");
const phasesEl = document.getElementById("phases");
let current = 0;
let busy = false;
let size = loadSize();

function loadSize() {
  try {
    const k = localStorage.getItem("tune-size");
    return SIZES.some(z => z.key === k) ? k : null;
  } catch (e) { return null; }
}
function chooseSize(k) {
  size = k;
  try { localStorage.setItem("tune-size", k); } catch (e) {}
  updateSizebar();
  go(1);
}
function updateSizebar() {
  const z = SIZES.find(x => x.key === size);
  document.getElementById("sizebar").hidden = !z;
  if (z) document.getElementById("sizeLabel").textContent = "Tips are set for your " + z.own + ".";
}
const BF_DEFAULT = { rpm: "100", lp1: "on", gyro: "1.0", dterm: "1.0" };
const BF_GUIDE = [
  { f: "rpm", say: v => `<strong>Gyro RPM Filter Min Frequency.</strong> Type your own number: the lowest motor noise you wrote down, minus about 30. The practice screen uses <b>${v}</b> as an example.` },
  { f: "lp1", say: () => `<strong>Gyro Lowpass 1.</strong> Switch it <b>off</b>, but only if your hover graph was quiet above 500 Hz, meaning below about −40 dB. Less filtering means less delay. Not sure? Leave it on.` },
  { f: "gyro", say: () => `<strong>Gyro Filter Multiplier.</strong> Leave it at <b>1.0</b>. On a quiet quad there’s no reason to add more filtering here.` },
  { f: "dterm", say: () => `<strong>D Term Filter Multiplier.</strong> Leave it at <b>1.0</b> for now. You’ll come back to it after PID tuning if the D noise is high.` },
  { f: "save", say: () => `<strong>Save.</strong> Click Save in the bottom right corner. Your changes are lost if you skip this.` }
];
function filterMock(s) {
  if (!s.filt || !s.filt[size]) return "";
  const num = (v, lab, f, scale, cls) => `<div class="bf-row${f ? " tgt" : ""}${cls ? " " + cls : ""}"${f ? ` data-f="${f}"` : ""}><span class="bf-in"${scale ? ` data-scale="${scale}" data-base="${v}"` : ""}>${f ? BF_DEFAULT[f] : v}</span><span class="bf-lab">${lab}</span></div>`;
  const sel = (v, lab, cls) => `<div class="bf-row${cls ? " " + cls : ""}"><span class="bf-in sel">${v}</span><span class="bf-lab">${lab}</span></div>`;
  const tog = (on, lab, f) => `<div class="bf-row${f ? " tgt" : ""}"${f ? ` data-f="${f}"` : ""}><span class="bf-tog${on ? " on" : ""}"></span><span class="bf-lab">${lab}</span></div>`;
  const sub = t => `<div class="bf-sub">${t}</div>`;
  const slide = (f, lab) => `<div class="bf-slide tgt" data-f="${f}"><span class="bf-lab">${lab}:</span><span class="bf-track"><span class="bf-thumb"></span></span><span class="bf-in">1.0</span></div>`;
  return `
  <div class="bf">
    <div class="bf-guide">
      <p class="bf-step"></p>
      <p class="bf-say" aria-live="polite"></p>
      <div class="bf-ctl">
        <button type="button" class="btn" data-act="prev">Previous change</button>
        <button type="button" class="btn primary" data-act="next">Show next change</button>
        <button type="button" class="btn" data-act="play">Play all</button>
      </div>
    </div>
    <p class="bf-note">This is a practice copy of the Filter Settings screen. Nothing here changes your quad.</p>
    <div class="bf-screen">
      <div class="bf-tabs"><span>PID Profile Settings</span><span>Rateprofile Settings</span><span class="on">Filter Settings</span></div>
      <div class="bf-sliders">
        ${slide("gyro", "Gyro Filter Multiplier")}
        ${slide("dterm", "D Term Filter Multiplier")}
      </div>
      <div class="bf-cols">
        <div class="bf-box">
          <div class="bf-title">Profile independent Filter Settings</div>
          ${sub("Gyro Lowpass Filters")}
          ${tog(true, "Gyro Lowpass 1", "lp1")}
          ${sel("DYNAMIC", "Mode", "lp1dep")}
          ${num(250, "Gyro Lowpass 1 Dynamic Min Cutoff Frequency [Hz]", null, "gyro", "lp1dep")}
          ${num(500, "Gyro Lowpass 1 Dynamic Max Cutoff Frequency [Hz]", null, "gyro", "lp1dep")}
          ${sel("PT1", "Gyro Lowpass 1 Filter Type", "lp1dep")}
          ${tog(true, "Gyro Lowpass 2")}
          ${num(500, "Gyro Lowpass 2 Cutoff Frequency [Hz]", null, "gyro")}
          ${sel("PT1", "Gyro Lowpass 2 Filter Type")}
          ${sub("Gyro Notch Filters")}
          ${tog(false, "Gyro Notch Filter 1")}
          ${tog(false, "Gyro Notch Filter 2")}
          ${sub("Gyro RPM Filter")}
          ${tog(true, "Gyro RPM Filter")}
          ${num(3, "Gyro RPM Filter Harmonics Number")}
          ${num(100, "Gyro RPM Filter Min Frequency [Hz]", "rpm")}
          ${sub("Dynamic Notch Filter")}
          ${tog(true, "Dynamic Notch Filter")}
          ${num(1, "Notch Count")}
          ${num(500, "Q factor")}
          ${num(100, "Min Frequency [Hz]")}
          ${num(600, "Max Frequency [Hz]")}
        </div>
        <div class="bf-box">
          <div class="bf-title">Profile dependent Filter Settings</div>
          ${sub("D Term Lowpass Filters")}
          ${tog(true, "D Term Lowpass 1")}
          ${sel("DYNAMIC", "Mode")}
          ${num(75, "D Term Lowpass 1 Dynamic Min Cutoff Frequency [Hz]", null, "dterm")}
          ${num(150, "D Term Lowpass 1 Dynamic Max Cutoff Frequency [Hz]", null, "dterm")}
          ${num(5, "D Term Lowpass 1 Dynamic Curve Expo")}
          ${sel("PT1", "D Term Lowpass 1 Filter Type")}
          ${tog(true, "D Term Lowpass 2")}
          ${num(150, "D Term Lowpass 2 Cutoff Frequency [Hz]", null, "dterm")}
          ${sel("PT1", "D Term Lowpass 2 Filter Type")}
          ${sub("D Term Notch Filter")}
          ${tog(false, "D Term Notch Filter")}
          ${sub("Yaw Lowpass Filter")}
          ${num(100, "Yaw Lowpass Cutoff Frequency [Hz]")}
        </div>
      </div>
      <div class="bf-foot"><span class="bf-btn">Refresh</span><span class="bf-btn tgt" data-f="save">Save</span></div>
      <svg class="bf-cursor" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 2v17l4.6-4.2 3 7 2.8-1.2-3-6.8H18z" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linejoin="round"/></svg>
    </div>
  </div>`;
}
// Shared driver for the step-by-step practice screens: moves the cursor,
// runs Previous / Show next / Play all, and calls o.render(i, ctx) to draw step i.
function guidedMock(root, o) {
  const screen = root.querySelector(".bf-screen");
  const cursor = root.querySelector(".bf-cursor");
  const stepEl = root.querySelector(".bf-step");
  const say = root.querySelector(".bf-say");
  const prevB = root.querySelector('[data-act="prev"]');
  const nextB = root.querySelector('[data-act="next"]');
  const playB = root.querySelector('[data-act="play"]');
  const last = o.steps.length - 1;
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tgt = f => root.querySelector(`[data-f="${f}"]`);
  let idx = 0, timers = [], play = null;

  const aim = () => {
    const n = tgt(o.steps[idx].f);
    let c = n.querySelector(".bf-thumb") || n.querySelector(".bf-tog") || n.querySelector(".bf-in") || n;
    let x = c.offsetWidth / 2, y = c.offsetHeight / 2;
    while (c && c !== screen) { x += c.offsetLeft; y += c.offsetTop; c = c.offsetParent; }
    cursor.style.transform = `translate(${x}px, ${y}px)`;
  };
  // later() delays are skipped when the reader has reduced motion switched on.
  const ctx = { root, tgt, calm, aim, later: (fn, ms) => timers.push(setTimeout(fn, calm ? 0 : ms)) };
  const show = (i, scroll) => {
    timers.forEach(clearTimeout);
    timers = [];
    idx = i;
    o.steps.forEach((g, j) => {
      const n = tgt(g.f);
      n.classList.toggle("now", j === i);
      n.classList.remove("flash");
    });
    o.render(i, ctx);
    stepEl.textContent = `${o.label} ${i + 1} of ${o.steps.length}`;
    say.innerHTML = o.steps[i].say;
    prevB.disabled = i === 0;
    nextB.disabled = i === last;
    aim();
    if (!scroll) return;
    // rowScroll keeps the highlighted row clear of the sticky guide box; otherwise keep the whole screen in view.
    const n = o.rowScroll ? tgt(o.steps[i].f) : screen;
    const r = n.getBoundingClientRect();
    const out = o.rowScroll ? r.top < 220 || r.bottom > window.innerHeight - 24 : r.top < 0 || r.bottom > window.innerHeight;
    if (out) n.scrollIntoView({ block: o.rowScroll ? "center" : "nearest", behavior: calm ? "auto" : "smooth" });
  };
  const stop = () => { clearInterval(play); play = null; playB.textContent = "Play all"; };
  const start = scroll => {
    if (idx === last) show(0, scroll);
    playB.textContent = "Pause";
    play = setInterval(() => {
      if (!root.isConnected || idx === last) return stop();
      show(idx + 1, scroll);
    }, o.interval);
  };

  prevB.addEventListener("click", () => { stop(); show(idx - 1, true); });
  nextB.addEventListener("click", () => { stop(); show(idx + 1, true); });
  playB.addEventListener("click", () => { if (play) return stop(); start(true); });
  window.addEventListener("resize", () => { if (root.isConnected) aim(); });
  show(0, false);
  requestAnimationFrame(() => {
    if (o.ready) o.ready();
    aim();
    if (o.autoplay && !calm) start(false);
  });
}
function wireMock(el, s) {
  const root = el.querySelector(".bf");
  if (!root) return;
  const want = s.filt[size];
  const tgt = f => root.querySelector(`[data-f="${f}"]`);
  const setVal = (f, v) => {
    const n = tgt(f);
    if (f === "lp1") {
      n.querySelector(".bf-tog").classList.toggle("on", v === "on");
      root.querySelectorAll(".lp1dep").forEach(x => x.classList.toggle("off", v !== "on"));
      return;
    }
    n.querySelector(".bf-in").textContent = v;
    if (f === "gyro" || f === "dterm") {
      n.querySelector(".bf-thumb").style.left = (parseFloat(v) / 2 * 100) + "%";
      root.querySelectorAll(`[data-scale="${f}"]`).forEach(x => { x.textContent = Math.round(x.dataset.base * parseFloat(v)); });
    }
  };
  guidedMock(root, {
    label: "Change",
    interval: 3200,
    rowScroll: true,
    steps: BF_GUIDE.map(g => ({ f: g.f, say: g.say(want[g.f]) })),
    render(i, { later, aim }) {
      BF_GUIDE.forEach((g, j) => {
        tgt(g.f).classList.toggle("done", j < i);
        if (g.f !== "save") setVal(g.f, j < i ? want[g.f] : BF_DEFAULT[g.f]);
      });
      const f = BF_GUIDE[i].f;
      if (f !== "save" && want[f] !== BF_DEFAULT[f]) later(() => { setVal(f, want[f]); tgt(f).classList.add("flash"); aim(); }, 900);
    }
  });
}

const PRE_LIST = [
  ["Crossfire 50Hz", "crossfire tbs crsf"],
  ["Crossfire 150Hz", "crossfire tbs crsf"],
  ["ExpressLRS 150Hz", "elrs"],
  ["ExpressLRS 250Hz", "elrs"],
  ["ExpressLRS 500Hz", "elrs"]
];
const PRE_PICK = "ExpressLRS 250Hz";
const PRE_GUIDE = [
  { f: "tab", say: "<strong>Presets tab.</strong> Click Presets in the menu down the left side of Betaflight." },
  { f: "search", say: "<strong>Search.</strong> Type <b>elrs</b> in the search box. Only the ExpressLRS presets stay on the list." },
  { f: "card", say: "<strong>Your packet rate.</strong> Click the preset that matches the rate set on your radio. The practice screen uses <b>250Hz</b> as an example." },
  { f: "pick", say: "<strong>Pick.</strong> A window opens that describes the preset. Click Pick to choose it." },
  { f: "save", say: "<strong>Save and Reboot.</strong> Click it in the bottom right corner. The preset isn’t applied until you do." }
];
function presetMock() {
  return `
  <div class="bf prem">
    <div class="bf-guide">
      <p class="bf-step"></p>
      <p class="bf-say" aria-live="polite"></p>
      <div class="bf-ctl">
        <button type="button" class="btn" data-act="prev">Previous</button>
        <button type="button" class="btn primary" data-act="next">Show next</button>
        <button type="button" class="btn" data-act="play">Play all</button>
      </div>
    </div>
    <p class="bf-note">This is a practice copy of the Presets screen. Your list will be longer, and nothing here changes your quad.</p>
    <div class="bf-screen">
      <div class="bf-tabs"><span class="on">Setup</span><span>Configuration</span><span class="tgt" data-f="tab">Presets</span><span>PID Tuning</span><span>Receiver</span></div>
      <div class="bfp-body">
        <div class="bfp-search tgt" data-f="search"><span class="bf-in"><span class="bfp-q"></span><span class="bfp-caret"></span><span class="bfp-ph">Search presets</span></span></div>
        <div class="bfp-list">
          ${PRE_LIST.map(([n, k]) => `<div class="bfp-card"${n === PRE_PICK ? ' data-f="card"' : ""} data-k="${(n + " " + k).toLowerCase()}"><b>${n}</b><span class="bfp-cat">RC_LINK</span></div>`).join("")}
        </div>
      </div>
      <div class="bf-foot"><span class="bf-btn off">Cancel</span><span class="bf-btn off" data-f="save">Save and Reboot</span></div>
      <div class="bfp-dim">
        <div class="bfp-dlg">
          <div class="bf-title">${PRE_PICK}</div>
          <p>Sets RC smoothing and feedforward to suit a 250Hz ExpressLRS link.</p>
          <div class="bf-foot"><span class="bf-btn off">Close</span><span class="bf-btn" data-f="pick">Pick</span></div>
        </div>
      </div>
      <svg class="bf-cursor" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 2v17l4.6-4.2 3 7 2.8-1.2-3-6.8H18z" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linejoin="round"/></svg>
    </div>
  </div>`;
}
function wirePreset(el) {
  const root = el.querySelector(".prem:not(.relm)");
  if (!root) return;
  const tabs = [...root.querySelectorAll(".bf-tabs span")];
  const body = root.querySelector(".bfp-body");
  const list = root.querySelector(".bfp-list");
  const cards = [...root.querySelectorAll(".bfp-card")];
  const qEl = root.querySelector(".bfp-q");
  const ph = root.querySelector(".bfp-ph");
  const dim = root.querySelector(".bfp-dim");
  const tgt = f => root.querySelector(`[data-f="${f}"]`);

  const setTab = on => {
    tabs.forEach(t => t.classList.toggle("on", (t.dataset.f === "tab") === on));
    body.classList.toggle("dim", !on);
  };
  const setQuery = q => {
    qEl.textContent = q;
    ph.hidden = !!q;
    cards.forEach(c => { c.hidden = !c.dataset.k.includes(q); });
  };
  const setPicked = on => {
    tgt("card").classList.toggle("picked", on);
    tgt("save").classList.toggle("off", !on);
  };
  guidedMock(root, {
    label: "Step",
    interval: 3000,
    autoplay: true,
    steps: PRE_GUIDE,
    // Hold the list height so the page doesn't jump when the search hides presets.
    ready() { list.style.minHeight = list.offsetHeight + "px"; },
    render(i, { later, calm }) {
      setTab(i > 0);
      setQuery(i > 1 ? "elrs" : "");
      dim.classList.toggle("open", i === 3);
      setPicked(i > 3);
      if (i === 0) later(() => setTab(true), 900);
      if (i === 1) "elrs".split("").forEach((_, k) => later(() => setQuery("elrs".slice(0, k + 1)), 800 + k * 240));
      // With reduced motion the window stays put: step 3 shows it closed, step 4 shows it open.
      if (i === 2 && !calm) later(() => dim.classList.add("open"), 1200);
      if (i === 3 && !calm) later(() => {
        dim.classList.remove("open");
        setPicked(true);
        tgt("card").classList.add("flash");
      }, 1400);
    }
  });
}

function relaxMock() {
  const row = (ctl, lab, f) => `<div class="bf-row${f ? " tgt" : ""}"${f ? ` data-f="${f}"` : ""}>${ctl}<span class="bf-lab">${lab}</span></div>`;
  const num = v => `<span class="bf-in">${v}</span>`;
  const sel = v => `<span class="bf-in sel">${v}</span>`;
  const tog = on => `<span class="bf-tog${on ? " on" : ""}"></span>`;
  return `
  <div class="bf prem relm">
    <div class="bf-guide">
      <p class="bf-step"></p>
      <p class="bf-say" aria-live="polite"></p>
      <div class="bf-ctl">
        <button type="button" class="btn" data-act="prev">Previous</button>
        <button type="button" class="btn primary" data-act="next">Show next</button>
        <button type="button" class="btn" data-act="play">Play all</button>
      </div>
    </div>
    <p class="bf-note">This is a practice copy of the PID Tuning screen. Nothing here changes your quad.</p>
    <div class="bf-screen">
      <div class="bf-tabs"><span class="on">Setup</span><span>Configuration</span><span>Presets</span><span class="tgt" data-f="nav">PID Tuning</span><span>Receiver</span></div>
      <div class="bfp-body" style="padding:0">
        <div class="bf-tabs sub"><span class="on">PID Profile Settings</span><span>Rateprofile Settings</span><span>Filter Settings</span></div>
        <div class="bf-cols">
          <div class="bf-box">
            <div class="bf-title">PID Controller Settings</div>
            <div class="bf-sub">I Term Relax</div>
            ${row(tog(true), "I Term Relax", "relax")}
            ${row(sel("RP"), "Axes")}
            ${row(sel("Setpoint"), "Type")}
            ${row(num(15), "Cutoff", "cut")}
            <div class="bf-sub">Anti Gravity</div>
            ${row(tog(true), "Anti Gravity")}
            ${row(num(80), "Gain")}
            <div class="bf-sub">I Term Rotation</div>
            ${row(tog(false), "I Term Rotation")}
          </div>
        </div>
      </div>
      <div class="bf-foot"><span class="bf-btn off">Refresh</span><span class="bf-btn" data-f="save">Save</span></div>
      <svg class="bf-cursor" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 2v17l4.6-4.2 3 7 2.8-1.2-3-6.8H18z" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linejoin="round"/></svg>
    </div>
  </div>`;
}
function wireRelax(el) {
  const root = el.querySelector(".relm");
  if (!root) return;
  const z = SIZES.find(x => x.key === size);
  const want = size === "big" ? "10" : "15";
  const steps = [
    { f: "nav", say: "<strong>PID Tuning tab.</strong> Click PID Tuning in the menu down the left side of Betaflight. It opens on PID Profile Settings." },
    { f: "relax", say: "<strong>I Term Relax.</strong> Find it in the PID Controller Settings box. Leave it switched <b>on</b>." },
    { f: "cut", say: size === "big"
      ? "<strong>Cutoff.</strong> A 6 inch can stay at 15. For a 7 inch, type a number from 7 to 10. The practice screen uses <b>10</b> as an example."
      : `<strong>Cutoff.</strong> Leave it at <b>15</b>. That’s the default, and it suits your ${z ? z.own : "quad"}.` },
    { f: "save", say: want === "15"
      ? "<strong>Save.</strong> Nothing changed, so there’s nothing to save. If you did type a new number, click Save in the bottom right corner."
      : "<strong>Save.</strong> Click Save in the bottom right corner. Your change is lost if you skip this." }
  ];
  const tabs = [...root.querySelectorAll(".bf-tabs:not(.sub) span")];
  const body = root.querySelector(".bfp-body");
  const tgt = f => root.querySelector(`[data-f="${f}"]`);
  const cutIn = tgt("cut").querySelector(".bf-in");
  const setTab = on => {
    tabs.forEach(t => t.classList.toggle("on", (t.dataset.f === "nav") === on));
    body.classList.toggle("dim", !on);
  };
  guidedMock(root, {
    label: "Step",
    interval: 3000,
    autoplay: true,
    steps,
    render(i, { later }) {
      steps.forEach((g, j) => tgt(g.f).classList.toggle("done", j < i && j > 0));
      setTab(i > 0);
      cutIn.textContent = i > 2 ? want : "15";
      if (i === 0) later(() => setTab(true), 900);
      if (i === 2 && want !== "15") later(() => { cutIn.textContent = want; tgt("cut").classList.add("flash"); }, 900);
    }
  });
}

const SPX = f => 44 + f / 1000 * 260;
const SPY = db => 12 + Math.min(60, Math.max(0, -db)) / 60 * 138;
function specSVG(o) {
  const floorAt = f => o.floor - 16 * (f / 1000);
  let d = "", fl = "";
  for (let f = 0; f <= 1000; f += 4) {
    let p = Math.pow(10, floorAt(f) / 10) + Math.pow(10, (-6 - f * 1.6) / 10);
    o.peaks.forEach(k => { p += Math.pow(10, (k.db - 12 * Math.pow((f - k.f) / k.w, 2)) / 10); });
    d += (f ? "L" : "M") + SPX(f).toFixed(1) + " " + SPY(10 * Math.log10(p)).toFixed(1);
    if (f >= 60) fl += (fl ? "L" : "M") + SPX(f).toFixed(1) + " " + (SPY(floorAt(f)) + 5).toFixed(1);
  }
  const grid = [-20, -40].map(v => `<path d="M44 ${SPY(v)}H304" stroke="#3a3a3a"/>`).join("");
  const ylab = [0, -20, -40, -60].map(v => `<text class="ptb-t" x="40" y="${SPY(v) + 3}" text-anchor="end">${v === 0 ? "0" : "−" + (-v)}</text>`).join("");
  const motors = (o.motors || []).map(f => `<path d="M${SPX(f) - 4} 13h8l-4 7z" fill="#ff7a59"/>`).join("");
  const mz = (o.motors || []).map((f, i) => `<rect class="hz" data-h="motor" x="${SPX(f) - 13}" y="${SPY(o.peaks[i].db) - 7}" width="26" height="${150 - SPY(o.peaks[i].db) + 5}"/>`).join("");
  return `<svg viewBox="0 0 320 180" role="img" aria-label="${o.alt}">
    <rect x="44" y="12" width="260" height="138" fill="#000"/>
    ${grid}
    ${o.limit ? `<path d="M44 ${SPY(-10)}H304" stroke="#ff7a59" stroke-dasharray="5 4"/><text class="ptb-t" x="300" y="${SPY(-10) - 4}" text-anchor="end" style="fill:#ff7a59">−10 dB limit</text>` : ""}
    <path d="${d}" fill="none" stroke="${o.color || "#5cd0ff"}" stroke-width="2" stroke-linejoin="round"/>
    ${motors}
    <path d="M44 12V150H304" fill="none" stroke="#ddd"/>
    ${ylab}
    <text class="ptb-t" x="10" y="10">dB</text>
    <text class="ptb-t" x="44" y="162" text-anchor="middle">0</text>
    <text class="ptb-t" x="174" y="162" text-anchor="middle">500</text>
    <text class="ptb-t" x="304" y="162" text-anchor="end">1000</text>
    <text class="ptb-t" x="174" y="176" text-anchor="middle">Frequency (Hz)</text>
    ${o.foot ? `<circle cx="${SPX(o.foot)}" cy="${SPY(floorAt(o.foot)) - 1}" r="3.5" fill="#ffbb00"/><text class="ptb-t" x="${SPX(o.foot) - 6}" y="${SPY(floorAt(o.foot)) + 16}" text-anchor="middle" style="fill:#ffbb00">about ${o.foot} Hz</text><circle class="hz" data-h="foot" cx="${SPX(o.foot)}" cy="${SPY(floorAt(o.foot)) - 1}" r="11"/>` : ""}
    <rect class="hz" data-h="move" x="45" y="14" width="13" height="135"/>
    ${mz}
    <path class="hz" data-h="floor" d="${fl}"/>
    <rect class="hz" data-h="scale" x="14" y="6" width="29" height="150"/>
    ${o.extra ? `<rect class="hz" data-h="extra" x="${SPX(o.extra) - 12}" y="24" width="24" height="126"/>` : ""}
    ${o.limit ? `<rect class="hz" data-h="limit" x="46" y="${SPY(-10) - 6}" width="256" height="12"/>` : ""}
  </svg>`;
}
function stepSVG(o) {
  const Y = v => 150 - v * 69;
  const paths = o.curves.map((c, n) => {
    const wd = c.z < 1 ? c.w * Math.sqrt(1 - c.z * c.z) : 0;
    let d = "";
    for (let t = 0; t <= 500; t += 4) {
      const tt = Math.max(0, t - 8);
      let y = c.z >= 1
        ? 1 - Math.exp(-c.w * tt) * (1 + c.w * tt)
        : 1 - Math.exp(-c.z * c.w * tt) * (Math.cos(wd * tt) + c.z / Math.sqrt(1 - c.z * c.z) * Math.sin(wd * tt));
      if (o.sag) y *= 1 - o.sag * (1 - Math.exp(-tt / 150));
      if (o.noise && tt > 0) y += o.noise * (Math.sin(tt * 0.21 + n * 2) + Math.sin(tt * 0.083 + n)) / 2;
      d += (t ? "L" : "M") + (44 + t / 500 * 256).toFixed(1) + " " + Y(y).toFixed(1);
    }
    return `<path d="${d}" fill="none" stroke="${c.color}" stroke-width="2" stroke-linejoin="round"/>`;
  }).join("");
  const legend = o.curves.map((c, n) => `<text class="ptb-t" x="294" y="${28 + n * 12}" text-anchor="end" style="fill:${c.color}">${c.label}</text>`).join("");
  return `<svg viewBox="0 0 320 180" role="img" aria-label="${o.alt}">
    <rect x="44" y="12" width="256" height="138" fill="#000"/>
    <path d="M44 81H300" stroke="#9a9a9a" stroke-dasharray="5 4"/>
    ${paths}
    <path d="M44 12V150H300" fill="none" stroke="#ddd"/>
    <text class="ptb-t" x="44" y="162" text-anchor="middle">0</text>
    <text class="ptb-t" x="172" y="162" text-anchor="middle">250</text>
    <text class="ptb-t" x="300" y="162" text-anchor="end">500</text>
    <text class="ptb-t" x="172" y="176" text-anchor="middle">time (ms)</text>
    <text class="ptb-t" x="40" y="153" text-anchor="end">0</text>
    <text class="ptb-t" x="40" y="84" text-anchor="end">1</text>
    <text class="ptb-t" x="40" y="18" text-anchor="end">2</text>
    ${legend}
    <rect class="hz" data-h="target" x="46" y="75" width="252" height="12"/>
    <rect class="hz" data-h="peak" x="54" y="38" width="74" height="58"/>
    <rect class="hz" data-h="tail" x="170" y="64" width="128" height="40"/>
    <rect class="hz" data-h="legend" x="236" y="17" width="62" height="${o.curves.length * 12 + 4}"/>
  </svg>`;
}
const MOTOR_PEAKS = [{ f: 150, db: -12, w: 16 }, { f: 300, db: -24, w: 18 }, { f: 450, db: -33, w: 20 }];
const SWEEP_COL = ["#ff5c5c", "#ff9d3c", "#ffe14d", "#6fdc6f", "#5cd0ff"];
const sweep = zs => zs.map((z, n) => ({ z, w: 0.065, color: SWEEP_COL[n], label: "Damping " + (0.6 + n * 0.2).toFixed(1) }));
const PTB = {
  spec: {
    tool: "spec",
    tour: [
      { h: "btn", t: "<strong>Open the tool.</strong> Click Spectral Analyzer, choose “Gyro prefilt”, then Run. That shows the gyro before any filtering." },
      { h: "move", t: "<strong>The hump on the far left</strong> is the quad actually moving. It isn’t noise, so ignore it." },
      { h: "motor", t: "<strong>The tall peaks are your motors.</strong> The first is the motor speed. The smaller ones to the right are its echoes. They’re normal, and the RPM filter removes them." },
      { h: "floor", t: "<strong>The floor</strong> is the line the peaks stand on. This is the part you’re judging. Lower is quieter." },
      { h: "scale", t: "<strong>Read the floor on the left scale.</strong> Below −40 dB is great. Around −30 is fine. Above about −25 needs fixing." },
      { h: "opts", t: "<strong>Now compare.</strong> Pick the example below that looks most like your own graph." }
    ],
    opts: [
      { key: "clean", name: "Peaks on a low floor", floor: -44, peaks: MOTOR_PEAKS, motors: [150, 300, 450], alt: "Three motor peaks on a low noise floor",
        mean: "A healthy quad. The only noise is from the motors, and the RPM filter handles that.",
        todo: "Carry on to the next step." },
      { key: "high", name: "The floor is high", floor: -23, peaks: MOTOR_PEAKS, motors: [150, 300, 450], alt: "Motor peaks on a high noise floor",
        mean: "There’s noise at every frequency. That usually points to electrical noise or something worn.",
        todo: "Check the capacitor is fitted, the props and bearings are good, and the flight controller sits on its rubber mounts. Raising the ESC PWM frequency to 48 kHz can also help. Then fly the hover test again." },
      { key: "extra", name: "An extra peak", floor: -44, peaks: MOTOR_PEAKS.concat([{ f: 232, db: -17, w: 12 }]), motors: [150, 300, 450], extra: 232, alt: "Motor peaks plus one extra peak between them",
        mean: "A peak that doesn’t sit under a motor marker is something on the quad shaking by itself.",
        todo: "Look for a loose camera, antenna, arm or stack screw, then fly the hover test again. If it won’t go away, the Dynamic Notch Filter will catch it." }
    ],
    draw: o => `<figure><div class="ptb-ttl">Gyro prefilt, roll</div>${specSVG(o)}</figure>`
  },
  low: {
    tool: "spec",
    tour: [
      { h: "motor", t: "<strong>Find the first motor peak.</strong> It’s the tall one furthest to the left, after the hump at the very edge." },
      { h: "foot", t: "<strong>Click its left foot,</strong> where the line starts to climb. PIDtoolbox shows the frequency. In this example it’s about 122 Hz. Write yours down." }
    ],
    base: { floor: -44, peaks: MOTOR_PEAKS, motors: [150, 300, 450], foot: 122, alt: "Noise graph with the left foot of the first motor peak marked at about 122 hertz" },
    draw: o => `<figure><div class="ptb-ttl">Gyro prefilt, roll</div>${specSVG(o)}</figure>`
  },
  dterm: {
    tool: "spec",
    tour: [
      { h: "btn", t: "<strong>Open the tool.</strong> Click Spectral Analyzer, choose “Dterm”, then Run." },
      { h: "limit", t: "<strong>The line to watch is −10 dB.</strong> During wobble tests, the D term noise should stay under it." },
      { h: "opts", t: "<strong>Now compare.</strong> Pick the example below that looks most like yours." }
    ],
    opts: [
      { key: "under", name: "Stays under the line", floor: -40, color: "#ffd45c", limit: true, peaks: [{ f: 170, db: -17, w: 130 }, { f: 60, db: -21, w: 50 }], alt: "D term noise staying below minus 10 decibels",
        mean: "The D noise is under control.",
        todo: "Nothing to change. Carry on." },
      { key: "over", name: "Goes over the line", floor: -34, color: "#ffd45c", limit: true, peaks: [{ f: 170, db: -5, w: 130 }, { f: 60, db: -12, w: 50 }], alt: "D term noise rising above minus 10 decibels",
        mean: "The motors are being fed too much D noise. That’s what makes them hot.",
        todo: "On Filter Settings, lower D Term Filter Multiplier to about 0.8 and test again. If it’s still over, take Master Multiplier down one step." }
    ],
    draw: o => `<figure><div class="ptb-ttl">Dterm, roll</div>${specSVG(o)}</figure>`
  },
  sweep: {
    tool: "step",
    tour: [
      { h: "btn", t: "<strong>Open the tool.</strong> Click Step Resp Tool, tick your five wobble logs, then Run." },
      { h: "target", t: "<strong>The dashed line at 1</strong> is where the quad should end up after you move the stick." },
      { h: "legend", t: "<strong>Each colour is one flight.</strong> PIDtoolbox lists the PID numbers for each, so you can tell which Damping value is which." },
      { h: "peak", t: "<strong>Look at the bump.</strong> The lowest Damping makes the tallest bump: too little brake, so the quad shoots past. Each step up shrinks it." },
      { h: "opts", t: "<strong>Choose the lowest Damping where the bump is nearly gone.</strong> A tiny overshoot is fine. Then pick the example below that looks like yours." }
    ],
    opts: [
      { key: "ok", name: "The bump shrinks, then goes", curves: sweep([.3, .42, .55, .68, .8]), alt: "Five curves, each with a smaller overshoot than the last",
        mean: "This is the normal result.",
        todo: "Set Damping to the lowest value where the bump has nearly gone. In this example that’s 1.2 or 1.4. Then set Drift – Wobble to 0.2 and save." },
      { key: "bumpy", name: "Still bumpy at 1.4", curves: sweep([.2, .26, .32, .38, .45]), alt: "Five curves that all overshoot",
        mean: "This quad needs more brake than most.",
        todo: "Fly two more flights with Damping at 1.6 and 1.8, checking the motors each time. If they get hot, stop at the last cool value." },
      { key: "sag", name: "The lines sag at the end", curves: sweep([.3, .42, .55, .68, .8]), sag: .16, alt: "Five curves that drift below the target line",
        mean: "That droop is because I is switched off, not because of P or D. Judge the bump at the start and ignore the droop.",
        todo: "Pick your Damping value as normal. Then set Drift – Wobble to 0.4, fly one more wobble test, and the lines should end flat." },
      { key: "messy", name: "Too wiggly to tell", curves: sweep([.3, .42, .55, .68, .8]), noise: .09, alt: "Five noisy, wiggly curves",
        mean: "Noise in the log is hiding the bump.",
        todo: "Go back to the hover test and check the noise floor. Also make sure each wobble flight had at least 20 sharp moves per axis." }
    ],
    draw: o => `<figure><div class="ptb-ttl">Step response, roll</div>${stepSVG(o)}</figure>`
  }
};
function ptbMock(kind) {
  const C = PTB[kind];
  return `
  <div class="ptb" data-kind="${kind}">
    <div class="bf-guide">
      <p class="bf-step"></p>
      <p class="bf-say" aria-live="polite"></p>
      <div class="bf-ctl">
        <button type="button" class="btn" data-act="prev">Previous</button>
        <button type="button" class="btn primary" data-act="next">Show next</button>
      </div>
    </div>
    <p class="bf-note">This is a practice copy of PIDtoolbox, drawn with made-up data.</p>
    <div class="ptb-screen">
      <div class="ptb-bar"><span class="ptb-btn">Open file</span><span class="ptb-btn"${C.tool === "spec" ? ' data-h="btn"' : ""}>Spectral Analyzer</span><span class="ptb-btn"${C.tool === "step" ? ' data-h="btn"' : ""}>Step Resp Tool</span><span class="ptb-btn" data-h="btn">Run</span></div>
      <div class="ptb-plots"></div>
    </div>
    ${C.opts ? `<p class="ptb-q">Which one looks most like yours?</p>
    <div class="ptb-opts" data-h="opts">${C.opts.map(o => `<button type="button" class="ptb-opt" data-o="${o.key}" aria-pressed="false">${o.name}</button>`).join("")}</div>
    <p class="note ptb-verdict" aria-live="polite"></p>` : ""}
  </div>`;
}
function wirePtb(el) {
  const root = el.querySelector(".ptb");
  if (!root) return;
  const C = PTB[root.dataset.kind];
  const plots = root.querySelector(".ptb-plots");
  const stepEl = root.querySelector(".bf-step");
  const say = root.querySelector(".bf-say");
  const prevB = root.querySelector('[data-act="prev"]');
  const nextB = root.querySelector('[data-act="next"]');
  const verdict = root.querySelector(".ptb-verdict");
  const optBtns = [...root.querySelectorAll(".ptb-opt")];
  let i = 0;
  const mark = () => {
    root.querySelectorAll(".hl").forEach(n => n.classList.remove("hl"));
    root.querySelectorAll(`[data-h="${C.tour[i].h}"]`).forEach(n => n.classList.add("hl"));
  };
  const draw = o => {
    plots.innerHTML = C.draw(o);
    if (C.opts) {
      optBtns.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.o === o.key)));
      verdict.innerHTML = `<strong>What it means:</strong> ${o.mean}<br><strong>What to do:</strong> ${o.todo}`;
    }
    mark();
  };
  const show = n => {
    i = n;
    stepEl.textContent = `Part ${i + 1} of ${C.tour.length}`;
    say.innerHTML = C.tour[i].t;
    prevB.disabled = i === 0;
    nextB.disabled = i === C.tour.length - 1;
    mark();
  };
  prevB.addEventListener("click", () => show(i - 1));
  nextB.addEventListener("click", () => show(i + 1));
  optBtns.forEach(b => b.addEventListener("click", () => draw(C.opts.find(o => o.key === b.dataset.o))));
  draw(C.opts ? C.opts[0] : C.base);
  show(0);
}

const PID_SL = [
  ["d", "Damping", "D Gains"],
  ["pi", "Tracking", "P & I Gains"],
  ["ff", "Stick Response", "FF Gains"],
  ["dmax", "Dynamic Damping", "D Max"],
  ["i", "Drift – Wobble", "I Gains"],
  ["pd", "Pitch Damping", "Pitch:Roll D"],
  ["ppi", "Pitch Tracking", "Pitch:Roll P, I & FF"],
  ["m", "Master Multiplier", "All Gains"]
];
function pidNums(g) {
  const r = Math.round;
  return [
    ["ROLL", "ax-r", r(45 * g.pi * g.m), r(80 * g.pi * g.i * g.m), r((30 + 10 * g.dmax) * g.d * g.m), r(30 * g.d * g.m), r(120 * g.ff * g.m)],
    ["PITCH", "ax-p", r(47 * g.pi * g.ppi * g.m), r(84 * g.pi * g.i * g.ppi * g.m), r((34 + 12 * g.dmax) * g.d * g.pd * g.m), r(34 * g.d * g.pd * g.m), r(125 * g.ff * g.ppi * g.m)],
    ["YAW", "ax-y", r(45 * g.pi * g.m), r(80 * g.pi * g.i * g.m), 0, 0, r(120 * g.ff * g.m)]
  ];
}
function pidMock(s) {
  const guide = s.pid.seq
    ? `<p class="bf-step"></p>
      <p class="bf-say" aria-live="polite"></p>
      <div class="bf-ctl">
        <button type="button" class="btn" data-act="prev">Previous change</button>
        <button type="button" class="btn primary" data-act="next">Show next change</button>
      </div>`
    : `<p class="ptb-q">${s.pid.q}</p>
      <div class="ptb-opts">${s.pid.opts.map((o, i) => `<button type="button" class="ptb-opt" data-i="${i}" aria-pressed="false">${o.name}</button>`).join("")}</div>
      <p class="bf-say" aria-live="polite">Pick one and the practice screen shows you what to do.</p>`;
  return `
  <div class="bf pidm">
    <div class="bf-guide">${guide}</div>
    <p class="bf-note">This is a practice copy of the PID Tuning screen. The slider positions are examples, so yours may differ.</p>
    <div class="bf-screen">
      <div class="bf-tabs"><span class="on">PID Profile Settings</span><span>Rateprofile Settings</span><span>Filter Settings</span></div>
      <div class="bf-expert"><span class="bf-tog on"></span>Enable Expert Mode</div>
      <div class="bf-scroll">
        <table class="bf-pid">
          <thead><tr><th></th><th>Proportional</th><th>Integral</th><th>D Max</th><th>Derivative</th><th>Feedforward</th></tr></thead>
          <tbody></tbody>
        </table>
      </div>
      <div class="bf-sliders pid">
        ${PID_SL.map(([k, n, sub]) => `<div class="bf-slide tgt" data-f="${k}"><span class="bf-lab">${n}:<small>${sub}</small></span><span class="bf-track"><span class="bf-thumb"></span></span><span class="bf-in">1.0</span></div>`).join("")}
      </div>
      <div class="bf-foot"><span class="bf-btn">Refresh</span><span class="bf-btn tgt" data-f="save">Save</span></div>
      <svg class="bf-cursor" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 2v17l4.6-4.2 3 7 2.8-1.2-3-6.8H18z" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linejoin="round"/></svg>
    </div>
  </div>`;
}
function wirePid(el, s) {
  const root = el.querySelector(".pidm");
  if (!root) return;
  const P = s.pid;
  const start = Object.assign({ d: 1, pi: 1, ff: 1, dmax: 1, i: 1, pd: 1, ppi: 1, m: 1 }, P.start || {});
  const screen = root.querySelector(".bf-screen");
  const cursor = root.querySelector(".bf-cursor");
  const say = root.querySelector(".bf-say");
  const body = root.querySelector(".bf-pid tbody");
  const save = root.querySelector('[data-f="save"]');
  const rowOf = k => root.querySelector(`[data-f="${k}"]`);
  const nameOf = k => PID_SL.find(x => x[0] === k)[1];
  const fmt = v => v.toFixed(2).replace(/0$/, "");
  let g, timers = [];

  const paint = flash => {
    const old = [...body.querySelectorAll(".bf-in")].map(n => n.textContent);
    let k = 0;
    body.innerHTML = pidNums(g).map(r => `<tr class="${r[1]}"><th scope="row">${r[0]}</th>${r.slice(2).map(v => `<td><span class="bf-in${flash && old[k++] !== String(v) ? " flash" : ""}">${v}</span></td>`).join("")}</tr>`).join("");
    PID_SL.forEach(([key]) => {
      const n = rowOf(key);
      n.querySelector(".bf-thumb").style.left = (g[key] / 2 * 100) + "%";
      n.querySelector(".bf-in").textContent = fmt(g[key]);
    });
  };
  const aim = c => {
    let x = c.offsetWidth / 2, y = c.offsetHeight / 2;
    while (c && c !== screen) { x += c.offsetLeft; y += c.offsetTop; c = c.offsetParent; }
    cursor.style.opacity = 1;
    cursor.style.transform = `translate(${x}px, ${y}px)`;
  };
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const reset = () => {
    timers.forEach(clearTimeout);
    timers = [];
    g = Object.assign({}, start);
    root.querySelectorAll(".now, .done, .flash").forEach(n => n.classList.remove("now", "done", "flash"));
    cursor.style.opacity = 0;
  };
  const pressSave = () => { save.classList.add("now"); aim(save); };
  const run = (moves, thenSave) => {
    const stepTo = j => {
      if (j >= moves.length) { if (thenSave) pressSave(); return; }
      const [k, v] = moves[j];
      const row = rowOf(k);
      const thumb = row.querySelector(".bf-thumb");
      row.classList.add("now");
      aim(thumb);
      later(() => {
        g[k] = v;
        paint(true);
        row.classList.add("flash");
        aim(thumb);
        later(() => {
          row.classList.remove("now", "flash");
          row.classList.add("done");
          stepTo(j + 1);
        }, moves.length > 1 || thenSave ? 1300 : 0);
      }, 850);
    };
    stepTo(0);
  };

  if (P.seq) {
    const stepEl = root.querySelector(".bf-step");
    const prevB = root.querySelector('[data-act="prev"]');
    const nextB = root.querySelector('[data-act="next"]');
    let idx = 0;
    const show = i => {
      idx = i;
      reset();
      P.seq.slice(0, i).forEach(it => {
        if (!it.set) return;
        Object.assign(g, it.set);
        Object.keys(it.set).forEach(k => rowOf(k).classList.add("done"));
      });
      paint(false);
      const it = P.seq[i];
      stepEl.textContent = `Change ${i + 1} of ${P.seq.length}`;
      if (it.save) {
        say.innerHTML = "<strong>Save.</strong> Click Save in the bottom right corner.";
        pressSave();
      } else {
        const [k, v] = Object.entries(it.set)[0];
        say.innerHTML = `<strong>${nameOf(k)}.</strong> Drag it to <b>${fmt(v)}</b>. ${it.why}`;
        run(Object.entries(it.set), false);
      }
      prevB.disabled = i === 0;
      nextB.disabled = i === P.seq.length - 1;
    };
    prevB.addEventListener("click", () => show(idx - 1));
    nextB.addEventListener("click", () => show(idx + 1));
    show(0);
    return;
  }

  const optBtns = [...root.querySelectorAll(".ptb-opt")];
  const pick = o => {
    reset();
    if (o && o.from) Object.assign(g, o.from);
    paint(false);
    optBtns.forEach((b, i) => b.setAttribute("aria-pressed", String(P.opts[i] === o)));
    if (!o) return;
    const moves = o.set ? Object.entries(o.set) : [];
    say.innerHTML = o.say || (moves.map(([k, v]) => `Drag <strong>${nameOf(k)}</strong> to <b>${fmt(v)}</b>.`).join(" ") + ` ${o.why} Then click Save.`);
    if (moves.length) run(moves, true);
  };
  optBtns.forEach((b, i) => b.addEventListener("click", () => pick(P.opts[i])));
  pick(null);
}
const QUAD_SCALE = { whoop: 0.5, micro: 0.62, mid: 0.74, five: 0.87, big: 1 };
function quadIcon(key) {
  const k = QUAD_SCALE[key];
  const L = 24 * k;
  const R = L * 0.8;
  const bw = 6 + 8 * k, bh = 10 + 16 * k;
  const spots = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => [50 + a * L, 50 + b * L]);
  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <path d="M${50 - L} ${50 - L}L${50 + L} ${50 + L}M${50 + L} ${50 - L}L${50 - L} ${50 + L}" stroke="currentColor" stroke-width="${2 + 3 * k}" stroke-linecap="round"/>
    ${spots.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${R}" fill="var(--signal)" fill-opacity=".4" stroke="currentColor" stroke-width="${key === "whoop" ? 3 : 1.2}"/><circle cx="${x}" cy="${y}" r="${1.5 + 1.5 * k}" fill="currentColor"/>`).join("")}
    <rect x="${50 - bw / 2}" y="${50 - bh / 2}" width="${bw}" height="${bh}" rx="3" fill="currentColor"/>
    <circle cx="50" cy="${50 - bh / 2 + 3}" r="1.8" fill="var(--signal)"/>
  </svg>`;
}
function sizeNote(s) {
  const z = SIZES.find(x => x.key === size);
  if (!z || !s.size || !s.size[size]) return "";
  return `<p class="note size"><strong>For your ${z.own}:</strong> ${s.size[size]}</p>`;
}

function saved() {
  try {
    const n = parseInt(localStorage.getItem("tune-step"), 10);
    return size && Number.isInteger(n) && n >= 0 && n < STEPS.length ? n : 0;
  } catch (e) { return 0; }
}
function remember(n) {
  try { localStorage.setItem("tune-step", String(n)); } catch (e) {}
}

function buildPhases() {
  PHASES.forEach((name, p) => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    b.className = "phase-btn";
    b.innerHTML = `<span class="bar"><span class="fill"></span></span><span class="name">${name}</span>`;
    b.addEventListener("click", () => go(STEPS.findIndex(s => s.phase === p)));
    li.appendChild(b);
    phasesEl.appendChild(li);
  });
}

function updateChrome() {
  const step = STEPS[current];
  [...phasesEl.querySelectorAll(".phase-btn")].forEach((b, p) => {
    const idx = STEPS.map((s, i) => s.phase === p ? i : -1).filter(i => i >= 0);
    const done = idx.filter(i => i <= current).length;
    b.querySelector(".fill").style.width = (done / idx.length * 100) + "%";
    b.setAttribute("aria-current", String(step.phase === p));
  });
  backBtn.disabled = current === 0;
  document.body.classList.toggle("wide", !!STEPS[current].mock);
  nextBtn.disabled = current === 0 && !size;
  nextBtn.textContent = current === STEPS.length - 1 ? "Start over" : "Next step";
}

function cardFor(i) {
  const s = STEPS[i];
  const el = document.createElement("article");
  el.className = "card";
  if (s.pick) {
    el.innerHTML = `
    <p class="count"><span>Before you start</span></p>
    <h2>What size props does your quad run?</h2>
    <p class="lead">The steps are the same for every quad. The tips and numbers change with size. You can change this later.</p>
    <div class="picks">${SIZES.map(z => `<button type="button" class="pick" data-size="${z.key}" aria-pressed="${z.key === size}"><span class="pick-ico">${quadIcon(z.key)}</span><span class="pick-txt"><b>${z.name}</b><small>${z.desc}</small></span><span class="pick-go" aria-hidden="true"></span></button>`).join("")}</div>`;
    el.querySelectorAll(".pick").forEach(b => b.addEventListener("click", () => chooseSize(b.dataset.size)));
    return el;
  }
  el.innerHTML = `
    <p class="count"><b>${i}</b><span>of ${STEPS.length - 1}, ${PHASES[s.phase].toLowerCase()}</span></p>
    <h2>${s.title}</h2>
    <p class="lead">${s.lead}</p>
    <ul class="todo">${s.todo.map(t => `<li>${t}</li>`).join("")}</ul>
    ${s.mock ? filterMock(s) : ""}${s.preset ? presetMock() : ""}${s.relax ? relaxMock() : ""}${s.ptb ? ptbMock(s.ptb) : ""}${s.pid ? pidMock(s) : ""}
    ${s.good ? `<p class="note"><strong>Good sign:</strong> ${s.good}</p>` : ""}
    ${s.warn ? `<p class="note warn"><strong>Stop if:</strong> ${s.warn}</p>` : ""}
    ${sizeNote(s)}
    <details><summary>Stuck on this step?</summary><p>${s.stuck}</p></details>`;
  if (s.mock) wireMock(el, s);
  if (s.preset) wirePreset(el);
  if (s.relax) wireRelax(el);
  wirePtb(el);
  wirePid(el, s);
  return el;
}

function go(i) {
  if (busy || i === current || i < 0 || i >= STEPS.length) return;
  if (i > 0 && !size) return;
  const dir = i > current ? "next" : "back";
  const old = stage.querySelector(".card");
  const fresh = cardFor(i);
  busy = true;
  current = i;
  remember(i);
  updateChrome();

  fresh.classList.add("enter-" + dir);
  stage.appendChild(fresh);
  fresh.getBoundingClientRect();
  fresh.classList.remove("enter-" + dir);

  if (old) {
    old.setAttribute("aria-hidden", "true");
    old.inert = true;
    old.classList.add("leave-" + dir);
  }
  setTimeout(() => {
    if (old) old.remove();
    busy = false;
  }, 520);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

nextBtn.addEventListener("click", () => go(current === STEPS.length - 1 ? 1 : current + 1));
document.getElementById("changeSize").addEventListener("click", () => go(0));
backBtn.addEventListener("click", () => go(current - 1));

document.addEventListener("keydown", e => {
  if (e.target.closest("summary")) return;
  if (e.key === "ArrowRight") go(current + 1);
  if (e.key === "ArrowLeft") go(current - 1);
});

let startX = null, startY = null;
stage.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
}, { passive: true });
stage.addEventListener("touchend", e => {
  if (startX === null) return;
  const dx = e.changedTouches[0].clientX - startX;
  const dy = e.changedTouches[0].clientY - startY;
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(current + (dx < 0 ? 1 : -1));
  startX = null;
}, { passive: true });

buildPhases();
current = saved();
stage.appendChild(cardFor(current));
updateChrome();
updateSizebar();
