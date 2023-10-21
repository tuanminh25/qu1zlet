import request from 'sync-request-curl';
import { port, url } from '../config.json';
import { testRegister, testClear, testLogin } from './auth.test';

const SERVER_URL = `${url}:${port}`;
const ERROR = { error: expect.any(String) };

beforeEach(() => {
	testClear();
});

