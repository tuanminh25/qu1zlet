import {
  getSession,
  load,
  save,
  checkquizId,
  sortPlayerNames,
  generateRandomName,
  findPlayerFromId,
} from './helper';
import HttpError from 'http-errors';
import {
  GameSession,
  GameAction,
  GameState,
  ReturnGameSession,
  ReturnQuizInfo,
  Player,
  PlayerStatus
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

  const newGameSession: GameSession = {
    gameSessionId: ++data.ids.gameSessionId,
    state: GameState.LOBBY,
    atQuestion: 0,
    players: [],
    metadata: quiz,
    autoStartNum: autoStartNum,
    messages: [],
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

    return {};
  }

  if (gameSession.state === GameState.LOBBY) {
    if (action !== GameAction.NEXT_QUESTION) {
      throw HttpError(400, 'Action enum cannot be applied in the current state');
    } else {
      gameSession.state = GameState.QUESTION_COUNTDOWN;
      save(data);
      timerIds.questionCountDown = countDownTimer(gameSessionId);
      timerIds.questionDurationTimer = durationTimer(gameSessionId, 3, currQues.duration);

      gameSession.atQuestion++;
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
      if (gameSession.atQuestion === gameSession.metadata.numQuestions) {
        gameSession.state = GameState.FINAL_RESULTS;
        save(data);

        return {};
      }

      gameSession.state = GameState.QUESTION_COUNTDOWN;

      save(data);
      timerIds.questionCountDown = countDownTimer(gameSessionId);

      gameSession.atQuestion++;

      save(data);
      timerIds.questionDurationTimer = durationTimer(gameSessionId, 3, currQues.duration);

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
      if (gameSession.atQuestion === gameSession.metadata.numQuestions) {
        gameSession.state = GameState.FINAL_RESULTS;
        save(data);

        return {};
      }
      gameSession.state = GameState.QUESTION_COUNTDOWN;

      save(data);
      timerIds.questionCountDown = countDownTimer(gameSessionId);

      gameSession.atQuestion++;

      save(data);
      timerIds.questionDurationTimer = durationTimer(gameSessionId, 3, currQues.duration);

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

export function joinPlayer(sessionId: number, name: string): {playerId: number} {
  const data = load();
  const gameSession = data.gameSessions.find(g => g.gameSessionId === sessionId);

  if (!gameSession) {
    throw HttpError(400, 'Session does not exist');
  }

  if (gameSession.players.find((p) => p.name === name)) {
    throw HttpError(400, 'Name of user is not unique');
  }

  // Session is not in LOBBY state
  if (gameSession.state !== 'LOBBY') {
    throw HttpError(400, 'Session is not in LOBBY state');
  }

  // Check name, generate new one if neccessary
  if (name === '') {
    name = generateRandomName();
    while (gameSession.players.find((p) => p.name === name)) {
      name = generateRandomName();
    }
  }

  // Initialize new player
  const player: Player = {
    sessionId: sessionId,
    name: name,
    playerId: data.ids.playerId,
  };

  // Save data
  data.players.push(player);
  gameSession.players.push(player);
  data.ids.playerId++;
  save(data);
  return { playerId: player.playerId };
}

export function playerStatus(playerId: number): PlayerStatus {
  const data = load();
  const player = findPlayerFromId(playerId);
  const gameSession = data.gameSessions.find((g) => g.gameSessionId === player.sessionId);

  return {
    state: gameSession.state,
    atQuestion: gameSession.atQuestion,
    numQuestions: gameSession.metadata.numQuestions
  };
}
