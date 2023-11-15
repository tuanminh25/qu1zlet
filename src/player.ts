import {
  load,
  findPlayerFromId,
  generateTime,
  save,
} from './helper';
import { ChatMessage, PlayerStatus, PlayerSubmission, GameState } from './interface';
import HttpError from 'http-errors';

export function getChatMessages(playerId: number): {messages: ChatMessage[]} {
  const data = load();
  const player = findPlayerFromId(playerId);
  const gameSession = data.gameSessions.find((g) => g.gameSessionId === player.sessionId);

  return {
    messages: gameSession.messages
  };
}

export function sendChatMessages(playerId: number, message: string): Record<string, never> {
  const data = load();
  const player = findPlayerFromId(playerId);
  const gameSession = data.gameSessions.find((q) => q.gameSessionId === player.sessionId);

  if (message.length < 1 || message.length > 100) {
    throw HttpError(400, 'Invalid message length');
  }

  const newChatMessage: ChatMessage = {
    playerId: playerId,
    messageBody: message,
    timeSent: generateTime(),
    playerName: player.name
  };

  gameSession.messages.push(newChatMessage);
  save(data);

  return {};
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

export function playerSubmission(playerId: number, questionPosition: number, answerIds: number[]) {
  const data = load();
  const player = findPlayerFromId(playerId);

  const gameSession = data.gameSessions.find((g) => g.gameSessionId === player.sessionId);

  if (questionPosition === 0 || questionPosition > gameSession.metadata.numQuestions) {
    throw HttpError(400, 'Invalid questionPosition');
  }

  if (gameSession.state !== GameState.QUESTION_OPEN) {
    throw HttpError(400, 'Session is not in QUESTION_OPEN state');
  }

  if (gameSession.atQuestion < questionPosition) {
    throw HttpError(400, 'Session is not yet up to this question');
  }

  if (!answerIds.some(ids => gameSession.questionDatas[questionPosition - 1].validAnswerIds.includes(ids))) {
    throw HttpError(400, 'Answer IDs are not valid for this particular questio');
  }

  const uniqueAnswerIds = new Set(answerIds);
  if (uniqueAnswerIds.size !== answerIds.length) {
    throw HttpError(400, 'There are duplicate answer IDs provided');
  }

  if (answerIds.length === 0) {
    throw HttpError(400, 'Less than 1 answer ID was submitted');
  }

  const playerSubmit: PlayerSubmission = {
    playerId: playerId,
    answerIds: answerIds,
    name: player.name,
    timeSubmitted: generateTime()
  };

  gameSession.questionDatas[questionPosition - 1].playerSubmissions.push(playerSubmit);
  save(data);
  
  return {};
}