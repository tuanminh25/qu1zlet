import {
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails,
} from './auth';

import clear from './other'

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  clear();
});

describe('adminUserDetails', () => {
  let user;
  beforeEach(() => {
    user = adminAuthRegister('roger@gmail.com', 'roger123', 'Roger', 'Duong');
  });

  test('AuthUserId is not a valid user', () => {
    expect(adminUserDetails(user.authUserId + 1)).toStrictEqual(ERROR);
  });

  test('Valid authUserId no log in', () => {
    expect(adminUserDetails(user.authUserId)).toStrictEqual({user :
      {
        userId: user.authUserId,
        name : 'Roger Duong',
        email : 'roger@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      }
    });
  });

  test('Valid authUserId 1 successful login', () => {
    adminAuthLogin('roger@gmail.com', 'roger123');
    expect(adminUserDetails(user.authUserId)).toStrictEqual({user :
      {
        userId: user.authUserId,
        name : 'Roger Duong',
        email : 'roger@gmail.com',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 0,
      }
    });
  });

  test('Valid authUserId multiple successful login', () => {
    adminAuthLogin('roger@gmail.com', 'roger123');
    adminAuthLogin('roger@gmail.com', 'roger123');
    adminAuthLogin('roger@gmail.com', 'roger123');
    expect(adminUserDetails(user.authUserId)).toStrictEqual({user :
      {
        userId: user.authUserId,
        name : 'Roger Duong',
        email : 'roger@gmail.com',
        numSuccessfulLogins: 4,
        numFailedPasswordsSinceLastLogin: 0,
      }
    });
  });

  test('Valid authUserId 1 failed log in', () => {
    adminAuthLogin('roger@gmail.com', 'roger1234');
    expect(adminUserDetails(user.authUserId)).toStrictEqual({user :
      {
        userId: user.authUserId,
        name : 'Roger Duong',
        email : 'roger@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 1,
      }
    });
  });

  test('Valid authUserId multiple failed log in', () => {
    adminAuthLogin('roger@gmail.com', 'roger1234');
    adminAuthLogin('roger@gmail.com', 'messi1234');
    adminAuthLogin('roger@gmail.com', 'neymar10');
    expect(adminUserDetails(user.authUserId)).toStrictEqual({user :
      {
        userId: user.authUserId,
        name : 'Roger Duong',
        email : 'roger@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 3,
      }
    });
  });

  test('Valid authUserId failed log in reset', () => {
    adminAuthLogin('roger@gmail.com', 'roger1234');
    adminAuthLogin('roger@gmail.com', 'messi1234');
    adminAuthLogin('roger@gmail.com', 'neymar10');
    adminAuthLogin('roger@gmail.com', 'roger123');
    expect(adminUserDetails(user.authUserId)).toStrictEqual({user :
      {
        userId: user.authUserId,
        name : 'Roger Duong',
        email : 'roger@gmail.com',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 0,
      }
    });
  });

  test('Valid authUserId failed log in reset then failed log in again ', () => {
    adminAuthLogin('roger@gmail.com', 'roger1234');
    adminAuthLogin('roger@gmail.com', 'messi1234');
    adminAuthLogin('roger@gmail.com', 'neymar10');
    adminAuthLogin('roger@gmail.com', 'roger123');
    adminAuthLogin('roger@gmail.com', 'neymar11');
    adminAuthLogin('roger@gmail.com', 'neymar10');
    expect(adminUserDetails(user.authUserId)).toStrictEqual({user :
      {
        userId: user.authUserId,
        name : 'Roger Duong',
        email : 'roger@gmail.com',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 2,
      }
    });
  });
});