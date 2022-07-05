import { LightningElement } from 'lwc';
import { getErrorMessages } from 'c/errorHandler';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import throwDmlException from '@salesforce/apex/CustomHandledExceptionExamples.throwDmlException';
import throwListException from '@salesforce/apex/CustomHandledExceptionExamples.throwListException';
import throwCustomHandledDmlException from '@salesforce/apex/CustomHandledExceptionExamples.throwCustomHandledDmlException';
import throwCustomHandledListException from '@salesforce/apex/CustomHandledExceptionExamples.throwCustomHandledListException';

export default class ErrorHandlerExamples extends LightningElement {

    async connectedCallback(){
        console.clear();
        try{
            await throwDmlException();
        } catch(errors){
            getErrorMessages(errors).forEach( message => {
                this.dispatchEvent(new ShowToastEvent({
                    message,
                    variant: 'error',
                    mode: 'sticky'
                }));
            });
        }

        try {
            await throwListException();
        } catch(errors){
            getErrorMessages(errors).forEach( message => {
                this.dispatchEvent(new ShowToastEvent({
                    message,
                    variant: 'error',
                    mode: 'sticky'
                }));
            });
        }

        try {
            await throwCustomHandledDmlException();
        } catch(errors){
            getErrorMessages(errors).forEach( message => {
                this.dispatchEvent(new ShowToastEvent({
                    message,
                    variant: 'error',
                    mode: 'sticky'
                }));
            });
        }

        try {
            await throwCustomHandledListException();
        } catch(errors){
            getErrorMessages(errors).forEach( message => {
                this.dispatchEvent(new ShowToastEvent({
                    message,
                    variant: 'error',
                    mode: 'sticky'
                }));
            });
        }
    }
}