import { LightningElement } from 'lwc';
import { getErrorMessages } from 'c/errorHandler';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import throwException from '@salesforce/apex/CustomHandledExceptionExamples.throwException';

export default class ErrorHandlerExamples extends LightningElement {

    isCustomHandledException = true;
    exceptionName = 'DML';
    customUserMessage;
    severityString = 'LOW';
    saveModeString = 'ALWAYS';
    customAppString = 'STANDARD';

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
        { label: 'Always', value: 'ALWAYS' },
        { label: 'Flag Based', value: 'FLAG_BASED' }
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

    handleChange({ target }){
        const { name, value, checked } = target;
        this[name] = name === 'isCustomHandledException' ? checked : value;
        console.log({ name, value: this[name] });
    }

    async handleClick(){
        try{
            await throwException({
                isCustomHandledException : this.isCustomHandledException,
                exceptionName : this.exceptionName,
                customUserMessage : this.customUserMessage,
                severityString : this.severityString,
                saveModeString : this.saveModeString, 
                customAppString : this.customAppString
            });
        } catch(errors){
            getErrorMessages(errors).forEach( message => {
                this.toastError(message);
            });
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