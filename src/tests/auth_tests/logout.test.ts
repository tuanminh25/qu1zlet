
import { testClear, testGetDetails, testLogout, testRegister } from '../testHelper';
const ERROR = { error: expect.any(String) };

beforeEach(() => {
  testClear();
});

describe('adminAuthLogout', () => {
  let user1: { token: string };
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

testClear();
