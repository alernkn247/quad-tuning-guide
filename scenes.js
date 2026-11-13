// Small Betaflight practice screens. A step in steps.js opts in with `scene: "<name>"`.
// Each scene returns { note, html, steps, render }: `steps` lists the targets (data-f) and
// instructions in order, and `render(i, ctx)` draws the screen as it looks at step i.
// app.js's guidedMock runs the cursor and the Previous / Show next / Play all buttons.

const scnNav = (names, target) => `<div class="bf-tabs">${names.map((n, k) => `<span class="${k === 0 ? "on" : ""}${n === target ? " tgt" : ""}"${n === target ? ' data-f="nav"' : ""}>${n}</span>`).join("")}</div>`;
const scnRow = (ctl, lab, f, cls) => `<div class="bf-row${f ? " tgt" : ""}${cls ? " " + cls : ""}"${f ? ` data-f="${f}"` : ""}>${ctl}<span class="bf-lab">${lab}</span></div>`;
const scnNum = v => `<span class="bf-in">${v}</span>`;
const scnSel = v => `<span class="bf-in sel">${v}</span>`;
const scnTog = on => `<span class="bf-tog${on ? " on" : ""}"></span>`;
const scnBox = (title, inner) => `<div class="bf-cols"><div class="bf-box"><div class="bf-title">${title}</div>${inner}</div></div>`;
const scnCmd = ph => `<div class="bfp-search tgt" data-f="cmd"><span class="bf-in"><span class="bfp-q"></span><span class="bfp-caret"></span><span class="bfp-ph">${ph}</span></span></div>`;

