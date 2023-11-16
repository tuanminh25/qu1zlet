import { testClear, testLogin, testRegister } from '../testHelper';
const ERROR = { error: expect.any(String) };

beforeEach(() => {
  testClear();
});

describe('adminAuthLogin', () => {
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

testClear();
