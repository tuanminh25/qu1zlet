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
    expect(adminAuthRegister('', 'Roger1234', 'Roger', 'Duong')).toStrictEqual(ERROR);
  });

  test('Email address unavailable', () => {
    const user = adminAuthRegister('Roger@gmail.com', 'Roger1234', 'Roger', 'Duong');
    expect(adminAuthRegister('Roger@gmail.com', 'Jadelyn12', 'Jade', '')).toStrictEqual(ERROR);
  });

  test.each([
    {a: 'Roger!', b: 'Duong', expected: ERROR},
    {a: 'R', b: 'Duong', expected: ERROR},
    {a: 'Roger Roger RogerRogerRoger', b: 'Duong', expected: ERROR},
    {a: 'Roger', b: 'Duong!', expected: ERROR},
    {a: 'Roger', b: 'D', expected: ERROR},
    {a: 'Roger', b: 'Duong Duong DuongDuongDuong', expected: ERROR},
    {a: '', b: 'Duong', expected: ERROR},
    {a: 'Roger', b: '', expected: ERROR},
    {a: '', b: '', expected: ERROR},
  ])('Invalid names : ($a, $b)', ({a, b, expected}) => {
    expect(adminAuthRegister('Roger@gmail.com', 'Roger123', a, b)).toStrictEqual(expected);
  });

  test.each([
    {a: 'Roger12', expected: ERROR},
    {a: '123456789', expected: ERROR},
    {a: 'RogerDuong', expected: ERROR},
    {a: '', expected: ERROR},
  ])('Invalid passwords : $a', ({a, expected}) => {
    expect(adminAuthRegister('Roger@gmail.com', a, 'Roger', 'Duong')).toStrictEqual(expected);
  });

  test('Valid Registeration', () => {
    const user1 = adminAuthRegister('Roger@gmail.com', 'Roger1234', 'Roger', 'Duong');
    expect(user1).toStrictEqual({
      authUserId: expect.any(Number)
    });
    const user2 = adminAuthRegister('Jade@gmail.com', 'JadeL1234', 'Jade', 'Duong')
    expect(user1.authUserId).not.toEqual(user2.authUserId);
  });
});

describe('adminAuthLogin', () => {
  let user1;
  beforeEach(() => {
    user1 = adminAuthRegister('Roger@gmail.com', 'Roger1234', 'Roger', 'Duong')
  });

  test('Email address does not exist', () => {
    expect(adminAuthLogin('Jade@gmail.com', 'Roger1234')).toStrictEqual(ERROR);
    expect(adminAuthLogin('', 'Roger1234')).toStrictEqual(ERROR);
  })

  test('Password is not correct for the given email', () => {
    expect(adminAuthLogin('Roger@gmail.com', 'Roger12345')).toStrictEqual(ERROR);
    expect(adminAuthLogin('Roger@gmail.com', '')).toStrictEqual(ERROR);
  })

  test('Successful login', () => {
    expect(adminAuthLogin('Roger@gmail.com', 'Roger1234')).toStrictEqual({
      authUserId: user1.authUserId
    });
  });

  test('Login failed before registering, then succeeds after ', () => {
    expect(adminAuthLogin('Jade@gmail.com', 'Roger1234')).toStrictEqual(ERROR);
    const user2 = adminAuthRegister('Jade@gmail.com', 'Roger1234', 'Roger', 'Duong');
    expect(adminAuthLogin('Jade@gmail.com', 'Roger1234')).toStrictEqual({
      authUserId: user2.authUserId
    });
  });
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

  test('Multiple users', () => {
    const user2 = adminAuthRegister('user2@gmail.com', 'user2lol', 'James', 'Bond');
    const user3 = adminAuthRegister('user3@gmail.com', 'user3lol', 'Killer', 'Bee');
    adminAuthLogin('user3@gmail.com', 'user3lol')
    expect(adminUserDetails(user.authUserId)).toStrictEqual({user :
      {
        userId: user.authUserId,
        name : 'Roger Duong',
        email : 'roger@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      }
    });
    expect(adminUserDetails(user2.authUserId)).toStrictEqual({user :
      {
        userId: user2.authUserId,
        name : 'James Bond',
        email : 'user2@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      }
    });
    expect(adminUserDetails(user3.authUserId)).toStrictEqual({user :
      {
        userId: user3.authUserId,
        name : 'Killer Bee',
        email : 'user3@gmail.com',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 0,
      }
    });
  });
});