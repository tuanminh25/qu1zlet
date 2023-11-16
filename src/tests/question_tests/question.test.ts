import {
  testRegister,
  testCreateQuiz,
  testCreateQuizQuestion,
  testClear,
  testCurrentPlayerInfo,
  testPlayerJoin,
  testGameSessionStart,
  testGameSessionUpdate
} from '../testHelper';

const ERROR = { error: expect.any(String) };

function sleepSync(ms: number) {
  const startTime = new Date().getTime();
  while (new Date().getTime() - startTime < ms) {
    // zzzZZ - comment needed so eslint doesn't complain
  }
}

beforeEach(() => {
  testClear();
});

describe('Current question information for a player', () => {
  let user1: { token: string };
  let quiz1: { quizId: number };

  let player1: {playerId: number};

  let game1: { sessionId: number};

  const validQuestion0 = {
    question: 'What is the capital of France?',
    duration: 4,
    points: 5,
    answers: [{ answer: 'Berlin', correct: false },
      { answer: 'Madrid', correct: false },
      { answer: 'Paris', correct: true },
      { answer: 'Rome', correct: false }],
    thumbnailUrl: 'http://example.com/image.jpg'

  };

  const validQuestion1 = {
    question: 'What is the capital of Spain?',
    duration: 4,
    points: 5,
    answers: [{ answer: 'Berlin', correct: false },
      { answer: 'Madrid', correct: true },
      { answer: 'Paris', correct: false },
      { answer: 'Rome', correct: false }],
    thumbnailUrl: 'http://example.com/image.jpg'

  };

  const validQuestion2 = {
    question: 'What is the capital of Brazil?',
    duration: 4,
    points: 5,
    answers: [{ answer: 'Berlin', correct: false },
      { answer: 'Madrid', correct: false },
      { answer: 'Paris', correct: true },
      { answer: 'Rome', correct: false }],
    thumbnailUrl: 'http://example.com/image.jpg'

  };

  const validQuestion3 = {
    question: 'What is the capital of Vietnam?',
    duration: 3,
    points: 10,
    answers: [{ answer: 'Hanoi', correct: true },
      { answer: 'Madrid', correct: false },
      { answer: 'Paris', correct: false },
      { answer: 'Rome', correct: false }],
    thumbnailUrl: 'http://example.com/image111.jpg'

  };

  const validQuestion4 = {
    question: 'What is the capital of Italy?',
    duration: 4,
    points: 5,
    answers: [{ answer: 'Berlin', correct: false },
      { answer: 'Madrid', correct: false },
      { answer: 'Paris', correct: false },
      { answer: 'Rome', correct: true }],
    thumbnailUrl: 'http://example.com/image.jpg'
  };

  beforeEach(() => {
    testClear();
    // First person
    user1 = testRegister('hayden.smith@unsw.edu.au', 'password1', 'nameFirst', 'nameLast').response;

    quiz1 = testCreateQuiz(user1.token, 'Quiz by Hayden', '').response;
    expect(testCreateQuizQuestion(user1.token, quiz1.quizId, validQuestion0).status).toStrictEqual(200);
    expect(testCreateQuizQuestion(user1.token, quiz1.quizId, validQuestion1).status).toStrictEqual(200);
    expect(testCreateQuizQuestion(user1.token, quiz1.quizId, validQuestion2).status).toStrictEqual(200);
    expect(testCreateQuizQuestion(user1.token, quiz1.quizId, validQuestion3).status).toStrictEqual(200);
    expect(testCreateQuizQuestion(user1.token, quiz1.quizId, validQuestion4).status).toStrictEqual(200);

    game1 = testGameSessionStart(user1.token, quiz1.quizId, 10).response;
    player1 = testPlayerJoin(game1.sessionId, 'Luca').response;
  });

  // Error cases:
  test('player ID does not exist', () => {
    const player1info = testCurrentPlayerInfo(player1.playerId + 100, 1);
    expect(player1info.status).toStrictEqual(400);
    expect(player1info.response).toStrictEqual(ERROR);
  });

  test('question position is not valid for the session this player is in', () => {
    let player1info = testCurrentPlayerInfo(player1.playerId, 6);
    expect(player1info.status).toStrictEqual(400);
    expect(player1info.response).toStrictEqual(ERROR);

    player1info = testCurrentPlayerInfo(player1.playerId, -10);
    expect(player1info.status).toStrictEqual(400);
    expect(player1info.response).toStrictEqual(ERROR);
  });

  test('Session is not currently on this question', () => {
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'NEXT_QUESTION').status).toStrictEqual(200);
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'SKIP_COUNTDOWN').status).toStrictEqual(200);
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'GO_TO_ANSWER').status).toStrictEqual(200);
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'NEXT_QUESTION').status).toStrictEqual(200);

    // Gone through this question
    let player1info = testCurrentPlayerInfo(player1.playerId, 1);
    expect(player1info.status).toStrictEqual(400);
    expect(player1info.response).toStrictEqual(ERROR);

    // Havent come to this question
    player1info = testCurrentPlayerInfo(player1.playerId, 3);
    expect(player1info.status).toStrictEqual(400);
    expect(player1info.response).toStrictEqual(ERROR);

    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'END').status).toStrictEqual(200);
  });

  test('Session is in LOBBY or END state', () => {
    // LOBBY state
    let player1info = testCurrentPlayerInfo(player1.playerId, 1);
    expect(player1info.status).toStrictEqual(400);
    expect(player1info.response).toStrictEqual(ERROR);

    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'END').status).toStrictEqual(200);

    // END state
    player1info = testCurrentPlayerInfo(player1.playerId, 3);
    expect(player1info.status).toStrictEqual(400);
    expect(player1info.response).toStrictEqual(ERROR);
  });

  // Working cases
  test('In the first question', () => {
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'NEXT_QUESTION').status).toStrictEqual(200);
    const player1info = testCurrentPlayerInfo(player1.playerId, 1);
    expect(player1info.status).toStrictEqual(200);
    expect(player1info.response).toStrictEqual({
      questionId: expect.any(Number),
      question: validQuestion0.question,
      duration: validQuestion0.duration,
      thumbnailUrl: validQuestion0.thumbnailUrl,
      points: validQuestion0.points,
      answers: [{ answer: 'Berlin', colour: expect.any(String), answerId: expect.any(Number) },
        { answer: 'Madrid', colour: expect.any(String), answerId: expect.any(Number) },
        { answer: 'Paris', colour: expect.any(String), answerId: expect.any(Number) },
        { answer: 'Rome', colour: expect.any(String), answerId: expect.any(Number) }],
    });

    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'END').status).toStrictEqual(200);
  });

  test('In the first question then the 4th question', () => {
    // Go to question 1
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'NEXT_QUESTION').status).toStrictEqual(200);
    const player1info = testCurrentPlayerInfo(player1.playerId, 1);
    expect(player1info.status).toStrictEqual(200);
    expect(player1info.response).toStrictEqual({
      questionId: expect.any(Number),
      question: validQuestion0.question,
      duration: validQuestion0.duration,
      thumbnailUrl: validQuestion0.thumbnailUrl,
      points: validQuestion0.points,
      answers: [{ answer: 'Berlin', colour: expect.any(String), answerId: expect.any(Number) },
        { answer: 'Madrid', colour: expect.any(String), answerId: expect.any(Number) },
        { answer: 'Paris', colour: expect.any(String), answerId: expect.any(Number) },
        { answer: 'Rome', colour: expect.any(String), answerId: expect.any(Number) }],
    });
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'SKIP_COUNTDOWN').status).toStrictEqual(200);
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'GO_TO_ANSWER').status).toStrictEqual(200);

    // TO question 2
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'NEXT_QUESTION').status).toStrictEqual(200);
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'SKIP_COUNTDOWN').status).toStrictEqual(200);
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'GO_TO_ANSWER').status).toStrictEqual(200);

    // TO question 3
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'NEXT_QUESTION').status).toStrictEqual(200);
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'SKIP_COUNTDOWN').status).toStrictEqual(200);
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'GO_TO_ANSWER').status).toStrictEqual(200);

    // TO question 4
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'NEXT_QUESTION').status).toStrictEqual(200);
    const player1info4 = testCurrentPlayerInfo(player1.playerId, 4);
    expect(player1info4.status).toStrictEqual(200);
    expect(player1info4.response).toStrictEqual({
      questionId: expect.any(Number),
      question: validQuestion3.question,
      duration: validQuestion3.duration,
      thumbnailUrl: validQuestion3.thumbnailUrl,
      points: validQuestion3.points,
      answers: [{ answer: 'Hanoi', colour: expect.any(String), answerId: expect.any(Number) },
        { answer: 'Madrid', colour: expect.any(String), answerId: expect.any(Number) },
        { answer: 'Paris', colour: expect.any(String), answerId: expect.any(Number) },
        { answer: 'Rome', colour: expect.any(String), answerId: expect.any(Number) }],
    });

    // End session
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'END').status).toStrictEqual(200);
  });

  test('In the first question wait to second question', () => {
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'NEXT_QUESTION').status).toStrictEqual(200);
    const player1info = testCurrentPlayerInfo(player1.playerId, 1);
    expect(player1info.status).toStrictEqual(200);
    expect(player1info.response).toStrictEqual({
      questionId: expect.any(Number),
      question: validQuestion0.question,
      duration: validQuestion0.duration,
      thumbnailUrl: validQuestion0.thumbnailUrl,
      points: validQuestion0.points,
      answers: [{ answer: 'Berlin', colour: expect.any(String), answerId: expect.any(Number) },
        { answer: 'Madrid', colour: expect.any(String), answerId: expect.any(Number) },
        { answer: 'Paris', colour: expect.any(String), answerId: expect.any(Number) },
        { answer: 'Rome', colour: expect.any(String), answerId: expect.any(Number) }],
    });

    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'SKIP_COUNTDOWN').status).toStrictEqual(200);
    sleepSync(4 * 1000);
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'GO_TO_ANSWER').status).toStrictEqual(200);
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'NEXT_QUESTION').status).toStrictEqual(200);

    const player1info2 = testCurrentPlayerInfo(player1.playerId, 2);
    expect(player1info2.status).toStrictEqual(200);
    expect(player1info2.response).toStrictEqual({
      questionId: expect.any(Number),
      question: validQuestion1.question,
      duration: validQuestion1.duration,
      thumbnailUrl: validQuestion1.thumbnailUrl,
      points: validQuestion1.points,
      answers: [{ answer: 'Berlin', colour: expect.any(String), answerId: expect.any(Number) },
        { answer: 'Madrid', colour: expect.any(String), answerId: expect.any(Number) },
        { answer: 'Paris', colour: expect.any(String), answerId: expect.any(Number) },
        { answer: 'Rome', colour: expect.any(String), answerId: expect.any(Number) }],
    });

    // End session
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'END').status).toStrictEqual(200);
  });
});

testClear();
