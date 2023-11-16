import {
  testRegister,
  testCreateQuiz,
  testClear,
  testQuizInfo,
  testQuizNameUpdate,
} from '../testHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  testClear();
});

describe('QuizNameUpdate', () => {
  let user: { token: string };
  let quiz: { quizId: number };

  beforeEach(() => {
    user = testRegister('testuser@example.com', 'Password123', 'Test', 'User').response;
    quiz = testCreateQuiz(user.token, 'My Quiz Name', 'A description of my quiz').response;
  });

  test('Normal Name Change - Successful', () => {
    const inforObjectOriginal = testQuizInfo(user.token, quiz.quizId).response;
    const nameupdate = testQuizNameUpdate(user.token, quiz.quizId, 'New Quiz Name');
    expect(nameupdate.response).toStrictEqual({});
    expect(nameupdate.status).toStrictEqual(200);
    const inforObjectNew = testQuizInfo(user.token, quiz.quizId).response;
    expect(inforObjectNew.name).toStrictEqual('New Quiz Name');

    expect(inforObjectOriginal.timeLastEdited !== inforObjectNew.timeLastEdited);
  });

  test.each([
    { name: 'ABC' },
    { name: 'A'.repeat(30) },
  ])('Name Change with exactly $name characters - Successful', async ({ name }) => {
    const infoObjectOriginal = testQuizInfo(user.token, quiz.quizId).response;
    const nameUpdate = testQuizNameUpdate(user.token, quiz.quizId, name);

    expect(nameUpdate.response).toStrictEqual({});
    expect(nameUpdate.status).toStrictEqual(200);

    const infoObjectNew = testQuizInfo(user.token, quiz.quizId).response;

    expect(infoObjectNew.name).toStrictEqual(name);

    expect(infoObjectNew.timeLastEdited !== infoObjectOriginal.timeLastEdited);
  });

  // Error Cases
  describe('Name is not alphanumeric', () => {
    test.each([
      { name: 'Exclamation!' },
      { name: 'Question?' },
      { name: '@at' }
    ])('Invalid Name: $name', async ({ name }) => {
      const nameUpdate = testQuizNameUpdate(user.token, quiz.quizId, name);
      const quizinfo = testQuizInfo(user.token, quiz.quizId).response;

      expect(nameUpdate.response).toStrictEqual(ERROR);
      expect(nameUpdate.status).toStrictEqual(400);

      expect(quizinfo.name).toStrictEqual('My Quiz Name');
    });
  });

  test('Name is less than 3 characters', () => {
    const nameUpdate = testQuizNameUpdate(user.token, quiz.quizId, 'hi');
    const quizinfo = testQuizInfo(user.token, quiz.quizId).response;

    expect(nameUpdate.response).toStrictEqual(ERROR);
    expect(nameUpdate.status).toStrictEqual(400);

    expect(quizinfo.name).toStrictEqual('My Quiz Name');
  });

  test('Name is more than 30 characters', () => {
    const nameUpdate = testQuizNameUpdate(user.token, quiz.quizId, 'A'.repeat(31));
    const quizinfo = testQuizInfo(user.token, quiz.quizId).response;

    expect(nameUpdate.response).toStrictEqual(ERROR);
    expect(nameUpdate.status).toStrictEqual(400);

    expect(quizinfo.name).toStrictEqual('My Quiz Name');
  });

  test('Quiz Name in use by same user', () => {
    testCreateQuiz(user.token, 'NewQuiz', 'A description of my quiz');
    const nameUpdate = testQuizNameUpdate(user.token, quiz.quizId, 'NewQuiz');
    const quizinfo = testQuizInfo(user.token, quiz.quizId).response;

    expect(nameUpdate.response).toStrictEqual(ERROR);
    expect(nameUpdate.status).toStrictEqual(400);

    expect(quizinfo.name).toStrictEqual('My Quiz Name');
  });

  test('Invalid Token', () => {
    const nameUpdate = testQuizNameUpdate(user.token + 'abc', quiz.quizId, 'Quiz Name');
    expect(nameUpdate.response).toStrictEqual(ERROR);
    expect(nameUpdate.status).toStrictEqual(401);
  });

  test('Empty Token', () => {
    const nameUpdate = testQuizNameUpdate('', quiz.quizId, 'Quiz Name');
    expect(nameUpdate.response).toStrictEqual(ERROR);
    expect(nameUpdate.status).toStrictEqual(401);
  });

  test('Unauthorized', () => {
    const unauthorizedUser = testRegister('unauthorized@example.com', 'password123', 'Unauthorized', 'User').response;
    const nameUpdate = testQuizNameUpdate(unauthorizedUser.token, quiz.quizId, 'Quiz Name');
    expect(nameUpdate.response).toStrictEqual(ERROR);
    expect(nameUpdate.status).toStrictEqual(403);
  });

  test('Quiz doesnt exist', () => {
    const nameUpdate = testQuizNameUpdate(user.token, quiz.quizId + 23, 'Quiz Name');
    expect(nameUpdate.response).toStrictEqual(ERROR);
    expect(nameUpdate.status).toStrictEqual(403);
  });
});

testClear();
