import { LightningElement, wire } from 'lwc';
import { getErrorMessages } from 'c/errorHandler';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import getExceptionLogs from '@salesforce/apex/Log.getExceptionLogs';
import deleteLogs from '@salesforce/apex/Log.deleteLogs';

export default class LogTool extends LightningElement {
    logs;
    data;
    selectedLog;
    subscription;
    wireExceptionLogsValue;
    loading = true;

    id = '';
    userName = '';
    profileName = '';
    type = '';
    severity = '';
    customApp = '';
    startDateTime = '';
    
    pageNumber = 1;
    recordsPerPage = '10';
    sortBy = '';
    sortDirection = 'DESC';

    columns = [
        { label: 'User Name', fieldName: 'userName', type: 'text' },
        { label: 'User Profile', fieldName: 'profileName', type: 'text' },
        { label: 'Type', fieldName: 'type', type: 'text' },
        { label: 'Severity', fieldName: 'severity', type: 'text' },
        { label: 'Custom App', fieldName: 'customApp', type: 'text' },
        { label: 'Created Date', fieldName: 'createdDate', type: 'date', typeAttributes:{
            year: "numeric",
            month: "long",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }}
    ];

    @wire(getExceptionLogs, {
        id : '$id',
        userName : '$userName',
        profileName : '$profileName',
        type : '$type',
        severity : '$severity',
        customApp : '$customApp',
        startDateTime : '$startDateTime',
        sortBy : '$sortBy',
        sortDirection : '$sortDirection',
        pageNumber : '$pageNumber',
        recordsPerPage : '$recordsPerPage'
    }) wiredExceptionLogs(value) {
        this.wireExceptionLogsValue = value;
        const { data, error } = value; 
        if (data) {
            this.processLogs(data);
        } else if (error) {
            getErrorMessages(error).forEach(message => {
                this.toastError(message);
            });
        }
        this.loading = false;
    }

    processLogs(logs){
        try {
            this.logs = logs;
            this.data = this.logs.length ? this.logs.map( log => {
                const row = {
                    createdDate : log.CreatedDate,
                    customApp : log.Custom_App__c,
                    type : log.Exception_Type__c,
                    id : log.Id,
                    severity : log.Severity__c,
                    userName : log.User__r.Name,
                    profileName : log.User__r.Profile.Name,
                };

                const exception = log.Exception__c ? JSON.parse(log.Exception__c) : undefined;
                
                if(!exception){
                    row.message = log.message;
                } else {
                    row.stackTrace = exception.stackTrace;
                    row.lineNumber = exception.lineNumber;

                    if(exception.dmlExceptions){
                        row.dmlExceptions = exception.dmlExceptions.map( dml => {
                            dml.fieldNames = dml.fieldNames?.length ? dml.fieldNames.join(', ') : '';
                            return dml;
                        });
                    } else {
                        row.message = exception.message;
                    }
                }

                return row;
            }) : undefined;
        } catch(errors) {
            getErrorMessages(errors).forEach(message => {
                this.toastError(message);
            });
        }
    }

    handleSelectRow({ detail }){
        const selectedRows = [...detail.selectedRows];
        if(selectedRows.length === 0 || selectedRows.length > 2){
            this.selectedLog = undefined;
            this.template.querySelector('lightning-datatable').selectedRows = [];
        } else if (selectedRows.length === 1) {
            this.selectedLog = selectedRows[0];
            this.template.querySelector('lightning-datatable').selectedRows = [this.selectedLog.id];
        } else {
            this.selectedLog = selectedRows.find( row => row.id != this.selectedLog.id);
            this.template.querySelector('lightning-datatable').selectedRows = [this.selectedLog.id];
        }
    }

    async deleteAll(){
        try{
            this.loading = true;
            await deleteLogs();
            this.refresh();
        } catch(errors){
            getErrorMessages(errors).forEach(message => {
                this.toastError(message);
            });
        }
    }

    refresh(){
        this.loading = true;
        refreshApex(this.wireExceptionLogsValue).finally(() => {
            this.loading = false;
        });
    }

    search({ detail }){
        this.loading = true;
        const searchValues = {...detail};
        Object.keys(searchValues).forEach(fieldName => {
            this[fieldName] = searchValues[fieldName];
        });
    }

    toastError(message){
        this.dispatchEvent(new ShowToastEvent({
            message,
            variant: 'error',
            mode: 'sticky'
        }));
    }
}


// import { subscribe, unsubscribe }  from 'lightning/empApi';
// const LOG_PLATFORM_EVENT = '/event/Log_Inserted_Event__e';
// subscription;
//
// async connectedCallback() {       
//     this.subscription = await subscribe(LOG_PLATFORM_EVENT, -1, this.refreshLogsFromPlatform);
// }
//
// refreshLogsFromPlatform(){
//     window.location.reload();//Need to change
// }
//
// disconnectedCallback(){
//     unsubscribe(this.subscription);
// }
