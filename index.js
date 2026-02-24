const audioCtx = new AudioContext();

// function to create oscillator
function createOscillator(freq) {
    const oscillator = audioCtx.createOscillator();

    oscillator.frequency.value = freq;

    return oscillator;
};

// function to create a list of oscillators
function createManyOsciallators(startingFreq, quantity) {
    const oscillators = [];
    let freq = startingFreq;

    for (let i=0; i<quantity; i++) {
        const osc = createOscillator(freq);
        oscillators.push(osc);
        freq *= 2;
    }

    return oscillators;
}

// adding start stop button event
let oscillators = [];

const button = document.querySelector("button");
button.addEventListener("click", () => {
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }

    if (button.innerText == "Start") {
        oscillators = createManyOsciallators(110, 7);
        
        for (const osc of oscillators) {
            osc.connect(audioCtx.destination);
            osc.start();
        }

        button.innerText = "Stop";
    } else {
        for (const osc of oscillators) osc.stop();

        button.innerText = "Start";
    }
});