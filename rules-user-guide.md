# Rules - User Guide

The powerful Rules feature allows you to cleanse, enrich and transform your incoming data before it is forwarded to downstream services. A Rule is a JavaScript function which takes an incoming batch object and modifies it according to user-defined criteria. Any rule will cover one or more of five basic use cases:

* Modify a batch's data
* Drop a batch
* Modify an event's data
* Drop an event from the events array
* Add events to the events array

Rules can be applied to an input in two ways:

* All Outputs Rules are applied first and affect the data forwarded to all Outputs. For example, if you forward iOS data to Mixpanel and Google Analytics and you apply an All Outputs Rule that drops all batches from outside the United States, neither Mixpanel or Google Analytics will receive the dropped batches.

* Specific Output Rules are applied only to data passed to selected Outputs. For example, if you forward iOS data to Mixpanel and Google Analytics, and you apply a Specific Outputs rule to the Google Analytics output that drops all batches from outside the United States, Mixpanel will receive events from outside the United States, but Google Analytics will not.

These two rule types operate almost identically. Both take in an mParticle batch object and return either `null` or a modified batch object in the same format. There are some differences in error handling and available fields. See the [Syntax documentation](https://github.com/mParticle/custom-rules/blob/master/rules-developer-guide.md) for more info.

All Outputs Rules are applied to data as soon as it arrives in mParticle. For example, if a batch received from an Input has 100 events and a rule is applied which drops half of them, the Activity Overview will show 50 events. The original input feed details are not available for reporting. A 200ms timeout applies to all rules. If a result is not returned within the timeout, the entire batch is dropped.

## Creating and Editing Rules

Create a rule by created by navigating to **Setup > Rules** and clicking **New Rule**.

![Rules](/img/rules-mainpage.png)

There are two ways you can write a rule: create it directly in mParticle, using the Inline Code editor, or host it yourself as an AWS Lambda Function. The Inline Code method is simpler and does not require any special setup. However, you cannot refer to any external resources, such as REST APIs or databases, or import libraries.

If you use an ARN to link to an AWS Lambda Function, you can use external resources, such as your own database or libraries, but you need to have an AWS account set up and grant permission to mParticle to invoke your function.

## Error Handling

When you first test a rule, you must select a **Failure Action**. This determines what will happen if your rule throws an unhandled exception. There is no default action, you must select one of the following:

* If you choose `Discard`, an unhandled exception will cause your rule return `null`, effectively dropping the batch.
* If you choose `Proceed`, an unhandled exception will cause your rule to return the unaltered batch object, proceeding as if the rule had not been applied.

Regardless of which option you choose, it's best practice to handle all exceptions in your code, rather than falling back on the above defaults. This is especially true if your rule deals with events, where an unhandled exception from just one event could lead to all events in the batch being dropped.

## Syntax

~~~
exports.handler=(batch,context,callback)=>{
    //do something with batch
    callback(null, batch)
}
~~~

Whether hosted in AWS Lambda or the Inline Code editor, your code must be a valid [Lambda function](http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html).

* `batch` is the complete incoming batch object.
* `context` is a required argument for Lambda functions, but is effectively `null` for mParticle rules.

More help with writing rules, including examples, is available [on Github](/rules-developer-guide.md). If using the Inline Code editor, syntax warnings will be displayed next to the line number with details of the problem.

## Testing Rules

The first time you test a rule, you will be asked to provide a name, description and failure action. After naming a rule, you can test it by using one of the sample templates provided in the Test Rule dialog. You can also copy and paste batch JSON from your Live Stream.  Click **Test** to run. Optionally, check a box to save your JSON template in local storage for future testing.

You must enter valid `batch` JSON in the code editor.  

If there are any syntactical errors in your code, warning or error icons will display next to the line number with details of the problem so you can correct.

After clicking **Test**, you can examine the JSON output from your function to see that the input has been modified as expected.

After a successful test you can click **Save** to save the rule.

For rules created in the inline code editor, if your test fails, try examining the [logs](#logs) for any console output.

## Versioning

When you first create a rule, by default it will only be applied to `DEV` data. As well as testing a rule with sample JSON you should test the rule in your dev environment to make sure data reaching your output services is as expected. When you are ready to apply a rule to your production data, click **Promote to Prod** on the rule page. This will create a 'v1' production rule.

If you need to make changes, choose `$LATEST` from the **Version** dropdown. All other versions are read only. Test your changes with your dev environment and, when you are ready, click **Promote to Prod** to create 'v2' of your production rule.

## Status

Each rule has a master switch in the Settings panel. If there is a problem with your rule, you can switch it off and it will be disabled for all connections until you enable it again. To disable, click **Edit** in the right sidebar and set the **Status** slider to **inactive**.

## Connecting an AWS Lambda Function

~~~
arn:aws:lambda:us-east-1:999999999999:function:mprmylambdafunction:PROD

arn:aws:lambda:us-east-1:999999999999:function:mprmylambdafunction:PROD
~~~

~~~
aws lambda add-permission 
--region us-east-1 
--function-name arn:aws:lambda:us-east-1:123456789:function:myLambdaFunction:$LATEST 
--statement-id 1 
--principal 338661164609 
--action lambda:InvokeFunction
~~~

~~~
aws lambda add-permission 
--region us-east-1 
--function-name arn:aws:lambda:us-east-1:123456789:function:myLambdaFunction:PROD 
--statement-id 1 
--principal 338661164609 
--action lambda:InvokeFunction
~~~

You can also host your rule as an AWS Lambda function. To do this, you need to be able to provide an Amazon Resource Number (ARN) for your rule. The rule name must be hosted in US-East-1, have a prefix of 'mpr'. Your production rule must have an alias of `PROD` and your development rule must have an alias of `$LATEST`.

You then need to give mParticle permission to invoke your Lambda functions. Using the Amazon CLI tool, execute the above commands, altering them for your Lambda.

* Change the --function-name argument (arn:aws:lambda:us-east-1:123456789:function:myLambdaFunction:prod) to the full ARN of your function. This can be found by navigating to your [AWS Lambda console](https://console.aws.amazon.com/lambda/home#/functions) and selecting your lambda function.
* `statement-id` must be unique - if you receive an error stating that the provided statement-id already exists, increment the statement-id(s) to a higher value.

More info on the Amazon CLI is available [here](http://docs.aws.amazon.com/lambda/latest/dg/access-control-resource-based.html#access-control-resource-based-example-cross-account-scenario)


## Metrics

Metrics are available for Inline Code rules only. The following metrics are available:

* **Invocations** - how many times the rule was invoked
* **Throttles** - how many times a 429 throttling response was returned when calling the rule
* **Errors** - how many errors have occurred when calling the rule

These metrics are for the last 24 hours and apply to all connections. Summaries for each rule can be seen on the main rules page. Detailed graph of the previous 24 hours is available on the **Monitoring** tab of the individual rule page.

![](/img/rules-logs.png)

## Logs

To help you with troubleshooting rules, mParticle maintains logs for each rule where you can view all console output. From an individual rule page, select the **Logs** tab. You can filter messages by date range or search for keywords.

![](/img/rules-monitoring.png)

## Deleting Rules

From the Rules listing, select the **Delete** action to delete the Rule. If the rule is applied to any connections, it will be removed.