import {
  load,
  findPlayerFromId,
  generateTime,
  save,
} from './helper';
import { ChatMessage, PlayerStatus } from './interface';
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