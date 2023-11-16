import {
  testRegister,
  testCreateQuiz,
  testCreateQuizQuestion,
  testClear,
  validQuestion,
  footballQues,
  testGameSessionStart,
  testPlayerJoin,
  testPlayerSubmit,
  testGameSessionUpdate,
  testPlayerQuesResult
} from './testHelper';

const ERROR = { error: expect.any(String) };
validQuestion.duration = 1;
footballQues.duration = 1;

beforeEach(() => {
  testClear();
});

describe('Results for a question', () => {
  let user: { token: string; };
  let quiz: { quizId: number; };
  let gameSession: { sessionId: number};
  let player: { playerId: number};
  beforeEach(() => {
    testClear();
    user = testRegister('testuser@example.com', 'password123', 'Test', 'User').response;
    quiz = testCreateQuiz(user.token, 'Sample Quiz', 'Sample Description').response;
    testCreateQuizQuestion(user.token, quiz.quizId, validQuestion);
    testCreateQuizQuestion(user.token, quiz.quizId, footballQues);
    gameSession = testGameSessionStart(user.token, quiz.quizId, 10).response;
    player = testPlayerJoin(gameSession.sessionId, 'LUCA').response;

    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
    testPlayerSubmit(player.playerId, 1, [1, 2]);
  });

  // Working case:
  test('gets results successfully', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_ANSWER');
    const questionResult = testPlayerQuesResult(player.playerId, 1);
    expect(questionResult.response).toStrictEqual({
      questionId: expect.any(Number),
      playersCorrectList: 'LUCA',
      averageAnswerTime: expect.any(Number),
      percentCorrect: expect.any(Number)
    });
    expect(questionResult.status).toStrictEqual(200);
  });

  // Error cases:
  // 400
  // If player ID does not exist
  test('playerId does not exist', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_ANSWER');
    const questionResult = testPlayerQuesResult(player.playerId + 123, 1);
    expect(questionResult.response).toStrictEqual(ERROR);
    expect(questionResult.status).toStrictEqual(400);
  });
  // If question position is not valid for the session this player is in
  test('Invalid QuestionPosition', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_ANSWER');
    const questionResult = testPlayerQuesResult(player.playerId, 100);
    expect(questionResult.response).toStrictEqual(ERROR);
    expect(questionResult.status).toStrictEqual(400);
  });
  // Session is not in ANSWER_SHOW state
  test('Session is not at ANSWER_SHOW_STATE', () => {
    const questionResult = testPlayerQuesResult(player.playerId, 1);
    expect(questionResult.response).toStrictEqual(ERROR);
    expect(questionResult.status).toStrictEqual(400);
  });
  // If session is not yet up to this question
  test('Session is not up to this question', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_ANSWER');
    const questionResult = testPlayerQuesResult(player.playerId, 2);
    expect(questionResult.response).toStrictEqual(ERROR);
    expect(questionResult.status).toStrictEqual(400);
  });
});
