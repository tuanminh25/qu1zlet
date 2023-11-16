import {
  load,
  findPlayerFromId,
  checkQuesPosition
} from './helper';
import { ReturnQuestResult, GameState } from './interface';
import HttpError from 'http-errors';

export function playerGetQuesResult(playerId: number, questionPosition: number): ReturnQuestResult {
  const data = load();
  const player = findPlayerFromId(playerId);
  const gameSession = data.gameSessions.find((g) => g.gameSessionId === player.sessionId);

  if (checkQuesPosition(gameSession, questionPosition)) {
    throw HttpError(400, 'Question position is not valid for the session this player is in');
  }

  if (gameSession.state !== GameState.ANSWER_SHOW) {
    throw HttpError(400, 'Session is not in ANSWER_SHOW state');
  }

  if (gameSession.atQuestion < questionPosition) {
    throw HttpError(400, 'Session is not yet up to this question');
  }

  let nameList: string[];
  for (const player of gameSession.questionDatas[gameSession.atQuestion - 1].playersCorrectList) {
    nameList.push(player.name);
  }

  const result: ReturnQuestResult = {
    questionId: gameSession.questionDatas[gameSession.atQuestion - 1].questionId,
    playersCorrectList: nameList.sort(),
    percentCorrect: gameSession.questionDatas[gameSession.atQuestion - 1].percentCorrect,
    averageAnswerTime: gameSession.questionDatas[gameSession.atQuestion - 1].averageAnswerTime
  };

	return result;
}
