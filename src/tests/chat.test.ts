import {
  testRegister,
  testCreateQuiz,
  testCreateQuizQuestion,
  testClear,
  validQuestion,
  testGameSessionStart,
  testPlayerJoin,
  testGetChatMessages,
} from './testHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  testClear();
});

// function sleepSync(ms: number) {
//   const startTime = new Date().getTime();
//   while (new Date().getTime() - startTime < ms) {
//     // zzzZZ - comment needed so eslint doesn't complain
//   }
// }

describe('Chat messages', () => {
  let user: { token: string; };
  let quiz: { quizId: number; };
  let gameSession: { sessionId: number};
  let player: { playerId: number};
  beforeEach(() => {
    testClear();
    user = testRegister('testuser@example.com', 'password123', 'Test', 'User').response;
    quiz = testCreateQuiz(user.token, 'Sample Quiz', 'Sample Description').response;
    expect(testCreateQuizQuestion(user.token, quiz.quizId, validQuestion).status).toStrictEqual(200);
    gameSession = testGameSessionStart(user.token, quiz.quizId, 10).response;
    player = testPlayerJoin(gameSession.sessionId, 'LUCA').response;
  });

  test('Successful get', () => {
    const chat = testGetChatMessages(player.playerId);
    expect(chat.response).toStrictEqual({
      messages: []
    });
    expect(chat.status).toStrictEqual(200);
  });

  test('Invalid playerId', () => {
    const chat = testGetChatMessages(player.playerId);
    expect(chat.response).toStrictEqual(ERROR);
    expect(chat.status).toStrictEqual(400);
  });
});
