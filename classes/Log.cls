public with sharing class Log {
    @AuraEnabled
    public static LogResponse exception(String serializedException){
        Log_Event__e event = new Log_Event__e();
        event.User_Id__c = UserInfo.getUserId();
        event.Exception__c = serializedException;
        event.Message__c = null;
        event.Is_Exception__c = true;
        event.Is_Message__c = false;

        Database.SaveResult dbResult = EventBus.publish(event);
        return new logResponse(dbResult);
    }

    @AuraEnabled
    public static LogResponse message(String message){
        Log_Event__e event = new Log_Event__e();
        event.User_Id__c = UserInfo.getUserId();
        event.Exception__c = null;
        event.Message__c = message;
        event.Is_Message__c = true;
        event.Is_Exception__c = false;

        Database.SaveResult dbResult = EventBus.publish(event);
        return new logResponse(dbResult);
    }

    @AuraEnabled
    public static List<Log__c> getExceptionLogs(){
        return [
            SELECT 
                Id, User__r.Name, User__r.Profile.Name, Exception__c,
                Is_Exception__c, Message__c, Is_Message__c, CreatedDate
            FROM Log__c
            ORDER BY CreatedDate DESC
            LIMIT 10
        ];
    }

    @AuraEnabled
    public static void deleteLogs(){
        try {
            delete [SELECT Id FROM Log__c];
        } catch (DmlException ex) {
            throw new CustomHandledException(ex, null);
        }
    }

    public class LogResponse {
        @AuraEnabled
        public Boolean isSuccess;
        @AuraEnabled
        public List<LogError> errors;

        public LogResponse(Database.SaveResult dbResult){
            this.isSuccess = dbResult.isSuccess();
            if (!this.isSuccess){
                errors = new List<LogError>();
                for(Database.Error dbError : dbResult.getErrors()){
                    errors.add(new LogError(dbError));
                }
            }
        }
    }

    public class LogError {
        @AuraEnabled
        public String message;
        @AuraEnabled
        public List<String> fieldNames;
        @AuraEnabled
        public System.StatusCode statusCode;

        public LogError(Database.Error dbError){
            this.message = dbError.getMessage();
            this.fieldNames = dbError.getFields();
            this.statusCode = dbError.getStatusCode();
        }
    }
}
