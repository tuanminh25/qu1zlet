import {
  load,
  findPlayerFromId,
  checkQuesPosition
} from './helper';
import { GameState, ReturnQuestResult } from './interface';
import HttpError from 'http-errors';

export function playerQuestionResult(playerId: number, questionPosition: number): ReturnQuestResult {
  const data = load();
  const player = findPlayerFromId(playerId);
  // findPlayerFromId() takes care of invalid player ID

  const gameSession = data.gameSessions.find((g) => g.gameSessionId === player.sessionId);

  if (!checkQuesPosition(gameSession, questionPosition)) {
    throw HttpError(400, 'question position is not valid for the session this player is in');
  }

  if (gameSession.state !== GameState.ANSWER_SHOW) {
    throw HttpError(400, 'session is not in ANSWER_SHOW state');
  }

  if (gameSession.atQuestion !== questionPosition) {
    throw HttpError(400, 'session is not yet up to this question');
  }

  const questionData = gameSession.questionDatas[questionPosition];
  const playerList = questionData.playersCorrectList.map(player => player.name).sort();

  return {
    questionId: questionData.questionId,
    playersCorrectList: playerList,
    averageAnswerTime: questionData.averageAnswerTime,
    percentCorrect: questionData.percentCorrect
  };
}
