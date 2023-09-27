import {
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails,
} from './auth.js';

describe('adminUserDetails', () => {
  test('AuthUserId is not a valid user', () => {
    expect(adminUserDetails(expect.any(Number))).toStrictEqual({error: expect.any(String)});
  })
  test('Valid authUserId', () => {
    expect(adminUserDetails(expect.any(Number))).toStrictEqual({user :
      {
        userId: expect.any(String),
        name : expect.any(String),
        email : expect.any(String),
        numSuccessfulLogins: expect.any(Number),
        numFailedPasswordsSinceLastLogin: expect.any(Number)
      }
    });
  });
});