const SCENES = {
  // Steps 2 and 26: back up the settings from the CLI tab.
  cli(s) {
    const d = new Date();
    const file = `BTFL_cli_${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}.txt`;
    const intro = "Entering CLI Mode, type 'exit' to return, or 'help'\n\n# ";
    const dump = "# diff all\n\n# version\n# Betaflight / STM32F405 4.5\n\n# start the command batch\nbatch start\n\n# master\n(every setting you have changed is listed here)\n\n# save configuration\nsave\n\n# ";
    const cmd = "diff all";
    return {
      note: "This is a practice copy of the CLI screen. Nothing here changes your quad.",
      interval: 3600,
      html: `
        ${scnNav(["Setup", "Configuration", "Blackbox", "CLI"], "CLI")}
        <div class="bfp-body">
          <div class="bf-term"><div class="bf-out"></div></div>
          ${scnCmd("Write your command here")}
          <p class="bf-toast out">Saved as <b>${file}</b>${s.cliTuned ? ". Add “tuned” to the name so you can tell it from your first backup." : ""}</p>
        </div>
        <div class="bf-foot"><span class="bf-btn off">Load from file</span><span class="bf-btn" data-f="savefile">Save to File</span></div>`,
      steps: [
        { f: "nav", say: "<strong>CLI tab.</strong> Click CLI at the bottom of the menu down the left side of Betaflight." },
        { f: "cmd", say: "<strong>The command.</strong> Click the box at the bottom, type <b>diff all</b> and press Enter. Your settings scroll past as text." },
        { f: "savefile", say: s.cliTuned
          ? "<strong>Save to File.</strong> Click it and keep the file as your tuned copy."
          : "<strong>Save to File.</strong> Click it and keep the file somewhere safe. This is your undo button." }
      ],
      render(i, { nav, $, later }) {
        const out = $(".bf-out"), q = $(".bfp-q"), ph = $(".bfp-ph"), toast = $(".bf-toast");
        const setQ = t => { q.textContent = t; ph.hidden = !!t; };
        nav(i > 0);
        out.textContent = i > 1 ? dump : intro;
        setQ("");
        toast.classList.add("out");
        if (i === 0) later(() => nav(true), 900);
        if (i === 1) {
          cmd.split("").forEach((_, k) => later(() => setQ(cmd.slice(0, k + 1)), 800 + k * 130));
          later(() => { setQ(""); out.textContent = dump; }, 2300);
        }
        if (i === 2) later(() => toast.classList.remove("out"), 1100);
      }
    };
  },

  // Step 3: read the CPU load, and lower the PID loop rate if it is too high.
  cpu() {
    return {
      note: "This is a practice copy of the Betaflight window. Nothing here changes your quad.",
      html: `
        ${scnNav(["Setup", "Configuration", "PID Tuning", "Motors"], "Configuration")}
        <div class="bfp-body scn-flush">
          <div class="scn-stack">
            <div class="scn-a">${scnBox("Setup", `<p class="scn-fill">Your quad’s 3D model and status appear on this tab.</p>`)}</div>
            <div class="scn-b out">${scnBox("System configuration", scnRow(scnSel("8.00 kHz"), "Gyro update frequency") + scnRow(scnSel("8.00 kHz"), "PID loop frequency", "loop"))}</div>
          </div>
        </div>
        <div class="bf-foot mid"><span class="bf-btn" data-f="save">Save and Reboot</span></div>
        <div class="bf-status"><span>Packet error: 0</span><span>I2C error: 0</span><span class="tgt" data-f="cpu">CPU Load: <b class="scn-cpu">23%</b></span></div>`,
      steps: [
        { f: "cpu", say: "<strong>CPU load.</strong> Look along the bottom edge of the Betaflight window. Under about <b>50%</b> with the quad on the bench is fine, and you can move on." },
        { f: "nav", say: "<strong>Only if it’s over 50%.</strong> The practice screen now shows <b>62%</b>. Click the Configuration tab." },
        { f: "loop", say: "<strong>PID loop frequency.</strong> Set it to <b>4 kHz</b>. Leave the gyro at 8 kHz." },
        { f: "save", say: "<strong>Save and Reboot.</strong> When Betaflight reconnects, the CPU load should be back under 50%." }
      ],
      render(i, { nav, $, tgt, later }) {
        const cpu = $(".scn-cpu"), loop = tgt("loop").querySelector(".bf-in");
        const setCpu = (v, hot) => { cpu.textContent = v; cpu.classList.toggle("hot", hot); };
        const pane = b => { $(".scn-a").classList.toggle("out", b); $(".scn-b").classList.toggle("out", !b); nav(b, false); };
        setCpu(i === 0 ? "23%" : "62%", i > 0);
        pane(i > 1);
        loop.textContent = i > 2 ? "4.00 kHz" : "8.00 kHz";
        if (i === 1) later(() => pane(true), 900);
        if (i === 2) later(() => { loop.textContent = "4.00 kHz"; tgt("loop").classList.add("flash"); }, 900);
        if (i === 3) later(() => setCpu("34%", false), 1200);
      }
    };
  },

  // Step 5: switch on bidirectional DShot and set the motor poles.
  motors() {
    const poles = size === "whoop" || size === "micro" ? "12" : "14";
    const polesSay = poles === "12"
      ? "<strong>Motor poles.</strong> Count the magnets inside the motor bell and type that number. Most motors this size have <b>12</b>."
      : size === "mid"
        ? "<strong>Motor poles.</strong> Count the magnets inside the motor bell and type that number. Motors this size have 12 or 14. The practice screen keeps <b>14</b>."
        : "<strong>Motor poles.</strong> Almost all motors this size have <b>14</b> magnets, which is already filled in. Count them if you’re unsure.";
    return {
      note: "This is a practice copy of the Motors screen. Nothing here changes your quad.",
      html: `
        ${scnNav(["Setup", "Configuration", "Receiver", "Motors"], "Motors")}
        <div class="bfp-body scn-flush">
          ${scnBox("ESC/Motor Features",
            scnRow(scnSel("DSHOT300"), "ESC/Motor protocol") +
            scnRow(scnTog(false), "Bidirectional DShot (requires supported ESC firmware)", "bidir") +
            scnRow(scnNum(14), "Motor poles (number of magnets on the motor bell)", "poles"))}
        </div>
        <div class="bf-foot"><span class="bf-btn" data-f="save">Save and Reboot</span></div>`,
      steps: [
        { f: "nav", say: "<strong>Motors tab.</strong> Click Motors in the menu down the left side of Betaflight. Take the props off first." },
        { f: "bidir", say: "<strong>Bidirectional DShot.</strong> Switch it <b>on</b>. The Motor poles box appears once it’s on." },
        { f: "poles", say: polesSay },
        { f: "save", say: "<strong>Save and Reboot.</strong> Click it in the bottom right corner." }
      ],
      render(i, { nav, tgt, later }) {
        const tog = tgt("bidir").querySelector(".bf-tog"), row = tgt("poles"), box = row.querySelector(".bf-in");
        const setOn = on => { tog.classList.toggle("on", on); row.classList.toggle("off", !on); };
        nav(i > 0);
        setOn(i > 1);
        box.textContent = i > 2 ? poles : "14";
        if (i === 0) later(() => nav(true), 900);
        if (i === 1) later(() => setOn(true), 900);
        if (i === 2 && poles !== "14") later(() => { box.textContent = poles; row.classList.add("flash"); }, 900);
      }
    };
  },

  // Step 6: logging rate, debug mode, then erase the flash.
  blackbox() {
    return {
      note: "This is a practice copy of the Blackbox screen. Nothing here changes your quad.",
      html: `
        ${scnNav(["Setup", "Motors", "Blackbox", "CLI"], "Blackbox")}
        <div class="bfp-body scn-flush">
          ${scnBox("Blackbox configuration",
            scnRow(scnSel("Onboard Flash"), "Blackbox logging device") +
            scnRow(scnSel("1 kHz"), "Blackbox logging rate", "rate") +
            scnRow(scnSel("NONE"), "Blackbox debug mode", "debug") +
            `<div class="bf-sub">Onboard flash</div>
            <div class="bf-meter"><span></span></div>
            <p class="bf-used"></p>`)}
        </div>
        <div class="bf-foot"><span class="bf-btn" data-f="erase">Erase flash</span><span class="bf-btn" data-f="save">Save and Reboot</span></div>`,
      steps: [
        { f: "nav", say: "<strong>Blackbox tab.</strong> Click Blackbox in the menu down the left side of Betaflight." },
        { f: "rate", say: "<strong>Logging rate.</strong> Choose about <b>2 kHz</b> from the list." },
        { f: "debug", say: "<strong>Debug mode.</strong> Choose <b>FFT_FREQ</b> from the list." },
        { f: "save", say: "<strong>Save and Reboot.</strong> Click it, then wait for Betaflight to reconnect." },
        { f: "erase", say: "<strong>Erase flash.</strong> Click it so the next log starts empty. The storage bar drops to zero." }
      ],
      render(i, { nav, $, tgt, later }) {
        const set = (f, v) => { tgt(f).querySelector(".bf-in").textContent = v; };
        const used = pct => { $(".bf-meter span").style.width = pct + "%"; $(".bf-used").textContent = pct ? `Used space: ${pct}%` : "Used space: 0%. The flash is empty."; };
        nav(i > 0);
        set("rate", i > 1 ? "2 kHz" : "1 kHz");
        set("debug", i > 2 ? "FFT_FREQ" : "NONE");
        used(62);
        if (i === 0) later(() => nav(true), 900);
        if (i === 1) later(() => { set("rate", "2 kHz"); tgt("rate").classList.add("flash"); }, 900);
        if (i === 2) later(() => { set("debug", "FFT_FREQ"); tgt("debug").classList.add("flash"); }, 900);
        if (i === 4) later(() => used(0), 1000);
      }
    };
  },

  // Step 16: a calm rate profile and a 30 degree angle limit for the test flights.
  rates() {
    const axis = (name, cls) => `<tr class="${cls}"><th scope="row">${name}</th><td><span class="bf-in" data-r="70">70</span></td><td><span class="bf-in" data-r="670">670</span></td><td><span class="bf-cell">0.00</span></td></tr>`;
    return {
      note: "This is a practice copy of the PID Tuning screen. The starting numbers are examples, so yours may differ.",
      html: `
        ${scnNav(["Setup", "Configuration", "Presets", "PID Tuning"], "PID Tuning")}
        <div class="bfp-body scn-flush">
          <div class="bf-tabs sub"><span class="on tgt" data-f="subP">PID Profile Settings</span><span class="tgt" data-f="subR">Rateprofile Settings</span><span>Filter Settings</span></div>
          <div class="scn-stack">
            <div class="scn-a">${scnBox("PID Controller Settings",
              `<div class="bf-sub">Angle/Horizon</div>` +
              scnRow(scnNum(60), "Angle Limit", "angle") +
              scnRow(scnNum(50), "Angle Strength"))}</div>
            <div class="scn-b out">${scnBox("Rateprofile Settings",
              scnRow(scnSel("Rateprofile 1"), "Rate profile", "prof") +
              scnRow(scnSel("Actual"), "Rates Type") +
              `<div class="bf-scroll"><table class="bf-pid tgt" data-f="rates">
                <thead><tr><th></th><th>Center Sensitivity</th><th>Max Rate</th><th>Expo</th></tr></thead>
                <tbody>${axis("ROLL", "ax-r")}${axis("PITCH", "ax-p")}${axis("YAW", "ax-y")}</tbody>
              </table></div>`)}</div>
          </div>
        </div>
        <div class="bf-foot"><span class="bf-btn" data-f="save">Save</span></div>`,
      steps: [
        { f: "nav", say: "<strong>PID Tuning tab.</strong> Click PID Tuning in the menu down the left side of Betaflight." },
        { f: "subR", say: "<strong>Rateprofile Settings.</strong> Click it at the top of the PID Tuning screen." },
        { f: "prof", say: "<strong>Rate profile.</strong> Switch to a spare one, such as <b>Rateprofile 2</b>, so your normal rates stay untouched." },
        { f: "rates", say: "<strong>Center Sensitivity and Max Rate.</strong> Type <b>150</b> in both boxes on roll, pitch and yaw." },
        { f: "subP", say: "<strong>PID Profile Settings.</strong> Click back to it for the last change." },
        { f: "angle", say: "<strong>Angle Limit.</strong> Set it to <b>30</b>." },
        { f: "save", say: "<strong>Save.</strong> Click Save in the bottom right corner, then fly the next flights in Angle mode." }
      ],
      render(i, { nav, $, tgt, later }) {
        const cells = [...tgt("rates").querySelectorAll(".bf-in")];
        const pane = r => {
          $(".scn-a").classList.toggle("out", r);
          $(".scn-b").classList.toggle("out", !r);
          tgt("subR").classList.toggle("on", r);
          tgt("subP").classList.toggle("on", !r);
        };
        const prof = v => { tgt("prof").querySelector(".bf-in").textContent = "Rateprofile " + v; };
        const flat = on => cells.forEach(c => { c.textContent = on ? "150" : c.dataset.r; });
        const angle = v => { tgt("angle").querySelector(".bf-in").textContent = v; };
        nav(i > 0);
        pane(i >= 2 && i <= 4);
        prof(i > 2 ? 2 : 1);
        flat(i > 3);
        angle(i > 5 ? 30 : 60);
        if (i === 0) later(() => nav(true), 900);
        if (i === 1) later(() => pane(true), 900);
        if (i === 2) later(() => { prof(2); tgt("prof").classList.add("flash"); }, 900);
        if (i === 3) later(() => { flat(true); tgt("rates").classList.add("flash"); }, 900);
        if (i === 4) later(() => pane(false), 900);
        if (i === 5) later(() => { angle(30); tgt("angle").classList.add("flash"); }, 900);
      }
    };
  }
};

