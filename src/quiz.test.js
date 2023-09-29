import {
  adminQuizCreate, 
  adminQuizRemove
} from './quiz.js';

import clear from './other.js';
user.authUserId
import {
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails,
} from './auth.js';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  clear();
  const user = adminAuthRegister('hayden.smith@unsw.edu.au', 'password', 'nameFirst', 'nameLast');
  adminAuthLogin('hayden.smith@unsw.edu.au', 'password');
});

describe('adminQuizCreate', () => {

  test("check for the correct return type", () => {
    expect(adminQuizCreate(user.authUserId, 'Cats or Dogs', 'I like dogs')).toStrictEqual({
      quizId: expect.any(Number)
    });
  });

  test("AuthUserId is not a valid user", () => {
    expect(adminQuizCreate(user.authUserId + 1, 'Dogs', 'I like dogs')).toStrictEqual(ERROR);
  });

  test.each([
    {a: 'Roger!', b: 'Duong'},
    {a: 'Roger%', b: 'Duong'},
    {a: 'R', b: 'Duong'},
    {a: 'Roger Roge', b: 'Duong'},
    {a: 'Roger', b: 'Duong!'},
    {a: 'Roger', b: 'Duong%'},
    {a: 'RogeRogerRogerRogerRogerRogerRogerRogerr', b: 'D'},
    {a: 'R', b: 'Duong DDuong DngDuongDuong DngDuongDuong DngDuongDuong DngDuongngDuongDuong DngDuongDuong DngDuongDuong DngDuong'},
    {a: 'RogerRogerRogerRogerRogerRogerRoge', b: 'Duong DDuong DngDuongDuong DngDuongDuong DngDuongDuong DngDuongngDuongDuong DngDuongDuong DngDuongDuong DngDuong'},
  ])('Invalid names : ($a, $b)', ({a, b}) => {
    expect(adminQuizCreate(user.authUserId, a, b)).toStrictEqual(ERROR);
  });

  test("non-numerical input for id", () => {
      expect(adminQuizCreate('weee', 'Dogs', 'I like dogs')).toStrictEqual(ERROR);
  });

  test.each([
    {a: '', b: 'Dogs', c: 'ship'},
    {a: user.authUserId, b: '', c: 'ship'}, 
    {a: '', b: '', c: 'ship'},
  ])('blank inputs should create an error', ({a, b, c}) => {
    expect(adminQuizCreate(a, b, c)).toStrictEqual(ERROR);
  });

  test("multiple quizzes should have different id", () => {
    expect(adminQuizCreate(user.authUserId, 'Dogs', 'I like dogs')).
    not.toEqual(adminQuizCreate(user.authUserId, 'Cats', 'I like dogs'));
  });

  test("error for duplicate names", () => {
    adminQuizCreate(user.authUserId, 'Dogs', 'I like cats')
    expect(adminQuizCreate(user.authUserId, 'Dogs', 'I like dogs')).toStrictEqual(ERROR);
  });
});