import { LightningElement } from 'lwc';
import { getErrorMessages } from 'c/errorHandler';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import throwDmlException from '@salesforce/apex/CustomHandledExceptionExamples.throwDmlException';
import throwListException from '@salesforce/apex/CustomHandledExceptionExamples.throwListException';
import throwJSONException from '@salesforce/apex/CustomHandledExceptionExamples.throwJSONException';
import throwQueryException from '@salesforce/apex/CustomHandledExceptionExamples.throwQueryException';
import throwLimitException from '@salesforce/apex/CustomHandledExceptionExamples.throwLimitException';
import throwNullPointerException from '@salesforce/apex/CustomHandledExceptionExamples.throwNullPointerException';
import throwCustomHandledDmlException from '@salesforce/apex/CustomHandledExceptionExamples.throwCustomHandledDmlException';
import throwCustomHandledListException from '@salesforce/apex/CustomHandledExceptionExamples.throwCustomHandledListException';
import throwCustomHandledJSONException from '@salesforce/apex/CustomHandledExceptionExamples.throwCustomHandledJSONException';
import throwCustomHandledQueryException from '@salesforce/apex/CustomHandledExceptionExamples.throwCustomHandledQueryException';
import throwCustomHandledLimitException from '@salesforce/apex/CustomHandledExceptionExamples.throwCustomHandledLimitException';
import throwCustomHandledNullPointerException from '@salesforce/apex/CustomHandledExceptionExamples.throwCustomHandledNullPointerException';

export default class ErrorHandlerExamples extends LightningElement {
    functionArr = [
        throwDmlException,
        throwListException,
        throwJSONException,
        throwQueryException,
        throwLimitException,
        throwNullPointerException,
        throwCustomHandledDmlException,
        throwCustomHandledListException,
        throwCustomHandledJSONException,
        throwCustomHandledQueryException,
        throwCustomHandledLimitException,
        throwCustomHandledNullPointerException
    ];

    async handleClick({ target }){
        const index = target.value * 1;
        try{
            await this.functionArr[index]();
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