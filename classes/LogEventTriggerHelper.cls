public with sharing class LogEventTriggerHelper {
    public static void insertLogs(List<Log_Event__e> logEvents) {
        List<Log__c> logRecords = new List<Log__c>();
        for (Log_Event__e logEvent : logEvents) {
            Log__c logRecord = new Log__c();
            logRecord.Severity__c = logEvent.Severity__c;
            logRecord.Save_Mode__c = logEvent.Save_Mode__c;
            logRecord.Custom_App__c = logEvent.Custom_App__c;
    
            logRecord.User__c = logEvent.User_Id__c;
            logRecord.Message__c = logEvent.Message__c;
            logRecord.Exception__c = logEvent.Exception__c;
            logRecord.Exception_Type__c = logEvent.Exception_Type__c;
            logRecords.add(logRecord);
        }
    
        insert logRecords;
    
        for(Log__c logRecord : logRecords){
            Boolean isCriticalLog = logRecord.Severity__c == Log.SEVERITY.CRITICAL.name();
            if(isCriticalLog){
                System.debug('@@@ Sending email as critical log was reported: ' + logRecord);
            }
        }
    }
}