// ---- PIDtoolbox practice screens (steps 10, 11, 19, 22), laid out like the real program ----
const pwWave = (y, amp, seed, x0 = 4, x1 = 296, n = 64) => {
  let r = seed, d = "";
  for (let k = 0; k <= n; k++) {
    r = (r * 9301 + 49297) % 233280;
    d += `${k ? "L" : "M"}${(x0 + (x1 - x0) * k / n).toFixed(1)} ${(y + (r / 233280 - .5) * 2 * amp).toFixed(1)}`;
  }
  return d;
};
const pwSpecPath = (peaks, floor) => {
  let d = "";
  for (let x = 0; x <= 136; x += 2) {
    let v = floor + 34 * Math.exp(-x / 5);
    peaks.forEach(([c, h, w]) => { v += h * Math.exp(-(((x - c) / w) ** 2)); });
    d += `${x ? "L" : "M"}${10 + x} ${(78 - Math.min(v, 70)).toFixed(1)}`;
  }
  return d;
};
const pwStepPath = (z, gain) => {
  const w = .09, wd = w * Math.sqrt(1 - z * z);
  let d = "";
  for (let t = 0; t <= 180; t += 3) {
    const y = gain * (1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + z / Math.sqrt(1 - z * z) * Math.sin(wd * t)));
    d += `${t ? "L" : "M"}${16 + t} ${(92 - y * 52).toFixed(1)}`;
  }
  return d;
};
const PW_COL = ["#ff4d4d", "#ff9a3c", "#ffe14d", "#7ddc5a", "#4dd2ff"];
// The main log viewer: plots on the left, Control Panel on the right. `hot` is the button the cursor visits.
const pwMain = (hot, file) => {
  const rows = ["Roll", "Pitch", "Yaw"].map((n, k) => {
    const y = 4 + k * 44;
    return `<rect x="4" y="${y}" width="292" height="40" fill="none" stroke="#444"/>
      <path d="M4 ${y + 20}H296" stroke="#555" stroke-dasharray="3 3"/>
      <text class="ptb-t" x="8" y="${y + 11}">${n}</text>
      <g class="pw-data"><path d="${pwWave(y + 20, 5, 7 + k * 31)}" fill="none" stroke="#e0245e" stroke-width="1.2"/><path d="${pwWave(y + 20, 3, 91 + k * 17)}" fill="none" stroke="#ddd" stroke-width=".8"/></g>`;
  }).join("");
  const motors = ["#4dd2ff", "#7ddc5a", "#ffe14d", "#ff9a3c"].map((c, k) => `<path d="${pwWave(160, 2.5, 13 + k * 53)}" fill="none" stroke="${c}" stroke-width=".9"/>`).join("");
  const btn = (name, cls, f) => `<span class="pw-btn ${cls}${hot === f ? " tgt" : ""}"${hot === f ? ` data-f="tool"` : ""}>${name}</span>`;
  return `
    <div class="pw-split pw-main${hot === "open" ? "" : " loaded"}">
      <div class="pw-plotbox${hot === "open" ? " tgt" : ""}"${hot === "open" ? ' data-f="plots"' : ""}><svg class="pw-plot" viewBox="0 0 300 180" role="img" aria-label="Log viewer with roll, pitch, yaw and motor plots">
        ${rows}
        <rect x="4" y="136" width="292" height="40" fill="none" stroke="#444"/>
        <text class="ptb-t" x="8" y="147">Throttle | Motor</text>
        <g class="pw-data">${motors}</g>
        <g class="pw-trim"><rect x="4" y="4" width="26" height="172"/><rect x="270" y="4" width="26" height="172"/></g>
      </svg>${hot === "open" ? '<i class="pw-trimhit tgt" data-f="trim"></i>' : ""}</div>
      <div class="pw-panel">
        <div class="pw-cap">Control Panel</div>
        <div class="pw-row3"><span class="pw-btn grn${hot === "open" ? " tgt" : ""}"${hot === "open" ? ' data-f="open"' : ""}>Open</span><span class="pw-btn org">Restore</span><span class="pw-btn red">Reset</span></div>
        <div class="pw-sel${hot === "open" ? " tgt" : ""}"${hot === "open" ? ' data-f="file"' : ""}><span class="pw-fname">${file}</span></div>
        ${btn("Spectral Analyzer", "red", "spec")}
        ${btn("Step Resp Tool", "blu", "step")}
        <span class="pw-btn org">PID slider tool</span>
        <span class="pw-btn grn">Filter Sim</span>
      </div>
    </div>`;
};
const pwList = (items, f, cls) => `<div class="pw-list ${cls} tgt" data-f="${f}">${items.map(t => `<span>${t}</span>`).join("")}</div>`;
const pwWin = (main, title, tool) => `
  <div class="pw-bar"><i></i><i></i><i></i><b class="pw-name">PIDtoolbox</b></div>
  <div class="scn-stack">
    <div class="scn-a">${main}</div>
    <div class="scn-b out"><div class="pw-ttl">${title}</div>${tool}</div>
  </div>`;
