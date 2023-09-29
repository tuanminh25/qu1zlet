import {
  adminQuizCreate,
  adminQuizDelete,
} from './quiz.js';

import {
  clear,
} from './other.js';

beforeEach(() => {
  clear();
});

describe('adminQuizCreate', () => {
  test("check for the correct return type", () => {
    expect(adminQuizCreate(1, "The Prestige", "Christopher Nolan")).toStrictEqual({
      movieId: expect.any(Number),
    });
  });


  describe("test that the quiz is stored in data", () => {
    const uid = adminQuizCreate(1, 'Planet of the Apes', 'Vincent is an ape.');
    expect(data.quizzes).toContainObject({
      quizId: uid,
      name: 'Planet of the Apes',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Vincent is an ape.',
      ownedBy: 1,
    });
  });

  describe("userid not contained in data", () => {
    expect(adminQuizCreate(uid(), '21', 'whats 9 + 10')).
    toStrictEqual({error: expect.any(String)})
  });

  describe("non-numerical input for id", () => {
      expect(adminQuizCreate(1, 'The Notebook', 'Cry')).
      toStrictEqual({error: expect.any(String)});
  });

  const cases = [['', 'The Titanic', 'ship'],
                 [1, '', 'two'], 
                 [1, 'movieeeeee', ''],
                 ['', '', 'i love computers'],
                 [1, '', ''],
                 ['', 'Spiderman', '']
                 ['', '', ''],];
  describe("blank inputs should create an error", () => {
    test.each(cases)((firstArg, secondArg, thirdArg) => {
      expect(adminQuizCreate(firstArg, secondArg, thirdArg)).
      toStrictEqual({error: expect.any(String)})
    });
  });

  describe("multiple quizzes should have different id", () => {
    expect(adminQuizCreate(1, 'movie1', 'this is a movie')).
    notToEqual(adminQuizCreate(1, 'movie2', 'this is a movie'));
  });
});