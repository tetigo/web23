/**
 * Validation class
 */
export default class Validation{
    success: boolean;
    message: string;

    /**
     * Creates a new validation object
     * @param success If the validation was succesful
     * @param message The validation message, if validation failed
     */
    constructor(success:boolean = true, message:string = 'All good!'){
        this.success=success;
        this.message=message;
    }
}