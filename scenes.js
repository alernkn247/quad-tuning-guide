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
    <div class="bf-screen">
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
    body.classList.toggle("dim", dim && !on);
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
