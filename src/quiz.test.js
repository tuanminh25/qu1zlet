import {
  adminQuizCreate,
  adminQuizDelete,
} from './quiz.js';


describe('adminQuizCreate', () => {
  let data = {
    users: [
      {
        userId: 1,
        nameFirst: 'Hayden',
        nameLast: 'Smith',
        email: 'hayden.smith@unsw.edu.au',
        password: 'hayden123',
        numSuccessfulLogins: 3,
        numFailedPasswordsSinceLastLogin: 1,
      }
    ],
    quizzes: [
      {
        quizId: 1,
        name: 'My Quiz',
        timeCreated: 1683125870,
        timeLastEdited: 1683125871,
        description: 'This is my quiz',
        ownedBy: 1,
      }    
    ]
  }

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

  const cases = [['', 'The Titanic', 'ship'], [1, '', 'two'], [1, 'Spiderman', '']];
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