import {
  testRegister,
  testQuizInfo,
  testCreateQuiz,
  testCreateQuizQuestion,
  testQuizToTrash,
  testClear,
  testQuizDescriptionUpdate
} from './testHelper';

const ERROR = { error: expect.any(String) };

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

describe.only('GET /v1/admin/quiz/:quizid', () => {
  let user: { token: string };
  let quiz: { quizId: number };
  const validQuestion = {
    question: 'What is the capital of France?',
    duration: 4,
    points: 5,
    answers: [
      { answer: 'Berlin', correct: false },
      { answer: 'Madrid', correct: false },
      { answer: 'Paris', correct: true },
      { answer: 'Rome', correct: false }
    ]
  };

  beforeEach(() => {
    testClear();
    user = testRegister('testuser@example.com', 'Password123', 'Test', 'User').response;
    quiz = testCreateQuiz(user.token, 'My Quiz Name', 'A description of my quiz').response;
  });

  test('Display Quiz Info - Successful', () => {
    const question = testCreateQuizQuestion(user.token, quiz.quizId, validQuestion).response;
    const quizinfo = testQuizInfo(user.token, quiz.quizId);
    expect(quizinfo.response).toStrictEqual({
      quizId: expect.any(Number),
      name: 'My Quiz Name',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'A description of my quiz',
      numQuestions: 1,
      questions: [
        {
          questionId: question.questionId,
          question: 'What is the capital of France?',
          duration: 4,
          points: 5,
          answers: [
            { answer: 'Berlin', correct: false },
            { answer: 'Madrid', correct: false },
            { answer: 'Paris', correct: true },
            { answer: 'Rome', correct: false }
          ]
        }
      ],
      duration: expect.any(Number),
    });
    expect(quizinfo.status).toStrictEqual(200);
  });

  test('Display Quiz Info without Description or Questions - Successful', () => {
    const badquiz = testCreateQuiz(user.token, 'My Quiz Nameeeee', '').response;
    const quizinfo = testQuizInfo(user.token, badquiz.quizId);
    expect(quizinfo.response).toStrictEqual({
      quizId: expect.any(Number),
      name: 'My Quiz Nameeeee',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: '',
      numQuestions: 0,
      questions: [],
      duration: 0,
    });
    expect(quizinfo.status).toStrictEqual(200);
  });

  test('Invalid Token', () => {
    const quizinfo = testQuizInfo(user.token + 'abc', quiz.quizId);
    expect(quizinfo.status).toStrictEqual(401);
  });

  test('Empty Token', () => {
    const quizinfo = testQuizInfo('', quiz.quizId);
    expect(quizinfo.status).toStrictEqual(401);
  });

  test('Invalid User', () => {
    const quizinfo = testQuizInfo('76234724334', quiz.quizId);
    expect(quizinfo.status).toStrictEqual(401);
  });

  test('Unauthorized', () => {
    const unauthorizedUser = testRegister('unauthorized@example.com', 'password123', 'Unauthorized', 'User').response;
    const quizinfo = testQuizInfo(unauthorizedUser.token, quiz.quizId);
    expect(quizinfo.status).toStrictEqual(403);
  });
});

describe.only('/v1/admin/quiz/:quizid/description', () => {
  let user : {token: string};
  let quiz : {quizId: number};
  beforeEach(() => {
    testClear();
    user = testRegister('hayden.smith@unsw.edu.au', 'password1', 'nameFirst', 'nameLast').response;
    quiz = testCreateQuiz(user.token, 'Quiz 1', 'This is quiz 1').response;
  });

  // Working cases:
  // Empty description cases
  test('Successfully update description', () => {
    const inforObjectOriginal = testQuizInfo(user.token, quiz.quizId).response;

    const updateResponse = testQuizDescriptionUpdate(user.token, quiz.quizId, '');
    expect(updateResponse.response).toStrictEqual({});
    expect(updateResponse.status).toStrictEqual(200);

    const inforObjectNew = testQuizInfo(user.token, quiz.quizId).response;
    expect(inforObjectNew.description).toStrictEqual('');

    // Check for changes in time last edited
    expect(inforObjectOriginal.timeLastEdited !== inforObjectNew.timeLastEdited);
  });

  // Any normal cases
  test('Successfully update description', () => {
    const inforObjectOriginal = testQuizInfo(user.token, quiz.quizId).response;

    const updateResponse = testQuizDescriptionUpdate(user.token, quiz.quizId, 'Hello there, hi new updated description');
    expect(updateResponse.response).toStrictEqual({});
    expect(updateResponse.status).toStrictEqual(200);

    const inforObjectNew = testQuizInfo(user.token, quiz.quizId).response;
    expect(inforObjectNew.description).toStrictEqual('Hello there, hi new updated description');

    // Check for changes in time last edited
    expect(inforObjectOriginal.timeLastEdited !== inforObjectNew.timeLastEdited);
  });

  // Error cases:

  // Description is more than 100 characters in length (note: empty strings are OK)
  test('Description is more than 100 characters in length', () => {
    const updateResponse = testQuizDescriptionUpdate(user.token, quiz.quizId,
      'avfwuevfg72q3fv3 r3y2urguyg23rg3t26rg32gr327gr7162gr671trgfjfjsbfsjfbsjhbfsbfsajbfjkwebf823g78grjwbfjewbqurweqbubrweuyrbuywqgruyweqgruwqgrwugreuwgruwgruwgruwgrweuygr293hrownfksnfkasdnfoihrf932hrhwrbjwabfwgf7ghseifbkwnf23noi32j893u2r9owhekfnwafbwafb732yr9q2yhriqwhrbfkwebfwakbf92qohrwqhefkasnfk,sa dfwhr9832urjwrnfefnoi3wjr0329jrowjflwnfmekqjr34jronfke fwrhf392hr9hjoqwnrlaenfa flwenmfo23ue021jeownrlewnfakbfhwgbfyu32gr8723gr92hrwenflasmnflam3902ur0ujonlwanfl');
    expect(updateResponse.response).toStrictEqual({ error: 'Description is more than 100 characters in length' });

    expect(updateResponse.status).toStrictEqual(400);
  });

  // Token is empty or invalid (does not refer to valid logged in user session)
  test('Token is empty or invalid', () => {
    const updateResponse = testQuizDescriptionUpdate(user.token + 1, quiz.quizId, 'Token is empty or invalid');
    expect(updateResponse.response).toStrictEqual({ error: 'Token is empty or invalid' });
    expect(updateResponse.status).toStrictEqual(401);
  });

  // Quiz ID does not refer to a valid quiz
  test('Quiz ID does not refer to a valid quiz', () => {
    const updateResponse = testQuizDescriptionUpdate(user.token, quiz.quizId + 1, 'This quiz id does no refer to any quiz');
    expect(updateResponse.response).toStrictEqual({ error: 'Quiz ID does not refer to a valid quiz' });
    expect(updateResponse.status).toStrictEqual(403);
  });

  // Quiz ID does not refer to a quiz that this user owns
  test('Quiz ID does not refer to a quiz that this user owns, belongs to somebody else', () => {
    const user2 = testRegister('somebody@unsw.edu.au', 'password2', 'nameFirst2', 'nameLast2').response;
    const quiz2 = testCreateQuiz(user2.token, 'Quiz by user 2', 'User 2 quiz').response;

    const updateResponse = testQuizDescriptionUpdate(user.token, quiz2.quizId, 'Try to update user 2 quiz');
    expect(updateResponse.response).toStrictEqual(ERROR);
    expect(updateResponse.status).toStrictEqual(403);
  });
});
