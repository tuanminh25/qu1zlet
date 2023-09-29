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

describe('adminAuthRegister', () => {
  test('Invalid email', () => {
    expect(adminAuthRegister('Roger.com', 'Roger1234', 'Roger', 'Duong')).toStrictEqual(ERROR);
  });

  test('Email address unavailable', () => {
    const user = adminAuthRegister('Roger@gmail.com', 'Roger1234', 'Roger', 'Duong');
    expect(adminAuthRegister('Roger@gmail.com', 'Jadelyn12', 'Jade', '')).toStrictEqual(ERROR);
  });

  test.each([
    {a: 'Roger!', b: 'Duong', expected: ERROR},
    {a: 'Roger%', b: 'Duong', expected: ERROR},
    {a: 'R', b: 'Duong', expected: ERROR},
    {a: 'Roger Roger RogerRogerRoger', b: 'Duong', expected: ERROR},
    {a: 'Roger', b: 'Duong!', expected: ERROR},
    {a: 'Roger', b: 'Duong%', expected: ERROR},
    {a: 'Roger', b: 'D', expected: ERROR},
    {a: 'Roger', b: 'Duong Duong DuongDuongDuong', expected: ERROR},
  ])('Invalid names : ($a, $b)', ({a, b, expected}) => {
    expect(adminAuthRegister('Roger@gmail.com', 'Roger123', a, b)).toStrictEqual(expected);
  });

  test.each([
    {a: 'Roger12', expected: ERROR},
    {a: '123456789', expected: ERROR},
    {a: 'RogerDuong', expected: ERROR},
  ])('Invalid passwords : $a', ({a, expected}) => {
    expect(adminAuthRegister('Roger@gmail.com', a, 'Roger', 'Duong')).toStrictEqual(expected);
  });

  test('Valid Registeration', () => {
    expect(adminAuthRegister('Roger@gmail.com', 'Roger1234', 'Roger', 'Duong')).toStrictEqual({
      authUserId: expect.any(Number)
    });
  });
});

describe('adminAuthLogin', () => {
  let user1;
  beforeEach(() => {
    user1 = adminAuthRegister('Roger@gmail.com', 'Roger1234', 'Roger', 'Duong')
  });

  test('Email address does not exist', () => {
    expect(adminAuthLogin('Jade@gmail.com', 'Roger1234')).toStrictEqual(ERROR);
  })

  test('Password is not correct for the given email', () => {
    expect(adminAuthLogin('Roger@gmail.com', 'Roger12345')).toStrictEqual(ERROR);
  })

  test('Successful login', () => {
    expect(adminAuthLogin('Roger@gmail.com', 'Roger1234')).toStrictEqual({
      authUserId: user1.authUserId
    });
  })
})

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