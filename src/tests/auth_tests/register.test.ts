import { testClear, testRegister } from '../testHelper';
const ERROR = { error: expect.any(String) };

beforeEach(() => {
  testClear();
});

describe('adminAuthRegister', () => {
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
    const user1 = testRegister('Roger@gmail.com', 'Roger1234', a, b);
    expect(user1.response).toStrictEqual(ERROR);
    expect(user1.status).toStrictEqual(400);
  });

  test.each([
    { a: 'Roger12' },
    { a: '123456789' },
    { a: 'RogerDuong' },
    { a: '' },
  ])('Invalid passwords : $a', ({ a }) => {
    const user1 = testRegister('Roger@gmail.com', a, 'Roger', 'Duong');
    expect(user1.response).toStrictEqual(ERROR);
    expect(user1.status).toStrictEqual(400);
  });
});

testClear();
