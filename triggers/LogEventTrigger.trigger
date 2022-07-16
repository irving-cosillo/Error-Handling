trigger LogEventTrigger on Log_Event__e (after insert) {
    if (Trigger.isAfter && Trigger.isInsert){
        LogEventTriggerHelper.insertLogs(Trigger.new);
    }
}