public with sharing class CustomHandledExceptionExamples {
    @AuraEnabled
    public static void throwDmlException() {
        // For this example, the Contact object has a Birthdate validation and a Gender__c require field. Add this to your org 
        // and run the following script to insert the record.

        // Contact contact = new Contact();
        // contact.LastName = 'Example';
        // contact.Birthdate = Date.newInstance(1993, 11, 11);
        // contact.Gender__c = 'Male';
        // insert contact;

        List<Contact> contacts = [SELECT Id, Name, Birthdate, Gender__c FROM Contact WHERE LastName = 'Example'];
        if(contacts.size() > 0 ){
            contacts[0].Birthdate = Date.today();
            contacts.add(new Contact());
            upsert contacts;
        }
    }

    @AuraEnabled
    public static void throwCustomHandledDmlException() {
        try {
            throwDmlException();
        } catch (DmlException ex ) {
            throw new CustomHandledException(ex, 'Somthing that I want to pass to the client side');
        }
    }
}