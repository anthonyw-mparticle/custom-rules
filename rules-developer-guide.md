# Rules - Developer Guide

<!-- toc -->
* [General Lambda function format](#general-lambda-function-format)
* [Non-events Rules](#non-events-rules)
* [Event-focused rules](#event-focused-rules)
* [Batch format](#batch-format)

<!-- toc stop -->

mParticle's Rules are JavaScript functions that manipulate an incoming batch object from an mParticle input. See mParticle's [documentation](https://docs.mparticle.com#rules) for help setting up rules in the mParticle dashboard.

## General format

Rules take the form of an AWS Lambda function, running in Node 4.3. The function takes an incoming `batch` argument to be manipulated and a `context` argument containing immutable metadata. The `context` argument is required, but for an mParticle rule is effectively `null`.

The `callback` takes a message and a data output. For mParticle Rules, the message will always be `null`. The output should either be an object in the same format as the original `batch` argument, or `null`.

```javascript
exports.handler=(batch,context,callback)=>{
    //Do something with batch
    callback(null, batch); // or callback(null, null); to drop the batch completely
}
```
> Note that standard AWS Lambda naming calls for `(event,context,callback)`; here we have used `(batch,context,callback)` to avoid confusion with mParticle's `event` object.

While all rules have the same basic syntax, there are two main use cases for rules: 
  * working with the events array of a batch
  * working with any other properties of the batch.

## Non-events Rules

There are two basic kinds of non-event rules:

The first is a simple 'filter'. Based on some attribute/s of the batch, the callback either contains the original batch object, unaltered, or `null`, effectively dropping the batch, altogether:

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
An input has firstname and lastname attributes for a user.
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

The batch object contains an `events` array, which can have any number of events. If you want to handle each event individually, you will need to define a handler function and use it to iterate over the `events` array.

```javascript
exports.handler=(batch,context,callback)=>{
/* 
An input sends events with the event name 'Signup'. 
We can create a rule to change it to 'subscribe', to tailor it to a specific Output service.
*/
    function event_handler(event) {
        if (event.data.event_name === 'Signup') {
            event.data.event_name = 'subscribe';
        }
     	return event;
    }
    
    var events = batch.events;
    var newEvents = [];
    
    events.forEach(function(currentEvent){
    	try { 
    	    newEvents.push(event_handler(currentEvent));
    	}
    	catch(err){ }
    });
    
    batch.events = newEvents;
    
    callback(null, batch);
};
```

## All Output vs Specific Output Rules

Rules can be applied in two places. 'All Output' rules are applied first, and their output is passed along to all Output services connected to that input. 'Specific Output' Rules are applied as part of a particular Input/Output connection and affect only that Output service.

In most ways the two types of rules operate in the same way. Both take the same arguments and return a `batch` object in the same format. However, there are two differences to be aware of:

### Errors

In the event of an unhandled exception:

* An 'All Output' rule will return `null`, effectively dropping the batch.
* A 'Specific Output' rule will return the unaltered batch object, discarding any changes.

Regardless of where you are applying a rule, it's best practice to handle all exceptions in your code, rather than falling back on the above defaults. This is especially true if your rule deals with events, where an unhandled exception from just one event could lead to all events in the batch being dropped.

### Available fields

Slightly different fields can be accessed/altered in 'All Outputs' and 'Specific Outputs' rules. See [Batch format](#batch-format) for details.

## Batch format

See the main mParticle docs for [full JSON batch examples](http://docs.mparticle.com/#json-reference). There are a few limitations on what is available and what can be changed in Rules:

Limitations applying to all Rules:

* Unique IDs for the Batch (`batch.batch_id`) and for each event (`event.event_id`) cannot be altered.
* The Deleted Attributes object (`batch.deleted_user_attributes`) cannot be accessed or altered.


Limitations applying only to 'All Outputs' Rules:

* Unique IDs for the Batch (`batch.batch_id`) and for each event (`event.event_id`) will not be populated.
* IP address (`batch.ip`) cannot be accessed in a rule. If a value is set for `batch.ip` it will be accepted only if it is a valid IP address.
* The Application Info (`batch.application_info`) object cannot be accessed or altered.

## Troubleshooting Tips

* Rules execute in Node 4.3 - some features of ES2016+ are not available in this runtime.
* Currently, no console output is available for rules. If you're struggling to track down the source of an error,
  try pasting your function into the try block of this template. If a test causes an error, this function will return
  the batch, with the error message tacked onto the batch itself as `batch.error`.
* Any `null` in the events array will cause a serialization error. If you want to drop individual events, don't use a handler that pushes `null` to the event array.