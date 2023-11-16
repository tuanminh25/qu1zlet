import {
  testRegister,
  testClear,
  testUpdateUserDetails
} from '../testHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  testClear();
});

describe('adminUserDetailsUpdate', () => {
  let user1: { token: string };

  beforeEach(() => {
    user1 = testRegister('Roger@gmail.com', 'hieu12345', 'Roger', 'Duong').response;
  });

  const validEmail = 'hayden.smith@unsw.edu.au';

  test('Successfully update user details', () => {
    const result = testUpdateUserDetails(user1.token, validEmail, 'Hayden', 'Smith');
    expect(result.status).toBe(200);
    expect(result.response).toEqual({});
  });

  test('Email is already used by another user', () => {
    const user2 = testRegister('Raaaager@gmail.com', 'hieu12345', 'Rager', 'Duang').response;
    const result = testUpdateUserDetails(user2.token, 'Roger@gmail.com', 'Hayden', 'Smith');
    expect(result.status).toBe(400);
    expect(result.response).toEqual(ERROR);
  });

  test.each([
    { email: 'invalidEmail', nameFirst: 'Hayden', nameLast: 'Smith' },
    { email: validEmail, nameFirst: 'Ha$den', nameLast: 'Smith' },
    { email: validEmail, nameFirst: 'H', nameLast: 'Smith' },
    { email: validEmail, nameFirst: 'H'.repeat(21), nameLast: 'Smith' },
    { email: validEmail, nameFirst: 'Hayden', nameLast: 'Sm!th' },
    { email: validEmail, nameFirst: 'Hayden', nameLast: 'S' },
    { email: validEmail, nameFirst: 'Hayden', nameLast: 'S'.repeat(21) }
  ])('Invalid inputs - Email: $email, NameFirst: $nameFirst, NameLast: $nameLast', ({ email, nameFirst, nameLast }) => {
    const result = testUpdateUserDetails(user1.token, email, nameFirst, nameLast);
    expect(result.response).toStrictEqual(ERROR);
    expect(result.status).toBe(400);
  });

  test('Empty or invalid token', () => {
    const result = testUpdateUserDetails('', validEmail, 'Hayden', 'Smith');
    expect(result.status).toBe(401);
    expect(result.response).toStrictEqual(ERROR);
  });

  test('Prioritize 401 over 400', () => {
    const result = testUpdateUserDetails('', 'invalidEmail', 'Hayden', 'Smith');
    expect(result.status).toBe(401);
    expect(result.response).toStrictEqual(ERROR);
  });
});

testClear();
