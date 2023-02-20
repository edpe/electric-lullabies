const startAudio = () => {
  Tone.start();
  Tone.Transport.start();

  const startButton = document.getElementById("startAudio");
  if (startButton) {
    startButton.style.display = "none";
  }
};

window.onload = function () {
  const startButton = document.getElementById("startAudio");
  if (startButton) {
    startButton.addEventListener("click", startAudio);
  }
};

Tone.Transport.bpm.value = 100;

const envelope = {
  attack: 1,
  release: 4,
  releaseCurve: "linear",
};

const envelopeLong = {
  attack: 2,
  release: 2,
  decay: 0,
  sustain: 0,
  releaseCurve: "linear",
};
const filterEnvelope = {
  baseFrequency: 200,
  octaves: 2,
  attack: 0,
  decay: 0,
  release: 1000,
};

const filter = new Tone.Filter(800, "lowpass");
const reverb = new Tone.Reverb(4);
const cheby = new Tone.Chebyshev(41);
const widener = new Tone.StereoWidener(1);
const autoFilter = new Tone.AutoFilter({
  frequency: "8n",
  baseFrequency: 800,
  octaves: 8,
});

const polySynth = new Tone.PolySynth(Tone.DuoSynth, {
  harmonicity: 1,
  volume: -30,
  voice0: {
    oscillator: { type: "square" },
    envelope,
    filterEnvelope,
  },
  voice1: {
    oscillator: { type: "sine" },
    envelope,
    filterEnvelope,
  },
  vibratoRate: 0.5,
  vibratoAmount: 0.1,
  portamento: 1,
}).chain(reverb, filter, widener, Tone.Destination);

const bassSynth = new Tone.MonoSynth({
  oscillator: { type: "sine" },
  envelope: {
    attack: 0.05,
    decay: 0.1,
    sustain: 0.1,
    release: 0.4,
  },
  filterEnvelope: {
    attack: 0.1,
    decay: 0.1,
    sustain: 0.1,
    release: 0.1,
    baseFrequency: 200,
    octaves: 2.6,
  },
}).chain(reverb, Tone.Destination);

const sineClick = new Tone.Synth({
  oscillator: {
    type: "sine",
  },
  envelope: {
    attack: 0.001,
    decay: 0.1,
    sustain: 0,
  },
}).toDestination();

const pinkNoise = new Tone.Noise("pink").connect(filter).start(2);

pinkNoise.volume.value = -30;

pinkNoise.chain(autoFilter, reverb, Tone.Destination);

new Tone.Loop((time) => {
  polySynth.triggerAttackRelease("E3", "2m", time, 0.8);
}, "2m").start(2);
new Tone.Loop((time) => {
  polySynth.triggerAttackRelease("A3", "2m", time, 0.8);
}, "2m").start(2);
new Tone.Loop((time) => {
  polySynth.triggerAttackRelease("E4", "2m", time, 0.8);
}, "2m").start(2);
new Tone.Loop((time) => {
  polySynth.triggerAttackRelease("A2", "2m", time, 0.8);
}, "2m").start(4);
new Tone.Loop((time) => {
  polySynth.triggerAttackRelease("E2", "2m", time, 0.8);
}, "2m").start(6);

new Tone.Sequence(
  (time, note) => {
    bassSynth.triggerAttackRelease(note, "1m", time, 0.8);
  },
  ["E1", null, null, "E1", "E1", null, null, null]
).start(2);

new Tone.Sequence(
  (time, note) => {
    sineClick.triggerAttackRelease(note, "1m", time, 0.4);
  },
  ["E1", ["E2", "E3"], null, "E1", null, null, null, null]
).start(2);

let t = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  stroke(255);
}

function draw() {
  background(0);
  let spacing = 20;
  let rows = height / spacing;

  for (let y = 0; y < rows; y++) {
    let x1 = noise(y, t) * width;
    let y1 = y * spacing;
    let x2 = noise(y, t + 100) * width;
    let y2 = y * spacing;
    let brightnessNoise = noise(y, t + 200); // Add a third noise value for the line's brightness
    let brightness = map(brightnessNoise, 0, 1, 50, 255); // Map the noise value to a brightness range
    stroke(brightness);
    line(x1, y1, x2, y2);
  }

  t += 0.001;
}
