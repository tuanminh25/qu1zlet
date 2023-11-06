import {
  getSession,
  GameSession,
  GameState,
  load,
  save
} from './helper';
import HttpError from 'http-errors';

export function gameSessionStart(token: string, quizId: number, autoStartNum: number): {sessionId: number} {
  const data = load();
  const session = getSession(token);
  const quiz = data.quizzes.find((quiz) => quiz.quizId === quizId);

  if (session.userId !== quiz.quizOwnedby) {
    throw HttpError(403, 'Unauthorised');
  }

  if (autoStartNum > 50) {
    throw HttpError(400, 'autoStartNum is a number greater than 50');
  }

  const activeSessions = data.gameSessions.filter((sess) => sess.metadata.quizOwnedby === session.userId && sess.state !== GameState.END);
  if (activeSessions.length >= 10) {
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
    metadata: quiz
  };

  data.gameSessions.push(newGameSession);
  save(data);

  return {
    sessionId: newGameSession.gameSessionId
  };
}
