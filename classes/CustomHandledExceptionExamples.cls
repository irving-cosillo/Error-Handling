public with sharing class CustomHandledExceptionExamples {
    @AuraEnabled
    public static void throwDmlException() {
        insert new Contact();
    }

    @AuraEnabled
    public static void throwListException() {
        List<Integer> integerList = new List<Integer>();
        Integer integerValue = integerList[1];
    }

    @AuraEnabled
    public static void throwCustomHandledDmlException() {
        try {
            throwDmlException();
        } catch (DmlException ex ) {
            throw new CustomHandledException(ex, null);
        }
    }

    @AuraEnabled
    public static void throwCustomHandledListException() {
        try {
            throwListException();
        } catch (Exception ex ) {
            throw new CustomHandledException(ex, 'Somthing that I want to pass to the client side');
        }
    }
}