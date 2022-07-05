@isTest
public class CustomHandledExceptionTest {
    static testMethod void listExceptionTest(){
        Test.startTest();
        try {
            List<Integer> integerList = new List<Integer>();
            Integer integerValue = integerList[1];
        } catch (Exception ex){
            CustomHandledException customEx = new CustomHandledException(ex, 'Test Exception');
            System.assertEquals('System.ListException', customEx.exceptionType, 'Incorrect exception type retrieved');
        }
        Test.stopTest();
    }

    static testMethod void dmlExceptionTest(){
        Test.startTest();
        try {
            insert new Contact();
        } catch (DmlException ex){
            CustomHandledException customEx = new CustomHandledException(ex, 'Test Dml Exception');
            System.assertEquals('System.DmlException', customEx.exceptionType, 'Incorrect exception type retrieved');
            System.assertEquals('REQUIRED_FIELD_MISSING', customEx.dmlExceptions[0].statusCode, 'Incorrect status code retrieved');
            System.assertEquals('LastName', customEx.dmlExceptions[0].fieldNames[0], 'Incorrect field name');
        }
        Test.stopTest();
    }
}