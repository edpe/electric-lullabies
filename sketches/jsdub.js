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
  
  // Create mode controls only after everything is initialized
  // We'll call this at the end of the script
  // createModeControls();
};

// Create UI controls for changing modes
function createModeControls() {
  // Create container for the mode controls
  const controlsDiv = document.createElement('div');
  controlsDiv.id = 'modeControls';
  controlsDiv.style.position = 'fixed';
  controlsDiv.style.bottom = '20px';
  controlsDiv.style.left = '20px';
  controlsDiv.style.zIndex = '1000';
  controlsDiv.style.background = 'rgba(0,0,0,0.7)';
  controlsDiv.style.padding = '10px';
  controlsDiv.style.borderRadius = '5px';
  controlsDiv.style.fontFamily = 'Arial, sans-serif';
  controlsDiv.style.color = 'white';
  
  // Create mode selector
  const modeLabel = document.createElement('label');
  modeLabel.textContent = 'Mode: ';
  modeLabel.style.marginRight = '5px';
  
  const modeSelect = document.createElement('select');
  modeSelect.id = 'modeSelect';
  
  // Add options for all modes
  Object.keys(modes).forEach(modeName => {
    const option = document.createElement('option');
    option.value = modeName;
    option.textContent = modeName.charAt(0).toUpperCase() + modeName.slice(1);
    if (modeName === currentMode.name) {
      option.selected = true;
    }
    modeSelect.appendChild(option);
  });
  
  // Create root note selector
  const rootLabel = document.createElement('label');
  rootLabel.textContent = ' Root: ';
  rootLabel.style.marginLeft = '10px';
  rootLabel.style.marginRight = '5px';
  
  const rootSelect = document.createElement('select');
  rootSelect.id = 'rootSelect';
  
  // Add options for all root notes
  chromaticScale.forEach(note => {
    const option = document.createElement('option');
    option.value = note;
    option.textContent = note;
    if (note === currentMode.root) {
      option.selected = true;
    }
    rootSelect.appendChild(option);
  });
  
  // Create apply button
  const applyButton = document.createElement('button');
  applyButton.textContent = 'Apply';
  applyButton.style.marginLeft = '10px';
  applyButton.style.padding = '3px 8px';
  
  // Add event listener to apply changes
  applyButton.addEventListener('click', () => {
    const newMode = modeSelect.value;
    const newRoot = rootSelect.value;
    if (changeMode(newMode, newRoot)) {
      // Update the display
      document.getElementById('currentMode').textContent = 
        `${newRoot} ${newMode.charAt(0).toUpperCase() + newMode.slice(1)}`;
    }
  });
  
  // Current mode display
  const currentModeDiv = document.createElement('div');
  currentModeDiv.id = 'currentMode';
  currentModeDiv.textContent = `${currentMode.root} ${currentMode.name.charAt(0).toUpperCase() + currentMode.name.slice(1)}`;
  currentModeDiv.style.marginTop = '5px';
  currentModeDiv.style.fontSize = '14px';
  
  // Assemble the controls
  controlsDiv.appendChild(modeLabel);
  controlsDiv.appendChild(modeSelect);
  controlsDiv.appendChild(rootLabel);
  controlsDiv.appendChild(rootSelect);
  controlsDiv.appendChild(applyButton);
  controlsDiv.appendChild(currentModeDiv);
  
  // Add to the document
  document.body.appendChild(controlsDiv);
}

Tone.Transport.bpm.value = 100;

// Define scale and chord tones for smooth voice leading
const chromaticScale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Mode definitions (intervals from the root)
const modes = {
  ionian:     [0, 2, 4, 5, 7, 9, 11], // Major scale
  dorian:     [0, 2, 3, 5, 7, 9, 10], 
  phrygian:   [0, 1, 3, 5, 7, 8, 10],
  lydian:     [0, 2, 4, 6, 7, 9, 11], // Lydian (major with #4)
  mixolydian: [0, 2, 4, 5, 7, 9, 10], // Dominant 7th flavor
  aeolian:    [0, 2, 3, 5, 7, 8, 10], // Natural minor
  locrian:    [0, 1, 3, 5, 6, 8, 10]
};

