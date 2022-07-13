public with sharing class Log {
    
    public enum SEVERITY {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    public enum SAVE_MODE {
        ENABLED, DISABLED, BASED_ON_FLAG
    }

    public enum CUSTOM_APP {
        STANDARD, MATRIX, HERMES, MELISSA, PARTNER, SERVICEPOWER, FLEXFI, COMMERCIAL, ALN
    }

    static final Boolean LOG_SAVE_FLAG; 

    static {
        LOG_SAVE_FLAG = true; //This will query a custom metadata or custom setting flag
    }
    
    public static LogResponse exception(CustomHandledException ex, Log.SEVERITY severity, Log.CUSTOM_APP customApp, Log.SAVE_MODE saveMode){
        Log_Event__e event = new Log_Event__e();
        event.Severity__c = severity == null ? 'LOW' : severity.name();
        event.Save_Mode__c = saveMode == null ? 'DISABLED' : saveMode.name();
        event.Custom_App__c = customApp == null ? 'STANDARD' : customApp.name();
    
        event.User_Id__c = UserInfo.getUserId();
        event.Exception__c = ex.getMessage();
        event.Exception_Type__c = ex.exceptionType;

        return isSaveLog(saveMode) ? publishLogEvent(event) : null;
    }

    public static LogResponse message(String message, Log.SAVE_MODE saveMode){
        Log_Event__e event = new Log_Event__e();
        event.User_Id__c = UserInfo.getUserId();
        event.Message__c = message;
        event.Exception_Type__c = 'System.Message';
        event.Save_Mode__c = saveMode == null ? 'DISABLED' : saveMode.name();
        
        return isSaveLog(saveMode) ? publishLogEvent(event) : null;
    }

    @AuraEnabled
    public static LogResponse message(String message, String saveMode){
        Log_Event__e event = new Log_Event__e();
        event.User_Id__c = UserInfo.getUserId();
        event.Message__c = message;
        event.Exception_Type__c = 'System.Message';

        try{
            return isSaveLog(Log.SAVE_MODE.valueOf(saveMode)) ? publishLogEvent(event) : null;
        } catch(Exception ex){
            System.debug('@@@ Invalid save mode value for log.message method');
            return null;
        }
    }

    private static Boolean isSaveLog(Log.SAVE_MODE saveMode){
        return saveMode == Log.SAVE_MODE.ENABLED || (saveMode == Log.SAVE_MODE.BASED_ON_FLAG && LOG_SAVE_FLAG);
    }

    private static LogResponse publishLogEvent(Log_Event__e event){
        Database.SaveResult dbResult = EventBus.publish(event);
        LogResponse logResponse = new LogResponse(dbResult);
        System.debug('Log response: ' + LogResponse);
        return logResponse;
    }

    @AuraEnabled(cacheable=true)
    public static List<Log__c> getExceptionLogs(
        String id,
        String userName,
        String profileName,
        String type,
        String severity,
        String customApp,
        String startDateTime,
        String sortBy,
        String sortDirection,
        Integer pageNumber,
        String recordsPerPage
    ){

        List<String> fields = new List<String>{
            'Id', 
            'User__r.Name', 
            'User__r.Profile.Name', 
            'Exception__c',
            'Exception_Type__c',
            'Message__c',
            'Severity__c',
            'Custom_App__c',
            'CreatedDate'
        };

        String query = 'SELECT ' + String.join(fields,', ') + ' FROM Log__c WHERE';

        query += getQueryCondition('Id', id);
        query += getQueryCondition('User__r.Name', userName);
        query += getQueryCondition('User__r.Profile.Name', profileName);
        query += getQueryCondition('Exception_Type__c', type);
        query += getQueryCondition('Severity__c', severity);
        query += getQueryCondition('Custom_App__c', customApp);

        if (String.isNotBlank(startDateTime)){
            try {
                JSON.deserialize('"' + startDateTime + '"', DateTime.class);
                query += ' ( CreatedDate > ' + startDateTime + ' ) AND';
            } catch(Exception ex){
                System.debug('Invalid date input, not including the query condition');
            }
        }
        
        query = removeLastQueryTerm(query, ' AND');
        query = removeLastQueryTerm(query, ' WHERE');

        // if ( sortBy != null && sortDirection != null ) {
        //     query += ' ORDER BY ' + sortBy + ' ' + sortDirection;
        // }
            
        System.debug('@@@ query: ' + query);
        return Database.query(query);
    }

    private static string getQueryCondition(String fieldName, String searchTerm){
        if ( String.isBlank(searchTerm) ) {
            return '';
        }
        
        String condition = ' ( ';
        for(String value : searchTerm.split(';')){
            condition += fieldName + ' LIKE \'%'+ value.trim() + '%\' OR ';
        }
        condition = removeLastQueryTerm(condition, ' OR ');
        condition += ' ) AND';
        return condition;
    }

    private static string removeLastQueryTerm(String query, String term){
        Integer termoPosition = query.lastIndexOf(term);
        if( termoPosition == query.length() - term.length()){
            query = query.substringBeforeLast(term);
        }
        return query;
    }
    

    @AuraEnabled
    public static void deleteLogs(){
        try {
            delete [SELECT id FROM Log__c];
        } catch (DmlException ex) {
            throw new CustomHandledException(ex, null, null, Log.SAVE_MODE.BASED_ON_FLAG);
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
