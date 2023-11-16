import {
  testRegister,
  testCreateQuiz,
  testClear,
  testCreateQuizQuestion,
  testQuizInfo,
  testQuizTransfer,
  testGameSessionStart,
  validQuestion,
  testGameSessionUpdate
} from '../testHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  testClear();
});

describe('/v1/admin/quiz/:quizid/transfer', () => {
  const userfrom = {
    email: 'testuser@example.com',
    password: 'Password123',
    nameFirst: 'Usersend',
    nameLast: 'from'
  };
  const userto = {
    email: 'testuser2@example.com',
    password: 'Password321',
    nameFirst: 'UserTransfer',
    nameLast: 'to'
  };
  let userfromtoken: {token: string};
  let usertotoken: {token: string};
  let quiz: { quizId: number };
  let gameSession: { sessionId: number };

  beforeEach(() => {
    userfromtoken = testRegister(userfrom.email, userfrom.password, userfrom.nameFirst, userfrom.nameLast).response;
    usertotoken = testRegister(userto.email, userto.password, userto.nameFirst, userto.nameLast).response;
    quiz = testCreateQuiz(userfromtoken.token, 'My Quiz Name', 'A description of my quiz').response;
    testCreateQuizQuestion(userfromtoken.token, quiz.quizId, validQuestion);
    gameSession = testGameSessionStart(userfromtoken.token, quiz.quizId, 10).response;
    testGameSessionUpdate(userfromtoken.token, quiz.quizId, gameSession.sessionId, 'END');
  });

  // Successful Case
  test('Successfully transfers quiz', () => {
    const quizTransfer = testQuizTransfer(userfromtoken.token, quiz.quizId, userto.email);

    expect(quizTransfer.response).toStrictEqual({});
    expect(quizTransfer.status).toStrictEqual(200);

    // Check that the quiz is now owned by the transfer user
    const transferredQuiz = testQuizInfo(usertotoken.token, quiz.quizId).response;
    expect(transferredQuiz.name).toStrictEqual('My Quiz Name');
    expect(transferredQuiz.description).toStrictEqual('A description of my quiz');
  });

  test('Transferring to an non-existent email - ERROR', () => {
    const quizTransfer = testQuizTransfer(userfromtoken.token, quiz.quizId, 'fakeemail@domain.com');
    expect(quizTransfer.response).toStrictEqual(ERROR);
    expect(quizTransfer.status).toStrictEqual(400);
  });

  test('Transferring to itself - ERROR', () => {
    const quizTransfer = testQuizTransfer(userfromtoken.token, quiz.quizId, userfrom.email);
    expect(quizTransfer.response).toStrictEqual(ERROR);
    expect(quizTransfer.status).toStrictEqual(400);
  });

  test('Not in END state - ERROR', () => {
    testGameSessionUpdate(userfromtoken.token, quiz.quizId, gameSession.sessionId, 'LOBBY');
    const quizTransfer = testQuizTransfer(userfromtoken.token, quiz.quizId, userfrom.email);
    expect(quizTransfer.response).toStrictEqual(ERROR);
    expect(quizTransfer.status).toStrictEqual(400);
  });

  test('Quiz has the same name as a quiz already owned by target - ERROR', () => {
    const quiz2 = testCreateQuiz(usertotoken.token, 'My Quiz Name', 'A description of my quiz').response;
    const ownedquiz2 = testQuizInfo(usertotoken.token, quiz2.quizId).response;
    // Checking the quiz was made correctly and owned by userto
    expect(ownedquiz2.name).toStrictEqual('My Quiz Name');

    const quizTransfer = testQuizTransfer(userfromtoken.token, quiz.quizId, userto.email);
    expect(quizTransfer.response).toStrictEqual(ERROR);
    expect(quizTransfer.status).toStrictEqual(400);
  });

  // Error 401
  test('Invalid Token', () => {
    const quizTransfer = testQuizTransfer(userfromtoken.token + 'abc', quiz.quizId, userto.email);
    expect(quizTransfer.response).toStrictEqual(ERROR);
    expect(quizTransfer.status).toStrictEqual(401);
  });

  test('Empty Token', () => {
    const quizTransfer = testQuizTransfer('', quiz.quizId, userto.email);
    expect(quizTransfer.response).toStrictEqual(ERROR);
    expect(quizTransfer.status).toStrictEqual(401);
  });

  // Error 403
  test('Unauthorized', () => {
    const unauthorizedUser = testRegister('unauthorized@example.com', 'password123', 'Unauthorized', 'User').response;
    const quizTransfer = testQuizTransfer(unauthorizedUser.token, quiz.quizId, userto.email);
    expect(quizTransfer.response).toStrictEqual(ERROR);
    expect(quizTransfer.status).toStrictEqual(403);
  });
});

testClear();
