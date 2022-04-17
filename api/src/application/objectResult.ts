export class EmptyObjectResult{
    constructor(
        public readonly error:string|null
    ) { }

    isValid(){
        return this.error === null;
    }
}

export const createSuccessEmptyResult = ():EmptyObjectResult => {
    return new EmptyObjectResult(null);
}

export const createErrorEmptyResult = (error:string):EmptyObjectResult => {
    return new EmptyObjectResult(error);
}


export class ObjectResult<T> extends EmptyObjectResult {
    constructor(
        public readonly data:T|null,
        error:string|null
    ) {
        super(error)
    }
}


export const createSuccessResult = <T>(data:T):ObjectResult<T> => {
    return new ObjectResult<T>(data, null);
}

export const createErrorResult = <T>(error:string):ObjectResult<T> => {
    return new ObjectResult<T>(null, error);
}
