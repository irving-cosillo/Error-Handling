# Salesforce Error Handling Best Practices

Apex class and JS library for handling errors following the best practices available in Salesforce
<br><br>

## About the project

The [CustomHandledException](classes/CustomHandledException.cls) Class gathers all the available information of a standard exception, and passes this information through the message property as a serialized string. To get and display the errors returned by this class in a lwc, use the [errorHandler](lwc/errorHandler/errorHandler.js) JS library.
<br><br>

## Usage

For this example, the Contact object has a Birthdate validation of +18 and a Gender__c require field, and there is an already created record with LastName = 'Example'.

We are going to change the birthdate to not meet the age validation, this will generate a FIELD_CUSTOM_VALIDATION_EXCEPTION for this record. We are also going to insert a second record with all required fields missing, this will throw a REQUIRED_FIELD_MISSING exception.

We will create the **CustomHandledExceptionExamples** class and expose the **throwCustomHandledDmlException** method to throw an exception to the **ErrorHandlerExamples** LWC:

```Apex
public with sharing class CustomHandledExceptionExamples {
    @AuraEnabled
    public static void throwCustomHandledDmlException() {
        try {
            List<Contact> contacts = [
                SELECT Id, Name, Birthdate, Gender__c 
                FROM Contact 
                WHERE LastName = 'Example'
            ];

            if(contacts.size() > 0 ){
                contacts[0].Birthdate = Date.today();
                contacts.add(new Contact());
                upsert contacts;
            }
        } catch (DmlException ex ) {
            throw new CustomHandledException(ex, 'This message will be displayed in the view');
        }
    }
}
```
<br>

> All properties from **CustomHandledException** class are public, so you can access them after instantiate the object.

<br>

```js
import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import { getErrorMessages } from 'c/errorHandler';
import throwDmlException from '@salesforce/apex/CustomHandledExceptionExamples.throwDmlException';
import throwCustomHandledDmlException from '@salesforce/apex/CustomHandledExceptionExamples.throwCustomHandledDmlException';

export default class ErrorHandlerExamples extends LightningElement {

    async connectedCallback(){
        console.clear();
        try {
            await throwCustomHandledDmlException();
        } catch(errors){
            getErrorMessages(errors).forEach( message => {
                this.toastError(message);
            });
        }
    }

    toastError(message){
        this.dispatchEvent(new ShowToastEvent({
            message,
            variant: 'error',
            mode: 'sticky'
        }));
    }
}
```

<br>
You will see the result displayed as:

<p align="center">
    ![Error Messages displayed in screen](/Images/ToastErrors.png)
<p/>

<br>

> The library will remove duplicate messages if two or more exceptions display the same error.

<br>

<p align="center">
    ![Console log error](/Images/ConsoleError.png)
<p/>

The dmlExceptions property is displaying an array of 2 exceptions (1 per each record), those exceptions are in the same order as they were upserted. If the record was
already created it will display the Id field as it is the case for the first record. Each record will have their own statusCode, fieldNames and message.

If you don't implement the custom exception and just let the code throw the standard one, you still can read it using the **errorHandler** library, but the log won't
be displayed as detailed as it is with the first approach. This is the result displaying only standard exceptions:

<p align="center">
    ![Standard exception log](/Images/StandardExceptionLog.png)
<p/>

<br><br>

<!-- 
## Recommendations

* Do not implement the CustomHandledException in
<br><br>

## Avoid Doing This

<br><br> -->

## Resources

* **errorHandler** library was built on top of the [ldsUtils Library](https://github.com/trailheadapps/lwc-recipes/blob/main/force-app/main/default/lwc/ldsUtils/ldsUtils.js).
* Sending a serialize wrapper class within the message property was taken from [Salesforce error handling best practices blog](https://developer.salesforce.com/blogs/2017/09/error-handling-best-practices-lightning-apex).
* Exceptions methods and properties [Apex Reference Guide](https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/apex_classes_exception_methods.htm).
