import {
  adminQuizCreate, 
  adminQuizRemove
} from './quiz.js';

import clear from './other.js';

import {
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails,
} from './auth.js';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  clear();
  adminAuthRegister('hayden.smith@unsw.edu.au', 'password', 'nameFirst', 'nameLast');
  adminAuthLogin('hayden.smith@unsw.edu.au', 'password');
});

describe('adminQuizCreate', () => {

  test("check for the correct return type", () => {
    expect(adminQuizCreate(1, 'Cats or Dogs?', 'I like dogs!')).toStrictEqual({
      quizId: expect.any(Number),
    });
  });

  test("AuthUserId is not a valid user", () => {
    expect(adminQuizCreate(2, 'Dogs?', 'I like dogs!')).toStrictEqual(ERROR)
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
    expect(adminQuizCreate(1, a, b)).toStrictEqual(ERROR);
  });

  test("non-numerical input for id", () => {
      expect(adminQuizCreate('weee', 'Dogs?', 'I like dogs!')).toStrictEqual(ERROR);
  });

  test.each([
    {a: '', b: 'The Titanic', c: 'ship'},
    {a: 1, b: '', c: 'ship'}, 
    {a: '', b: '', c: 'ship'},
  ])('blank inputs should create an error', ({a, b, c}) => {
    expect(adminQuizCreate(a, b, c)).toStrictEqual(ERROR)
  });

  test("multiple quizzes should have different id", () => {
    expect(adminQuizCreate(1, 'movie1', 'this is a movie')).
    not.toEqual(adminQuizCreate(1, 'movie2', 'this is a movie'));
  });

  test("error for duplicate names", () => {
    adminQuizCreate('weee', 'Dogs?', 'I like cats!')
    expect(adminQuizCreate('weee', 'Dogs?', 'I like dogs!')).toStrictEqual(ERROR);
  });
});