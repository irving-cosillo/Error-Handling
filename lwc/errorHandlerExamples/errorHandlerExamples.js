import { LightningElement } from 'lwc';
import { getErrorMessages } from 'c/errorHandler';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import throwDmlException from '@salesforce/apex/CustomHandledExceptionExamples.throwDmlException';
import throwCustomHandledDmlException from '@salesforce/apex/CustomHandledExceptionExamples.throwCustomHandledDmlException';

export default class ErrorHandlerExamples extends LightningElement {

    async connectedCallback(){
        console.clear();
        try{
            await throwDmlException();
        } catch(errors){
            getErrorMessages(errors).forEach( message => {
                this.toastError(message);
            });
        }

        try {
            await throwCustomHandledDmlException();
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