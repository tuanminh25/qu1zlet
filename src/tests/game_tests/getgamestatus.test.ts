import {
  testRegister,
  testCreateQuiz,
  testCreateQuizQuestion,
  testClear,
  validQuestion,
  footballQues,
  testGameSessionStart,
  testGameSessionUpdate,
  testGetGameStatus,
} from '../testHelper';

const ERROR = { error: expect.any(String) };
validQuestion.duration = 1;
footballQues.duration = 1;
beforeEach(() => {
  testClear();
});

function sleepSync(ms: number) {
  const startTime = new Date().getTime();
  while (new Date().getTime() - startTime < ms) {
    // zzzZZ - comment needed so eslint doesn't complain
  }
}

describe('Get game status', () => {
  let user: { token: string; };
  let quiz: { quizId: number; };
  let ques: { questionId: number};
  let gameSession: { sessionId: number};
  beforeEach(() => {
    user = testRegister('testuser@example.com', 'password123', 'Test', 'User').response;
    quiz = testCreateQuiz(user.token, 'Sample Quiz', 'Sample Description').response;
    ques = testCreateQuizQuestion(user.token, quiz.quizId, validQuestion).response;
    gameSession = testGameSessionStart(user.token, quiz.quizId, 10).response;
  });

  test('Successfully get state: LOBBY', () => {
    const gameStatus = testGetGameStatus(user.token, quiz.quizId, gameSession.sessionId);
    expect(gameStatus.status).toStrictEqual(200);
    expect(gameStatus.response).toStrictEqual({
      state: 'LOBBY',
      atQuestion: 0,
      players: [],
      metadata: {
        quizId: quiz.quizId,
        name: 'Sample Quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Sample Description',
        numQuestions: 1,
        questions: [
          {
            questionId: ques.questionId,
            question: validQuestion.question,
            duration: 1,
            thumbnailUrl: 'http://example.com/image.jpg',
            points: 5,
            answers: [
              { answer: 'Berlin', correct: false, colour: expect.any(String), answerId: expect.any(Number) },
              { answer: 'Madrid', correct: false, colour: expect.any(String), answerId: expect.any(Number) },
              { answer: 'Paris', correct: true, colour: expect.any(String), answerId: expect.any(Number) },
              { answer: 'Rome', correct: false, colour: expect.any(String), answerId: expect.any(Number) }
            ]
          }
        ],
        duration: 1,
        thumbnailUrl: ''
      }
    });
  });

  test('Successful states update with 1 question', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    sleepSync(1 * 1000);
    const gameStatus = testGetGameStatus(user.token, quiz.quizId, gameSession.sessionId).response;
    expect(gameStatus.state).toStrictEqual('QUESTION_COUNTDOWN');
    expect(gameStatus.atQuestion).toStrictEqual(1);

    sleepSync(2 * 1000);
    const gameStatus2 = testGetGameStatus(user.token, quiz.quizId, gameSession.sessionId);
    expect(gameStatus2.status).toStrictEqual(200);
    expect(gameStatus2.response.state).toStrictEqual('QUESTION_OPEN');

    sleepSync(validQuestion.duration * 1000);
    const gameStatus3 = testGetGameStatus(user.token, quiz.quizId, gameSession.sessionId);
    expect(gameStatus3.status).toStrictEqual(200);
    expect(gameStatus3.response.state).toStrictEqual('QUESTION_CLOSE');

    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_ANSWER');
    const gameStatus4 = testGetGameStatus(user.token, quiz.quizId, gameSession.sessionId);
    expect(gameStatus4.status).toStrictEqual(200);
    expect(gameStatus4.response.state).toStrictEqual('ANSWER_SHOW');

    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_FINAL_RESULTS');
    const gameStatus5 = testGetGameStatus(user.token, quiz.quizId, gameSession.sessionId);
    expect(gameStatus5.status).toStrictEqual(200);
    expect(gameStatus5.response.state).toStrictEqual('FINAL_RESULTS');
    expect(gameStatus5.response.atQuestion).toStrictEqual(0);

    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'END');
    const gameStatus6 = testGetGameStatus(user.token, quiz.quizId, gameSession.sessionId);
    expect(gameStatus6.status).toStrictEqual(200);
    expect(gameStatus6.response.state).toStrictEqual('END');
  });

  test('Invalid quizId', () => {
    const gameStatus = testGetGameStatus(user.token, quiz.quizId + 123, gameSession.sessionId);
    expect(gameStatus.response).toStrictEqual(ERROR);
    expect(gameStatus.status).toStrictEqual(403);
  });

  test('Invalid token', () => {
    const gameStatus = testGetGameStatus(user.token + '123cs', quiz.quizId, gameSession.sessionId);
    expect(gameStatus.response).toStrictEqual(ERROR);
    expect(gameStatus.status).toStrictEqual(401);
  });

  test('Empty token', () => {
    const gameStatus = testGetGameStatus('', quiz.quizId, gameSession.sessionId);
    expect(gameStatus.response).toStrictEqual(ERROR);
    expect(gameStatus.status).toStrictEqual(401);
  });

  test('Unauthorised', () => {
    const user2 = testRegister('roger@gmail.com', 'password123', 'Roger', 'Duong').response;
    const gameStatus = testGetGameStatus(user2.token, quiz.quizId, gameSession.sessionId);
    expect(gameStatus.response).toStrictEqual(ERROR);
    expect(gameStatus.status).toStrictEqual(403);
  });

  test('Session Id does not refer to a valid session within this quiz', () => {
    const user2 = testRegister('testuser@example.com', 'password123', 'Test', 'User').response;
    const quiz2 = testCreateQuiz(user2.token, 'Sample Quiz', 'Sample Description').response;
    testCreateQuizQuestion(user2.token, quiz2.quizId, validQuestion);
    const gameSession2 = testGameSessionStart(user2.token, quiz2.quizId, 10).response;

    const gameStatus = testGetGameStatus(user.token, quiz.quizId, gameSession2.sessionId);
    expect(gameStatus.response).toStrictEqual(ERROR);
    expect(gameStatus.status).toStrictEqual(400);
  });
});

testClear();
