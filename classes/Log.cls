public with sharing class Log {
    
    public enum SEVERITY {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    public enum SAVE_MODE {
        ALWAYS, FLAG_BASED
    }

    public enum CUSTOM_APP {
        STANDARD, MATRIX, HERMES, MELISSA, PARTNER, SERVICEPOWER, FLEXFI, COMMERCIAL, ALN
    }

    static final Boolean SAVE_LOGS_FLAG; 

    static {
        SAVE_LOGS_FLAG = Log_Settings__c.getInstance()?.Save_Logs_Flag__c;
    }

    //#region  ---------- Exception Constructors ----------------
    public static LogResponse exception(CustomHandledException ex){
        return exception(ex, null, null, null);
    }

    public static LogResponse exception(CustomHandledException ex, Log.SEVERITY severity){
        return exception(ex, severity, null, null);
    }

    public static LogResponse exception(CustomHandledException ex, Log.SEVERITY severity, Log.SAVE_MODE saveMode){
        return exception(ex, severity, saveMode, null );
    }
    
    public static LogResponse exception(CustomHandledException ex, Log.SEVERITY severity, Log.SAVE_MODE saveMode, Log.CUSTOM_APP customApp){  
        String saveModeStr = getSaveModeString(saveMode);
        String severityStr = severity == null ? Log.SEVERITY.LOW.name() : severity.name();
        String customAppStr = customApp == null ? Log.CUSTOM_APP.STANDARD.name() : customApp.name();

        if(!isSaveLog(saveModeStr, severityStr)){
            LogResponse logResponse = new LogResponse();
            logResponse.isSuccess = false;
            return logResponse;
        }

        Database.SaveResult dbResult = EventBus.publish(new Log_Event__e(
            Severity__c = severityStr,
            Save_Mode__c = saveModeStr,
            Custom_App__c = customAppStr,
            User_Id__c = UserInfo.getUserId(),
            Exception__c = ex.getMessage(),
            Exception_Type__c = ex.exceptionType
        ));

        LogResponse logResponse = new LogResponse(dbResult);
        System.debug('@@@ Log Response: ' + logResponse);
        return logResponse;
    }
    //#endregion
    
    //#region  ---------- Private Constructor Methods -----------
    private static Boolean isSaveLog(String saveModeString, String severityString){
        Boolean isCriticalLog = severityString == Log.SEVERITY.CRITICAL.name();
        Boolean isAlwaysSave = saveModeString == Log.SAVE_MODE.ALWAYS.name();
        Boolean isFlagBasedSave = saveModeString == Log.SAVE_MODE.FLAG_BASED.name() && SAVE_LOGS_FLAG;
        return isAlwaysSave || isFlagBasedSave || isCriticalLog;
    }

    private static String getSaveModeString(Log.SAVE_MODE saveMode){
        return saveMode == null ? Log.SAVE_MODE.FLAG_BASED.name() : saveMode.name(); 
    }

    private static LogResponse saveGenericMessage(String message, String exceptionType, String saveModeString){        
        if(!isSaveLog(saveModeString, null)){
            LogResponse logResponse = new LogResponse();
            logResponse.isSuccess = false;
            return logResponse;
        }

        Database.SaveResult dbResult = EventBus.publish(new Log_Event__e(
            User_Id__c = UserInfo.getUserId(),
            Exception_Type__c = exceptionType,
            Save_Mode__c = saveModeString,
            Message__c = message
        ));

        LogResponse logResponse = new LogResponse(dbResult);
        System.debug('@@@ Log Response: ' + logResponse);
        return logResponse;
    }
    //#endregion

    //#region  ---------- Message Constructors ------------------
    public static LogResponse message(String message){
        return saveGenericMessage(message, 'System.Message', null);
    }

    public static LogResponse message(String message, Log.SAVE_MODE saveMode){
        return saveGenericMessage(message, 'System.Message', getSaveModeString(saveMode));
    }

    @AuraEnabled
    public static LogResponse logMessageFromLWC(String message, String saveMode){
        String saveModeString;
        try{
            saveModeString = Log.SAVE_MODE.valueOf(saveMode).name(); 
        } catch(Exception ex){
            saveModeString = Log.SAVE_MODE.FLAG_BASED.name();
        }
        return saveGenericMessage(message, 'System.Message', saveModeString);
    }
    //#endregion

    //#region  ---------- JSON Object Constructors --------------
    public static LogResponse jsonObject(Object obj){
        return saveGenericMessage(JSON.serialize(obj), 'System.JSON', null);
    }

    public static LogResponse jsonObject(Object obj, Log.SAVE_MODE saveMode){
        return saveGenericMessage(JSON.serialize(obj), 'System.JSON', getSaveModeString(saveMode));
    }

    @AuraEnabled
    public static LogResponse logJsonFromLWC(String json, String saveMode){
        String saveModeString;
        try{
            saveModeString = Log.SAVE_MODE.valueOf(saveMode).name(); 
        } catch(Exception ex){
            saveModeString = Log.SAVE_MODE.FLAG_BASED.name();
        }
        return saveGenericMessage(json, 'System.JSON', saveModeString);
    }
    //#endregion

    //#region  ---------- Log Tool LWC Exposed Methods ----------
    @AuraEnabled(cacheable=true)
    public static LogRecordsResponse getLogs(
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
        Map<String, String> fields = new Map<String, String>{
            'id' => 'Id', 
            'userName' => 'User__r.Name', 
            'profileName' => 'User__r.Profile.Name', 
            'exception' => 'Exception__c',
            'type' => 'Exception_Type__c',
            'message' => 'Message__c',
            'severity' => 'Severity__c',
            'customApp' => 'Custom_App__c',
            'createdDate' => 'CreatedDate'
        };

        String countStatement = 'SELECT COUNT(Id) total';
        String selectStatement = 'SELECT ' + String.join(fields.values(),', ');
        String fromStatement = ' FROM Log__c';

        String conditions = ' WHERE';
        conditions += getQueryCondition('Id', id);
        conditions += getQueryCondition('User__r.Name', userName);
        conditions += getQueryCondition('User__r.Profile.Name', profileName);
        conditions += getQueryCondition('Exception_Type__c', type);
        conditions += getQueryCondition('Severity__c', severity);
        conditions += getQueryCondition('Custom_App__c', customApp);

        if (String.isNotBlank(startDateTime)){
            JSON.deserialize('"' + startDateTime + '"', DateTime.class);
            conditions += ' ( CreatedDate > ' + startDateTime + ' ) AND';
        }
        
        conditions = removeLastQueryTerm(conditions, ' AND');
        conditions = removeLastQueryTerm(conditions, ' WHERE');
        
        String orderByStatement = ' ORDER BY ' + fields.get(sortBy) + ' ' + sortDirection;
        String limitStatement = ' LIMIT ' + recordsPerPage;
        String offsetStatement = ' OFFSET ' + Integer.valueOf(recordsPerPage) * (pageNumber - 1);

        String queryLogs = selectStatement + fromStatement + conditions + orderByStatement + limitStatement + offsetStatement;
        String queryCount = countStatement + fromStatement + conditions;

        LogRecordsResponse response = new LogRecordsResponse();
        response.logsPerPage = Database.query(queryLogs);

        List<AggregateResult> result = Database.query(queryCount);
        response.totalLogsNumber = (Integer) result[0].get('total');

        System.debug('@@@ getLogs response: ' + response);
        return response;
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
    public static void deleteAllLogs(){
        try {
            delete [SELECT id FROM Log__c];
        } catch (DmlException ex) {
            throw new CustomHandledException(ex, null);
        }
    }

    @AuraEnabled
    public static void deleteSelectedLogs(List<String> logIds){
        try {
            delete [SELECT id FROM Log__c WHERE Id IN : logIds];
        } catch (DmlException ex) {
            throw new CustomHandledException(ex, null);
        }
    }
    //#endregion

    //#region  ---------- Response Wrapper Classes --------------
    public class LogRecordsResponse {
        @AuraEnabled
        public List<Log__c> logsPerPage;
        @AuraEnabled
        public Integer totalLogsNumber;
    }

    public class LogResponse {
        @AuraEnabled
        public String operationId;
        @AuraEnabled
        public Boolean isSuccess;
        @AuraEnabled
        public List<LogError> errors;

        public LogResponse(Database.SaveResult dbResult){
            this.isSuccess = dbResult.isSuccess();
            this.operationId = EventBus.getOperationId(dbResult);

            if (!this.isSuccess){
                errors = new List<LogError>();
                for(Database.Error dbError : dbResult.getErrors()){
                    errors.add(new LogError(dbError));
                }
            }
        }

        public LogResponse(){
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
    //#endregion
}