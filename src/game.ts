import {
  getSession,
  GameSession,
  GameState,
  GameAction,
  checkquizId,
  load,
  save
} from './helper';
import HttpError from 'http-errors';

function countDownTimer(sessionId: number): ReturnType<typeof setTimeout> {
  return setTimeout(() => {
    const data = load();
    const gameSession = data.gameSessions.find((g) => g.gameSessionId === sessionId);
    gameSession.state = GameState.QUESTION_OPEN;
    gameSession.questionCountDown = null;
    save(data);
  }, 3000);
}

function durationTimer(sessionId: number, duration: number): ReturnType<typeof setTimeout> {
  return setTimeout(() => {
    const data = load();
    const gameSession = data.gameSessions.find((g) => g.gameSessionId === sessionId);
    gameSession.state = GameState.QUESTION_CLOSE;
    gameSession.questionDurationTimer = null;
    save(data);
  }, duration * 1000);
}

export function gameSessionStart(token: string, quizId: number, autoStartNum: number): {sessionId: number} {
  const data = load();
  const session = getSession(token);
  const quiz = checkquizId(quizId);

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

  const newGameSession: GameSession = {
    gameSessionId: ++data.ids.gameSessionId,
    state: GameState.LOBBY,
    atQuestion: 0,
    players: [],
    metadata: quiz,
    questionCountDown: null,
    questionDurationTimer: null,
    autoStartNum: autoStartNum
  };
  quiz.activeSessions.push(newGameSession.gameSessionId);
  data.gameSessions.push(newGameSession);
  save(data);

  return {
    sessionId: newGameSession.gameSessionId
  };
}

export function updateGameSessionState(token: string, quizId: number, gameSessionId: number, action: string): Record<string, never> {
  const data = load();
  const session = getSession(token);
  const quiz = data.quizzes.find((quiz) => quiz.quizId === quizId);

  if (!quiz) {
    throw HttpError(403, 'Quiz does not exist');
  }

  if (session.userId !== quiz.quizOwnedby) {
    throw HttpError(403, 'Unauthorised');
  }

  if (!quiz.activeSessions.includes(gameSessionId)) {
    throw HttpError(400, 'Session Id does not refer to a valid session within this quiz');
  }

  const actionArray: string[] = Object.values(GameAction);
  if (!actionArray.includes(action)) {
    throw HttpError(400, 'Not a valid action enum');
  }

  const gameSession = data.gameSessions.find((g) => g.gameSessionId === gameSessionId);
  if (action === GameAction.END) {
    if (gameSession.questionCountDown !== null) {
      clearTimeout(gameSession.questionCountDown);
    } else if (gameSession.questionDurationTimer !== null) {
      clearTimeout(gameSession.questionDurationTimer);
    }

    gameSession.state = GameState.END;
    quiz.inactiveSessions.push(gameSession.gameSessionId);
    quiz.activeSessions = quiz.activeSessions.filter((g) => g !== gameSession.gameSessionId);
    save(data);

    return {};
  }

  if (gameSession.state === GameState.LOBBY) {
    if (action !== GameAction.NEXT_QUESTION) {
      throw HttpError(400, 'Action enum cannot be applied in the current state');
    } else {
      gameSession.state = GameState.QUESTION_COUNTDOWN;
      save(data);
      gameSession.questionCountDown = countDownTimer(gameSessionId);

      const currQues = gameSession.metadata.questions[gameSession.atQuestion];
      gameSession.atQuestion++;
      gameSession.questionDurationTimer = durationTimer(gameSessionId, currQues.duration);

      return {};
    }
  }

  if (gameSession.state === GameState.QUESTION_COUNTDOWN) {
    if (action !== GameAction.SKIP_COUNTDOWN) {
      throw HttpError(400, 'Action enum cannot be applied in the current state');
    } else {
      clearTimeout(gameSession.questionCountDown);
      gameSession.questionCountDown = null;
      gameSession.state = GameState.QUESTION_OPEN;
      save(data);

      return {};
    }
  }

  if (gameSession.state === GameState.QUESTION_OPEN) {
    if (action !== GameAction.GO_TO_ANSWER) {
      throw HttpError(400, 'Action enum cannot be applied in the current state');
    } else {
      gameSession.state = GameState.ANSWER_SHOW;
      clearTimeout(gameSession.questionDurationTimer);
      gameSession.questionDurationTimer = null;
      save(data);

      return {};
    }
  }

  if (gameSession.state === GameState.ANSWER_SHOW) {
    if (action === GameAction.NEXT_QUESTION) {
      gameSession.state = GameState.QUESTION_COUNTDOWN;
      save(data);
      gameSession.questionCountDown = countDownTimer(gameSessionId);

      const currQues = gameSession.metadata.questions[gameSession.atQuestion];
      gameSession.atQuestion++;
      gameSession.questionDurationTimer = durationTimer(gameSessionId, currQues.duration);

      return {};
    } else if (action === GameAction.GO_TO_FINAL_RESULTS) {
      gameSession.state = GameState.FINAL_RESULTS;
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
      save(data);

      return {};
    } else if (action === GameAction.NEXT_QUESTION) {
      gameSession.state = GameState.QUESTION_COUNTDOWN;
      save(data);
      gameSession.questionCountDown = countDownTimer(gameSessionId);

      const currQues = gameSession.metadata.questions[gameSession.atQuestion];
      gameSession.atQuestion++;
      gameSession.questionDurationTimer = durationTimer(gameSessionId, currQues.duration);

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
