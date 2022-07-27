import { LightningElement, api } from 'lwc';
import { prettyPrint } from 'c/errorHandler';

export default class LogInformation extends LightningElement {
    @api selectedLog;

    renderedCallback() {
        if(this.selectedLog?.json){
            const codeElement = this.template.querySelector('.html-container');
            try {
                const jsonPretty = prettyPrint(JSON.parse(this.selectedLog.json));
                codeElement.innerHTML = jsonPretty;
            } catch (error){
                codeElement.innerHTML = this.selectedLog.json;
            }
        }
    }
}