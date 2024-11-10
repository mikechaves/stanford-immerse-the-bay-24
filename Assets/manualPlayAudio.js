// manualPlayAudio.js
// Description: Manually play or stop audio on Object B activation/deactivation.

//@input Component.AudioComponent audioComponent {"label": "Audio Component"}

function playAudio() {
    if (script.audioComponent) {
        script.audioComponent.stop();  // Ensure audio stops completely
        script.audioComponent.reset(); // Reset playback position to the beginning
        script.audioComponent.play(1); // Play audio from start
        print("Audio started playing from the beginning.");
    }
}

function stopAudio() {
    if (script.audioComponent && script.audioComponent.isPlaying()) {
        script.audioComponent.stop();
        print("Audio stopped.");
    }
}

// Expose functions for external access
script.api.playAudio = playAudio;
script.api.stopAudio = stopAudio;