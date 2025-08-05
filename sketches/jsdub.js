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

// Voice leading chord progression system
let currentChord = {
  bass: "E2",      // Voice 1 (lowest)
  tenor: "A2",     // Voice 2 
  alto: "E3",      // Voice 3
  soprano1: "A3",  // Voice 4
  soprano2: "E4"   // Voice 5 (highest)
};

// Color palette system for visual transitions
let colorPalettes = [
  { name: "Purple Depths", colors: [[75, 0, 130], [138, 43, 226], [147, 112, 219], [221, 160, 221]] }, // Purple shades
  { name: "Orange Sunset", colors: [[255, 140, 0], [255, 165, 0], [255, 69, 0], [255, 215, 0]] }, // Orange hues
  { name: "Ocean Blues", colors: [[0, 105, 148], [70, 130, 180], [135, 206, 235], [173, 216, 230]] }, // Blue tones
  { name: "Forest Greens", colors: [[34, 139, 34], [46, 125, 50], [76, 175, 80], [129, 199, 132]] }, // Green shades
  { name: "Crimson Fire", colors: [[139, 0, 0], [220, 20, 60], [255, 99, 71], [255, 160, 122]] }, // Red spectrum
  { name: "Golden Fields", colors: [[184, 134, 11], [234, 179, 8], [250, 204, 21], [253, 224, 71]] }, // Yellow/Gold
  { name: "Rose Garden", colors: [[219, 39, 119], [236, 72, 153], [244, 114, 182], [251, 207, 232]] }, // Pink/Rose
  { name: "Midnight Sky", colors: [[25, 25, 112], [72, 61, 139], [106, 90, 205], [147, 112, 219]] } // Deep blues/purples
];

let currentPaletteIndex = 0;
let nextPaletteIndex = 1;
let colorTransition = 0;
let transitionSpeed = 0.02;

// Define scale and chord tones for smooth voice leading
const scale = ["C", "D", "E", "F", "G", "A", "B"];
const scaleWithSharps = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Get semitone distance between two notes
function getSemitoneDistance(note1, note2) {
  const getIndex = (note) => scaleWithSharps.indexOf(note.replace(/\d+/, ""));
  return Math.abs(getIndex(note1) - getIndex(note2));
}

// Get valid voice leading moves (stepwise motion preferred, leaps allowed but limited)
function getValidMoves(currentNote, octave) {
  const currentNoteClass = currentNote.replace(/\d+/, "");
  const currentIndex = scaleWithSharps.indexOf(currentNoteClass);
  const moves = [];
  
  // Stepwise motion (most preferred in Chopin style)
  const stepwise = [
    scaleWithSharps[(currentIndex - 1 + 12) % 12] + octave, // down a semitone
    scaleWithSharps[(currentIndex + 1) % 12] + octave,      // up a semitone
    scaleWithSharps[(currentIndex - 2 + 12) % 12] + octave, // down a tone
    scaleWithSharps[(currentIndex + 2) % 12] + octave       // up a tone
  ];
  
  // Small leaps (thirds)
  const smallLeaps = [
    scaleWithSharps[(currentIndex - 3 + 12) % 12] + octave,
    scaleWithSharps[(currentIndex + 3) % 12] + octave,
    scaleWithSharps[(currentIndex - 4 + 12) % 12] + octave,
    scaleWithSharps[(currentIndex + 4) % 12] + octave
  ];
  
  // Prefer stepwise motion (70% chance), then small leaps (30% chance)
  moves.push(...stepwise, ...stepwise, ...stepwise); // Weight stepwise motion
  moves.push(...smallLeaps);
  
  return moves;
}

// Update one voice following Chopin-style voice leading
function updateChordVoice() {
  const voices = Object.keys(currentChord);
  const voiceToChange = voices[Math.floor(Math.random() * voices.length)];
  const currentNote = currentChord[voiceToChange];
  const octave = currentNote.match(/\d+/)[0];
  
  const validMoves = getValidMoves(currentNote, octave);
  const newNote = validMoves[Math.floor(Math.random() * validMoves.length)];
  
  console.log(`Voice leading: ${voiceToChange} ${currentNote} → ${newNote}`);
  
  currentChord[voiceToChange] = newNote;
  
  // Delay color transition to sync with when we hear the new note
  // The chord change happens, but we need to wait for the next loop cycle
  // Each loop is 2m, so delay by 4m (one full cycle) to sync properly
  setTimeout(() => {
    console.log(`Color transition: ${colorPalettes[currentPaletteIndex].name} → ${colorPalettes[nextPaletteIndex].name}`);
    startColorTransition();
  }, (60 / Tone.Transport.bpm.value) * 4 * 1000); // 4 measures in milliseconds
}

