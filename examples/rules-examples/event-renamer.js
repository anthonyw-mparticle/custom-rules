exports.handler = (batch, context, callback) => {
    // Converts event names for an output platform still using
    // an older version of those names

    // Define our mapping of new names to legacy names
    const mappings = {
        "new_name1": "legacy_name1",
        "new_name2": "legacy_name2",
        "new_name3": "legacy_name3"
    };

    // If the event name is in our list of mappings, update it to the legacy name
    function rename_test_events(eventItem, mappings) {
        const keys = Object.keys(mappings);
        if (keys.indexOf(eventItem.data.event_name) === -1) {
            eventItem.data.event_name = mappings[eventItem.data.event_name];
        }
    }

    const newEvents = []
    // Create updated events array
    batch.events.forEach(item => {
        try {
            rename_test_events(item, mappings);
            newEvents.push(item)
        }
        catch (err) { } // if an error occurs, exclude the event from the updated events array
    });

    // Replace original events with updated events
    batch.events = newEvents;
    callback(null, batch);
};

