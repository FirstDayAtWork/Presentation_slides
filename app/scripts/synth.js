function handlePlay(synth, stateObject) {
  const playButton = document.querySelector(".synth-play-btn");
  playButton.addEventListener("click", () => {
    if (!stateObject.isSynthStarted && synth.gain.gain.value === 0) {
      synth.osc.start(0);
    }
    synth.gain.gain.setTargetAtTime(1, synth.context.currentTime, 0.001);
  });
}

function handlePause(synth, stateObject) {
  const pauseButton = document.querySelector(".synth-pause-btn");
  pauseButton.addEventListener("click", () => {
    synth.gain.gain.setTargetAtTime(0, synth.context.currentTime, 0.01);
    synth.osc.stop(1);
    stateObject.isSynthStarted = false;
  });
}

function handleInput(synth) {
  const slider = document.getElementById("synth-range");
  const hz = document.querySelector('.synth-range-hz');
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
  handlePlay(synth, stateObject);
  handlePause(synth, stateObject);
  handleInput(synth)
})();
