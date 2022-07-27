trigger LogEventTrigger on Log_Event__e (after insert) {
    LogEventTriggerHelper.insertLogs(Trigger.new);
}