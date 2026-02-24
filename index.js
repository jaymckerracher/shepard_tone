const audioCtx = new AudioContext();
const button = document.querySelector("button");

// create and connect the oscillator
function createOscillator() {
    const oscillator = audioCtx.createOscillator();

    oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);

    oscillator.connect(audioCtx.destination);

    return oscillator;
};

let oscillator;

// start stop osciallator via button
button.addEventListener("click", () => {
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }

    if (button.dataset.playing == "false") {
        oscillator = createOscillator();
        oscillator.start();
        button.dataset.playing = "true";
    } else {
        oscillator.stop();
        button.dataset.playing = "false";
    };
});