import { testClear, testGetDetails, testLogin, testLogout, testRegister } from './testHelper';
const ERROR = { error: expect.any(String) };

beforeEach(() => {
  testClear();
});

describe('adminAuthRegister v1', () => {
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

describe('adminAuthLogin v1', () => {
  beforeEach(() => {
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

describe('adminAuthLogout v1', () => {
  let user1: any;
  beforeEach(() => {
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
