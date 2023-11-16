import {
  testRegister,
  testCreateQuiz,
  testCreateQuizQuestion,
  testClear,
  validQuestion,
	footballQues,
  testGameSessionStart,
	testGameSessionUpdate,
  testPlayerJoin,
	testPlayerSubmit,
	testPlayerQuesResult
} from './testHelper';

const ERROR = { error: expect.any(String) };
validQuestion.duration = 2;
function sleepSync(ms: number) {
  const startTime = new Date().getTime();
  while (new Date().getTime() - startTime < ms) {
    // zzzZZ - comment needed so eslint doesn't complain
  }
}

beforeEach(() => {
  testClear();
});

describe('Chat messages', () => {
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
  });

	test('1 player correct', () => {
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');

		sleepSync(1 * 1000);
		testPlayerSubmit(player.playerId, 1, [3]);
		testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_ANSWER');
		const answer = testPlayerQuesResult(player.playerId, 1);
		expect(answer.response).toStrictEqual({
			questionId: expect.any(Number),
			playersCorrectList: ['LUCA'],
			averageAnswerTime: 1,
			percentCorrect: 100
		});
		expect(answer.status).toStrictEqual(200);
	});

	test('1 correct 1 wrong', () => {
		const player2 = testPlayerJoin(gameSession.sessionId, 'HELLEN').response;
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
		testPlayerSubmit(player.playerId, 1, [3]);
		sleepSync(1 * 1000);
		testPlayerSubmit(player2.playerId, 1, [1]);
		testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_ANSWER');

		const answer = testPlayerQuesResult(player.playerId, 1);
		expect(answer.response).toStrictEqual({
			questionId: expect.any(Number),
			playersCorrectList: ['LUCA'],
			averageAnswerTime: 0.5,
			percentCorrect: 50
		});
		expect(answer.status).toStrictEqual(200);
	});

	test('PlayerId does not exist', () => {
		testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
		testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_ANSWER');
		const answer = testPlayerQuesResult(player.playerId, 1);
		expect(answer.status).toStrictEqual(400);
		expect(answer.response).toStrictEqual(ERROR);
	});

	test('If question position is not valid for the session this player is in', () => {
		testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
		testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_ANSWER');
		const answer = testPlayerQuesResult(player.playerId, 1000);
		expect(answer.status).toStrictEqual(400);
		expect(answer.response).toStrictEqual(ERROR);
	});

	test('Session is not in ANSWER_SHOW state', () => {
		const answer = testPlayerQuesResult(player.playerId, 1);
		expect(answer.status).toStrictEqual(400);
		expect(answer.response).toStrictEqual(ERROR);
	});

	test('PlayerId does not exist', () => {
		testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'NEXT_QUESTION');
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'SKIP_COUNTDOWN');
		testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'GO_TO_ANSWER');
		const answer = testPlayerQuesResult(player.playerId, 2);
		expect(answer.status).toStrictEqual(400);
		expect(answer.response).toStrictEqual(ERROR);
	});
});