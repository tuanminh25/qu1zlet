import request from 'sync-request-curl';
import { port, url } from '../config.json';
import { testRegister, testClear, testLogin, testGetDetails } from './auth.test';

const SERVER_URL = `${url}:${port}`;
const ERROR = { error: expect.any(String) };
const userUrl = '/v1/admin/user/';

function testUpdatePassword(
  token: string,
  oldPassword: string,
  newPassword: string
) {
  const res = request('PUT', SERVER_URL + userUrl + 'password',
    {
      json: {
        token: token,
        oldPassword: oldPassword,
        newPassword: newPassword
      }
    });

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
      user: {
        userId: expect.any(Number),
        name: 'Roger Duong',
        email: 'Roger@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0
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
      user: {
        userId: expect.any(Number),
        name: 'Roger Duong',
        email: 'Roger@gmail.com',
        numSuccessfulLogins: 4,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
    expect(details1.status).toStrictEqual(200);
  });

  test('Valid token with failed 1 login', () => {
    testLogin('Roger@gmail.com', 'hieu123455133');
    const details1 = testGetDetails(user1.token);
    expect(details1.response).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'Roger Duong',
        email: 'Roger@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 1
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
      user: {
        userId: expect.any(Number),
        name: 'Roger Duong',
        email: 'Roger@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 3
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
      user: {
        userId: expect.any(Number),
        name: 'Roger Duong',
        email: 'Roger@gmail.com',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
    expect(details1.status).toStrictEqual(200);
  });
});

describe('/v1/admin/user/details', () => {
  let user1: any;
  beforeEach(() => {
    user1 = testRegister('Roger@gmail.com', 'hieu12345', 'Roger', 'Duong').response;
  });

  test('Successful Update', () => {
    const update1 = testUpdatePassword(user1.token, 'hieu12345', 'hieu123456');
    expect(update1.response).toStrictEqual({});
    expect(update1.status).toStrictEqual(200);

    const login1 = testLogin('Roger@gmail.com', 'hieu12345');
    expect(login1.response).toStrictEqual(ERROR);
    expect(login1.status).toStrictEqual(400);

    const login2 = testLogin('Roger@gmail.com', 'hieu123456');
    expect(login2.response).toStrictEqual({
      token: expect.any(String)
    });
    expect(login2.status).toStrictEqual(200);
  });

  test('Incorrect old password', () => {
    const update1 = testUpdatePassword(user1.token, 'hieu1234567', 'hieu123456');
    expect(update1.response).toStrictEqual(ERROR);
    expect(update1.status).toStrictEqual(400);
  });

  test('Same new password', () => {
    const update1 = testUpdatePassword(user1.token, 'hieu12345', 'hieu12345');
    expect(update1.response).toStrictEqual(ERROR);
    expect(update1.status).toStrictEqual(400);
  });

  test('New password is used before', () => {
    const update1 = testUpdatePassword(user1.token, 'hieu12345', 'Roger1234');
    expect(update1.response).toStrictEqual({});
    expect(update1.status).toStrictEqual(200);

    const update2 = testUpdatePassword(user1.token, 'Roger1234', 'Duong1234');
    expect(update2.response).toStrictEqual({});
    expect(update2.status).toStrictEqual(200);

    const update3 = testUpdatePassword(user1.token, 'Duong1234', 'hieu12345');
    expect(update3.response).toStrictEqual(ERROR);
    expect(update3.status).toStrictEqual(400);

    const update4 = testUpdatePassword(user1.token, 'Duong1234', 'Roger1234');
    expect(update4.response).toStrictEqual(ERROR);
    expect(update4.status).toStrictEqual(400);
  });

  test.each([
    { a: 'Roger12' },
    { a: '123456789' },
    { a: 'RogerDuong' },
    { a: '' },
  ])('Invalid new passwords : $a', ({ a }) => {
    const update1 = testUpdatePassword(user1.token, 'hieu12345', a);
    expect(update1.response).toStrictEqual(ERROR);
    expect(update1.status).toStrictEqual(400);
  });

  test('Empty token', () => {
    const update1 = testUpdatePassword('', 'hieu12345', 'Roger1234');
    expect(update1.response).toStrictEqual(ERROR);
    expect(update1.status).toStrictEqual(401);
  });

  test('Invalid token', () => {
    const update1 = testUpdatePassword(user1.token + 'random', 'hieu12345', 'Roger1234');
    expect(update1.response).toStrictEqual(ERROR);
    expect(update1.status).toStrictEqual(401);
  });
});
