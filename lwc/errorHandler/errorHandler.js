/**
 * Reduces one or more LDS errors into a string[] of error messages.
 * @param {FetchResponse|FetchResponse[]} errors
 * @return {String[]} Array of error messages
 */
 export function getErrorMessages(errors) {
    let consoleLogErrors = errors;
    if (!Array.isArray(errors)) {
        errors = [errors];
    }
    
    const errorMessages = errors
    .filter( error => !!error ) // Remove null/undefined items
    .map((error) => {
        const isUIAPIReadError = error && Array.isArray(error.body);
        const isPageLevelError = error?.body?.pageErrors && error.body.pageErrors.length > 0;
        const isFieldLevelError = error?.body?.fieldErrors && Object.keys(error.body.fieldErrors).length > 0;
        const isUIAPIDMLPageLevelError = error?.body?.output?.errors && error.body.output.errors.length > 0;
        const isUIAPIDMLFieldLevelError = error?.body?.output?.fieldErrors && Object.keys(error.body.output.fieldErrors).length > 0;
        const isUIAPIDMLApexNetworkError = error?.body?.message && typeof error.body.message === 'string';
        const isJSError = error?.message && typeof error.message === 'string';

        if ( isUIAPIReadError ) {
            return error.body.map((e) => e.message);
        }
        else if ( isPageLevelError ) {
            return error.body.pageErrors.map((e) => e.message);
        }
        else if ( isFieldLevelError ) {
            const fieldErrors = [];
            Object.values(error.body.fieldErrors).forEach(
                (errorArray) => {
                    fieldErrors.push(
                        ...errorArray.map((e) => e.message)
                    );
                }
            );
            return fieldErrors;
        }
        else if ( isUIAPIDMLPageLevelError ) {
            return error.body.output.errors.map((e) => e.message);
        }
        else if ( isUIAPIDMLFieldLevelError ) {
            const fieldErrors = [];
            Object.values(error.body.output.fieldErrors).forEach(
                (errorArray) => {
                    fieldErrors.push(
                        ...errorArray.map((e) => e.message)
                    );
                }
            );
            return fieldErrors;
        }
        else if ( isUIAPIDMLApexNetworkError ) {
            try {
                const customHandledException = JSON.parse(error.body.message);
                consoleLogErrors = customHandledException;
                if(customHandledException?.dmlExceptions?.length > 0){
                    return customHandledException.dmlExceptions.map(dmlException => dmlException.message);
                } else {
                    const hasCustomUserMessage = customHandledException.customUserMessage;
                    return hasCustomUserMessage ? customHandledException.customUserMessage : customHandledException.message; 
                }
            } catch {
                return error.body.message;
            }
        }
        else if (isJSError) {
            return error.message;
        } else { 
            // Unknown error shape so try HTTP status text
            return error.statusText;
        }
    })
    .reduce((prev, curr) => prev.concat(curr), []) // Flatten
    .filter((message) => !!message) // Remove empty strings

    console.error('Error: ' , consoleLogErrors);
    return errorMessages;
}