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
            CustomHandledException customEx = new CustomHandledException(ex, 'Something that I want to pass to the client side');
            Log.exception(customEx.getMessage());
            throw customEx;
        }
    }

    @AuraEnabled
    public static void throwListException() {
        List<Integer> integerList = new List<Integer>();
        Integer integerValue = integerList[1];
    }

    @AuraEnabled
    public static void throwCustomHandledListException() {
        try {
            throwListException();
        } catch (Exception ex ) {
            CustomHandledException customEx = new CustomHandledException(ex, 'Something that I want to pass to the client side');
            Log.exception(customEx.getMessage());
            throw customEx;
        }
    }

    @AuraEnabled
    public static void throwJSONException() {
        Object parse = JSON.deserializeUntyped('{sd ..');
    }

    @AuraEnabled
    public static void throwCustomHandledJSONException() {
        try {
            throwJSONException();
        } catch (Exception ex ) {
            CustomHandledException customEx = new CustomHandledException(ex, null);
            Log.exception(customEx.getMessage());
            throw customEx;
        }
    }

    @AuraEnabled
    public static void throwLimitException() {
        for(Integer i = 0; i < 160; i++ ){
            Contact contact = new Contact();
            contact.LastName = 'Test ';
            contact.Gender__c = 'Female';
            contact.Birthdate = Date.today().addYears(-20);
            insert contact;
        }
    }

    @AuraEnabled
    public static void throwCustomHandledLimitException() {
        try {
            throwLimitException();
        } catch (Exception ex ) {
            CustomHandledException customEx = new CustomHandledException(ex, null);
            Log.exception(customEx.getMessage());
            throw customEx;
        }
    }

    @AuraEnabled
    public static void throwNullPointerException() {
        String a = null;
        Boolean b = a.contains(a);
    }

    @AuraEnabled
    public static void throwCustomHandledNullPointerException() {
        try {
            throwNullPointerException();
        } catch (Exception ex ) {
            CustomHandledException customEx = new CustomHandledException(ex, null);
            Log.exception(customEx.getMessage());
            throw customEx;
        }
    }

    @AuraEnabled
    public static void throwQueryException() {
        Account account = [SELECT Id FROM Account WHERE Name = 'sdfsdf'];
    }

    @AuraEnabled
    public static void throwCustomHandledQueryException() {
        try {
            throwQueryException();
        } catch (Exception ex ) {
            CustomHandledException customEx = new CustomHandledException(ex, null);
            Log.exception(customEx.getMessage());
            throw customEx;
        }
    }
}