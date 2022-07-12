import { LightningElement } from 'lwc';

export default class LogSearch extends LightningElement {
    selectedOptions = ['userName', 'severity', 'startDateTimeString'];
    options = [
        { label: 'Id', value: 'Id' },
        { label: 'User', value: 'userName' },
        { label: 'Profile', value: 'profileName' },
        { label: 'Type', value: 'type' },
        { label: 'Severity', value: 'severity' },
        { label: 'Custom App', value: 'customApp' },
        { label: 'Start Date', value: 'startDateTimeString' },
    ];

    recordsPerPageOptions = [
        { label: '5', value: '5' },
        { label: '10', value: '10' },
        { label: '25', value: '25' },
        { label: '50', value: '50' },
        { label: '100', value: '100' }
    ];

    showFilters = false;
    searchValues = {
        Id : '',
        userName : '',
        profileName : '',
        type : '',
        severity : '',
        customApp : '',
        startDateTimeString : '',
        recordsPerPage : '10'
    };
    
    get optionVisible(){
        const optionVisible = {};
        this.options.forEach( option => {
            const optionName = option.value;
            optionVisible[optionName] = !!this.selectedOptions.find( selectedOption => selectedOption === optionName);
        });
        return optionVisible;
    }

    get mediumDeviceSizeFilter(){
        return this.selectedOptions.length <= 1 ? "12" : "6";
    }
    
    get largeDeviceSizeFilter(){
        if(this.selectedOptions.length <= 1){
            return "12";
        } else if(this.selectedOptions.length === 2){
            return "6";
        } else {
            return "4";
        }
    } 

    handleChange({ target }){
        const {name, value } = target;
        if (name === 'searchOptions'){
            this.selectedOptions = value;
            this.options.forEach( option => {
                const isSelectedOption = this.selectedOptions.find(selectedOption => selectedOption === option.value);
                this.searchValues[option.value] = isSelectedOption ? this.searchValues[option.value] : '';
            });
        } else {
            this.searchValues[name] = name != 'recordsPerPage' ? value : value * 1;
        }

        this.dispatchEvent( new CustomEvent('search', {
            detail : this.searchValues
        }));
    }

    toggleFilters(){
        this.showFilters = !this.showFilters;
    }
}