const PW_NOTE = "This is a practice copy of PIDtoolbox, drawn with made-up data. Yours may look a little different depending on the version.";

Object.assign(SCENES, {
  // Step 10: open the log and trim the ends.
  ptbOpen() {
    const file = "01 hover.bbl";
    return {
      note: PW_NOTE, cls: "pw", interval: 3600,
      html: `<div class="pw-bar"><i></i><i></i><i></i><b class="pw-name">PIDtoolbox</b></div>${pwMain("open", file)}`,
      steps: [
        { f: "open", say: "<strong>Open.</strong> Click Open at the top of the Control Panel on the right, then choose the log you saved." },
        { f: "file", say: `<strong>Check the file.</strong> Its name appears in the list under the buttons. Here it’s <b>${file}</b>. If the log holds several flights, pick the long one.` },
        { f: "plots", say: "<strong>The log viewer.</strong> Roll, pitch and yaw each get a row of wavy gyro lines. The motor lines sit along the bottom." },
        { f: "trim", say: "<strong>Trim the ends.</strong> The grey bands mark what gets left out. Cut off take-off and landing so only the steady hover is measured." }
      ],
      render(i, { $, later }) {
        const m = $(".pw-main");
        m.classList.toggle("loaded", i > 0);
        m.classList.remove("trimmed");
        if (i === 0) later(() => m.classList.add("loaded"), 1300);
        if (i === 3) later(() => m.classList.add("trimmed"), 900);
      }
    };
  },

  // Steps 11 and 22: open the Spectral Analyzer, pick the log and the signal, then Run.
  ptbSpec(s) {
    const sig = s.sig || "Gyro prefilt", file = s.sig === "Dterm" ? "08 wobble.bbl" : "01 hover.bbl";
    const dterm = sig === "Dterm";
    const full = pwSpecPath(dterm ? [[30, 30, 16], [10, 14, 6]] : [[22, 46, 2.4], [44, 28, 2.4], [66, 18, 2.8]], dterm ? 6 : 8);
    const plot = (t, d) => `<figure><figcaption>${t}</figcaption><svg viewBox="0 0 150 84"><rect x="10" y="4" width="136" height="74" fill="none" stroke="#444"/><path class="pw-res" d="${d}" fill="none" stroke="#e0245e" stroke-width="1.4"/></svg></figure>`;
    const sub = "M10 14C26 52 60 60 146 66";
    return {
      note: PW_NOTE, cls: "pw", interval: 3600,
      html: pwWin(pwMain("spec", file), "Spectral Analyzer", `
        <div class="pw-split pw-tool">
          <div class="pw-grid2">${plot("Full Spectrum, roll", full)}${plot("Sub 100Hz, roll", sub)}${plot("Full Spectrum, pitch", full)}${plot("Sub 100Hz, pitch", sub)}</div>
          <div class="pw-panel">
            <div class="pw-cap">select files (max 10)</div>
            ${pwList([file], "file", "pw-files")}
            ${pwList(["Gyro", "Gyro prefilt", "Dterm", "Dterm prefilt", "Pterm", "PID error"], "sig", "pw-sigs")}
            <div class="pw-row2"><span class="pw-btn grn tgt" data-f="run">Run</span><span class="pw-btn org">Reset</span></div>
            <span class="pw-btn red">Freq x Throttle</span>
          </div>
        </div>`),
      steps: [
        { f: "tool", say: "<strong>Spectral Analyzer.</strong> Click it in the Control Panel. It’s the button with red text. A new window opens." },
        { f: "file", say: `<strong>Pick the log.</strong> In the “select files” list at the top right, click <b>${file}</b> so it’s highlighted.` },
        { f: "sig", say: `<strong>Pick the signal.</strong> In the list below it, click <b>${sig}</b>. ${dterm ? "That’s the D term after filtering, which is what reaches the motors." : "That’s the gyro before any filtering."}` },
        { f: "run", say: "<strong>Run.</strong> The graphs fill in. The left column is the full range, and that’s the one this guide reads. Use roll and pitch." }
      ],
      render(i, { $, later, root }) {
        const a = $(".scn-a"), b = $(".scn-b"), t = $(".pw-tool"), name = $(".pw-name");
        const view = on => { a.classList.toggle("out", on); b.classList.toggle("out", !on); name.textContent = on ? "PIDtoolbox – Spectral Analyzer" : "PIDtoolbox"; };
        const files = root.querySelectorAll(".pw-files span"), sigs = [...root.querySelectorAll(".pw-sigs span")];
        const pick = (f, g) => { files.forEach(n => n.classList.toggle("sel", f)); sigs.forEach(n => n.classList.toggle("sel", g && n.textContent === sig)); };
        view(i > 0); pick(i > 1, i > 2); t.classList.remove("ran");
        if (i === 0) later(() => view(true), 1500);
        if (i === 1) later(() => pick(true, false), 1000);
        if (i === 2) later(() => pick(true, true), 1000);
        if (i === 3) later(() => t.classList.add("ran"), 1000);
      }
    };
  },

  // Step 19: open the Step Response Tool, select the five wobble logs, Run, then Y correction.
  ptbStep() {
    const vals = ["0.6", "0.8", "1.0", "1.2", "1.4"];
    const files = vals.map((v, k) => `0${k + 2} D${v}.bbl`);
    const zs = [.3, .42, .55, .68, .8], off = [.93, 1.05, .97, 1.04, .95];
    const curves = g => zs.map((z, k) => `<path d="${pwStepPath(z, g ? off[k] : 1)}" fill="none" stroke="${PW_COL[k]}" stroke-width="1.3"/>`).join("");
    const dots = PW_COL.map((c, k) => `<circle cx="${16 + k * 14}" cy="${62 - k * 9}" r="2.5" fill="${c}"/>`).join("");
    return {
      note: PW_NOTE, cls: "pw", interval: 3800,
      html: pwWin(pwMain("step", files[0]), "Step Response Tool", `
        <div class="pw-split pw-tool">
          <div class="pw-grid21">
            <figure><figcaption>Step Response Functions, roll</figcaption><svg viewBox="0 0 200 100"><rect x="16" y="6" width="180" height="86" fill="none" stroke="#444"/><path d="M16 40H196" stroke="#e0245e" stroke-dasharray="4 3"/>
              <text class="ptb-t" x="12" y="43" text-anchor="end">1</text><text class="ptb-t" x="12" y="94" text-anchor="end">0</text>
              <g class="pw-res pw-raw">${curves(true)}</g><g class="pw-res pw-cor">${curves(false)}</g></svg></figure>
            <figure><figcaption>SR Latency (ms)</figcaption><svg viewBox="0 0 84 100"><rect x="6" y="6" width="74" height="86" fill="none" stroke="#444"/><g class="pw-res">${dots}</g></svg></figure>
          </div>
          <div class="pw-panel">
            <div class="pw-cap">select files (max 10)</div>
            ${pwList(files, "file", "pw-files")}
            <div class="pw-row2"><span class="pw-btn grn tgt" data-f="run">Run</span><span class="pw-btn org">Reset</span></div>
            <div class="pw-radios"><span>Raw</span><span class="tgt" data-f="ycor">Y corr</span></div>
          </div>
        </div>`),
      steps: [
        { f: "tool", say: "<strong>Step Resp Tool.</strong> With your five wobble logs open, click it in the Control Panel. It’s the button with blue text." },
        { f: "file", say: "<strong>Pick the logs.</strong> In the “select files” list, select all five wobble logs so they’re highlighted." },
        { f: "run", say: "<strong>Run.</strong> One curve appears for each flight, in a different colour. The small graph on the right shows how quickly each one responded." },
        { f: "ycor", say: "<strong>Y corr.</strong> Switch it on to line every curve up on the dashed target line. That makes the bumps easier to compare." }
      ],
      render(i, { $, later, root }) {
        const a = $(".scn-a"), b = $(".scn-b"), t = $(".pw-tool"), name = $(".pw-name"), y = $('[data-f="ycor"]');
        const view = on => { a.classList.toggle("out", on); b.classList.toggle("out", !on); name.textContent = on ? "PIDtoolbox – Step Response Tool" : "PIDtoolbox"; };
        const list = root.querySelectorAll(".pw-files span");
        const pick = on => list.forEach(n => n.classList.toggle("sel", on));
        const cor = on => { t.classList.toggle("ycorr", on); y.classList.toggle("on", on); };
        view(i > 0); pick(i > 1); t.classList.toggle("ran", i > 2); cor(false);
        if (i === 0) later(() => view(true), 1500);
        if (i === 1) list.forEach((n, k) => later(() => n.classList.add("sel"), 800 + k * 220));
        if (i === 2) later(() => t.classList.add("ran"), 1000);
        if (i === 3) later(() => cor(true), 1000);
      }
    };
  }
});