// Start a smooth color transition to the next palette
function startColorTransition() {
  currentPaletteIndex = nextPaletteIndex;
  nextPaletteIndex = (nextPaletteIndex + 1) % colorPalettes.length;
  colorTransition = 0; // Reset transition to start fading
  console.log(`Fading to palette: ${colorPalettes[nextPaletteIndex].name}`);
}

// Interpolate between two colors
function lerpColor(color1, color2, amount) {
  // Safety checks
  if (!color1 || !color2 || color1.length < 3 || color2.length < 3) {
    return [255, 255, 255]; // Fallback to white
  }
  
  // Clamp amount between 0 and 1
  amount = Math.max(0, Math.min(1, amount));
  
  return [
    lerp(color1[0], color2[0], amount),
    lerp(color1[1], color2[1], amount),
    lerp(color1[2], color2[2], amount)
  ];
}

// Get interpolated color from current palette transition
function getCurrentColor(noiseValue) {
  // Ensure we have valid palettes
  if (!colorPalettes || colorPalettes.length === 0) {
    return [255, 255, 255]; // Fallback to white
  }
  
  const currentPalette = colorPalettes[currentPaletteIndex];
  const nextPalette = colorPalettes[nextPaletteIndex];
  
  // Safety checks
  if (!currentPalette || !nextPalette || !currentPalette.colors || !nextPalette.colors) {
    return [255, 255, 255]; // Fallback to white
  }
  
  // Map noise to palette index
  const colorIndex = Math.floor(noiseValue * currentPalette.colors.length);
  const clampedIndex = Math.max(0, Math.min(colorIndex, currentPalette.colors.length - 1));
  
  // Get colors from both palettes
  const currentColor = currentPalette.colors[clampedIndex];
  const nextColor = nextPalette.colors[clampedIndex];
  
  // Safety checks for individual colors
  if (!currentColor || !nextColor) {
    return [255, 255, 255]; // Fallback to white
  }
  
  // Interpolate between palettes based on transition progress
  return lerpColor(currentColor, nextColor, colorTransition);
}

// Individual loops for each voice that reference the current chord
new Tone.Loop((time) => {
  polySynth.triggerAttackRelease(currentChord.alto, "2m", time, 0.8);
}, "2m").start(2);

new Tone.Loop((time) => {
  polySynth.triggerAttackRelease(currentChord.soprano1, "2m", time, 0.8);
}, "2m").start(2);

new Tone.Loop((time) => {
  polySynth.triggerAttackRelease(currentChord.soprano2, "2m", time, 0.8);
}, "2m").start(2);

new Tone.Loop((time) => {
  polySynth.triggerAttackRelease(currentChord.tenor, "2m", time, 0.8);
}, "2m").start(4);

new Tone.Loop((time) => {
  polySynth.triggerAttackRelease(currentChord.bass, "2m", time, 0.8);
}, "2m").start(6);

// Voice leading progression - change one note every 4 bars (8 measures at current tempo)
new Tone.Loop((time) => {
  updateChordVoice();
}, "8m").start(8); // Start after initial chord is established

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
  colorMode(RGB, 255); // Ensure we're using RGB mode with 0-255 values
  stroke(255);
}

function draw() {
  background(0);
  let spacing = 20;
  let rows = height / spacing;

  // Update color transition
  if (colorTransition < 1) {
    colorTransition += transitionSpeed;
    colorTransition = Math.min(colorTransition, 1); // Clamp to 1
  }

  for (let y = 0; y < rows; y++) {
    let x1 = noise(y, t) * width;
    let y1 = y * spacing;
    let x2 = noise(y, t + 100) * width;
    let y2 = y * spacing;
    
    // Color selection with smooth palette interpolation
    let colorNoise = noise(y, t + 200);
    let brightnessNoise = noise(y, t + 300);
    
    // Get colors from both current and next palettes
    let currentPalette = colorPalettes[currentPaletteIndex];
    let nextPalette = colorPalettes[nextPaletteIndex];
    
    let colorIndex = Math.floor(colorNoise * currentPalette.colors.length);
    colorIndex = Math.max(0, Math.min(colorIndex, currentPalette.colors.length - 1));
    
    let currentColor = currentPalette.colors[colorIndex];
    let nextColor = nextPalette.colors[colorIndex];
    
    // Interpolate between the two palettes
    let interpolatedColor = [
      lerp(currentColor[0], nextColor[0], colorTransition),
      lerp(currentColor[1], nextColor[1], colorTransition),
      lerp(currentColor[2], nextColor[2], colorTransition)
    ];
    
    // Apply brightness variation
    let brightness = map(brightnessNoise, 0, 1, 0.6, 1.0);
    
    let r = Math.max(80, Math.floor(interpolatedColor[0] * brightness));
    let g = Math.max(80, Math.floor(interpolatedColor[1] * brightness));
    let b = Math.max(80, Math.floor(interpolatedColor[2] * brightness));
    
    stroke(r, g, b);
    line(x1, y1, x2, y2);
  }

  t += 0.001;
}
