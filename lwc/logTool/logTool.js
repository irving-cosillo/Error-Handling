import { LightningElement } from 'lwc';
import { getErrorMessages } from 'c/errorHandler';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getExceptionLogs from '@salesforce/apex/Log.getExceptionLogs';
import deleteLogs from '@salesforce/apex/Log.deleteLogs';

export default class LogTool extends LightningElement {    
    
    logs;
    data;
    selectedLog;
    columns = [
        { label: 'User Name', fieldName: 'userName', type: 'text' },
        { label: 'User Profile', fieldName: 'profileName', type: 'text' },
        { label: 'Exception Type', fieldName: 'exceptionType', type: 'text' },
        { label: 'Created Date', fieldName: 'createdDate', type: 'date', typeAttributes:{
            year: "numeric",
            month: "long",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }}
    ];

    connectedCallback(){
        this.refreshLogs();
    }

    async refreshLogs(){
        try {
            const result = await getExceptionLogs();
            if (!result?.length){
                this.logs = undefined;
                this.data = undefined;
            } else {
                this.logs = result;
                console.log(this.logs);
                this.data = this.logs.map( log => {
                    const row = {
                        Id            : log.Id,
                        userName      : log.User__r.Name,
                        profileName   : log.User__r.Profile.Name,
                        isException   : log.Is_Exception__c,
                        isMessage     : log.Is_Message__c,
                        createdDate   : log.CreatedDate,
                    }
                    try {
                        row.exception = JSON.parse(log.Exception__c);
                        row.exceptionType = row.exception.exceptionType.split('.')[1];
                        row.message = row.exception.message;
                        row.optionalMessage = row.exception.optionalMessage;
                        row.stackTrace = row.exception.stackTrace;
                        row.lineNumber = row.exception.lineNumber;
    
                        if (row.exception?.dmlExceptions?.length){
                            row.exception.dmlExceptions = row.exception.dmlExceptions.map( dml => {
                                dml.fieldNames = dml.fieldNames?.length ? dml.fieldNames.join(', ') : '';
                                return dml;
                            });
                        }
                    } catch(errors) {
                        console.error(errors);
                        row.exception = undefined;
                        row.exceptionType = undefined;
                    }
                    return row;
                });
                console.log(this.data);
            }      
        } catch (errors) {
            getErrorMessages(errors).forEach(message => {
                this.toastError(message);
            });
        }
    }

    handleSelectRow({ detail }){
        const selectedRows = [...detail.selectedRows];
        if(selectedRows.length === 1){
            this.selectedLog = selectedRows[0];
            this.template.querySelector('lightning-datatable').selectedRows = [this.selectedLog.Id];
        } else if (selectedRows.length === 0) {
            this.selectedLog = undefined;
            this.template.querySelector('lightning-datatable').selectedRows = [];
        } else {
            this.selectedLog = selectedRows.find( row => row.Id != this.selectedLog.Id);
            this.template.querySelector('lightning-datatable').selectedRows = [this.selectedLog.Id];
        }
    }

    async handleDelete(){
        try{
            await deleteLogs();
            this.refreshLogs();
        } catch(errors){
            getErrorMessages(errors).forEach(message => {
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