import {
  load,
  findPlayerFromId,
  generateTime,
  save,
  generateRandomName,
  checkQuesPosition
} from './helper';

import { ChatMessage, PlayerStatus, PlayerSubmission, GameState, Player, GameSession, QuestionData, QuizResults } from './interface';

import HttpError from 'http-errors';

function isAnswerCorrect(answer: number[], playerAns: number[]) {
  const sortedAnswer = answer.sort();
  const sortedPlayerAnswer = playerAns.sort();

  if (sortedAnswer.length !== sortedPlayerAnswer.length) {
    return false;
  }

  for (let i = 0; i < sortedAnswer.length; i++) {
    if (sortedAnswer[i] !== sortedPlayerAnswer[i]) {
      return false;
    }
  }

  return true;
}

function updateQuestionData(gameSession: GameSession, questionPosition: number, playerSubmit: PlayerSubmission) {
  const currQues: QuestionData = gameSession.questionDatas[questionPosition - 1];
  if (isAnswerCorrect(currQues.correctAnswerIds, playerSubmit.answerIds)) {
    const place = currQues.playersCorrectList.length + 1;
    const score = currQues.points * (1 / place);

    currQues.playersCorrectList.push({
      playerId: playerSubmit.playerId,
      score: score,
      name: playerSubmit.name
    });
  }

  let totalAnswerTime = 0;
  for (const submit of currQues.playerSubmissions) {
    totalAnswerTime += submit.answerTime;
  }

  currQues.averageAnswerTime = Math.floor(totalAnswerTime / (currQues.playerSubmissions.length));
  currQues.percentCorrect = Math.floor((currQues.playersCorrectList.length / gameSession.players.length) * 100);
}

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

  if (!checkQuesPosition(gameSession, questionPosition)) {
    throw HttpError(400, 'Invalid questionPosition');
  }

  if (gameSession.state !== GameState.QUESTION_OPEN) {
    throw HttpError(400, 'Session is not in QUESTION_OPEN state');
  }

  if (gameSession.atQuestion !== questionPosition) {
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

  const currQues = gameSession.questionDatas[questionPosition - 1];
  const playerSubmit: PlayerSubmission = {
    playerId: playerId,
    answerIds: answerIds,
    name: player.name,
    answerTime: generateTime() - currQues.openTime
  };

  if (currQues.playerSubmissions.find((ans) => ans.playerId === playerSubmit.playerId)) {
    currQues.playerSubmissions = currQues.playerSubmissions.filter((ans) => ans.playerId !== playerSubmit.playerId);
  }

  gameSession.questionDatas[questionPosition - 1].playerSubmissions.push(playerSubmit);
  updateQuestionData(gameSession, questionPosition, playerSubmit);
  save(data);

  return {};
}

/**
 * Get the final results for a whole session a player is playing in
 *
 * @param {number} playerId
 * @returns {QuizResults}
 */
export function GetPlayerQuizResults(playerId: number): QuizResults {
  const quizResults = {
    usersRankedByScore: [
      {
        name: 'Hayden',
        score: 45
      },
    ],
    questionResults: [
      {
        questionId: 5546,
        playersCorrectList: ['Hayden'],
        averageAnswerTime: 45,
        percentCorrect: 54
      },
    ]
  };
  return quizResults;
}
