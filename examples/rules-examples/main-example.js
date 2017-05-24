exports.handler = (batch, context, callback) => {

    /**
     * Below are a few examples of what you can do with rules. You will need to replace these with your own functions. A few notes:
     * The 'batch' argument of this function is a complete mParticle batch object. see http://docs.mparticle.com/#json-reference for details.
     * The 'context' argument is part of the Lambda format but is effectively NULL, here.
     * If your function throws an unhandled exception, the batch will either be dropped (for an all outputs rule), or forwarded unaltered (for a specific output rule). You may wish to add exception handling to avoid this.
     * Each batch may contain many events. If you want to modify or drop events, you will need to iterate over 'batch.events'.
     */

    /**
     * Change United States to USA
     *
     * @param {batch} data
     */
    function changeCountryName(data) {
        if (!data.user_attributes || !data.user_attributes.$Country) {
            return;
        }

        const countryLower = data.user_attributes.$Country.toLowerCase();

        if (countryLower === 'united states' || countryLower === 'united states of america') {
            data.user_attributes.$Country = 'USA';
        } else {
            // Else logic goes here
        }
    }

    /**
     * Only include data from iOS
     *
     * @param {batch} data
     */
    function dropNonIos(data) {
        if (data.device_info && data.device_info.platform !== 'iOS') {
            batch = undefined;
        }
    }

    /**
     * When an event name comes in as 'Test Event', change it to 'Other'
     *
     * @param {event} eventItem
     */
    function rename_test_events(eventItem) {
        if (eventItem.data.event_name === 'Test Event') {
            eventItem.data.event_name = 'Other';
        }
    }

    /**
     * Create a custom event attribute for a specific output
     * Our events already have a timing attribute in milliseconds. One output requires a speed attribute in seconds
     *
     * @param {event} eventItem
     */
    function create_custom_attribute(eventItem) {
        if (eventItem.data.custom_attributes && eventItem.data.custom_attributes.timing) {
            eventItem.data.custom_attributes.speed = eventItem.data.custom_attributes.timing / 1000;
        }
    }

    // Update events
    newEvents = [];

    batch.events.forEach(item => {
        // Basic error handling is included here, to avoid dropping or passing through
        // a whole batch due to errors processing one event.
        try {
            rename_test_events(item);
            create_custom_attribute(item);
            newEvents.push(item);
        }
        catch (err) { }
    });

    batch.events = newEvents;

    // Update batch
    changeCountryName(batch);
    dropNonIos(batch);

    callback(null, batch);
};