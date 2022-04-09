import express from 'express';
import {urlencoded as bodyParserUrlencoded, json as bodyParserJson} from 'body-parser';

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