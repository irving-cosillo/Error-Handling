# Salesforce Error Handling Best Practices

Apex class and JS library for handling errors following the best practices available in Salesforce
<br><br>

## About the project

The **CustomHandledException** Class gathers all the available information of a standard exception, and passes this information through the message property as a serialized string. To get and display the errors returned by this class in a lwc, use the **errorHandler** JS library.
<br><br>

## Usage

For this example, the Contact object has a Birthdate validation of +18 and a Gender__c require field, and there is an already created record with LastName = 'Example'.

We are going to change the birthdate to not meet the age validation, this will generate a FIELD_CUSTOM_VALIDATION_EXCEPTION for this record. We are also going to insert a second record with all required fields missing, this will throw a REQUIRED_FIELD_MISSING exception.

We will create the CustomHandledExceptionExamples class and expose a method to throw an exception to a LWC:

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

The LWC that will cath the exception will be ErrorHandlerExamples:

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
<br><br>
You will see the result displayed as:

![Error Messages displayed in screen](/Images/ToastErrors.png)
<br><br>
![Console log error](/Images/ConsoleError.png)
<br><br>

## Resources

* errorHandler library was built on top of the [ldsUtils Library](https://github.com/trailheadapps/lwc-recipes/blob/main/force-app/main/default/lwc/ldsUtils/ldsUtils.js).
* Sending a serialize wrapper class within the message property was taken from [Salesforce error handling best practices blog](https://developer.salesforce.com/blogs/2017/09/error-handling-best-practices-lightning-apex).
* Exceptions methods and properties [Apex Reference Guide](https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/apex_classes_exception_methods.htm).
