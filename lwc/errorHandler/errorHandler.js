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
        const isUIAPIReadErrors = error && Array.isArray(error.body);
        const isPageLevelErrors = error?.body?.pageErrors && error.body.pageErrors.length > 0;
        const isFieldLevelErrors = error?.body?.fieldErrors && Object.keys(error.body.fieldErrors).length > 0;
        const isUIAPIDMLPageLevelErrors = error?.body?.output?.errors && error.body.output.errors.length > 0;
        const isUIAPIDMLFieldLevelErrors = error?.body?.output?.fieldErrors && Object.keys(error.body.output.fieldErrors).length > 0;
        const isUIAPIDMLApexNetworkErrors = error?.body?.message && typeof error.body.message === 'string';
        const isJSErrors = error?.message && typeof error.message === 'string';

        if ( isUIAPIReadErrors ) {
            return error.body.map((e) => e.message);
        }
        else if ( isPageLevelErrors ) {
            return error.body.pageErrors.map((e) => e.message);
        }
        else if ( isFieldLevelErrors ) {
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
        else if ( isUIAPIDMLPageLevelErrors ) {
            return error.body.output.errors.map((e) => e.message);
        }
        else if ( isUIAPIDMLFieldLevelErrors ) {
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
        else if ( isUIAPIDMLApexNetworkErrors ) {
            try {
                const customHandledException = JSON.parse(error.body.message);
                consoleLogErrors = customHandledException;
                if(customHandledException?.dmlExceptions?.length > 0){
                    return customHandledException.dmlExceptions.map(dmlException => dmlException.message);
                } else {
                    return customHandledException.message; 
                }
            } catch {
                return error.body.message;
            }
        }
        else if (isJSErrors) {
            return error.message;
        } else { // Unknown error shape so try HTTP status text
            return error.statusText;
        }
    })
    .reduce((prev, curr) => prev.concat(curr), []) // Flatten
    .filter((message) => !!message) // Remove empty strings

    console.error('Error: ' , consoleLogErrors);
    return errorMessages;
}