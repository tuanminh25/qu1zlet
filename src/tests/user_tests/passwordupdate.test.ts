import {
  testRegister,
  testClear,
  testLogin,
  testUpdatePassword,
} from '../testHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  testClear();
});

describe('adminUserPasswordUpdate', () => {
  let user1: { token: string };
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

testClear();