function sceneMock(s) {
  const sc = SCENES[s.scene](s);
  return `
  <div class="bf scn">
    <div class="bf-guide">
      <p class="bf-step"></p>
      <p class="bf-say" aria-live="polite"></p>
      <div class="bf-ctl">
        <button type="button" class="btn" data-act="prev">Previous</button>
        <button type="button" class="btn primary" data-act="next">Show next</button>
        <button type="button" class="btn" data-act="play">Play all</button>
      </div>
    </div>
    <p class="bf-note">${sc.note}</p>
    <div class="bf-screen${sc.cls ? " " + sc.cls : ""}">
      ${sc.html}
      <svg class="bf-cursor" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 2v17l4.6-4.2 3 7 2.8-1.2-3-6.8H18z" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linejoin="round"/></svg>
    </div>
  </div>`;
}
function wireScene(el, s) {
  const root = el.querySelector(".scn");
  if (!root) return;
  const sc = SCENES[s.scene](s);
  const tabs = [...root.querySelectorAll(".bf-tabs:not(.sub) span")];
  const body = root.querySelector(".bfp-body");
  // nav(true) makes the scene's own tab the active one; the screen body is greyed out until then.
  const nav = (on, dim = true) => {
    tabs.forEach((t, k) => t.classList.toggle("on", on ? t.dataset.f === "nav" : k === 0));
    if (body) body.classList.toggle("dim", dim && !on);
  };
  guidedMock(root, {
    label: "Step",
    interval: sc.interval || 3000,
    autoplay: true,
    steps: sc.steps,
    render(i, ctx) {
      sc.steps.forEach((g, j) => {
        const n = ctx.tgt(g.f);
        if (n.classList.contains("bf-row")) n.classList.toggle("done", j < i);
      });
      sc.render(i, Object.assign({ nav, $: q => root.querySelector(q) }, ctx));
    }
  });
}
