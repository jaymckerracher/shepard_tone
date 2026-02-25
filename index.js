// map to associate frequencies with gain values
const frequencyMap = new Map();
frequencyMap.set(110, 0);
frequencyMap.set(220, 0.5);
frequencyMap.set(440, 1);
frequencyMap.set(880, 0.75);
frequencyMap.set(1760, 0.5);
frequencyMap.set(3520, 0.25);

// creating variables
const audioCtx = new AudioContext();
let oscillators = [];
let intervalId = null;
const LOWEST_FREQ = 110;
const NUM_OF_WAVES = 6;
const MID_VALUE = 440;
const HIGHEST_FREQ = LOWEST_FREQ * 2 ** NUM_OF_WAVES;

// function to create oscillator
function createOscillator(freq) {
    const oscillator = audioCtx.createOscillator();
    oscillator.frequency.value = freq;

    return oscillator;
};

// function to create gain node
function createGainNode(freq) {
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = frequencyMap.get(freq);

    return gainNode;
}

// function to create a list of oscillator objects
function createManyOscObjects(startingFreq, quantity) {
    const myOscillators = [];
    let freq = startingFreq;

    for (let i=0; i<quantity; i++) {
        const osc = createOscillator(freq);
        const gainNode = createGainNode(freq);
        myOscillators.push({ osc, gainNode });
        freq *= 2;
    }

    return myOscillators;
}

// function that changes wave frequency and gain
function transitionWaves() {
    for (const oscObj of oscillators) {
        // sets frequency back to beginning if past highest available value
        if (oscObj.osc.frequency.value >= HIGHEST_FREQ * 0.75) {
            oscObj.osc.frequency.value = LOWEST_FREQ;
        }

        // get the next frequency and gain values
        const nextFreq = oscObj.osc.frequency.value * 2;
        const nextGain = frequencyMap.get(nextFreq) || 0;

        // start transition to next values
        oscObj.osc.frequency.exponentialRampToValueAtTime(
            nextFreq,
            audioCtx.currentTime + 9.9
        );

        oscObj.gainNode.gain.linearRampToValueAtTime(
            nextGain,
            audioCtx.currentTime + 9.9
        );
    }

    intervalId = setTimeout(() => {
        transitionWaves();
    }, 10000);
}

// adding start stop button event
const button = document.querySelector("button");
button.addEventListener("click", () => {
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }

    if (button.innerText == "Start") {
        button.innerText = "Stop";

        oscillators = createManyOscObjects(LOWEST_FREQ, NUM_OF_WAVES);
        
        for (const oscObj of oscillators) {
            oscObj.osc.connect(oscObj.gainNode);
            oscObj.gainNode.connect(audioCtx.destination);
            oscObj.osc.start();
        }

        setTimeout(transitionWaves, 100);
    } else {
        button.innerText = "Start";
        for (const oscObj of oscillators) oscObj.osc.stop();
        oscillators = [];
        clearTimeout(intervalId);
        intervalId = null;
    }
});