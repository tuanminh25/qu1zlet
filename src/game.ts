import {
  getSession,
  load,
  save,
  checkquizId,
  sortPlayerNames,
  generateTime,
} from './helper';
import HttpError from 'http-errors';
import {
  GameSession,
  GameAction,
  GameState,
  ReturnGameSession,
  ReturnQuizInfo,
  QuestionData
} from './interface';

interface GameSessionTimeoutIds {
  sessionId: number;
  questionCountDown: ReturnType<typeof setTimeout> ;
  questionDurationTimer: ReturnType<typeof setTimeout>;
}

const gameSessionTimeoutIds: GameSessionTimeoutIds[] = [];

function countDownTimer(gameSessionId: number): ReturnType<typeof setTimeout> {
  const timer = gameSessionTimeoutIds.find((g) => g.sessionId === gameSessionId);
  return setTimeout(() => {
    const data = load();
    const gameSession = data.gameSessions.find((g) => g.gameSessionId === gameSessionId);
    gameSession.state = GameState.QUESTION_OPEN;
    gameSession.questionDatas[gameSession.atQuestion - 1].openTime = generateTime();
    timer.questionCountDown = null;
    save(data);
  }, 3000);
}

function durationTimer(gameSessionId: number, countdown: number, duration: number): ReturnType<typeof setTimeout> {
  const timer = gameSessionTimeoutIds.find((g) => g.sessionId === gameSessionId);
  return setTimeout(() => {
    const data = load();
    const gameSession = data.gameSessions.find((g) => g.gameSessionId === gameSessionId);
    gameSession.state = GameState.QUESTION_CLOSE;
    timer.questionDurationTimer = null;
    save(data);
  }, (countdown + duration) * 1000);
}

export function clearAllTimers() {
  for (const timer of gameSessionTimeoutIds) {
    if (timer.questionCountDown !== null) {
      clearTimeout(timer.questionCountDown);
    }

    if (timer.questionDurationTimer !== null) {
      clearTimeout(timer.questionDurationTimer);
    }
  }
}

function goToNextQues(gameSession: GameSession, timerIds: GameSessionTimeoutIds): void {
  if (gameSession.atQuestion === gameSession.metadata.numQuestions) {
    gameSession.state = GameState.FINAL_RESULTS;
    return;
  }
  const newQues = gameSession.metadata.questions[gameSession.atQuestion];
  gameSession.atQuestion++;
  gameSession.state = GameState.QUESTION_COUNTDOWN;
  timerIds.questionCountDown = countDownTimer(gameSession.gameSessionId);
  timerIds.questionDurationTimer = durationTimer(gameSession.gameSessionId, 3, newQues.duration);
}

/**
 * Create a name quiz game session
 *
 * @param {string} token
 * @param {number} quizId
 * @param {number} autoStartNum
 * @returns {sessionId: number}
 */
export function gameSessionStart(token: string, quizId: number, autoStartNum: number): {sessionId: number} {
  const data = load();
  const session = getSession(token);
  const quiz = data.quizzes.find((quiz) => quiz.quizId === quizId);

  if (!quiz) {
    throw HttpError(403, 'Quiz does not exist');
  }

  if (session.userId !== quiz.quizOwnedby) {
    throw HttpError(403, 'Unauthorised');
  }

  if (autoStartNum > 50) {
    throw HttpError(400, 'autoStartNum is a number greater than 50');
  }

  if (quiz.activeSessions.length >= 10) {
    throw HttpError(400, 'More than 10 active sessions');
  }

  if (quiz.questions.length === 0) {
    throw HttpError(400, 'Quiz does not have any question');
  }

  const newQuestionDatas: QuestionData[] = [];
  for (const ques of quiz.questions) {
    const correctAnswerIds: number[] = [];
    const validAnswerIds: number[] = [];
    for (const answer of ques.answers) {
      if (answer.correct === true) {
        correctAnswerIds.push(answer.answerId);
      }
      validAnswerIds.push(answer.answerId);
    }

    newQuestionDatas.push(
      {
        questionId: ques.questionId,
        averageAnswerTime: 0,
        percentCorrect: 0,
        playersCorrectList: [],
        openTime: 0,
        playerSubmissions: [],
        correctAnswerIds: correctAnswerIds,
        validAnswerIds: validAnswerIds,
        points: ques.points
      }
    );
  }

  const newGameSession: GameSession = {
    gameSessionId: ++data.ids.gameSessionId,
    state: GameState.LOBBY,
    atQuestion: 0,
    players: [],
    metadata: quiz,
    autoStartNum: autoStartNum,
    messages: [],
    questionDatas: newQuestionDatas
  };

  quiz.activeSessions.push(newGameSession.gameSessionId);
  data.gameSessions.push(newGameSession);

  gameSessionTimeoutIds.push({
    sessionId: newGameSession.gameSessionId,
    questionCountDown: null,
    questionDurationTimer: null
  });
  save(data);

  return {
    sessionId: newGameSession.gameSessionId
  };
}

/**
 * Update the state of a particular session by sending an action command
 *
 * @param {string} token
 * @param {number} quizId
 * @param {number} gameSessionId
 * @param {string} action
 * @returns {}
 */
