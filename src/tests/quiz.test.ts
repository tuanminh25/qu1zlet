import {
  testRegister,
  testCreateQuiz,
  testQuizToTrash,
  testClear,
  testQuizList
} from './testHelper';

const ERROR = { error: expect.any(String) };

// Tests:
describe('/v1/admin/quiz', () => {
  let user: { token: string; };

  beforeEach(() => {
    testClear();
    user = testRegister('testuser@example.com', 'password123', 'Test', 'User').response;
  });

  test('Successful quiz creation', () => {
    const quiz = testCreateQuiz(user.token, 'My Quiz Name', 'A description of my quiz');
    expect(quiz.status).toStrictEqual(200);
    // TODO: use other functions to check if working eg quizlist.
  });

  test.each([
    { a: 'Roger!', b: 'Duong' },
    { a: 'Roger%', b: 'Duong' },
    { a: 'R', b: 'Duong' },
    { a: 'Roge...r Roge', b: '' },
    { a: '', b: '' },
    { a: 'Roge! djnfdnn 1 !r', b: '' },
  ])('Invalid names : ($a, $b)', ({ a, b }) => {
    const quiz = testCreateQuiz(user.token, a, b);
    expect(quiz.response).toStrictEqual(ERROR);
  });

  test('multiple quizzes should have different id', () => {
    const quiz1 = testCreateQuiz(user.token, 'Dogs', 'I like dogs');
    const quiz2 = testCreateQuiz(user.token, 'Cats', 'I like dogs');
    expect(quiz1.response.quizId).not.toEqual(quiz2.response.quizId);
  });

  test('error for duplicate names', () => {
    testCreateQuiz(user.token, 'Dogs', 'I like cats');
    const quiz = testCreateQuiz(user.token, 'Dogs', 'I like dogs');
    expect(quiz.response).toStrictEqual(ERROR);
    expect(quiz.status).toStrictEqual(400);
  });
  test('Empty Quiz Name and Description', () => {
    const quiz = testCreateQuiz(user.token, '', '');
    expect(quiz.response).toStrictEqual(ERROR);
    expect(quiz.status).toStrictEqual(400);
  });

  test('Long Quiz Name and Description', () => {
    const longName = 'A'.repeat(31);
    const longDescription = 'B'.repeat(101);
    const quiz1 = testCreateQuiz(user.token, longName, 'A description');
    const quiz2 = testCreateQuiz(user.token, 'A valid name', longDescription);
    expect(quiz1.response).toStrictEqual(ERROR);
    expect(quiz2.response).toStrictEqual(ERROR);
    expect(quiz1.status).toStrictEqual(400);
    expect(quiz2.status).toStrictEqual(400);
  });

  test('Check 400 Error is Prioritized Over 401', () => {
    const invalidToken = user.token + 1;
    const emptyName = '';
    const quiz = testCreateQuiz(invalidToken, emptyName, 'A description of my quiz');

    // Check first for 400 Error
    expect(quiz.response).toStrictEqual(ERROR);
    expect(quiz.status).toStrictEqual(400);

    // Then check for 401 Error with just the invalid token.
    const quizWithInvalidToken = testCreateQuiz(invalidToken, 'My Quiz', 'A description of my quiz');
    expect(quizWithInvalidToken.response).toStrictEqual(ERROR);
    expect(quizWithInvalidToken.status).toStrictEqual(401);
  });
});

describe('/v1/admin/quiz/:quizid', () => {
  let user: { token: string; };
  let quiz: { quizId: number; };

  beforeEach(() => {
    testClear();
    user = testRegister('testuser@example.com', 'Password123', 'Test', 'User').response;
    quiz = testCreateQuiz(user.token, 'My Quiz Name', 'A description of my quiz').response;
  });

  test('Send Quiz to Trash - Successful', () => {
    // const initialTimeLastEdited = quiz.timeLastEdited;
    expect(quiz.quizId).toBe(1);
    const sendToTrash = testQuizToTrash(user.token, quiz.quizId);
    expect(sendToTrash.response).toStrictEqual({});
    expect(sendToTrash.status).toStrictEqual(200);

    // Check if timeLastEdited is updated
    // const updatedQuiz = getQuizInfo(quiz.quizId); REPLACE
    // expect(updatedQuiz.timeLastEdited).not.toStrictEqual(initialTimeLastEdited);
  });

  test('Non-Existent User', () => {
    const sendToTrash = testQuizToTrash('76234724334', quiz.quizId);
    expect(sendToTrash.status).toStrictEqual(401);
  });

  test('Empty Token', () => {
    const sendToTrash = testQuizToTrash('', quiz.quizId);
    expect(sendToTrash.status).toStrictEqual(401);
  });

  test('Non-Existent Token', () => {
    const nonExistentToken = 'nonExistentToken';
    const sendToTrash = testQuizToTrash(nonExistentToken, quiz.quizId);
    expect(sendToTrash.status).toStrictEqual(401);
  });

  test('Unauthorized', () => {
    // Create a new user and use their token to attempt to send the quiz to trash
    const unauthorizedUser = testRegister('unauthorized@example.com', 'password123', 'Unauthorized', 'User').response;
    const sendToTrash = testQuizToTrash(unauthorizedUser.token, quiz.quizId);
    expect(sendToTrash.status).toStrictEqual(403);
  });
});

