trigger LogTrigger on Log__c (after insert) {
    if(Trigger.isAfter && Trigger.isInsert){
        EventBus.publish(new Log_Inserted_Event__e());
    }
}