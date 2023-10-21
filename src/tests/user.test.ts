import request from 'sync-request-curl';
import { port, url } from '../config.json';
import { testRegister, testClear, testLogin, testLogout } from './auth.test';

const SERVER_URL = `${url}:${port}`;
const ERROR = { error: expect.any(String) };

export function testGetDetails(token: string) {
  const res = request('GET', SERVER_URL + '/v1/admin/user/details',
    {
      qs: {
        token: token
      }
    }
  );

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

beforeEach(() => {
	testClear();
});

describe('/v1/admin/user/details', () => {
  let user1: any;
  beforeEach(() => {
    user1 = testRegister('Roger@gmail.com', 'hieu12345', 'Roger', 'Duong').response;
  });

  test('Empty token', () => {
    const details1 = testGetDetails('');
    expect(details1.response).toStrictEqual(ERROR);
    expect(details1.status).toStrictEqual(401);
  });

  test('Invalid token', () => {
    const token1 = user1.token;
    const details1 = testGetDetails(token1 + 'random');
    expect(details1.response).toStrictEqual(ERROR);
    expect(details1.status).toStrictEqual(401);
  });

  test('Valid token', () => {
    const details1 = testGetDetails(user1.token);
    expect(details1.response).toStrictEqual({
      "user": {
        "userId": expect.any(Number),
        "name": "Roger Duong",
        "email": "Roger@gmail.com",
        "numSuccessfulLogins": 1,
        "numFailedPasswordsSinceLastLogin": 0
      }
    });
    expect(details1.status).toStrictEqual(200);
  });

  test('Valid token with multiple login', () => {
    for (let i = 0; i < 3; i++) {
      testLogin('Roger@gmail.com', 'hieu12345');
    }
    const details1 = testGetDetails(user1.token);
    expect(details1.response).toStrictEqual({
      "user": {
        "userId": expect.any(Number),
        "name": "Roger Duong",
        "email": "Roger@gmail.com",
        "numSuccessfulLogins": 4,
        "numFailedPasswordsSinceLastLogin": 0
      }
    });
    expect(details1.status).toStrictEqual(200);
  });

  test('Valid token with failed 1 login', () => {
    testLogin('Roger@gmail.com', 'hieu123455133');
    const details1 = testGetDetails(user1.token);
    expect(details1.response).toStrictEqual({
      "user": {
        "userId": expect.any(Number),
        "name": "Roger Duong",
        "email": "Roger@gmail.com",
        "numSuccessfulLogins": 1,
        "numFailedPasswordsSinceLastLogin": 1
      }
    });
    expect(details1.status).toStrictEqual(200);
  });

  test('Valid token with multiple failed login', () => {
    for (let i = 0; i < 3; i++) {
      testLogin('Roger@gmail.com', 'hieu1234533123');
    }
    const details1 = testGetDetails(user1.token);
    expect(details1.response).toStrictEqual({
      "user": {
        "userId": expect.any(Number),
        "name": "Roger Duong",
        "email": "Roger@gmail.com",
        "numSuccessfulLogins": 1,
        "numFailedPasswordsSinceLastLogin": 3
      }
    });
    expect(details1.status).toStrictEqual(200);
  });

  test('Valid token with login reset', () => {
    for (let i = 0; i < 3; i++) {
      testLogin('Roger@gmail.com', 'hieu1234533123');
    }
    testLogin('Roger@gmail.com', 'hieu12345');
    const details1 = testGetDetails(user1.token);
    expect(details1.response).toStrictEqual({
      "user": {
        "userId": expect.any(Number),
        "name": "Roger Duong",
        "email": "Roger@gmail.com",
        "numSuccessfulLogins": 2,
        "numFailedPasswordsSinceLastLogin": 0
      }
    });
    expect(details1.status).toStrictEqual(200);
  });
});