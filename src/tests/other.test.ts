import request from 'sync-request-curl';
import { port, url } from '../config.json';
import { testRegister } from './auth.test';

const SERVER_URL = `${url}:${port}`;
const auth = '/v1/admin/auth/';

function testClear() {
	const res = request('DELETE', SERVER_URL + '/v1/clear');

	return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

describe('/v1/clear', () => {
	testRegister('Roger@gmail.com', 'password 1', 'Roger', 'Duong');
	test('Successful clear', () => {
		const clear1 = testClear();
		expect(clear1.response).toStrictEqual({});
		expect(clear1.status).toStrictEqual(200);
	})
});