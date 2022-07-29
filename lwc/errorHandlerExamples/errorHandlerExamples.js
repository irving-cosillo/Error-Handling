import { LightningElement } from 'lwc';
import { getErrorMessages } from 'c/errorHandler';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import logMessageExample from '@salesforce/apex/CustomHandledExceptionExamples.logMessageExample';
import logSObjectExample from '@salesforce/apex/CustomHandledExceptionExamples.logSObjectExample';
import throwException from '@salesforce/apex/CustomHandledExceptionExamples.throwException';
import logMessageFromLWC from '@salesforce/apex/Log.logMessageFromLWC';
import logJsonFromLWC from '@salesforce/apex/Log.logJsonFromLWC';

export default class ErrorHandlerExamples extends LightningElement {

    isProcessErrors = true;
    isCustomHandledException = true;
    exceptionName = 'DML';
    customUserMessage;
    severityString = 'LOW';
    saveModeString = 'FLAG_BASED';
    customAppString = 'STANDARD';

    apexTemplate;
    isJSONMessage = false;
    message = "";

    exceptionOptions = [
        { label: 'DML', value: 'DML' },
        { label: 'List', value: 'List' },
        { label: 'JSON', value: 'JSON' },
        { label: 'Limit', value: 'Limit' },
        { label: 'Null Pointer', value: 'NullPointer' },
        { label: 'Query', value: 'Query' }
    ];

    severityOptions = [
        { label: 'Low', value: 'LOW' },
        { label: 'Medium', value: 'MEDIUM' },
        { label: 'High', value: 'HIGH' },
        { label: 'Critical', value: 'CRITICAL' }
    ];

    saveModeOptions = [
        { label: 'Flag Based', value: 'FLAG_BASED' },
        { label: 'Always', value: 'ALWAYS' }
    ];

    customAppOptions = [
        { label: 'Standard', value: 'STANDARD' },
        { label: 'Matrix', value: 'MATRIX' },
        { label: 'Hermes', value: 'HERMES' },
        { label: 'Melissa', value: 'MELISSA' },
        { label: 'Partner', value: 'PARTNER' },
        { label: 'Service Power', value: 'SERVICEPOWER' },
        { label: 'Flexfi', value: 'FLEXFI' },
        { label: 'Commercial', value: 'COMMERCIAL' },
        { label: 'ALN', value: 'ALN' }
    ];

    connectedCallback(){
        this.fillExceptionTemplate();
    }

    handleChange({ target }){
        const { name, value, checked, type } = target;
        this[name] = type === 'toggle' ? checked : value;

        const exceptionFields = ['severityString','saveModeString','customAppString','exceptionName','customUserMessage', 'isProcessErrors'];
        if (exceptionFields.includes(name) || (name ==='isCustomHandledException' &&  this[name] === true)){
            this.fillExceptionTemplate();
        } else if (['isJSONMessage','message'].includes(name)) {
            this.fillMessageTemplate();
        } else {
            this.apexTemplate = '';
        }
    }

    fillExceptionTemplate(){
        const exceptionType = this.exceptionName === 'DML' ? 'DmlException' : 'Exception';
        const customUserMessage = this.customUserMessage ? `, '` + this.customUserMessage + `'`: ', null';

        let params = 'customEx';
        if(this.severityString === 'LOW' && this.saveModeString === 'FLAG_BASED' && this.customAppString === 'STANDARD'){
            params += '';
        } else if (this.saveModeString === 'FLAG_BASED' && this.customAppString === 'STANDARD'){
            params += ', LOG.SEVERITY.' + this.severityString;
        } else if (this.customAppString === 'STANDARD'){
            params += ', LOG.SEVERITY.' + this.severityString + ', LOG.SAVE_MODE.' + this.saveModeString;
        } else {
            params += ', LOG.SEVERITY.' + this.severityString + ', LOG.SAVE_MODE.' + this.saveModeString + ', LOG.CUSTOM_APP.' + this.customAppString;
        }

        this.apexTemplate = `
    try {
        //Code that will throw the exception
    } (${exceptionType} ex) {
        CustomHandledException customEx = new CustomHandledException(ex ${customUserMessage});
        Log.exception(${params});
        throw customEx;
    } 
        `;
    }

    fillMessageTemplate(){
        const methodName = this.isJSONMessage ? 'logJsonFromLWC' : 'logMessageFromLWC';
        this.apexTemplate = `
    //Save Mode parameter is required, aura methods does not allow overload. 
    //FLAG_BASED will be the default value if null is passed.
    Log.${methodName}('${this.message}', null);
        `;
    }

    async handleClick({ target }){
        try {
            if (target.name === 'throwException'){
                await throwException({
                    isCustomHandledException : this.isCustomHandledException,
                    exceptionName : this.exceptionName,
                    customUserMessage : this.customUserMessage,
                    severityString : this.severityString,
                    saveModeString : this.saveModeString, 
                    customAppString : this.customAppString
                });
            } else if ( target.name === 'logFromLWC'){
                if (this.isJSONMessage) {
                    await logJsonFromLWC({
                        json : this.message,
                        saveMode : null
                    });
                } else {
                    await logMessageFromLWC({
                        message : this.message,
                        saveMode : null
                    });
                }
            } else if ( target.name === 'logSObject'){
                this.apexTemplate = `
    //Example SObject Array
    List<Account> accountList = [SELECT Id, Name, Phone, Owner.Name FROM Account LIMIT 5];
    //The save mode parameter is optional, if it is not included or null value is passed the 
    //default value will be FLAG_BASED
    Log.jsonMessage('${this.message}', Log.SAVE_MODE.ALWAYS);
                `;
                await logSObjectExample();
            } else if ( target.name === 'logMessage'){
                this.apexTemplate = `
    Log.message('Test message from apex');
                `;
                await logMessageExample();
            }

            this.dispatchEvent(new ShowToastEvent({
                message: 'Message logged successfully',
                variant: 'success',
                mode: 'sticky'
            }));
        } catch(errors){
            if(this.isProcessErrors){
                getErrorMessages(errors).forEach( message => {
                    this.toastError(message);
                });
            } else {
                console.error(errors);
                if (errors?.body?.message){
                    this.toastError(errors.body.message);
                }
            }
        }
    }

    toastError(message){
        this.dispatchEvent(new ShowToastEvent({
            message,
            variant: 'error',
            mode: 'sticky'
        }));
    }
}