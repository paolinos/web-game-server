import express from 'express';
import * as core from 'express-serve-static-core';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';


import routes from './routers';
import { PORT } from '../../consts';

// TODO: do custom
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
}

export class HttpApi{
    private readonly _app:core.Express;

    constructor(){
        this._app = express();
        
        // Settings
        this._app
            .use(helmet())
            .use(compression())
            .use(cors(corsOptions))
            .use(morgan('dev'))
            .use(routes);
    }

    run(){
        this._app.listen(PORT, () => {
            console.log(`Example app listening on port ${PORT}`)
        });
    }
}