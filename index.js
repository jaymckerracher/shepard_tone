// map to associate frequencies with gain values
const frequencyMap = new Map();
frequencyMap.set(110, 0);
frequencyMap.set(220, 0.5);
frequencyMap.set(440, 1);
frequencyMap.set(880, 0.75);
frequencyMap.set(1760, 0.5);
frequencyMap.set(3520, 0.25);

// colors for visual nodes
const visualNodeColours = [
    "#ffcbe1",
    "#d6e5bd",
    "#f9e1a8",
    "#bcd8ec",
    "#dcccec",
    "#ffdab4"
]

// creating variables
const audioCtx = new AudioContext();
let oscillators = [];
let intervalId = null;
const startStopButton = document.querySelector(".start-stop-button");
const startStopIcon = document.querySelector("i.material-icons");

const LOWEST_FREQ = 110;
const NUM_OF_WAVES = 6;
const MID_VALUE = 440;
const HIGHEST_FREQ = LOWEST_FREQ * 2 ** NUM_OF_WAVES;

const NUM_OF_VISUAL_NODES = NUM_OF_WAVES;
const NUM_OF_SPACES = NUM_OF_VISUAL_NODES;
const DISPLAY_WIDTH = 900;
const VISUAL_NODE_WIDTH = 50;
const SPACE_WIDTH = (DISPLAY_WIDTH - VISUAL_NODE_WIDTH * NUM_OF_VISUAL_NODES) / NUM_OF_SPACES;
const VISUAL_NODES_STARTING_Y = "5%";
const VISUAL_NODES = createVisualNodes();

// function to create visual nodes in DOM
function createVisualNodes() {
    const nodes = [];

    const nodeContainer = document.querySelector(".node-container");

    for (let i=0; i<NUM_OF_VISUAL_NODES; i++) {
        const position = (SPACE_WIDTH / 2) + (i * VISUAL_NODE_WIDTH) + (i * SPACE_WIDTH);

        const node = document.createElement("div");
        node.classList.add("node");
        node.style.backgroundColor = visualNodeColours[i];
        node.style.left = position + "px";
        node.style.bottom = VISUAL_NODES_STARTING_Y;

        nodeContainer.appendChild(node);
        nodes.push(node);
    }

    return nodes;
}

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

// function to obtain new visual node y position
function updateVisualNodeValues() {
    for (let i=0; i<oscillators.length; i++) {
        const oscFreqVal = oscillators[i].osc.frequency.value;
        const oscGain = oscillators[i].gainNode.gain.value;
        
        const newYVal = (5 + (oscFreqVal / HIGHEST_FREQ) * 80) + "%";

        const newOpacityVal = oscGain;

        VISUAL_NODES[i].style.bottom = newYVal;
        VISUAL_NODES[i].style.opacity = newOpacityVal;
    }


    setTimeout(updateVisualNodeValues, 100);
}

// function to handle start/stop button click
function handleClick() {
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }

    // on start
    if (startStopButton.dataset.playing == "false") {
        startStopButton.dataset.playing = "true";
        startStopButton.classList.toggle("button-red");
        startStopIcon.innerText = "pause";

        oscillators = createManyOscObjects(LOWEST_FREQ, NUM_OF_WAVES);
        
        for (const oscObj of oscillators) {
            oscObj.osc.connect(oscObj.gainNode);
            oscObj.gainNode.connect(audioCtx.destination);
            oscObj.osc.start();
        }

        setTimeout(transitionWaves, 100);
        updateVisualNodeValues();
    }
    // on stop
    else {
        startStopButton.dataset.playing = "false";
        startStopButton.classList.toggle("button-red");
        startStopIcon.innerText = "play_arrow";

        for (const oscObj of oscillators) oscObj.osc.stop();
        oscillators = [];
        clearTimeout(intervalId);
        intervalId = null;
    }
}

// adding start stop button event
startStopButton.addEventListener("click", handleClick);