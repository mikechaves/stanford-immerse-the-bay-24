// pinchToScale.js
// Description: Scales an object based on the pinch gesture from hand tracking.

//@input SceneObject portalObject {"label": "Portal Object", "type": "SceneObject"}
//@input Component.HandTracking handTrackingComponent {"label": "Hand Tracking Component"}

(function() {
    // Validate Inputs
    if (!script.portalObject) {
        print("pinchToScale.js Error: Portal Object is not assigned.");
        return;
    }
    if (!script.handTrackingComponent) {
        print("pinchToScale.js Error: Hand Tracking Component is not assigned.");
        return;
    }

    var initialDistance = 0.0;
    var isPinching = false;
    var initialScale;

    // Create an Update Event to track hand gestures
    var updateEvent = script.createEvent("UpdateEvent");
    updateEvent.bind(function() {
        // Get the number of tracked hands
        var handCount = script.handTrackingComponent.getActiveHandCount();
        
        // If there's at least one hand in view
        if (handCount > 0) {
            // Get the first hand
            var hand = script.handTrackingComponent.getHand(0);
            if (hand) {
                // Check if pinch gesture is active
                var isPinch = hand.isPinching();

                if (isPinch) {
                    // If pinch gesture is detected for the first time
                    if (!isPinching) {
                        initialDistance = hand.getPinchDistance();
                        initialScale = script.portalObject.getTransform().getLocalScale();
                        isPinching = true;
                    }

                    // Get the current distance between fingers
                    var currentDistance = hand.getPinchDistance();

                    // Calculate scale factor based on the change in pinch distance
                    var scaleFactor = currentDistance / initialDistance;

                    // Apply scaling to the portal object
                    var newScale = initialScale.uniformScale(scaleFactor);
                    script.portalObject.getTransform().setLocalScale(newScale);
                } else {
                    isPinching = false;
                }
            }
        } else {
            // Reset if no hand is detected
            isPinching = false;
        }
    });

    // Utility Function: Create uniform scaling based on vector
    vec3.prototype.uniformScale = function(s) {
        return new vec3(this.x * s, this.y * s, this.z * s);
    };

})();