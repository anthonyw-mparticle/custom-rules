<!-- toc -->
* [General Lambda function format](#general-lambda-function-format)
* [Non-events Rules](#non-events-rules)
* [Event-focused rules](#event-focused-rules)
* [Batch format](#batch-format)

<!-- toc stop -->

mParticle's Rules are JavaScript functions that manipulate an incoming batch object. Currently, rules can only be applied to Feeds, but support for other input types will be added over time. See mParticle's [documentation](https://docs.mparticle.com#rules) for help setting up rules in the mParticle dashboard.

## General Lambda function format

Rules take the form of an AWS Lambda function, running in Node 4.3. The Lambda function takes an incoming `batch` argument to be manipulated and a `context` argument containing immutable metadata. The `context` argument is required for AWS Lambda functions but for an mParticle rule is effectively `null`.

The standard Lambda `callback` function takes a message and a data output. For mParticle Rules, the message will always be `null`. The output should either be an object in the same format as the original `batch` argument, or `null`.

```javascript
exports.handler=(batch,context,callback)=>{
    //Do something with batch
    callback(null, batch); // or callback(null, null); to drop the batch completely
}
```
> Note that standard AWS Lambda naming calls for `(event,context,callback)`; here we have used `(batch,context,callback)` to avoid confusion with mParticle's `event` object.

While all rules have the same basic syntax, there are two main use cases for rules: working with the events array of a batch, and working with anything else.

## Non-events Rules

If you aren't dealing with the events array, there are two basic kinds of rules:

The first is a simple 'filter'. Based on some attribute/s of the batch, the callback either contains the original batch object, unaltered, or `null`, effectively dropping the batch from feed altogether:

```javascript
exports.handler=(batch,context,callback)=>{
/* 
A support feed contains batches from internal and external users. 
We can create a rule to drop batches from internal users.
*/    
    if(batch.user_attributes.internal) {
        callback(null, null);
    }
    else{
        callback(null, batch);
    }
};
```

Alternatively, the callback can contain a modified version of the original batch, with some attributes added, changed or dropped.

```javascript
exports.handler=(batch,context,callback)=>{
/* 
A feed has firstname and lastname attributes for a user.
Our output platform expects a full name, so we can use a rule to create one.
*/    
    if(batch.user_attributes.$firstname && batch.user_attributes.$lastname) {
        var firstname = batch.user_attributes.$firstname;
        var lastname = batch.user_attributes.$lastname;
        batch.user_attributes.name = `${firstname} ${lastname}`;
    }
    callback(null, batch);

};
```

## Event-focused rules

The batch object contains an `events` array, which can have any number of events. If you want to handle each event individually, you will need to define a handler function and use it to iterate over the `events` array and, for each event, return either the original event, a modified copy, or `null` to drop the event.

Remember that if your Lambda function throws an error, the entire batch will be dropped so consider including at least basic error handling into your `event_handler` function, so that problems processing a single event won't cause you to lose a whole batch.

```javascript
exports.handler=(batch,context,callback)=>{
/* 
An attribution feed sends events with the event name 'Email UnSubscribe'. 
We can create a feed to change it to 'unsubscribe' to match data from other sources.
*/
    function event_handler(event) {
    	try {
            if (event.data.event_name === 'Email UnSubscribe') {
                event.data.event_name = 'unsubscribe';
            }
     	    return event;   	    
    	}
    	catch(err) {
    	    return null;
    	}
    }
    
    var events = batch.events;
    var newEvents = [];
    
    events.forEach(function(currentEvent){
    	newEvents.push(event_handler(currentEvent));
    });
    
    batch.events = newEvents;
    
    callback(null, batch);
};
```

## Batch format

See the main mParticle docs for [full JSON batch examples](http://docs.mparticle.com/#json-reference). Here's a stripped down example:

```json
{
	"events": [{
		"data": {
			"event_name": "my event",
			"custom_event_type": "navigation",
			"device_current_state": {
				"application_memory_available_bytes": 5
			}
		},
		"event_type": "custom_event"
	}],
	"device_info": {
		"platform": "iOS",
		"ios_advertising_id": "b86e0741-4c62-496c-b936-6f9e2c41eea8",
		"is_dst": false
	},
	"user_attributes": {

	},
	"deleted_user_attributes": [

	],
	"user_identities": {
		"CustomerId": "Peter.Venkman@Ghostbusters.com"
	},
	"environment": "Development",
	"api_key": "XXXXXXXXXXXXXXXXXXXXXXXX",
	"ip": "127.0.0.1"
}
```
