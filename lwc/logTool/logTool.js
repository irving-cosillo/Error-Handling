import { LightningElement, wire } from 'lwc';
import { getErrorMessages } from 'c/errorHandler';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import getLogs from '@salesforce/apex/Log.getLogs';
import deleteAllLogs from '@salesforce/apex/Log.deleteAllLogs';
import deleteSelectedLogs from '@salesforce/apex/Log.deleteSelectedLogs';

const COLUMNS = [
    { label: 'User Name', fieldName: 'userName', type: 'text', sortable: true, wrapText: true},
    { label: 'User Profile', fieldName: 'profileName', type: 'text', sortable: true, wrapText: true },
    { label: 'Type', fieldName: 'type', type: 'text', sortable: true, wrapText: false },
    { label: 'Severity', fieldName: 'severity', type: 'text', sortable: true, wrapText: false, initialWidth: 100 },
    { label: 'Custom App', fieldName: 'customApp', type: 'text', sortable: true, wrapText: false, initialWidth: 125 },
    { label: 'Created Date', fieldName: 'createdDate', type: 'date', sortable: true, wrapText: true, 
        typeAttributes:{
            year: "numeric",
            month: "long",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }
    },
    {
        fixedWidth : 50,
        type: 'button-icon',
        typeAttributes: {
            name: 'preview',
            iconName: 'utility:preview',
            title: 'Preview',
            variant: 'bare',
            alternativeText: 'Preview'
        }
    }
];

export default class LogTool extends LightningElement {
    data;
    selectedLog;
    selectedRows;
    wireExceptionLogsValue;
    loading = true;
    columns = COLUMNS;

    id = '';
    userName = '';
    profileName = '';
    type = '';
    severity = '';
    customApp = '';
    startDateTime = '';
    
    totalLogsNumber;
    pageNumber = 1;
    recordsPerPage = '10';
    sortBy = 'createdDate';
    sortDirection = 'desc';
    defaultSortDirection = 'desc';

    @wire(getLogs, {
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
            this.totalLogsNumber = data.totalLogsNumber;
            this.processLogs(data.logsPerPage);
            this.loading = false;
        } else if (error) {
            getErrorMessages(error).forEach(message => {
                this.toastError(message);
            });
            this.loading = false;
        }
    }

    get numberOfPages(){
        return this.totalLogsNumber ? Math.ceil(this.totalLogsNumber / this.recordsPerPage) : 0;
    }

    processLogs(logs){
        try {
            this.data = logs.length ? logs.map( log => {
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
                    if(row.type === 'System.JSON'){
                        row.json = log.Message__c;
                    } else {
                        row.message = log.Message__c;
                    }
                } else {
                    row.stackTrace = exception.stackTrace;
                    row.lineNumber = exception.lineNumber;
                    row.customUserMessage = exception.customUserMessage;

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

    async deleteAll(){
        try{
            this.loading = true;
            await deleteAllLogs();
            this.pageNumber = 1;
            this.selectedLog = undefined;
            this.refresh();
        } catch(errors){
            getErrorMessages(errors).forEach(message => {
                this.toastError(message);
            });
        }
    }

    async deleteSelected(){
        try{
            this.loading = true;
            const logIds = this.template.querySelector('lightning-datatable').selectedRows;
            await deleteSelectedLogs({ logIds });
            this.pageNumber = 1;
            this.selectedLog = undefined;
            this.refresh();
        } catch(errors){
            getErrorMessages(errors).forEach(message => {
                this.toastError(message);
            });
        }
    }

    refresh(){
        this.loading = true;
        this.pageNumber = 1;
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

    updatePageNumber({ detail }){
        this.loading = true;
        this.pageNumber = detail.pageNumber;
    }

    handleRowAction({ detail }) {
        const { action, row } = detail;
        if(action.name === 'preview'){
            this.selectedLog = row;
        } else if (action.name === 'delete'){
            this.deleteLog(row.id);
        }
    }

    handleSort({ detail }){
        const { fieldName, sortDirection } = detail;
        
        this.loading = true;
        this.pageNumber = 1;
        this.sortBy = fieldName;
        this.sortDirection = sortDirection;
    }

    handleRowSelection({ detail }){
        this.selectedRows = detail.selectedRows;
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
