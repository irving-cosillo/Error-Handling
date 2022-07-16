/**
 * @author Irving Cosillo
 * @date July 2022
 * 
 * @description Custom Exception Class that gathers all the available information of a standard exception 
 * and passes this information through the message property as a serialized string. To get and display the 
 * errors returned by this class in a lwc, use the errorHandler.js library.
 * 
 * <p>Coverage: CustomHandledExceptionTest</p>
 */
public virtual class CustomHandledException extends Exception{
    /**
     * @description Type of exception, such as DmlException, ListException, MathException, and so on.
     */
    public string exceptionType;
    /**
     * @description Stack trace of a thrown exception
     */
    public string stackTrace;
    /**
     * @description Line number from where the exception was thrown.
     */
    public Integer lineNumber;
    /**
     * @description System Default Error message.
     */
    public string message;
    /**
     * @description Error message that will be displayed to the user, if this value is null it will display the default exception message.
     */
    public string customUserMessage;
    /**
     * @description List of DmlEx that contains the error information of each record
     */
    public List<DmlEx> dmlExceptions;

    /**
     * description Constructor for any kind of exceptions. If a DmlException is passed in the argument, it
     * won't display the full information of the exception, use the DmlException constructor instead.
     * 
     * @param ex Standard Exception that will be converted into a custom one.
     * @param customUserMessage Error message that will be displayed to the user, if this value is null it will display the default exception message.
     */
    public CustomHandledException(Exception ex, String customUserMessage) {
        this.exceptionType = ex.getTypeName();
        this.stackTrace = ex.getStackTraceString();
        this.lineNumber = ex.getLineNumber();
        this.message = ex.getMessage();
        this.customUserMessage = customUserMessage;
        this.dmlExceptions = null;

        setCustomMessage(JSON.serialize(this,true));
    }
    
    /**
     * description Constructor for Dml Exceptions. It will display an array of errors for the records that
     * caused the Dml Exception in the dmlExceptions property.
     * 
     * @param ex Standard Dml Exception that will be converted into a custom one. The type can be any kind of exception as it extends the Exception class.
     * @param customUserMessage Error message that will be displayed to the user, if this value is null it will display the default exception message.
     */
    public CustomHandledException(DmlException ex, String customUserMessage) {
        this.exceptionType = ex.getTypeName();
        this.stackTrace = ex.getStackTraceString();
        this.lineNumber = ex.getLineNumber();
        this.message = ex.getMessage();
        this.customUserMessage = customUserMessage;
        this.dmlExceptions = new List<DmlEx>();

        DmlEx dmlEx;
        for(Integer i = 0; i < ex.getNumDml(); i++){
            dmlEx = new DmlEx();
            dmlEx.id = ex.getDmlId(i);
            dmlEx.index = ex.getDmlIndex(i);
            dmlEx.fieldNames = ex.getDmlFieldNames(i);
            dmlEx.message = ex.getDmlMessage(i);
            dmlEx.statusCode = ex.getDmlStatusCode(i);
            dmlExceptions.add(dmlEx);
        }

        setCustomMessage(JSON.serialize(this, true));
    }

    /**
     * description Serializes the class with all the information of the standard exception into the message property of the standard exception.
     */
    private void setCustomMessage(String serializedException){
        System.debug('<CustomHandledException>' + serializedException + '</CustomHandledException>');
        setMessage(serializedException);
    }

    /**
     * @description Wrapper inner class for specific dml exception properties
     */
    public class DmlEx {
        /**
         * @description id of the failed record that caused the error
         */
        public string id;
        /**
         * @description Index of the failed record
         */
        public Integer index;
        /**
         * @description Names of the fields that caused the error for the specified failed record
         */
        public List<String> fieldNames;
        /**
         * @description error message for the record that caused the error
         */
        public string message;
        /**
         * @description Status Code for the record that caused the error 
         */
        public string statusCode;
    }
}