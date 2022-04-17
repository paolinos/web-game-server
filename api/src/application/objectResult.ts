export class EmptyObjectResult{
    private readonly _error:string|null;
    constructor(
        error:string|null
    ) { 
        this._error = error;
    }

    isValid(){
        return this._error === null;
    }

    get error():string{
        return this._error as string;
    }
}

export const createSuccessEmptyResult = ():EmptyObjectResult => {
    return new EmptyObjectResult(null);
}

export const createErrorEmptyResult = (error:string):EmptyObjectResult => {
    return new EmptyObjectResult(error);
}


export class ObjectResult<T> extends EmptyObjectResult {
    private readonly _data:T|null;

    constructor(
        data:T|null,
        error:string|null
    ) {
        super(error);
        this._data = data
    }

    get data():T{
        return this._data as T;
    }
}


export const createSuccessResult = <T>(data:T):ObjectResult<T> => {
    return new ObjectResult<T>(data, null);
}

export const createErrorResult = <T>(error:string):ObjectResult<T> => {
    return new ObjectResult<T>(null, error);
}
