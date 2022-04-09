import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';


import routes from './routers';

const runApi = async () => {
    const app = express()
    const port = 3000;

    const corsOptions = {
        origin: '*',
        optionsSuccessStatus: 200
    }

    // Settings
    app
        .use(helmet())
        .use(compression())
        .use(cors(corsOptions))
        .use(morgan('dev'))
        .use(routes);

    // Start
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
}

export default runApi; 