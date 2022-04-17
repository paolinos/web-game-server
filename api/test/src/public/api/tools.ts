import express from 'express';
import {urlencoded as bodyParserUrlencoded, json as bodyParserJson} from 'body-parser';
import { UserSession } from '../../../../src/application/interfaces/userSession.interface';

/**
 * Create Test app with body parser
 * 
 * @returns {Express} 
 */
export const createTestApp = () => {
    const app = express();
    app
    .use(bodyParserUrlencoded({ extended: false }))
    .use(bodyParserJson())

    return app;
}


export const createUserSession = (email:string):UserSession => {
    return  {
        email,
        last: new Date()
    }
}