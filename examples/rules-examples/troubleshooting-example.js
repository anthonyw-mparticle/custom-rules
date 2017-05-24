exports.handler = (batch, context, callback) => {

    /*
    Future releases of Rules will include a console output.
    For the beta release, if you're having difficulty trying to troubleshoot a rule
    this template will - in case of an error - return a success message and the unaltered batch,
    plus the error message.
    WARNING: Use this for troubleshooting only, if deployed to production, this
    rule will pass along all batches regardless of errors.
    */

    try {
        // replace try block with your failing function
        const dropThese = ["Drop this event", "And this one"];
        batch.events = batch.events.filter(item => {
            // Node 4.3 does not support includes(). This line will cause an error.
            return !dropThese.includes(item.data.event_name);
        });

        callback(null, batch);

    }
    catch(err) {
        // include the error with the returned batch
        batch.error = err.message;
        callback(null, batch);
    }
};

/*
Response:
Test Successful
{
    "events" : [...],
    ...,
    "error": "dropThese.includes is not a function"
}
*/