// Current mode settings
let currentMode = {
  name: "lydian",
  root: "F", // F Lydian
  scaleNotes: [] // Will be computed
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

// Effects for high melody
const feedbackDelay = new Tone.FeedbackDelay({
  delayTime: "8n",
  feedback: 0.3,
  wet: 0.4
});
const distortion = new Tone.Distortion({
  distortion: 0.2,
  wet: 0.3
});
const tremolo = new Tone.Tremolo({
  frequency: 2,
  depth: 0.5,
  spread: 180,
  type: "sine"
}).start();

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

const highDuoSynth = new Tone.MonoSynth({
  oscillator: {
    type: "sine", // Pure sine wave like the whistle synth
  },
  envelope: {
    attack: 0.03,  // Fast attack but not too abrupt
    decay: 0.1,
    sustain: 0.9,
    release: 2.0,
    releaseCurve: "linear"
  },
  filterEnvelope: {
    attack: 0.02,
    decay: 0.4,
    sustain: 0.7,
    release: 2,
    baseFrequency: 2500, // Slightly higher than the whistle synth
    octaves: 1.2
  },
  volume: -28 // Slightly louder than the whistle synth
}).chain(distortion, feedbackDelay, tremolo, reverb, widener, Tone.Destination);

// Second whistling sine-wavey melody synth
const whistleSynth = new Tone.MonoSynth({
  oscillator: {
    type: "sine", // Pure sine wave for whistling quality
  },
  envelope: {
    attack: 0.02,
    decay: 0.1,
    sustain: 0.9,
    release: 1.5,
    releaseCurve: "linear"
  },
  filterEnvelope: {
    attack: 0.02,
    decay: 0.5,
    sustain: 0.7,
    release: 2,
    baseFrequency: 2000,
    octaves: 1.5
  },
  volume: -30 // Slightly quieter than the main high melody
}).chain(
  // Specific effects chain for the whistle synth
  new Tone.FeedbackDelay({
    delayTime: "16n", 
    feedback: 0.3,
    wet: 0.25
  }),
  new Tone.Tremolo({
    frequency: 3.5,
    depth: 0.4,
    spread: 90,
    type: "sine"
  }).start(),
  // Much bigger, washier reverb for the whistle synth
  new Tone.Reverb({
    decay: 8,      // Longer decay time for washy effect
    wet: 0.7,      // Higher wet level
    preDelay: 0.2  // Add some pre-delay for spatial depth
  }),
  widener, 
  Tone.Destination
);

const pinkNoise = new Tone.Noise("pink").connect(filter).start(2);

pinkNoise.volume.value = -30;

pinkNoise.chain(autoFilter, reverb, Tone.Destination);

// Function to initialize chord with notes from the current mode
function initializeChordFromMode() {
  // For F lydian, we'll use F, A, C notes from the mode
  // Since F Lydian has notes: F G A B C D E
  const chordTones = [
    currentMode.scaleNotes[0], // Root (F in F lydian)
    currentMode.scaleNotes[2], // Third (A in F lydian)
    currentMode.scaleNotes[4]  // Fifth (C in F lydian)
  ];
  
  return {
    bass: chordTones[0] + "2",      // Voice 1 (lowest) - root
    tenor: chordTones[1] + "2",     // Voice 2 - third
    alto: chordTones[0] + "3",      // Voice 3 - root octave up
    soprano1: chordTones[1] + "3",  // Voice 4 - third octave up
    soprano2: chordTones[2] + "4"   // Voice 5 (highest) - fifth higher octave
  };
}

// Initialize with F Lydian before creating the chord
changeMode("lydian", "F");

// Voice leading chord progression system - initialized from the mode
let currentChord = initializeChordFromMode();

// High melody synth voice leading system - use the 7th of the scale for interest
let highMelody = {
  note: currentMode.scaleNotes[6] + "6",  // 7th degree of the scale, higher octave (now octave 6)
  direction: 0,         // -1 for down, 1 for up, 0 for static
  changesInDirection: 0, // Count how many changes in current direction
  maxChanges: 5,        // Number of changes before going static
  staticDuration: 0,    // How long to stay static
  maxStaticDuration: 3  // How many cycles to stay static
};

// Second whistling melody voice leading system - starting with the 3rd of the scale
let whistleMelody = {
  note: currentMode.scaleNotes[2] + "6",  // 3rd degree of the scale, even higher octave
  direction: 0,         // -1 for down, 1 for up, 0 for static
  changesInDirection: 0, // Count how many changes in current direction
  maxChanges: 3,        // Fewer changes before going static (different rhythm)
  staticDuration: 0,    // How long to stay static
  maxStaticDuration: 4, // Longer static durations
  active: false,        // Start inactive, will activate later
  activationTime: 120   // Number of seconds before this melody joins in
};



// Compute the scale notes based on mode and root
function computeScaleNotes() {
  const rootIndex = chromaticScale.indexOf(currentMode.root);
  if (rootIndex === -1) {
    console.error(`Invalid root note: ${currentMode.root}`);
    return [];
  }
  
  // Get the intervals for the current mode
  const intervals = modes[currentMode.name];
  if (!intervals) {
    console.error(`Invalid mode: ${currentMode.name}`);
    return [];
  }
  
  // Create the scale by applying intervals to the root
  return intervals.map(interval => 
    chromaticScale[(rootIndex + interval) % 12]
  );
}

// Change the current mode
function changeMode(newMode, newRoot) {
  // Validate inputs
  if (!modes[newMode]) {
    console.error(`Invalid mode: ${newMode}`);
    return false;
  }
  
  if (!chromaticScale.includes(newRoot)) {
    console.error(`Invalid root note: ${newRoot}`);
    return false;
  }
  
  // Update mode settings
  currentMode.name = newMode;
  currentMode.root = newRoot;
  currentMode.scaleNotes = computeScaleNotes();
  
  console.log(`Mode changed to ${newRoot} ${newMode}`);
  console.log(`Scale notes: ${currentMode.scaleNotes.join(', ')}`);
  
  return true;
}

// This is now handled earlier in the code

// Get semitone distance between two notes
function getSemitoneDistance(note1, note2) {
  const getIndex = (note) => chromaticScale.indexOf(note.replace(/\d+/, ""));
  return Math.abs(getIndex(note1) - getIndex(note2));
}

// Get valid voice leading moves (stepwise motion preferred, leaps allowed but limited)
function getValidMoves(currentNote, octave) {
  const currentNoteClass = currentNote.replace(/\d+/, "");
  
  // If note isn't in our scale, find the closest note that is
  if (!currentMode.scaleNotes.includes(currentNoteClass)) {
    const chromaticIndex = chromaticScale.indexOf(currentNoteClass);
    let closestNote = currentMode.scaleNotes[0];
    let minDistance = 12;
    
    // Find the closest scale note
    for (const scaleNote of currentMode.scaleNotes) {
      const scaleNoteIndex = chromaticScale.indexOf(scaleNote);
      const distance = Math.min(
        (scaleNoteIndex - chromaticIndex + 12) % 12,
        (chromaticIndex - scaleNoteIndex + 12) % 12
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestNote = scaleNote;
      }
    }
    
    console.log(`Note ${currentNoteClass} not in scale, using ${closestNote} instead`);
    currentNote = closestNote + octave;
  }
  
  const moves = [];
  
  // Find the current note's position in our scale
  const currentScaleIndex = currentMode.scaleNotes.indexOf(currentNoteClass);
  
  // Stepwise motion within the mode (diatonic steps)
  const stepwise = [];
  
  // Add previous scale note if available
  if (currentScaleIndex > 0) {
    stepwise.push(currentMode.scaleNotes[currentScaleIndex - 1] + octave);
  } else {
    // Wrap around to the top of the scale but drop an octave
    stepwise.push(currentMode.scaleNotes[currentMode.scaleNotes.length - 1] + (parseInt(octave) - 1));
  }
  
  // Add next scale note if available
  if (currentScaleIndex < currentMode.scaleNotes.length - 1) {
    stepwise.push(currentMode.scaleNotes[currentScaleIndex + 1] + octave);
  } else {
    // Wrap around to the bottom of the scale but raise an octave
    stepwise.push(currentMode.scaleNotes[0] + (parseInt(octave) + 1));
  }
  
  // Add +2 and -2 scale degrees if available
  if (currentScaleIndex > 1) {
    stepwise.push(currentMode.scaleNotes[currentScaleIndex - 2] + octave);
  }
  if (currentScaleIndex < currentMode.scaleNotes.length - 2) {
    stepwise.push(currentMode.scaleNotes[currentScaleIndex + 2] + octave);
  }
  
  // Add leaps for more variety (consonant intervals preferred in modal harmony)
  const smallLeaps = [];
  
  // Try to add a fourth up/down
  if (currentScaleIndex >= 3) {
    smallLeaps.push(currentMode.scaleNotes[currentScaleIndex - 3] + octave);
  }
  if (currentScaleIndex + 3 < currentMode.scaleNotes.length) {
    smallLeaps.push(currentMode.scaleNotes[currentScaleIndex + 3] + octave);
  }
  
  // Prefer stepwise motion (70% chance), then small leaps (30% chance)
  moves.push(...stepwise, ...stepwise, ...stepwise); // Weight stepwise motion
  moves.push(...smallLeaps);
  
  // Make sure we have at least one move
  if (moves.length === 0) {
    // As a fallback, just use the root note of our mode
    moves.push(currentMode.root + octave);
    console.log(`No valid moves found, defaulting to root note ${currentMode.root}${octave}`);
  }
  
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

// Update the high melody note following directional patterns
function updateHighMelody() {
  const currentNoteClass = highMelody.note.replace(/\d+/, "");
  const octave = highMelody.note.match(/\d+/)[0];
  const currentIndex = chromaticScale.indexOf(currentNoteClass);
  
  // Check if we need to change state
  if (highMelody.direction === 0) {
    // If static, check if we should start moving again
    if (highMelody.staticDuration >= highMelody.maxStaticDuration) {
      // Choose a new direction (-1 or 1)
      highMelody.direction = Math.random() > 0.5 ? 1 : -1;
      highMelody.changesInDirection = 0;
      highMelody.staticDuration = 0;
      highMelody.maxChanges = 4 + Math.floor(Math.random() * 3); // 4 to 6 changes
      console.log(`High melody starting to move ${highMelody.direction > 0 ? 'up' : 'down'} for ${highMelody.maxChanges} steps`);
      
      // Fade back in over a relatively short time
      highDuoSynth.volume.linearRampTo(-25, 1.5);
      console.log("Fading high melody back in");
      
      // More intense modulation during directional movement
      updateHighSynthModulation(0.4, 0.1, 3);
    } else {
      // Stay static for another cycle
      highMelody.staticDuration++;
      console.log(`High melody staying static at ${highMelody.note}, cycle ${highMelody.staticDuration}/${highMelody.maxStaticDuration}`);
      
      // Subtle modulation during static periods
      updateHighSynthModulation(0.2, 0.05, 1.5);
      return; // No change to the note
    }
  } else if (highMelody.changesInDirection >= highMelody.maxChanges) {
    // We've reached our max changes in one direction, go static
    highMelody.direction = 0;
    highMelody.staticDuration = 0;
    highMelody.maxStaticDuration = 2 + Math.floor(Math.random() * 3); // Stay static for 2-4 cycles
    console.log(`High melody going static at ${highMelody.note} for ${highMelody.maxStaticDuration} cycles`);
    
    // Calm modulation when going static
    updateHighSynthModulation(0.2, 0.05, 1);
    
    // Gradually fade out the high melody over the static duration
    // We'll calculate fade time based on the static duration plus a little extra
    const fadeOutTime = (highMelody.maxStaticDuration * 4) - 0.5; // Convert to seconds (4s per cycle) with a buffer
    highDuoSynth.volume.linearRampTo(-50, fadeOutTime); // Fade to very quiet
    console.log(`Fading out high melody over ${fadeOutTime.toFixed(1)} seconds`);
    
    return; // No change to the note
  }
  
  // Calculate the new note based on direction but staying in the current mode
  // Find the current note's position in the scale
  let currentScaleIndex = currentMode.scaleNotes.indexOf(currentNoteClass);
  
  // If the note isn't in our scale, find the nearest one that is
  if (currentScaleIndex === -1) {
    let closestNote = currentMode.scaleNotes[0];
    let minDistance = 12;
    const chromaticIndex = chromaticScale.indexOf(currentNoteClass);
    
    // Find closest note in our scale
    for (const scaleNote of currentMode.scaleNotes) {
      const scaleNoteIndex = chromaticScale.indexOf(scaleNote);
      const distance = Math.min(
        (scaleNoteIndex - chromaticIndex + 12) % 12,
        (chromaticIndex - scaleNoteIndex + 12) % 12
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestNote = scaleNote;
      }
    }
    
    currentScaleIndex = currentMode.scaleNotes.indexOf(closestNote);
    console.log(`High melody note ${currentNoteClass} not in scale, using ${closestNote} instead`);
  }
  
  // Determine new scale index based on direction
  let newScaleIndex;
  let newOctave = parseInt(octave);
  
  if (highMelody.direction > 0) {
    // Moving up: one or two scale degrees
    const steps = Math.random() > 0.5 ? 1 : 2;
    newScaleIndex = currentScaleIndex + steps;
    
    // Handle octave change when we go past the top of the scale
    if (newScaleIndex >= currentMode.scaleNotes.length) {
      newOctave++;
      newScaleIndex %= currentMode.scaleNotes.length;
    }
  } else {
    // Moving down: one or two scale degrees
    const steps = Math.random() > 0.5 ? 1 : 2;
    newScaleIndex = currentScaleIndex - steps;
    
    // Handle octave change when we go below the bottom of the scale
    if (newScaleIndex < 0) {
      newOctave--;
      newScaleIndex += currentMode.scaleNotes.length;
    }
  }
  
  // Keep the note within a higher range (octave 5-7) to match the new tone
  newOctave = Math.max(5, Math.min(7, newOctave));
  
  const newNote = currentMode.scaleNotes[newScaleIndex] + newOctave;
  console.log(`High melody moving ${highMelody.direction > 0 ? 'up' : 'down'}: ${highMelody.note} → ${newNote}, step ${highMelody.changesInDirection + 1}/${highMelody.maxChanges}`);
  
  highMelody.note = newNote;
  highMelody.changesInDirection++;
  
  // Adjust modulation for the new note - more intense with higher notes
  const normalizedOctave = (newOctave - 4) / 2; // 0-1 range from octave 4-6
  const intensityFactor = 0.2 + normalizedOctave * 0.3;
  updateHighSynthModulation(intensityFactor, intensityFactor * 0.5, 2 + normalizedOctave * 2);
}

// Update the high synth modulation parameters for expressive variations
function updateHighSynthModulation(intensityFactor, distortionAmount, tremoloFreq) {
  // No vibrato adjustments - we're keeping pitch stable
  
  // Update distortion
  distortion.wet.value = distortionAmount + (Math.random() * 0.1);
  
  // Update tremolo (amplitude modulation) - this is our main expressive element now
  tremolo.frequency.value = tremoloFreq + (Math.random() * 1.5 - 0.75); // Varied frequency
  tremolo.depth.value = 0.3 + (intensityFactor * 0.3); // Adjust the tremolo depth based on intensity
  
  // Update delay parameters
  feedbackDelay.feedback.value = 0.2 + Math.random() * 0.2; // Between 0.2 and 0.4
  feedbackDelay.delayTime.value = ["8n", "8n.", "16n"][Math.floor(Math.random() * 3)]; // Varied delay times
  
  console.log(`Updated high synth modulation: tremolo depth=${tremolo.depth.value.toFixed(2)}, freq=${tremolo.frequency.value.toFixed(2)}Hz`);
}

// Update the whistle melody note following directional patterns
function updateWhistleMelody() {
  // Check if the whistleMelody is active yet
  if (!whistleMelody.active) {
    return; // Not active yet
  }
  
  const currentNoteClass = whistleMelody.note.replace(/\d+/, "");
  const octave = whistleMelody.note.match(/\d+/)[0];
  const currentIndex = chromaticScale.indexOf(currentNoteClass);
  
  // Check if we need to change state - similar to high melody but with different timing
  if (whistleMelody.direction === 0) {
    // If static, check if we should start moving again
    if (whistleMelody.staticDuration >= whistleMelody.maxStaticDuration) {
      // Choose a new direction (-1 or 1)
      whistleMelody.direction = Math.random() > 0.5 ? 1 : -1;
      whistleMelody.changesInDirection = 0;
      whistleMelody.staticDuration = 0;
      whistleMelody.maxChanges = 3 + Math.floor(Math.random() * 2); // 3 to 4 changes
      console.log(`Whistle melody starting to move ${whistleMelody.direction > 0 ? 'up' : 'down'} for ${whistleMelody.maxChanges} steps`);
      
      // For whistle synth, adjust the tremolo rate based on direction
      const tremoloEffect = whistleSynth.get().at(-4); // Access the tremolo in the chain
      if (whistleMelody.direction > 0) {
        tremoloEffect.frequency.linearRampTo(4.5, 1); // Faster for ascending lines
      } else {
        tremoloEffect.frequency.linearRampTo(3, 1);  // Slower for descending lines
      }
      
      // Fade back in
      whistleSynth.volume.linearRampTo(-30, 1.5);
    } else {
      // Stay static for another cycle
      whistleMelody.staticDuration++;
      console.log(`Whistle melody staying static at ${whistleMelody.note}, cycle ${whistleMelody.staticDuration}/${whistleMelody.maxStaticDuration}`);
      return; // No change to the note
    }
  } else if (whistleMelody.changesInDirection >= whistleMelody.maxChanges) {
    // We've reached our max changes in one direction, go static
    whistleMelody.direction = 0;
    whistleMelody.staticDuration = 0;
    whistleMelody.maxStaticDuration = 3 + Math.floor(Math.random() * 3); // Stay static for 3-5 cycles
    console.log(`Whistle melody going static at ${whistleMelody.note} for ${whistleMelody.maxStaticDuration} cycles`);
    
    // Fade out the whistle melody over the static duration
    const fadeOutTime = (whistleMelody.maxStaticDuration * 4) - 0.5;
    whistleSynth.volume.linearRampTo(-45, fadeOutTime);
    return; // No change to the note
  }
  
  // Calculate the new note based on direction but staying in the current mode
  // Find the current note's position in the scale
  let currentScaleIndex = currentMode.scaleNotes.indexOf(currentNoteClass);
  
  // If the note isn't in our scale, find the nearest one that is
  if (currentScaleIndex === -1) {
    let closestNote = currentMode.scaleNotes[0];
    let minDistance = 12;
    const chromaticIndex = chromaticScale.indexOf(currentNoteClass);
    
    // Find closest note in our scale
    for (const scaleNote of currentMode.scaleNotes) {
      const scaleNoteIndex = chromaticScale.indexOf(scaleNote);
      const distance = Math.min(
        (scaleNoteIndex - chromaticIndex + 12) % 12,
        (chromaticIndex - scaleNoteIndex + 12) % 12
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestNote = scaleNote;
      }
    }
    
    currentScaleIndex = currentMode.scaleNotes.indexOf(closestNote);
    console.log(`Whistle melody note ${currentNoteClass} not in scale, using ${closestNote} instead`);
  }
  
  // Determine new scale index based on direction - whistle uses smaller steps most of the time
  let newScaleIndex;
  let newOctave = parseInt(octave);
  
  if (whistleMelody.direction > 0) {
    // Moving up: one scale degree most of the time, occasionally two
    const steps = Math.random() > 0.8 ? 2 : 1; // 20% chance of larger leap
    newScaleIndex = currentScaleIndex + steps;
    
    // Handle octave change when we go past the top of the scale
    if (newScaleIndex >= currentMode.scaleNotes.length) {
      newOctave++;
      newScaleIndex %= currentMode.scaleNotes.length;
    }
  } else {
    // Moving down: one scale degree most of the time, occasionally two
    const steps = Math.random() > 0.8 ? 2 : 1; // 20% chance of larger leap
    newScaleIndex = currentScaleIndex - steps;
    
    // Handle octave change when we go below the bottom of the scale
    if (newScaleIndex < 0) {
      newOctave--;
      newScaleIndex += currentMode.scaleNotes.length;
    }
  }
  
  // Keep the note within a reasonable range (octave 5-7 for whistling - higher than the first melody)
  newOctave = Math.max(5, Math.min(7, newOctave));
  
  const newNote = currentMode.scaleNotes[newScaleIndex] + newOctave;
  console.log(`Whistle melody moving ${whistleMelody.direction > 0 ? 'up' : 'down'}: ${whistleMelody.note} → ${newNote}, step ${whistleMelody.changesInDirection + 1}/${whistleMelody.maxChanges}`);
  
  whistleMelody.note = newNote;
  whistleMelody.changesInDirection++;
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

// Occasionally change the mode
function changeToRandomMode() {
  // List of possible mode choices
  const modeChoices = Object.keys(modes);
  
  // Choose a random mode but avoid the current one
  let newMode;
  do {
    newMode = modeChoices[Math.floor(Math.random() * modeChoices.length)];
  } while (newMode === currentMode.name);
  
  // Choose a new root note randomly
  const rootChoices = ["C", "D", "E", "F", "G", "A", "B"]; // Could include sharps too
  const newRoot = rootChoices[Math.floor(Math.random() * rootChoices.length)];
  
  console.log(`Changing from ${currentMode.root} ${currentMode.name} to ${newRoot} ${newMode}...`);
  
  // Change the mode
  if (changeMode(newMode, newRoot)) {
    // Update chord and melody to use notes from the new mode
    // But do it gradually through voice leading rather than sudden changes
    
    // This logs the current state before changes
    console.log("Previous chord:", JSON.stringify(currentChord));
    console.log("Previous high melody:", highMelody.note);
    
    // The bass and sineClick patterns will automatically use the new root
    // next time they trigger due to our pattern-based approach
    console.log("Bass and SineClick will now use root:", currentMode.scaleNotes[0]);
  }
}

// Voice leading progression - change one note every 4 bars (8 measures at current tempo)
new Tone.Loop((time) => {
  updateChordVoice();
}, "8m").start(8); // Start after initial chord is established

// Occasionally change the mode (less frequently than chord changes)
new Tone.Loop((time) => {
  // 25% chance of changing the mode each time this fires
  if (Math.random() < 0.25) {
    changeToRandomMode();
  }
}, "32m").start(40); // Start after the piece is well established

// Update high melody according to its directional pattern
new Tone.Loop((time) => {
  updateHighMelody();
}, "4m").start(12); // Start a bit after the main chord is established

// Update whistle melody according to its directional pattern (offset from the high melody)
new Tone.Loop((time) => {
  updateWhistleMelody();
}, "3m").start(15); // Different timing from main melody (3m instead of 4m) for phasing effect

// Create subtle modulation variations periodically 
new Tone.Loop((time) => {
  // Only apply subtle changes while not in a major transition
  if (highMelody.direction === 0) {
    // Adjust only amplitude modulation (tremolo), not pitch
    const subtleTremoloDepth = 0.15 + Math.random() * 0.15; // Between 0.15 and 0.3
    const subtleTremoloFreq = 1.5 + Math.random() * 2;    // Between 1.5 and 3.5 Hz
    
    // Smoothly transition to new values
    tremolo.depth.linearRampTo(subtleTremoloDepth, 2);
    tremolo.frequency.linearRampTo(subtleTremoloFreq, 2);
  }
}, "2m").start(14); // Offset slightly from the main changes

// Check if it's time to activate the whistle melody
new Tone.Loop((time) => {
  if (!whistleMelody.active) {
    // Get current playback time in seconds
    const currentTime = Tone.Transport.seconds;
    
    if (currentTime >= whistleMelody.activationTime) {
      whistleMelody.active = true;
      console.log("Activating whistle melody!");
      
      // Start with a fade-in
      whistleSynth.volume.value = -60; // Start very quiet
      whistleSynth.volume.linearRampTo(-30, 4); // Fade in over 4 seconds
    }
  }
}, "1m").start(0);

// Bass sequence that follows the current mode's root
let bassSequence = new Tone.Sequence(
  (time, index) => {
    if (index === null) return; // Skip rests
    
    // Use the root note of the current mode for bass
    const note = currentMode.scaleNotes[0] + "1"; // Root note in octave 1
    bassSynth.triggerAttackRelease(note, "1m", time, 0.8);
  },
  [0, null, null, 0, 0, null, null, null] // Pattern of root notes and rests
).start(2);

// SineClick sequence that follows the current mode
let sineClickSequence = new Tone.Sequence(
  (time, indexes) => {
    if (indexes === null) return; // Skip rests
    
    if (Array.isArray(indexes)) {
      // For chords/multiple notes, play each note in the array
      indexes.forEach(index => {
        const octave = index === 0 ? "1" : (index === 1 ? "2" : "3");
        const note = currentMode.scaleNotes[0] + octave; // Root note in different octaves
        sineClick.triggerAttackRelease(note, "1m", time, 0.4);
      });
    } else {
      // For single notes
      const note = currentMode.scaleNotes[0] + "1"; // Root note in octave 1
      sineClick.triggerAttackRelease(note, "1m", time, 0.4);
    }
  },
  [
    // First bar - original pattern (call)
    0, [0, 1], null, 0, null, null, null, null,
    // Second bar - inverse/answering pattern (response)
    null, null, null, null, 0, null, [2, 1], 0
  ]
).start(2);

// High melody duo synth loop - plays the evolving high melody note
new Tone.Loop((time) => {
  // Vary velocity based on direction and expressiveness
  let velocity = 0.6 + Math.random() * 0.25; // Base velocity between 0.6 and 0.85
  
  // Add emphasis when changing direction or during directional movement
  if (highMelody.changesInDirection === 1 || highMelody.changesInDirection === highMelody.maxChanges - 1) {
    velocity = 0.85; // Emphasize first and last note in a directional run
  }
  
  // If we're in directional mode, ensure the volume is correct
  if (highMelody.direction !== 0 && highMelody.changesInDirection === 0) {
    // If we're just starting a directional movement, ensure volume is normal
    if (highDuoSynth.volume.value < -30) {
      highDuoSynth.volume.value = -25;
    }
  }
  
  highDuoSynth.triggerAttackRelease(highMelody.note, "2m", time, velocity);
  
  // Randomly adjust feedback delay wet value for spatial variation
  feedbackDelay.wet.linearRampTo(0.3 + Math.random() * 0.2, 0.5, time);
}, "2m").start(10); // Start after the main chord loops have established

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

// Now that all variables are initialized, create the mode controls
// This needs to happen after setup() is defined but will run when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Create mode controls
  createModeControls();
});
