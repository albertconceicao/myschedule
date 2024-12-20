import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import express from 'express';

import 'express-async-errors';

import { cors } from '../app/middlewares/cors';
import { router } from '../app/routes/routes';
import logger from '../app/utils/logger';

import databaseConfig from './database/databaseConfig';

dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());

app.use(cors);

databaseConfig.init();

app.use(router);

app.use((error: any, request: any, response: any, next: any) => {
	logger.error(`###### Error Handler ######`, error);
	response.sendStatus(500);
});

export default app;
