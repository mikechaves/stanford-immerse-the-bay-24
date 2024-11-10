// toggleObjectsWithVoice.js
// Description: Toggles between multiple objects using voice commands with VoiceML module.

//@input Asset.VoiceMLModule vmlModule {"label": "Voice ML Module"}
//@input SceneObject objectA {"label": "Object A"}
//@input SceneObject objectB {"label": "Object B"}
//@input SceneObject objectC {"label": "Object C"}
//@input SceneObject objectD {"label": "Object D"}
//@input SceneObject objectE {"label": "Object E"}
//@input SceneObject objectF {"label": "Object F"}

(function() {
    // Initialize script
    print("toggleObjectsWithVoice.js initialized.");

    // Validate inputs
    if (!script.vmlModule || !script.objectA || !script.objectB || !script.objectC || !script.objectD || !script.objectE || !script.objectF) {
        print("toggleObjectsWithVoice.js Error: One or more required objects or VoiceML Module is not assigned.");
        return;
    }

    // Set up VoiceML Listening Options
    var options = VoiceML.ListeningOptions.create();
    options.speechRecognizer = VoiceMLModule.SpeechRecognizer.Default;
    options.languageCode = 'en_US';
    options.shouldReturnAsrTranscription = true;
    options.shouldReturnInterimAsrTranscription = true;

    // Define voice commands for toggling objects
    var returnToInitialKeywords = ['exit portal', 'leave portal', 'return home'];
    var showObjectBKeywords = ['enter portal b', 'enter india'];
    var showObjectDKeywords = ['enter portal d', 'enter samoa'];
    var showObjectFKeywords = ['enter portal f', 'enter america'];

    var nlpReturnToInitial = VoiceML.NlpKeywordModelOptions.create();
    nlpReturnToInitial.addKeywordGroup('returnHome', returnToInitialKeywords);

    var nlpShowObjectB = VoiceML.NlpKeywordModelOptions.create();
    nlpShowObjectB.addKeywordGroup('activateB', showObjectBKeywords);

    var nlpShowObjectD = VoiceML.NlpKeywordModelOptions.create();
    nlpShowObjectD.addKeywordGroup('activateD', showObjectDKeywords);

    var nlpShowObjectF = VoiceML.NlpKeywordModelOptions.create();
    nlpShowObjectF.addKeywordGroup('activateF', showObjectFKeywords);

    options.nlpModels = [nlpReturnToInitial, nlpShowObjectB, nlpShowObjectD, nlpShowObjectF];

    // Function to start listening
    function startListening() {
        print("Starting VoiceML listening for toggle commands...");
        try {
            // Ensure any previous session is stopped
            if (script.vmlModule.isListeningEnabled) {
                script.vmlModule.stopListening();
                print("Stopped previous VoiceML session to avoid conflicts.");
            }
            // Start listening
            script.vmlModule.startListening(options);
            print("VoiceML is now listening for toggle commands.");
        } catch (error) {
            print("Error starting VoiceML listening: " + error.message);
        }
    }

    // Handle VoiceML events to toggle objects
    function onUpdateListeningEventHandler(eventArgs) {
        // Ignore empty transcriptions
        if (eventArgs.transcription.trim() === '') {
            return;
        }

        // Only process final transcriptions
        if (!eventArgs.isFinalTranscription) {
            return;
        }

        // Process the transcription and check for commands
        var transcription = eventArgs.transcription.toLowerCase();
        print("Voice Transcription: " + transcription);

        // Check for commands and toggle objects accordingly
        if (returnToInitialKeywords.some(keyword => transcription.includes(keyword))) {
            setInitialState();
        } else if (showObjectBKeywords.some(keyword => transcription.includes(keyword))) {
            activateObject("B");
        } else if (showObjectDKeywords.some(keyword => transcription.includes(keyword))) {
            activateObject("D");
        } else if (showObjectFKeywords.some(keyword => transcription.includes(keyword))) {
            activateObject("F");
        } else {
            print("No matching keywords detected.");
        }
    }

    // Set initial state (activate A, C, E and deactivate B, D, F)
    function setInitialState() {
        script.objectA.enabled = true;
        script.objectC.enabled = true;
        script.objectE.enabled = true;
        script.objectB.enabled = false;
        script.objectD.enabled = false;
        script.objectF.enabled = false;
        print("Initial state set: A, C, E enabled; B, D, F disabled.");
    }

    // Activate one object (B, D, or F) and disable A, C, E
    function activateObject(objectLetter) {
        print("Activating object " + objectLetter);

        // Disable initial state objects
        script.objectA.enabled = false;
        script.objectC.enabled = false;
        script.objectE.enabled = false;

        // Enable the selected object, disable others
        script.objectB.enabled = (objectLetter === "B");
        script.objectD.enabled = (objectLetter === "D");
        script.objectF.enabled = (objectLetter === "F");

        print("Activated object " + objectLetter + ". Other objects disabled.");
    }

    // Add VoiceML listeners
    script.vmlModule.onListeningUpdate.add(onUpdateListeningEventHandler);
    script.vmlModule.onListeningEnabled.add(startListening);

    // Set initial state when the script runs
    setInitialState();

    // Start listening automatically if enabled
    if (script.vmlModule.isListeningEnabled) {
        startListening();
    }

})();