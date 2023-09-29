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

import { getData, setData } from "./dataStore.js";
let store  = getData();

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  clear();
  adminAuthRegister('hayden.smith@unsw.edu.au', 'password', 'nameFirst', 'nameLast');
  adminAuthLogin('hayden.smith@unsw.edu.au', 'password');
});

describe('adminQuizCreate', () => {

  test("check for the correct return type", () => {
    expect(adminQuizCreate(1, "The Prestige", "Christopher Nolan")).toStrictEqual({
      movieId: expect.any(Number),
    });
  });

  test("test that the quiz is stored in data", () => {
    const uid = adminQuizCreate(1, 'Planet of the Apes', 'Vincent is an ape.');
    expect(store.quizzes).toContain({
      quizId: uid,
      name: 'Planet of the Apes',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Vincent is an ape.',
      ownedBy: 1,
    });
  });

  test("userid not contained in data", () => {
    expect(adminQuizCreate(Math.random(), '21', 'whats 9 + 10')).toStrictEqual(ERROR)
  });

  test("non-numerical input for id", () => {
      expect(adminQuizCreate(1, 'The Notebook', 'Cry')).toStrictEqual(ERROR);
  });

  test.each([
    {a: '', b: 'The Titanic', c: 'ship'},
    {a: 1, b: '', c: 'ship'}, 
    {a: 1, b: 'The Titanic', c: ''},
    {a: '', b: '', c: 'ship'},
    {a: 1, b: '', c: ''},
    {a: '', b: 'The Titanic', c: ''},
    {a: '', b: '', c: ''},
  ])('blank inputs should create an error', ({a, b, c}) => {
    expect(adminQuizCreate(a, b, c)).toStrictEqual(ERROR)
  });

  test("multiple quizzes should have different id", () => {
    expect(adminQuizCreate(1, 'movie1', 'this is a movie')).
    not.toEqual(adminQuizCreate(1, 'movie2', 'this is a movie'));
  });
});