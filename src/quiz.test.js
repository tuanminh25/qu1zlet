import {
  adminQuizCreate,
  adminQuizDelete,
} from './quiz.js';

describe('adminQuizCreate', () => {
  describe("test that the quiz is stored in data", () => {
    const uid = adminQuizCreate(1, 'Planet of the Apes', 'Vincent is an ape.');
    expect(data.quizzes).toContainObject({
      quizId: uid,
      name: 'Planet of the Apes',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Vincent is an ape.',
    }    )
  });

  describe("non-numerical input for id", () => {
      expect(adminQuizCreate('hello', 'im', 'tracie')).
      toStrictEqual({error: expect.any(String)});
  });

  const cases = [['', 'hello', 'hi'], ['one', '', 'two'], ['good', 'bye', '']];
  describe("blank inputs should create an error", () => {
    test.each(cases)((firstArg, secondArg, thirdArg) => {
      expect(adminQuizCreate(firstArg, secondArg, thirdArg)).
      toStrictEqual({error: expect.any(String)})
    });
  });

  describe("multiple quizzes should have different id", () => {
    expect(adminQuizCreate('tracie', 'movie1', 'this is a movie')).
    notToEqual(adminQuizCreate('vincent', 'movie2', 'this is a movie'));
  });
});