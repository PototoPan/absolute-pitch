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

function playNote(note){
        //set up web audio 
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator(); 
    const gainNode = audioCtx.createGain();

    oscillator.frequency.value = NOTE_FREQUENCIES[currentNote];
    oscillator.type = "sine"; //plain note, no harmonics

    oscillator.connect(gainNode); 
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 1); //play for one second
    console.log("Played note: " + currentNote); //CONSOLE 
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

function checkAnswer(userAnswer){
    if (currentNote === null) {
        const feedback = document.getElementById("feedback");
        feedback.textContent = "Play a note first";
        return; 
    }

    if (userAnswer === currentNote) {
        feedback.textContent = "Correct!";
    } else {
        feedback.textContent = `Incorrect, it was ${currentNote}`;
    }
}

document.getElementById("playBtn").addEventListener("click", playRandomNote);
document.getElementById("repeatBtn").addEventListener("click", repeatNote);

document.querySelectorAll(".key").forEach(key => {
    key.addEventListener("click", () => {
        checkAnswer(key.dataset.note);
    })
})