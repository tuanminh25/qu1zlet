import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;
const auth = '/v1/admin/auth/'
const ERROR = { error: expect.any(String) };

export function testRegister(
  email: string, 
  password: string,
  nameFirst: string,
  nameLast: string
) {
  const res = request('POST', SERVER_URL + auth + 'register', 
    { 
      json: { 
        "email": email, 
        "password": password, 
        "nameFirst": nameFirst, 
        "nameLast": nameLast 
      } 
    }
  );

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
};

const testClear = () => { request('DELETE', SERVER_URL + '/v1/clear') };

function testLogin(email: string, password: string) {
  const res = request('POST', SERVER_URL + auth + 'login', 
    { 
      json: { 
        "email": email, 
        "password": password
      } 
    }
  );

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
};

beforeEach(() => {
  testClear();
});

describe('v1/admin/auth/register', () => {
  test('Successful Registeration', () => {
    const user1 = testRegister('Roger@gmail.com', 'Roger1234', 'Roger', 'Duong');
    expect(user1.response).toStrictEqual(
      {
        "token": expect.any(String)
      }
    );
    expect(user1.status).toStrictEqual(200);
  });

  test('Email address is used', () => {
    const user1 = testRegister('Roger@gmail.com', 'Roger1234', 'Roger', 'Duong');
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
    {a: 'Roger!', b: 'Duong'},
    {a: 'R', b: 'Duong'},
    {a: 'Roger Roger RogerRogerRoger', b: 'Duong'},
    {a: 'Roger', b: 'Duong!'},
    {a: 'Roger', b: 'D'},
    {a: 'Roger', b: 'Duong Duong DuongDuongDuong'},
    {a: '', b: 'Duong'},
    {a: 'Roger', b: ''},
    {a: '', b: ''},
  ])('Invalid names : ($a, $b)', ({a, b}) => {
    const user1 = testRegister('Rogergmail.com', 'Roger1234', a, b);
    expect(user1.response).toStrictEqual(ERROR);
    expect(user1.status).toStrictEqual(400);
  });

  test.each([
    {a: 'Roger12'},
    {a: '123456789'},
    {a: 'RogerDuong'},
    {a: ''},
  ])('Invalid passwords : $a', ({a}) => {
    const user1 = testRegister('Rogergmail.com', a, 'Roger', 'Duong');
    expect(user1.response).toStrictEqual(ERROR);
    expect(user1.status).toStrictEqual(400);
  });
});

describe('/v1/admin/auth/login', () => {
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

    const login2 =  testLogin('Roger@gmail.com', '');
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




/*
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
*/
