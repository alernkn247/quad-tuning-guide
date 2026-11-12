// Guide content: the phases, quad sizes and the text of every step.
// Edit wording here; app.js turns it into the page.
const PHASES = ["Get ready", "Hover and filters", "P and D", "Finish"];

const SIZES = [
  { key: "whoop", name: "Whoop", desc: "Ducted, props under 2 inch", own: "whoop" },
  { key: "micro", name: "2 to 3 inch", desc: "Toothpicks and small cinewhoops", own: "2 to 3 inch quad" },
  { key: "mid", name: "3.5 to 4 inch", desc: "Light freestyle and small long range", own: "3.5 to 4 inch quad" },
  { key: "five", name: "5 inch", desc: "Standard freestyle and racing", own: "5 inch quad" },
  { key: "big", name: "6 to 7 inch", desc: "Long range and heavy lifters", own: "6 to 7 inch quad" }
];

const STEPS = [
  { phase: 0, pick: true },
  {
    phase: 0,
    title: "Check the quad before you tune",
    lead: "Tuning can’t fix a loose or damaged quad, so sort the hardware first.",
    todo: [
      "Fit a fresh set of props. Tuning on bent props gives you the wrong answers.",
      "Tighten the frame, motor and stack screws.",
      "Check the flight controller is secure and the capacitor is fitted.",
      "Strap the battery so the quad balances in the middle."
    ],
    good: "Nothing rattles when you give it a shake.",
    stuck: "A gritty motor or a bent prop will show up as noise later. Swap it now and save yourself the hunt."
  },
  {
    phase: 0,
    title: "Save your current settings",
    scene: "cli",
    lead: "This is your undo button. If anything goes wrong, you can go straight back.",
    todo: [
      "Open Betaflight and go to the CLI tab.",
      "Type <code>diff all</code> and press Enter.",
      "Click Save to File."
    ],
    good: "You have a text file with today’s date in its name.",
    stuck: "To go back later, paste the file’s text into the CLI, then type <code>save</code>."
  },
  {
    phase: 0,
    title: "Check the CPU load",
    scene: "cpu",
    lead: "A flight controller that’s too busy can’t filter or tune properly.",
    todo: [
      "Look at the CPU load figure at the bottom of the Betaflight window.",
      "It should be under about 50%."
    ],
    good: "CPU load is under 50% with the quad sitting on the bench.",
    stuck: "Over 50%? On the Configuration tab, set the PID loop to 4 kHz and keep the gyro at 8 kHz. You should never need to go lower than that."
  },
  {
    phase: 0,
    title: "Apply your radio link preset",
    preset: true,
    lead: "Betaflight needs to know how fast your radio sends stick data.",
    todo: [
      "Go to the Presets tab.",
      "Search for your radio system, such as ELRS or Crossfire.",
      "Pick the preset that matches your packet rate, for example 250 Hz.",
      "Click Pick in the window that opens.",
      "Click Save and Reboot."
    ],
    good: "The preset name matches the packet rate shown on your radio.",
    stuck: "No exact match? Pick the closest one. If you’re between two, go for the higher rate."
  },
  {
    phase: 0,
    title: "Turn on bidirectional DShot",
    scene: "motors",
    lead: "This switches on the RPM filter, which removes motor noise for you. It also records motor speed in your logs.",
    todo: [
      "Go to the Motors tab.",
      "Switch on Bidirectional DShot.",
      "Set Motor poles to the number of magnets in your motor bell.",
      "Save and reboot."
    ],
    good: "With a battery plugged in, the Motors tab shows an error rate near 0%.",
    stuck: "No RPM reading? Your ESC firmware may not support it. BLHeli_32, AM32 and Bluejay all do.",
    size: {
      whoop: "Most whoop motors have 12 magnets. Whoop ESCs usually need Bluejay firmware before this works.",
      micro: "Most motors this size have 12 magnets. Count to be sure.",
      mid: "Motors this size have 12 or 14 magnets. Count to be sure.",
      five: "Almost all 5 inch motors have 14 magnets.",
      big: "Almost all motors this size have 14 magnets."
    }
  },
  {
    phase: 0,
    title: "Set up Blackbox logging",
    scene: "blackbox",
    lead: "The log records what the quad felt in the air. Every test in this guide is read from it.",
    todo: [
      "Go to the Blackbox tab.",
      "Set the logging rate to about 2 kHz.",
      "Set debug mode to <code>FFT_FREQ</code>.",
      "Save, then click Erase Flash so the log starts empty."
    ],
    good: "The storage bar shows it’s empty.",
    stuck: "Onboard flash memory is the most reliable. An SD card works too, but use a fast one, because gaps in the log spoil the results. On Betaflight older than 4.3, set debug mode to GYRO_SCALED instead.",
    size: {
      whoop: "Small motors spin very fast. If your board offers 4 kHz, use it for the hover test, then go back to 2 kHz so the memory lasts.",
      micro: "Small motors spin very fast. If your board offers 4 kHz, use it for the hover test, then go back to 2 kHz so the memory lasts.",
      mid: "If your board offers 4 kHz, it’s worth using for the hover test on a quad this small. Go back to 2 kHz afterwards.",
      big: "Big props make lower-pitched noise, so 1.6 or 2 kHz is plenty."
    }
  },
  {
    phase: 0,
    title: "Get PIDtoolbox",
    lead: "PIDtoolbox is the program that turns your logs into graphs you can read.",
    todo: [
      "Download it from the PIDtoolbox author’s Patreon page. It’s a paid download that costs a few dollars.",
      "Install it and open it once to check it runs."
    ],
    good: "PIDtoolbox opens and shows an Open file button.",
    stuck: "The paid version adds a motor-line overlay that makes the hover test easier to read, but you can follow this guide without it."
  },
  {
    phase: 1,
    title: "Fly the hover test",
    lead: "This shows how noisy the quad is when it’s doing nothing. Everyone flies it the same way, so the result is easy to judge.",
    todo: [
      "Take off and hover about a metre off the ground.",
      "Hold it as still as you can for 30 to 40 seconds.",
      "Land and disarm."
    ],
    good: "A boring flight. That’s exactly what you want here.",
    stuck: "Don’t hover lower than about a metre. Air bouncing off the ground adds noise that isn’t really there. Angle mode is fine for this.",
    size: {
      whoop: "Indoors is fine. Keep away from walls, the floor and the ceiling."
    }
  },
  {
    phase: 1,
    title: "Touch the motors",
    lead: "Do this right after every landing. It’s your safety check for the whole process.",
    todo: [
      "Rest a finger on each motor bell.",
      "Cool or slightly warm is fine.",
      "If you can’t hold your finger there for 5 seconds, it’s too hot."
    ],
    warn: "Hot motors mean stop. Undo your last change before you fly again.",
    stuck: "One motor much hotter than the rest usually means a bad motor, a damaged prop, or the weight sitting off-centre.",
    size: {
      whoop: "Tiny motors cool down in seconds, so check the moment you land.",
      big: "Big props heat motors quickly. Check within a few seconds of landing."
    }
  },
  {
    phase: 1,
    title: "Open the log in PIDtoolbox",
    lead: "Get the log off the quad and onto your computer.",
    todo: [
      "Plug the quad in and open the Blackbox tab.",
      "Click Save Flash to File. Give it a short, numbered name such as “01 hover”.",
      "In PIDtoolbox, click Open file and choose it.",
      "If it lists several logs, pick the long one."
    ],
    good: "You see wavy gyro and motor lines in the log viewer.",
    stuck: "Short logs of a second or two are just you arming on the ground. To cut off take-off and landing, press I and drag to set the start, then O to set the end."
  },
  {
    phase: 1,
    title: "Read the noise graph",
    lead: "This graph shows how much the quad is shaking, and how fast. The practice screen below teaches you to read it.",
    ptb: "spec",
    todo: [
      "Press “Show next” to learn what each part means.",
      "Then pick the example that looks most like yours."
    ],
    good: "Tall peaks standing on a low, quiet floor.",
    stuck: "Roll, pitch and yaw each get their own graph. Judge roll and pitch. Yaw is usually the quietest.",
    size: {
      whoop: "Ducts and plastic frames make whoops noisier. Expect a higher floor than the example.",
      big: "On a quad with a camera on the front, the front and back motors spin at different speeds, so each peak may look doubled."
    }
  },
  {
    phase: 1,
    title: "Find where the motor noise starts",
    lead: "You need one number from the graph: the lowest frequency where motor noise begins.",
    ptb: "low",
    todo: [
      "Find the first tall motor peak.",
      "Click the left foot of that peak, where the line starts to climb.",
      "Write down the frequency PIDtoolbox shows."
    ],
    good: "You have one number written down, such as 120 Hz.",
    stuck: "Use the data tip tool in PIDtoolbox, then click on the line. It shows the frequency at that point.",
    size: {
      whoop: "Small props spin fast, so expect a high number.",
      big: "Big props spin slowly, so expect a low number. Around 110 Hz is typical for a 7 inch."
    }
  },
  {
    phase: 1,
    title: "Set the filters",
    lead: "The aim is to remove motor noise and nothing more. Extra filtering adds delay, and delay makes the quad fly worse. Follow the animated guide below.",
    todo: [
      "Open Betaflight and go to PID Tuning, then Filter Settings.",
      "Press “Show next change” and copy each change onto your real screen."
    ],
    mock: true,
    filt: {
      whoop: { rpm: "150", lp1: "off", gyro: "1.0", dterm: "1.0" },
      micro: { rpm: "130", lp1: "off", gyro: "1.0", dterm: "1.0" },
      mid: { rpm: "120", lp1: "off", gyro: "1.0", dterm: "1.0" },
      five: { rpm: "100", lp1: "off", gyro: "1.0", dterm: "1.0" },
      big: { rpm: "80", lp1: "off", gyro: "1.0", dterm: "1.0" }
    },
    good: "The quad arms and idles smoothly, with no grinding sound.",
    stuck: "Can’t find a setting? Switch on Expert Mode at the top of Betaflight. If your noise graph showed an extra peak that you couldn’t fix by tightening things, the Dynamic Notch Filter is the tool for it. Leave it at its defaults to begin with.",
    size: {
      whoop: "Small quads are often too noisy to switch off Gyro Lowpass 1. If your floor wasn’t below −40 dB, leave it on.",
      micro: "Small quads are often too noisy to switch off Gyro Lowpass 1. If your floor wasn’t below −40 dB, leave it on.",
      five: "Betaflight’s default of 100 Hz is made for 5 inch quads, so your own number will usually land close to it.",
      big: "Big props spin slower, so this number needs to come down from the default. A typical 7 inch ends up around 80."
    }
  },
  {
    phase: 2,
    title: "Set I-term Relax for your size",
    relax: true,
    lead: "This setting stops the quad overcorrecting after sharp moves. Bigger quads need a lower number.",
    todo: [
      "Go to PID Tuning, then PID Profile Settings.",
      "Find I Term Relax and its Cutoff number.",
      "Set the Cutoff for your size, then save."
    ],
    good: "The Cutoff matches the value for your quad size.",
    stuck: "Can’t see it? Switch on Expert Mode at the top of Betaflight.",
    size: {
      whoop: "Leave it at 15, the default.",
      micro: "Leave it at 15, the default.",
      mid: "Leave it at 15, the default.",
      five: "Leave it at 15, the default. It’s made for 5 inch quads.",
      big: "A 6 inch can stay at 15. For a 7 inch, set it to about 7 to 10. For 8 inch and larger, about 5."
    }
  },
  {
    phase: 2,
    title: "Clear the sliders for testing",
    lead: "You’re about to test P and D on their own. Switching the other helpers off stops them muddying the results.",
    todo: [
      "Go to PID Tuning, PID Profile Settings, with Expert Mode on.",
      "Press “Show next change” and copy each change onto your real screen."
    ],
    pid: {
      seq: [
        { set: { ff: 0 }, why: "Feedforward would hide what P and D are doing." },
        { set: { dmax: 0 }, why: "This keeps D steady, so every test is fair." },
        { set: { i: 0 }, why: "You’ll set I properly later." },
        { set: { d: 0.6 }, why: "You start with too little brake on purpose, then work upwards. That way you never have too much D, which is what overheats motors." },
        { save: true }
      ]
    },
    good: "Stick Response, Dynamic Damping and Drift – Wobble all read 0, and Damping reads 0.6.",
    stuck: "The quad will feel loose and bouncy like this. That’s expected. It’s only for the test flights."
  },
  {
    phase: 2,
    title: "Make the test flights easy to fly",
    scene: "rates",
    lead: "The next flights use quick stick wiggles. These settings keep the quad calm while you do them.",
    todo: [
      "On Rateprofile Settings, switch to a spare rate profile so your normal rates stay untouched.",
      "Set Center Sensitivity and Max Rate to 150 on roll, pitch and yaw. That makes the sticks respond in a straight line.",
      "On PID Profile Settings, set the Angle Limit to 30.",
      "Save. Fly the next flights in Angle mode."
    ],
    good: "A full stick push tilts the quad to 30 degrees and no further.",
    stuck: "Still feels out of control? Drop the Angle Limit to 20."
  },
  {
    phase: 2,
    title: "Fly the wobble test",
    lead: "Flips and rolls give very little data, because most of the flight is just cruising. Wobbles pack lots of sharp moves into a short flight.",
    todo: [
      "Take off in Angle mode and hover at about head height.",
      "Jab the roll stick left and right, quickly, about 20 times.",
      "Do the same on pitch, forward and back, about 20 times.",
      "Keep the stick moving the whole time, then land and disarm."
    ],
    good: "The quad rocks sharply from side to side but stays roughly in one place.",
    stuck: "Line of sight is easier than goggles for this. You can mix roll and pitch jabs together. You can skip yaw.",
    size: {
      whoop: "Indoors is fine. Use smaller jabs so it stays in the room.",
      big: "Give yourself plenty of open space. A big quad swings a lot of weight around."
    }
  },
  {
    phase: 2,
    title: "Repeat at five Damping values",
    lead: "You fly the same wobble test five times, raising Damping a little each time. Then you compare the results.",
    todo: [
      "Pick the flight you’re on below to see the Damping value.",
      "Set it in Betaflight and save.",
      "Fly the wobble test, land, disarm. Then touch the motors.",
      "You don’t need to download the log between flights."
    ],
    pid: {
      start: { ff: 0, dmax: 0, i: 0, d: 0.6 },
      q: "Which flight are you on?",
      opts: [
        { name: "Flight 1", say: "<strong>Flight 1.</strong> Damping stays at <b>0.6</b>. Fly the wobble test, land and disarm." },
        { name: "Flight 2", set: { d: 0.8 }, say: "<strong>Flight 2.</strong> Drag Damping to <b>0.8</b> and click Save. Then fly the wobble test, land and disarm." },
        { name: "Flight 3", set: { d: 1.0 }, say: "<strong>Flight 3.</strong> Drag Damping to <b>1.0</b> and click Save. Then fly the wobble test, land and disarm." },
        { name: "Flight 4", set: { d: 1.2 }, say: "<strong>Flight 4.</strong> Drag Damping to <b>1.2</b> and click Save. Then fly the wobble test, land and disarm." },
        { name: "Flight 5", set: { d: 1.4 }, say: "<strong>Flight 5.</strong> Drag Damping to <b>1.4</b> and click Save. Then fly the wobble test, land and disarm." }
      ]
    },
    warn: "Motors getting hot as Damping goes up? Stop there. Don’t fly the higher values.",
    stuck: "Each time you arm, Betaflight starts a new log, so all five flights end up in one file."
  },
  {
    phase: 2,
    title: "Compare the five curves",
    lead: "Now you find the right amount of brake. The practice screen below shows what to look for.",
    ptb: "sweep",
    todo: [
      "Save the log file and open it in PIDtoolbox. Tick the five long logs.",
      "Press “Show next” to learn what the curves mean.",
      "Then pick the example that looks most like yours."
    ],
    good: "You’ve chosen one Damping value: the lowest one where the bump is nearly gone.",
    stuck: "The Y correction button lines the curves up on the target line, which makes the bumps easier to compare.",
    size: {
      whoop: "If all five curves look the same, the tune is too weak to measure. Raise Master Multiplier to 1.2 and fly the five flights again.",
      micro: "If all five curves look the same, the tune is too weak to measure. Raise Master Multiplier to 1.2 and fly the five flights again."
    }
  },
  {
    phase: 2,
    title: "Even up pitch and roll",
    lead: "Most quads are slower on pitch, because the battery and camera spread weight front to back.",
    todo: [
      "In the Step Resp Tool, compare the latency number for roll and for pitch.",
      "Tell the guide below what you see.",
      "If you change anything, fly one more wobble test to check."
    ],
    pid: {
      start: { ff: 0, dmax: 0, i: 0.4, d: 1.4 },
      q: "How do the latency numbers compare?",
      opts: [
        { name: "Pitch is clearly slower", set: { pd: 1.3, ppi: 1.3 }, why: "Move both pitch sliders together, so pitch gets more push and more brake." },
        { name: "About the same", say: "<strong>Nothing to change.</strong> Leave the pitch sliders at 1.0." }
      ]
    },
    good: "Pitch and roll curves look alike, and their latency numbers are within a few milliseconds.",
    stuck: "You may never get pitch as quick as roll, and that’s fine. Pushing the pitch sliders too far just adds noise. Stop around 1.4."
  },
  {
    phase: 3,
    title: "Raise the Master Multiplier",
    lead: "The balance is right, so now you find out how strong the tune can go. Start this step on a fresh battery.",
    todo: [
      "Fly a wobble test and note the latency number in the Step Resp Tool.",
      "Raise Master Multiplier by 0.2, save, and fly again.",
      "Tell the guide below what happened, and repeat."
    ],
    pid: {
      start: { ff: 0, dmax: 0, i: 0.4, d: 1.4, pd: 1.3, ppi: 1.3 },
      q: "What happened after the last step up?",
      opts: [
        { name: "Latency dropped, motors cool", set: { m: 1.2 }, say: "<strong>Master Multiplier.</strong> Go up another step of 0.2, like 1.0 to <b>1.2</b> here. Save and fly the wobble test again." },
        { name: "Latency barely changed", say: "<strong>Stop here.</strong> The quad has reached what it can do. Going higher only adds noise." },
        { name: "Hot motors, or the curve got wiggly", set: { m: 0.8 }, say: "<strong>Master Multiplier.</strong> Go back down one step of 0.2 and stop there. That’s your final value." }
      ]
    },
    warn: "Check the motors after every flight in this step. This is where they can get hot.",
    stuck: "A tired battery makes the quad slower, which can fool you into going too high. That’s why this step needs a fresh pack.",
    size: {
      whoop: "Small quads vary a lot. Light, powerful ones can start at 0.8. Ducted cinewhoops are usually under-tuned and can start at 1.0.",
      micro: "Small quads vary a lot. Light, powerful ones can start at 0.8. Ducted cinewhoops are usually under-tuned and can start at 1.0.",
      mid: "Start at 1.0. On a very light, powerful build, start at 0.8.",
      five: "Start at 1.0. On a very light, powerful race quad, start at 0.8.",
      big: "Start at 1.0, or 1.2 on a heavy lifter. Bigger quads often feel locked in around 1.6."
    }
  },
  {
    phase: 3,
    title: "Check the D noise",
    lead: "A stronger tune also makes noise stronger. This check tells you whether the motors are being asked to do too much.",
    ptb: "dterm",
    todo: [
      "Open your latest wobble log in PIDtoolbox.",
      "Use the practice screen below to see what to look for."
    ],
    good: "The D term line stays under −10 dB.",
    stuck: "PIDtoolbox can also show filter delay, from its Delay menu. More filtering means more delay, so only add as much as you need.",
    size: {
      big: "As a guide for a 7 inch, a D term filter delay of about 1.5 to 1.7 ms and a gyro delay of about 2.2 to 2.4 ms are fine. Bigger quads cope with more delay than small ones."
    }
  },
  {
    phase: 3,
    title: "Set the I value",
    lead: "I keeps the quad holding its angle. It’s forgiving, so a normal value works for most quads.",
    todo: [
      "Tell the guide below which case fits you.",
      "Copy the slider move in Betaflight and save."
    ],
    pid: {
      start: { ff: 0, dmax: 0, i: 0.4, d: 1.4, pd: 1.3, ppi: 1.3, m: 1.4 },
      q: "Which fits your quad?",
      opts: [
        { name: "Just set the normal value", set: { i: 1.0 }, why: "1.0 works on most quads." },
        { name: "The curve has a slow, long overshoot", set: { i: 0.6 }, why: "Too much I shows up as a slow bulge above the line, not a sharp bump." },
        { name: "It feels stiff going into turns", set: { i: 0.8 }, why: "A little less I loosens the feel." }
      ]
    },
    good: "The end of the step response curve sits flat on the target line.",
    stuck: "If the curve sags below the line at the end, I is too low. Around 0.4 is usually the least you can run."
  },
  {
    phase: 3,
    title: "Add feedforward",
    lead: "Feedforward makes the quad start moving the moment you move the stick. It’s the last thing to add.",
    todo: [
      "Tell the guide below where you are.",
      "Copy the slider move, save, and fly a short test.",
      "Touch the motors straight after landing."
    ],
    pid: {
      start: { ff: 0, dmax: 0, i: 1, d: 1.4, pd: 1.3, ppi: 1.3, m: 1.4 },
      q: "Where are you with feedforward?",
      opts: [
        { name: "First try", set: { ff: 0.5 }, why: "Half is a safe start. It takes roughly 6 milliseconds off the delay." },
        { name: "Motors cool, want it snappier", set: { ff: 1.0 }, why: "This takes roughly 12 milliseconds off the delay." },
        { name: "Hot motors, or it overshoots", set: { ff: 0.3 }, why: "Too much feedforward shoves the quad past where you stopped, and works the motors hard." }
      ]
    },
    warn: "Feedforward can heat motors fast. If they’re hot, go back down before flying again.",
    stuck: "Don’t judge feedforward with the step response curve. It can look wrong with feedforward on. Go by feel and by motor heat.",
    size: {
      big: "Big motors can’t speed up quickly. Stay near 0.5."
    }
  },
  {
    phase: 3,
    title: "Decide on Dynamic Damping",
    lead: "Dynamic Damping lets D rise only during sharp moves. Most quads don’t need it.",
    todo: [
      "If your motors run cool and the quad flies well, leave it at 0.",
      "Only use it if you needed very high Damping, around 1.6 or more, and the motors run hot.",
      "In that case, lower Damping and raise Dynamic Damping until D Max shows the D number you found in testing.",
      "Pick your case below to watch the slider moves."
    ],
    pid: {
      start: { ff: 0.5, dmax: 0, i: 1, d: 1.4, pd: 1.3, ppi: 1.3, m: 1.4 },
      q: "How did the quad end up?",
      opts: [
        { name: "Motors cool, flies well", say: "Leave <strong>Dynamic Damping</strong> at <b>0</b>. There’s nothing to change and nothing to save." },
        { name: "Damping 1.6 or more, motors hot", from: { d: 1.6 }, set: { d: 1.2, dmax: 1.0 }, why: "Watch the table: Derivative drops, so the motors work less in normal flight, while D Max climbs back to the D number you found in testing." }
      ]
    },
    good: "Motors are cool after a normal flight.",
    stuck: "Leave yaw alone too. There’s no yaw slider for a reason, and pushing yaw hard makes the quad climb during spins."
  },
  {
    phase: 3,
    title: "Save your tune and go fly",
    scene: "cli",
    cliTuned: true,
    lead: "You’re done. Put your normal settings back and keep a copy of the tune.",
    todo: [
      "Switch back to your normal rate profile and your usual Angle Limit.",
      "Go to the CLI, type <code>diff all</code>, and save it as your tuned file.",
      "Fly a normal pack and touch the motors when you land.",
      "Retune if you change props, motors, battery size, or add a camera."
    ],
    good: "Cool motors, clean video, and a quad that goes where you point it.",
    stuck: "If it ever feels worse than stock, load your first backup and start again. Nothing is lost."
  }
];