export function updateGameSessionState(token: string, quizId: number, gameSessionId: number, action: string): Record<string, never> {
  const data = load();
  const session = getSession(token);
  const quiz = data.quizzes.find((quiz) => quiz.quizId === quizId);
  const gameSession = data.gameSessions.find((g) => g.gameSessionId === gameSessionId);
  let atQuestionInt;

  if (!quiz) {
    throw HttpError(403, 'Quiz does not exist');
  }

  if (session.userId !== quiz.quizOwnedby) {
    throw HttpError(403, 'Unauthorised');
  }

  if (!gameSession || gameSession.metadata.quizId !== quizId) {
    throw HttpError(400, 'Session Id does not refer to a valid session within this quiz');
  }

  const actionArray: string[] = Object.values(GameAction);
  if (!actionArray.includes(action)) {
    throw HttpError(400, 'Not a valid action enum');
  }

  if (gameSession.atQuestion === 0) {
    atQuestionInt = 0;
  } else {
    atQuestionInt = gameSession.atQuestion - 1;
  }

  const currQues = gameSession.metadata.questions[atQuestionInt];
  const timerIds = gameSessionTimeoutIds.find((g) => g.sessionId === gameSessionId);

  if (action === GameAction.END) {
    if (timerIds.questionCountDown !== null) {
      clearTimeout(timerIds.questionCountDown);
    }

    if (timerIds.questionDurationTimer !== null) {
      clearTimeout(timerIds.questionDurationTimer);
    }

    gameSession.state = GameState.END;
    gameSession.atQuestion = 0;
    quiz.inactiveSessions.push(gameSession.gameSessionId);
    quiz.activeSessions = quiz.activeSessions.filter((g) => g !== gameSession.gameSessionId);
    save(data);
  }

  if (gameSession.state === GameState.LOBBY) {
    if (action !== GameAction.NEXT_QUESTION) {
      throw HttpError(400, 'Action enum cannot be applied in the current state');
    } else {
      goToNextQues(gameSession, timerIds);
      save(data);

      return {};
    }
  }

  if (gameSession.state === GameState.QUESTION_COUNTDOWN) {
    if (action !== GameAction.SKIP_COUNTDOWN) {
      throw HttpError(400, 'Action enum cannot be applied in the current state');
    } else {
      clearTimeout(timerIds.questionCountDown);
      clearTimeout(timerIds.questionDurationTimer);
      timerIds.questionCountDown = null;
      timerIds.questionDurationTimer = durationTimer(gameSessionId, 0, currQues.duration);
      gameSession.state = GameState.QUESTION_OPEN;
      gameSession.questionDatas[gameSession.atQuestion - 1].openTime = generateTime();

      save(data);

      return {};
    }
  }

  if (gameSession.state === GameState.QUESTION_OPEN) {
    if (action !== GameAction.GO_TO_ANSWER) {
      throw HttpError(400, 'Action enum cannot be applied in the current state');
    } else {
      gameSession.state = GameState.ANSWER_SHOW;
      clearTimeout(timerIds.questionDurationTimer);
      timerIds.questionDurationTimer = null;

      save(data);

      return {};
    }
  }

  if (gameSession.state === GameState.ANSWER_SHOW) {
    if (action === GameAction.NEXT_QUESTION) {
      goToNextQues(gameSession, timerIds);
      save(data);

      return {};
    } else if (action === GameAction.GO_TO_FINAL_RESULTS) {
      gameSession.state = GameState.FINAL_RESULTS;
      gameSession.atQuestion = 0;

      save(data);

      return {};
    } else {
      throw HttpError(400, 'Action enum cannot be applied in the current state');
    }
  }

  if (gameSession.state === GameState.QUESTION_CLOSE) {
    if (action === GameAction.GO_TO_ANSWER) {
      gameSession.state = GameState.ANSWER_SHOW;

      save(data);

      return {};
    } else if (action === GameAction.GO_TO_FINAL_RESULTS) {
      gameSession.state = GameState.FINAL_RESULTS;
      gameSession.atQuestion = 0;

      save(data);

      return {};
    } else if (action === GameAction.NEXT_QUESTION) {
      goToNextQues(gameSession, timerIds);
      save(data);

      return {};
    } else {
      throw HttpError(400, 'Action enum cannot be applied in the current state');
    }
  }

  if (gameSession.state === GameState.FINAL_RESULTS) {
    throw HttpError(400, 'Action enum cannot be applied in the current state');
  }

  return {};
}

/**
 * Get the status of a particular quiz session
 *
 * @param {string} token
 * @param {number} quizId
 * @param {number} gameSessionId
 * @returns {ReturnGameSession}
 */
export function getGameStatus(token: string, quizId: number, gameSessionId: number): ReturnGameSession {
  const data = load();
  const session = getSession(token);
  const quiz = checkquizId(quizId);
  const gameSession: GameSession = data.gameSessions.find((g) => g.gameSessionId === gameSessionId);

  if (!gameSession || gameSession.metadata.quizId !== quizId) {
    throw HttpError(400, 'Session Id does not refer to a valid session within this quiz');
  }

  if (quiz.quizId !== session.userId) {
    throw HttpError(403, 'Unauthorised');
  }

  const metadata: ReturnQuizInfo = {
    quizId: gameSession.metadata.quizId,
    name: gameSession.metadata.name,
    timeCreated: gameSession.metadata.timeCreated,
    timeLastEdited: gameSession.metadata.timeLastEdited,
    description: gameSession.metadata.description,
    numQuestions: gameSession.metadata.numQuestions,
    questions: gameSession.metadata.questions,
    duration: gameSession.metadata.duration,
    thumbnailUrl: gameSession.metadata.thumbnailUrl
  };

  return {
    state: gameSession.state,
    atQuestion: gameSession.atQuestion,
    players: sortPlayerNames(gameSession.players),
    metadata: metadata
  };
}

/**
 *
 * @param {string} token
 * @param {number} quizId
 * @returns
 */
export function viewGameSession(token: string, quizId: number) {
  const session = getSession(token);
  const quiz = checkquizId(quizId);

  if (quiz.quizOwnedby !== session.userId) {
    throw HttpError(403, 'Unauthorised');
  }

  return {
    activeSessions: quiz.activeSessions,
    inactiveSessions: quiz.inactiveSessions
  };
}
