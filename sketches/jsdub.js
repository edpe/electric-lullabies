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

const Reverb = new Tone.Reverb(1);
const cheby = new Tone.Chebyshev(41).toDestination();

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
}).chain(Reverb, Tone.Destination);

const bassSynth = new Tone.MonoSynth({
  oscillator: { type: "sine" },
  envelope: {
    attack: 0.05,
    decay: 0.1,
    sustain: 0.1,
    release: 0.2,
  },
  filterEnvelope: {
    attack: 0.1,
    decay: 0.1,
    sustain: 0.1,
    release: 0.1,
    baseFrequency: 200,
    octaves: 2.6,
  },
}).chain(Reverb, Tone.Destination);

const filter = new Tone.Filter(800, "lowpass").toDestination();

const percussiveSynth = new Tone.MetalSynth({
  frequency: 200,
  envelope: {
    attack: 0.001,
    decay: 0.1,
    release: 0.2,
  },
  harmonicity: 3.1,
  modulationIndex: 32,
  resonance: 2000,
  octaves: 1.5,
  volume: -10,
})
  .connect(filter)
  .toDestination();

new Tone.Loop((time) => {
  polySynth.triggerAttackRelease("E3", "2m", time, 0.8);
}, "2m").start(2);
new Tone.Loop((time) => {
  polySynth.triggerAttackRelease("A3", "2m", time, 0.8);
}, "2m").start(2);
new Tone.Loop((time) => {
  polySynth.triggerAttackRelease("E4", "2m", time, 0.8);
}, "2m").start(2);

new Tone.Sequence(
  (time, note) => {
    bassSynth.triggerAttackRelease(note, "1m", time, 0.8);
  },
  ["E1", null, null, "E1", "E1", null, null, null]
).start(2);

new Tone.Sequence(
  (time, note) => {
    percussiveSynth.triggerAttackRelease(note, "1m", time, 0.8);
  },
  [null, null, "E6", null, null, null, "E6", null]
).start(2);

const noise = new Tone.Noise("pink").connect(filter).start(2);

noise.volume.value = -26;

noise.chain(Reverb, Tone.Destination);

function setup() {
  createCanvas(windowWidth, windowHeight);

  noStroke();

  background(0);
}
