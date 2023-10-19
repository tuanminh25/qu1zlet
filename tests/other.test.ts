import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;

function testClear() {
	const res = request('DELETE', SERVER_URL + '/v1/clear');

	return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

describe('/v1/clear', () => {
	test('Successful clear', () => {
		const clear1 = testClear();
		expect(clear1.response).toStrictEqual({});
		expect(clear1.status).toStrictEqual(200);
	})
});