describe('/v1/admin/quiz/:quizid', () => {
  let user: { token: string; };
  let quiz: { quizId: number; };

  beforeEach(() => {
    testClear();
    user = testRegister('testuser@example.com', 'Password123', 'Test', 'User').response;
    quiz = testCreateQuiz(user.token, 'My Quiz Name', 'A description of my quiz').response;
  });

  test('Send Quiz to Trash - Successful', () => {
    // const initialTimeLastEdited = quiz.timeLastEdited;
    expect(quiz.quizId).toBe(1);
    const sendToTrash = testQuizToTrash(user.token, quiz.quizId);
    expect(sendToTrash.response).toStrictEqual({});
    expect(sendToTrash.status).toStrictEqual(200);

    // Check if timeLastEdited is updated
    // const updatedQuiz = getQuizInfo(quiz.quizId); REPLACE
    // expect(updatedQuiz.timeLastEdited).not.toStrictEqual(initialTimeLastEdited);
  });

  test('Non-Existent User', () => {
    const sendToTrash = testQuizToTrash('76234724334', quiz.quizId);
    expect(sendToTrash.status).toStrictEqual(401);
  });

  test('Empty Token', () => {
    const sendToTrash = testQuizToTrash('', quiz.quizId);
    expect(sendToTrash.status).toStrictEqual(401);
  });

  test('Non-Existent Token', () => {
    const nonExistentToken = 'nonExistentToken';
    const sendToTrash = testQuizToTrash(nonExistentToken, quiz.quizId);
    expect(sendToTrash.status).toStrictEqual(401);
  });

  test('Unauthorized', () => {
    // Create a new user and use their token to attempt to send the quiz to trash
    const unauthorizedUser = testRegister('unauthorized@example.com', 'password123', 'Unauthorized', 'User').response;
    const sendToTrash = testQuizToTrash(unauthorizedUser.token, quiz.quizId);
    expect(sendToTrash.status).toStrictEqual(403);
  });
});

describe('testQuizList', () => {
  let user : {token: string};
  let quiz : {quizId: number};

  beforeEach(() => {
    testClear();

    // First person
    user = testRegister('hayden.smith@unsw.edu.au', 'password1', 'nameFirst', 'nameLast').response;
    quiz = testCreateQuiz(user.token, 'Quiz by Hayden', '').response;
  });

  // Working cases

  // One item in list 1 and 0 item in list 2
  test('Successful case: one item in the list', () => {
    // 2nd person
    const user2 = testRegister('jayden2.smith@unsw.edu.au', 'password2', 'nameFirst', 'nameLast').response;

    // 1 item in list 1
    expect(testQuizList(user.token).response).toStrictEqual({ quizzes: [{ quizId: quiz.quizId, name: 'Quiz by Hayden' }] });
    expect(testQuizList(user.token).status).toStrictEqual(200);

    // No item in list 2
    expect(testQuizList(user2.token).response).toStrictEqual({ quizzes: [] });
    expect(testQuizList(user.token).status).toStrictEqual(200);
  });

  // Many items in list
  test('Successful case: many items in the list', () => {
    // More quizzies from person 1
    const quiz2 = testCreateQuiz(user.token, 'Jayden quiz', 'Jayden content').response;
    const quiz3 = testCreateQuiz(user.token, 'Phaden quiz', 'Phaden content').response;
    const quiz4 = testCreateQuiz(user.token, 'Warden quiz', 'Warden content').response;

    expect(testQuizList(user.token).response).toStrictEqual(
      {
        quizzes: [
          { quizId: quiz.quizId, name: 'Quiz by Hayden' },
          { quizId: quiz2.quizId, name: 'Jayden quiz' },
          { quizId: quiz3.quizId, name: 'Phaden quiz' },
          { quizId: quiz4.quizId, name: 'Warden quiz' },
        ]
      });

    // Removing quizzes
    testQuizToTrash(user.token, quiz3.quizId);

    expect(testQuizList(user.token).response).toStrictEqual(
      {
        quizzes: [
          { quizId: quiz.quizId, name: 'Quiz by Hayden' },
          { quizId: quiz2.quizId, name: 'Jayden quiz' },
          { quizId: quiz4.quizId, name: 'Warden quiz' },
        ]
      });
  });

  // Error cases:
  // Token is empty or invalid (does not refer to valid logged in user session)
  test('Token is empty or invalid (does not refer to valid logged in user session)', () => {
    expect(testQuizList(user.token + 1).response).toStrictEqual({ error: 'Token is empty or invalid' });
    expect(testQuizList(user.token + 1).status).toStrictEqual(401);
  });
});
