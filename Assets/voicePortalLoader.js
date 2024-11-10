// voicePortalLoader.js
// Version: 1.1.9
// Description: Activates and deactivates the portal in response to voice commands using Snap Spectacles.

//@input Asset.VoiceMLModule vmlModule {"label": "Voice ML Module"}
//@input SceneObject portalObject {"label": "Portal Object", "type": "SceneObject"}
//@input SceneObject portalControllerObject {"label": "Portal Controller Object", "type": "SceneObject"}

(function() {
    // Initialize script
    print("voicePortalLoader.js initialized.");

    // Validate Inputs
    if (!script.vmlModule) {
        print("voicePortalLoader.js Error: Voice ML Module is not assigned.");
        return;
    }
    if (!script.portalObject) {
        print("voicePortalLoader.js Error: Portal Object is not assigned.");
        return;
    }
    if (!script.portalControllerObject) {
        print("voicePortalLoader.js Error: Portal Controller Object is not assigned.");
        return;
    }

    // Ensure there's only one VoiceML active
    if (script.vmlModule.isListeningEnabled) {
        print("VoiceML is already listening. Stopping existing session to prevent conflict.");
        script.vmlModule.stopListening();
    }

    // Ensure Portal is initially disabled
    ensurePortalDisabled();

    // Enforce disabling for safety — Retry mechanism
    var retryCount = 0;
    var maxRetries = 5;

    function ensurePortalDisabled() {
        script.portalObject.enabled = false;
        print("Portal object explicitly set to disabled.");

        // Adding a recurring event to double-check the state
        var retryEvent = script.createEvent("UpdateEvent");
        retryEvent.bind(function() {
            if (retryCount < maxRetries) {
                if (script.portalObject.enabled) {
                    script.portalObject.enabled = false;
                    print("Portal object found enabled, disabling again. Retry #" + (retryCount + 1));
                }
                retryCount++;
            } else {
                retryEvent.enabled = false;
            }
        });
    }

    // Add a slight delay to ensure that disabling takes effect properly before listening begins
    var delayedEvent = script.createEvent("DelayedCallbackEvent");
    delayedEvent.bind(function() {
        startListening();
    });
    delayedEvent.reset(0.5); // Wait for 0.5 seconds before starting to listen

    // Function to Start VoiceML Listening
    function startListening() {
        print("Attempting to start VoiceML listening...");

        try {
            if (script.vmlModule.isListeningEnabled) {
                script.vmlModule.stopListening(); // Stop any previous listening if active
            }

            script.vmlModule.startListening(getListeningOptions());
            print("VoiceML successfully started listening for portal commands.");
        } catch (error) {
            print("Error starting VoiceML listening: " + error.message);
        }
    }

    // Set up VoiceML Listening Options
    function getListeningOptions() {
        var options = VoiceML.ListeningOptions.create();
        options.speechRecognizer = VoiceMLModule.SpeechRecognizer.Default;
        options.languageCode = 'en_US';
        options.shouldReturnAsrTranscription = true;
        options.shouldReturnInterimAsrTranscription = true;

        // Configure Keywords for Portal Activation and Deactivation
        var activationKeywords = ['portal on', 'activate portal'];
        var deactivationKeywords = ['portal off', 'deactivate portal'];

        var nlpActivationModel = VoiceML.NlpKeywordModelOptions.create();
        nlpActivationModel.addKeywordGroup('activate', activationKeywords);

        var nlpDeactivationModel = VoiceML.NlpKeywordModelOptions.create();
        nlpDeactivationModel.addKeywordGroup('deactivate', deactivationKeywords);

        options.nlpModels = [nlpActivationModel, nlpDeactivationModel];
        return options;
    }

    // Handler for Listening Updates, including Keyword Detection
    function onUpdateListeningEventHandler(eventArgs) {
        if (eventArgs.transcription.trim() === '') {
            return;
        }
        print('Voice Transcription: ' + eventArgs.transcription);

        if (!eventArgs.isFinalTranscription) {
            return;
        }

        var transcription = eventArgs.transcription.toLowerCase();

        print("Processing transcription: " + transcription);

        if (transcription.includes('portal on') || transcription.includes('activate portal')) {
            print(`Detected activation command in transcription: ${transcription}`);
            activatePortalComponent();
            return;
        } else if (transcription.includes('portal off') || transcription.includes('deactivate portal')) {
            print(`Detected deactivation command in transcription: ${transcription}`);
            deactivatePortalComponent();
            return;
        }

        print('No matching keywords detected.');
    }

    // Functions to Activate and Deactivate Portal
    function activatePortalComponent() {
        try {
            if (script.portalObject && !script.portalObject.enabled) {
                script.portalObject.enabled = true;
                print("Portal activated.");

                var animation = script.portalObject.getComponent("Component.Animation");
                if (animation && !animation.isPlaying()) {
                    animation.play();
                    print("Portal animation started.");
                }
            }
        } catch (e) {
            print(`Error during portal activation: ${e.message}`);
        }
    }

    function deactivatePortalComponent() {
        try {
            if (script.portalObject && script.portalObject.enabled) {
                script.portalObject.enabled = false;
                print("Portal deactivated.");

                var animation = script.portalObject.getComponent("Component.Animation");
                if (animation && animation.isPlaying()) {
                    animation.stop();
                    print("Portal animation stopped.");
                }
            }
        } catch (e) {
            print(`Error during portal deactivation: ${e.message}`);
        }
    }

    // Add Callbacks for VoiceML Events
    script.vmlModule.onListeningUpdate.add(onUpdateListeningEventHandler);
    script.vmlModule.onListeningError.add(onListeningErrorHandler);
    script.vmlModule.onListeningEnabled.add(onListeningEnabledHandler);
    script.vmlModule.onListeningDisabled.add(onListeningDisabledHandler);

    function onListeningEnabledHandler() {
        startListening();
    }

    function onListeningDisabledHandler() {
        script.vmlModule.stopListening();
        print("VoiceML stopped listening.");
    }

    function onListeningErrorHandler(eventErrorArgs) {
        print(`VoiceML Listening Error: ${eventErrorArgs.error} - ${eventErrorArgs.description}`);
    }

})();
