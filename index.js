const audioCtx = new AudioContext();
const button = document.querySelector("button");

// function to create oscillator
function createOscillator(freq) {
    const oscillator = audioCtx.createOscillator();

    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

    oscillator.connect(audioCtx.destination);

    return oscillator;
};

// function to create a list of oscillators
function createManyOsciallators(startingFreq, quantity) {
    const oscillators = [];
    let freq = startingFreq;

    for (let i=0; i<quantity; i++) {
        oscillators.push(createOscillator(freq));
        freq *= 2;
    }

    return oscillators;
}

// creating the oscillators
const oscillators = createManyOsciallators(110, 7);
console.log(oscillators);