public with sharing class LogEventTriggerHelper {
    public static void insertLogs(List<Log_Event__e> events) {
        insert new Account(Name='T');
        [SELECT COUNT() FROM Account WHERE Name = 'TEST']
    //     List<Log__c> logs = new List<Log__c>();
    //     for (Log_Event__e event : events) {
    //         Log__c log = new Log__c();
    //         log.Severity__c = event.Severity__c;
    //         log.Save_Mode__c = event.Save_Mode__c;
    //         log.Custom_App__c = event.Custom_App__c;
    
    //         log.User__c = event.User_Id__c;
    //         log.Exception__c = event.Exception__c;
    //         log.Exception_Type__c = event.Exception_Type__c;
    //         log.Message__c = event.Message__c;
    //         logs.add(log);
    //     }

    //     insert logs;

    //     for(Log__c logRecord : logs){
    //         Boolean isCriticalLog = logRecord.Severity__c == Log.SEVERITY.CRITICAL.name();
    //         if(isCriticalLog){
    //             sendEmail(logRecord);
    //         }
    //     }
    }

    // private static void sendEmail(Log__c log){
    //     System.debug('@@@ Sending email as critical log was reported: ' + log);
    // }
}
