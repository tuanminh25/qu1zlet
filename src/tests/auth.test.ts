import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const auth = '/v1/admin/auth/';
const ERROR = { error: expect.any(String) };

export function testRegister(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
) {
  const res = request('POST', SERVER_URL + auth + 'register',
    {
      json: {
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast
      }
    }
  );

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export const testClear = () => { request('DELETE', SERVER_URL + '/v1/clear'); };

export function testLogin(email: string, password: string) {
  const res = request('POST', SERVER_URL + auth + 'login',
    {
      json: {
        email: email,
        password: password
      }
    }
  );

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testLogout(token: string) {
  const res = request('POST', SERVER_URL + auth + 'logout',
    {
      json: {
        token: token
      }
    }
  );

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

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

describe('v1/admin/auth/register', () => {
  beforeEach(() => {
    testClear();
  });

  test('Successful Registeration', () => {
    const user1 = testRegister('Roger@gmail.com', 'Roger1234', 'Roger', 'Duong');
    expect(user1.response).toStrictEqual(
      {
        token: expect.any(String)
      }
    );
    expect(user1.status).toStrictEqual(200);
  });

  test('Email address is used', () => {
    testRegister('Roger@gmail.com', 'Roger1234', 'Roger', 'Duong');
    const user2 = testRegister('Roger@gmail.com', 'Roger12345', 'Roger', 'Duong');
    expect(user2.response).toStrictEqual(ERROR);
    expect(user2.status).toStrictEqual(400);
  });

  test('Invalid email', () => {
    const user1 = testRegister('Rogergmail.com', 'Roger1234', 'Roger', 'Duong');
    expect(user1.response).toStrictEqual(ERROR);
    expect(user1.status).toStrictEqual(400);
    const user2 = testRegister('', 'Roger1234', 'Roger', 'Duong');
    expect(user2.response).toStrictEqual(ERROR);
    expect(user2.status).toStrictEqual(400);
  });

  test.each([
    { a: 'Roger!', b: 'Duong' },
    { a: 'R', b: 'Duong' },
    { a: 'Roger Roger RogerRogerRoger', b: 'Duong' },
    { a: 'Roger', b: 'Duong!' },
    { a: 'Roger', b: 'D' },
    { a: 'Roger', b: 'Duong Duong DuongDuongDuong' },
    { a: '', b: 'Duong' },
    { a: 'Roger', b: '' },
    { a: '', b: '' },
  ])('Invalid names : ($a, $b)', ({ a, b }) => {
    const user1 = testRegister('Rogergmail.com', 'Roger1234', a, b);
    expect(user1.response).toStrictEqual(ERROR);
    expect(user1.status).toStrictEqual(400);
  });

  test.each([
    { a: 'Roger12' },
    { a: '123456789' },
    { a: 'RogerDuong' },
    { a: '' },
  ])('Invalid passwords : $a', ({ a }) => {
    const user1 = testRegister('Rogergmail.com', a, 'Roger', 'Duong');
    expect(user1.response).toStrictEqual(ERROR);
    expect(user1.status).toStrictEqual(400);
  });
});

describe('/v1/admin/auth/login', () => {
  beforeEach(() => {
    testClear();
    testRegister('Roger@gmail.com', 'hieu12345', 'Roger', 'Duong');
  });

  test('Email does not exist', () => {
    const login1 = testLogin('Jade@gmail.com', 'hieu12345');
    expect(login1.response).toStrictEqual(ERROR);
    expect(login1.status).toStrictEqual(400);
  });

  test('Password is not correct for the given email', () => {
    const login1 = testLogin('Roger@gmail.com', 'Roger12345');
    expect(login1.response).toStrictEqual(ERROR);
    expect(login1.status).toStrictEqual(400);

    const login2 = testLogin('Roger@gmail.com', '');
    expect(login2.response).toStrictEqual(ERROR);
    expect(login2.status).toStrictEqual(400);
  });

  test('Successful login', () => {
    const login1 = testLogin('Roger@gmail.com', 'hieu12345');
    expect(login1.response).toStrictEqual({
      token: expect.any(String)
    });
    expect(login1.status).toStrictEqual(200);
  });
});

describe('/v1/admin/auth/logout', () => {
  let user1: any;
  beforeEach(() => {
    testClear();
    user1 = testRegister('Roger@gmail.com', 'hieu12345', 'Roger', 'Duong').response;
  });

  test('Empty token', () => {
    const logout1 = testLogout('');
    expect(logout1.response).toStrictEqual(ERROR);
    expect(logout1.status).toStrictEqual(401);
  });

  test('Invalid token', () => {
    const logout1 = testLogout(user1.token + 'random');
    expect(logout1.response).toStrictEqual(ERROR);
    expect(logout1.status).toStrictEqual(401);
  });

  test('Successful logout', () => {
    const logout1 = testLogout(user1.token);
    expect(logout1.response).toStrictEqual({});
    expect(logout1.status).toStrictEqual(200);
  });

  test('Cannot view profile', () => {
    testLogout(user1.token);
    const details1 = testGetDetails(user1.token);
    expect(details1.response).toStrictEqual(ERROR);
    expect(details1.status).toStrictEqual(401);
  });
});
