@IsTest
public with sharing class LogEventTriggerHelperTest {
    static testMethod void logSeverityCriticalTest(){
        Test.startTest();
        try {
            insert new Contact();
        } catch (DmlException ex){
            CustomHandledException customEx = new CustomHandledException(ex, 'Test Dml Exception');

            Log_Event__e event = new Log_Event__e();
            event.Severity__c = Log.SEVERITY.CRITICAL.name();
            event.Save_Mode__c = Log.SAVE_MODE.ALWAYS.name();
            event.Custom_App__c = Log.CUSTOM_APP.STANDARD.name();
            event.User_Id__c = UserInfo.getUserId();
            event.Exception__c = customEx.getMessage();
            event.Exception_Type__c = customEx.getTypeName();
            Database.SaveResult saveResult = Eventbus.publish(event);
            System.assertEquals(True, saveResult.isSuccess(), 'Event not published');
            //List<Log__c> logs = [SELECT Id FROM Log__c];
            //System.assertEquals(1, logs.size(), 'Incorrect number of logs created');
        }
        Test.stopTest();
    }
}
