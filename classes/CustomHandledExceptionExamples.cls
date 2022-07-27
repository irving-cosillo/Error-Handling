public with sharing class CustomHandledExceptionExamples {
    private static void throwDmlException() {
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

    private static void throwListException() {
        List<Integer> integerList = new List<Integer>();
        Integer integerValue = integerList[1];
    }

    private static void throwJSONException() {
        Object parse = JSON.deserializeUntyped('{sd ..');
    }

    private static void throwLimitException() {
        for(Integer i = 0; i < 160; i++ ){
            Contact contact = new Contact();
            contact.LastName = 'Test ';
            contact.Gender__c = 'Female';
            contact.Birthdate = Date.today().addYears(-20);
            insert contact;
        }
    }

    private static void throwNullPointerException() {
        String a = null;
        Boolean b = a.contains(a);
    }

    private static void throwQueryException() {
        Account account = [SELECT Id FROM Account WHERE Name = 'sdfsdf'];
    }

    @AuraEnabled
    public static void throwException(Boolean isCustomHandledException, String exceptionName, String customUserMessage, String severityString, String saveModeString, String customAppString) {
        if(!isCustomHandledException){
            throwException(exceptionName);
        }

        //As aura exposed methods does not allowed passing enums as arguments, we are going to use this block of code to simulate it.
        Log.SEVERITY severity = String.isBlank(severityString) ? null : Log.SEVERITY.valueOf(severityString);
        Log.SAVE_MODE saveMode = String.isBlank(saveModeString) ? null :  Log.SAVE_MODE.valueOf(saveModeString);
        Log.CUSTOM_APP customApp = String.isBlank(customAppString) ? null :  Log.CUSTOM_APP.valueOf(customAppString);

        try {
            throwException(exceptionName);
        } catch (DmlException ex ) {
            CustomHandledException customEx = new CustomHandledException(ex, customUserMessage);
            Log.exception(customEx, severity, saveMode, customApp);
            throw customEx;
        } catch (Exception ex ) {
            CustomHandledException customEx = new CustomHandledException(ex, customUserMessage);
            Log.exception(customEx, severity, saveMode, customApp);
            throw customEx;
        }
    }

    @AuraEnabled
    public static void logSObjectExample(){
        List<Account> accountList = [
            SELECT 
                Id, Name, Phone, Owner.Name 
            FROM Account 
            LIMIT 3
        ];
        Log.jsonObject(accountList, Log.SAVE_MODE.ALWAYS);
    }

    @AuraEnabled
    public static void logMessageExample(){
        Log.message('Test message from apex', Log.SAVE_MODE.ALWAYS);
    }

    private static void throwException(String exceptionName){
        switch on exceptionName {
            when 'DML' {
                throwDmlException();
            }	
            when 'List' {
                throwListException();
            }
            when 'JSON' {
                throwJSONException();
            }
            when 'Limit' {
                throwLimitException();
            }
            when 'NullPointer' {
                throwNullPointerException();
            }
            when 'Query' {
                throwQueryException();
            }
        }
    }
}