import { LightningElement, api } from 'lwc';

export default class LogPagination extends LightningElement {
    @api pageNumber;
    @api numberOfPages;

    get nextDisabled(){
        return this.pageNumber === this.numberOfPages;
    }

    get previousDisabled(){
        return this.pageNumber === 1;
    }

    handleNext(){
        this.pageNumber++;
        this.updatePageNumber();
    }

    handlePrevious(){
        this.pageNumber--;
        this.updatePageNumber();
    }

    updatePageNumber(){
        this.dispatchEvent( new CustomEvent('updatepagenumber', {
            detail: {
                pageNumber : this.pageNumber
            }
        }));
    }
}