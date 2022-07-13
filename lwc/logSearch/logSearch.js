import { LightningElement, api, track } from 'lwc';

const RECORDS_PER_PAGE_OPTIONS = [
    { label: '5', value: '5' },
    { label: '10', value: '10' },
    { label: '25', value: '25' },
    { label: '50', value: '50' },
    { label: '100', value: '100' }
];

export default class LogSearch extends LightningElement {
    @api id;
    @api userName;
    @api profileName;
    @api type;
    @api severity;
    @api customApp;
    @api startDateTime;
    @api recordsPerPage;

    @track filtersVisibility = {
        id : false,
        userName : true,
        profileName : false,
        type : false,
        severity : true,
        customApp : false,
        startDateTime : true
    } 
    
    recordsPerPageOptions = RECORDS_PER_PAGE_OPTIONS;

    get numberOfDisplayedFilters(){
        return Object.values(this.filtersVisibility).filter( visible => visible === true).length;
    }

    get mediumDeviceSizeFilter(){ 
        return this.numberOfDisplayedFilters <= 1 ? "12" : "6";
    }
    
    get largeDeviceSizeFilter(){
        const numberOfDisplayedFilters = this.numberOfDisplayedFilters;
        if(numberOfDisplayedFilters <= 1){
            return "12";
        } else if(numberOfDisplayedFilters === 2){
            return "6";
        } else {
            return "4";
        }
    } 

    handleChange({ target }){
        const {name, value } = target;
        this[name] = value;
        this.doSearch();
    }

    handleFiltersChange({ target }){
        const { value, checked } = target;
        this.filtersVisibility[value] = !checked;
        target.checked = !checked;

        const previousValue = this[value];
        this[value] = checked ? '' : this[value];

        if(previousValue != this[value]){
            this.doSearch();
        }
    }

    doSearch(){
        this.dispatchEvent( new CustomEvent('search', {
            detail : {
                id : this.id,
                userName : this.userName,
                profileName : this.profileName,
                type : this.type,
                severity : this.severity,
                customApp : this.customApp,
                startDateTime : this.startDateTime,
                recordsPerPage : this.recordsPerPage
            }
        }));
    }

    deleteAll(){
        this.dispatchEvent( new CustomEvent('deleteall'));
    }

    refresh(){
        this.dispatchEvent( new CustomEvent('refresh'));
    }
}