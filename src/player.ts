import {
  load,
  findPlayerFromId,
  generateTime,
  save,
  generateRandomName
} from './helper';
import { ChatMessage, PlayerStatus, PlayerSubmission, GameState, Player } from './interface';
import HttpError from 'http-errors';

/**
 * Allow a guest player to join
 *
 * @param {number} sessionId
 * @param {string} name
 * @returns {playerId: number}
 */
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

/**
 * Return all messages that are in the same session as the player
 *
 * @param {number} playerId
 * @returns {messages: ChatMessage[]}
 */
export function getChatMessages(playerId: number): {messages: ChatMessage[]} {
  const data = load();
  const player = findPlayerFromId(playerId);
  const gameSession = data.gameSessions.find((g) => g.gameSessionId === player.sessionId);

  return {
    messages: gameSession.messages
  };
}

/**
 * Send a new chat message to everyone in the session
 *
 * @param {number} playerId
 * @param {string} message
 * @returns
 */
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

/**
 * Get the status of a guest player that has already joined a session
 *
 * @param {number} playerId
 * @returns {PlayerStatus}
 */
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

/**
 *
 *
 * @param {number} playerId
 * @param {number} questionPosition
 * @param {number[]} answerIds
 * @returns
 */
export function playerSubmission(playerId: number, questionPosition: number, answerIds: number[]) {
  const data = load();
  const player = findPlayerFromId(playerId);

  const gameSession = data.gameSessions.find((g) => g.gameSessionId === player.sessionId);

  if (questionPosition < 1 || questionPosition > gameSession.metadata.numQuestions) {
    throw HttpError(400, 'Invalid questionPosition');
  }

  if (gameSession.state !== GameState.QUESTION_OPEN) {
    throw HttpError(400, 'Session is not in QUESTION_OPEN state');
  }

  if (gameSession.atQuestion < questionPosition) {
    throw HttpError(400, 'Session is not yet up to this question');
  }

  if (answerIds.length === 0) {
    throw HttpError(400, 'Less than 1 answer ID was submitted');
  }

  if (!answerIds.some(ids => gameSession.questionDatas[questionPosition - 1].validAnswerIds.includes(ids))) {
    throw HttpError(400, 'Answer IDs are not valid for this particular questio');
  }

  const uniqueAnswerIds = new Set(answerIds);
  if (uniqueAnswerIds.size !== answerIds.length) {
    throw HttpError(400, 'There are duplicate answer IDs provided');
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
