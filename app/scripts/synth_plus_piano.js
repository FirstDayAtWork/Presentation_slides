function createPiano(synth, stateObject) {
  const keys = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
    "C",
  ];
  const keyboard = "zsxdcvgbhnjmq";
  const piano = document.querySelector(".piano");
  for (let i = 0; i < keys.length; i += 1) {
    const key = document.createElement("div");
    const text = document.createElement("span");
    text.classList.add("key-txt");
    key.classList.add("piano-key");
    key.id = `key-${keys[i]}`;
    key.dataset.number = 52 + i;
    key.dataset.key = keyboard[i];
    text.textContent = keyboard[i];
    key.append(text);
    piano.append(key);
  }
  pianoEvents(piano, keyboard, synth, stateObject);
}

function pianoEvents(piano, keyboard, synth, stateObject) {
  const hz = document.querySelector('.synth-2-range-hz');
  const slider = document.getElementById("synth-2-range");
  const array = [...piano.children];

  document.body.addEventListener("keydown", (e) => {
    if (e.repeat) return;
    if (keyboard.includes(e.key)) {
      const filtered = array.find((element) => element.dataset.key === e.key);
      filtered.classList.add("selected-key");
      synth.gain.gain.setTargetAtTime(1, synth.context.currentTime, 0.001);
      const frequency = Math.floor(
        440 * 2 ** ((filtered.dataset.number - 69) / 12)
      );
      synth.osc.frequency.value = frequency;
      const message = [144, +filtered.dataset.number, 100];
      slider.value = frequency;
      hz.textContent = `${frequency} hz`;
    }
  });

  document.body.addEventListener("keyup", (e) => {
    if (keyboard.includes(e.key)) {
      const filtered = array.find((element) => element.dataset.key === e.key);
      filtered.classList.remove("selected-key");
      synth.gain.gain.setTargetAtTime(0, synth.context.currentTime, 0.01);
      const message = [128, +filtered.dataset.number, 0];
    }
  });

  piano.addEventListener("mousedown", (e) => {
    const target = e.target.closest(".piano-key");
    if (target) {
      target.classList.add("selected-key");
      synth.gain.gain.setTargetAtTime(1, synth.context.currentTime, 0.001);
      const frequency = Math.floor(
        440 * 2 ** ((target.dataset.number - 69) / 12)
      );
      synth.osc.frequency.value = frequency;
      const message = [144, +target.dataset.number, 100];
      slider.value = frequency;
      hz.textContent = `${frequency} hz`;
    }
  });

  piano.addEventListener("mouseup", (e) => {
    const target = e.target.closest(".piano-key");
    if (target) {
      target.classList.remove("selected-key");
      synth.gain.gain.setTargetAtTime(0, synth.context.currentTime, 0.01);
      const message = [128, +target.dataset.number, 0];
    }
  });
}

function handlePlay(synth, stateObject) {
  const playButton = document.querySelector(".synth-2-play-btn");
  playButton.addEventListener("click", () => {
    if (!stateObject.isSynthStarted && synth.gain.gain.value === 0) {
      synth.osc.start(0);
    }
    synth.gain.gain.setTargetAtTime(1, synth.context.currentTime, 0.001);
  });
}

function handlePause(synth, stateObject) {
  const pauseButton = document.querySelector(".synth-2-pause-btn");
  pauseButton.addEventListener("click", () => {
    synth.gain.gain.setTargetAtTime(0, synth.context.currentTime, 0.01);
    synth.osc.stop(2);
    stateObject.isSynthStarted = false;
  });
}

function handleInput(synth) {
  const slider = document.getElementById("synth-2-range");
  const hz = document.querySelector('.synth-2-range-hz');
  slider.addEventListener("input", () => {
    synth.osc.frequency.value = slider.value;
    hz.textContent = `${slider.value} hz`;
  });
}

function createSynth(stateObject) {
  const context = new AudioContext();
  const osc = context.createOscillator();
  osc.frequency.value = 220;
  osc.type = "sine";
  const gain = context.createGain();
  osc.connect(gain);
  gain.connect(context.destination);
  gain.gain.value = 0;

  context.addEventListener("statechange", () => {
    if (context.state === "running") {
      stateObject.isSynthStarted = true;
    }
  });

  return {
    context,
    osc,
    gain,
  };
}

(() => {
  const stateObject = {
    isSynthStarted: false,
    input: {},
    output: {},
  };
  const synth = createSynth(stateObject);
  createPiano(synth, stateObject);
  handlePlay(synth, stateObject);
  handlePause(synth, stateObject);
  handleInput(synth)
})();