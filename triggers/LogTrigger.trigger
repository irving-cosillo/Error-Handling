trigger LogTrigger on Log_Event__e (after insert) {
    List<Log__c> logs = new List<Log__c>();
    for (Log_Event__e event : Trigger.new) {
        Log__c log = new Log__c();
        log.User__c = event.User_Id__c;
        log.Exception__c = event.Exception__c;
        log.Message__c = event.Message__c;
        log.Is_Exception__c = event.Is_Exception__c;
        log.Is_Message__c = event.Is_Message__c;
        logs.add(log);
    }

    insert logs;
}