console.log("Script loaded");
// 12 notes in an octave
const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

//frequency of each note in 4th octave (middle c)
const NOTE_FREQUENCIES = {
    "C": 261.63, "C#": 277.18, "D": 293.66, "D#": 311.13,
    "E": 329.63, "F": 349.23, "F#": 369.99, "G": 392.00,
    "G#": 415.30, "A": 440.00, "A#": 466.16, "B": 493.88
};

let currentNote = null; //store answer for current round 

let fadeTimer = null; //track fade out timer so it can be cancelled

const settings = {
    feedbackMode: 'correctness'
};

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const VOLUME_LEVELS = [0, 0.02, 0.05, 0.1, 0.17, 0.27, 0.4, 0.58, 0.78, 1];

const masterGain = audioContext.createGain();
masterGain.gain.value = VOLUME_LEVELS[5]; 
masterGain.connect(audioContext.destination);



function playFeedbackSound(isCorrect) {
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    let stopTime;

    if(isCorrect) {
        osc.type= 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1320, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        stopTime = now + 0.25;
    } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        stopTime = now + 0.2;
    }

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(stopTime);
}

function playFeedback(isCorrect, correctNote, submittedNote) {
    if (settings.feedbackMode === 'correctness') {
        playFeedbackSound(isCorrect);
    } else if (settings.feedbackMode === 'notePlayed') {
        playNote(isCorrect ? correctNote : submittedNote);
    }
}

document.getElementById("isCorrectRadio").addEventListener("change", () => {
    settings.feedbackMode = 'correctness';
    console.log("Feedback mode set to correctness");
})

document.getElementById("correctNoteRadio").addEventListener("change", () => {
    settings.feedbackMode = 'notePlayed';
    console.log("Feedback mode set to correct note");
})
function playNote(note){
        //set up web audio 
    const oscillator = audioContext.createOscillator(); 
    const gainNode = audioContext.createGain();

    oscillator.frequency.value = NOTE_FREQUENCIES[note];
    oscillator.type = "sine"; //plain note, no harmonics

    oscillator.connect(gainNode); 
    gainNode.connect(masterGain);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1); //play for one second
    console.log("Played note: " + note); //CONSOLE 
}

function playRandomNote() {
    // pick a random note from the array
    const randomIndex = Math.floor(Math.random() * NOTES.length); 
    currentNote = NOTES[randomIndex];
    console.log("Currentnote: " + currentNote); //CONSOLE 
    //play said note 
    playNote(currentNote);
}

function repeatNote() {
    console.log("repeat button clicked");
    if (currentNote === null){
        document.getElementById("feedback").textContent = "Play a note first";
        return;
    }
    playNote(currentNote);
}

function checkAnswer(clickedKey){
    const feedback = document.getElementById("feedback");
    const userAnswer = clickedKey.dataset.note;

    if (currentNote === null) {
        feedback.textContent = "Play a note first";
        return; 
    }
    // find the key element that matches the correct note
    const correctKey = document.querySelector(`.key[data-note="${currentNote}"]`);
    //remove leftover colours from previous round
    if (fadeTimer !== null){
        clearTimeout(fadeTimer);
    }
    document.querySelectorAll(".key").forEach(key => {
        key.classList.remove("correct", "incorrect", "fading-out");
    });

    if (userAnswer === currentNote) {
        feedback.textContent = "Correct!";
        correctKey.classList.add("correct");
    } else {
        feedback.textContent = `Incorrect, it was ${currentNote}`;
        clickedKey.classList.add("incorrect");
        correctKey.classList.add("correct");
    } 
    playFeedback(userAnswer === currentNote, currentNote, userAnswer);

    fadeTimer = setTimeout(() => {
        document.querySelectorAll(".key").forEach(key => {
            key.classList.add("fading-out");
            key.classList.remove("correct", "incorrect");
        });
        fadeTimer = null;
    }, 1000);
}

document.getElementById("playBtn").addEventListener("click", playRandomNote);
document.getElementById("repeatBtn").addEventListener("click", repeatNote);

document.querySelectorAll(".key").forEach(key => {
    key.addEventListener("click", () => {
        checkAnswer(key);
    })
})