import {
  load,
  findPlayerFromId,
  checkQuesPosition,
  findGameSession,
} from './helper';
import { ReturnQuestResult, ReturnFinalResults, UsersRanked, QuestionData, GameState } from './interface';
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

  const questionData = gameSession.questionDatas[questionPosition - 1];
  const playerList = questionData.playersCorrectList.map(player => player.name).sort();

  return {
    questionId: questionData.questionId,
    playersCorrectList: playerList,
    averageAnswerTime: questionData.averageAnswerTime,
    percentCorrect: questionData.percentCorrect
  };
}

function calculateFinalScore(name: string, allQues: QuestionData[]): number {
  let score = 0;
  for (const ques of allQues) {
    for (const player of ques.playersCorrectList) {
      if (player.name === name) {
        score += player.score;
      }
    }
  }

  return score;
}

export function playerFinalResults(playerId: number): ReturnFinalResults {
  const player = findPlayerFromId(playerId);
  const gameSession = findGameSession(player.sessionId);

  if (gameSession.state !== GameState.FINAL_RESULTS) {
    throw HttpError(400, 'Session is not in FINAL_RESULTS state');
  }

  const users: UsersRanked[] = [];

  for (const player of gameSession.players) {
    const name = player.name;
    const finalScore = calculateFinalScore(name, gameSession.questionDatas);
    users.push({
      name: name,
      score: finalScore
    });
  }

  users.sort((a, b) => b.score - a.score);
  const questionResults: ReturnQuestResult[] = [];

  for (const ques of gameSession.questionDatas) {
    const correctPlayers: string[] = [];
    for (const player of ques.playersCorrectList) {
      correctPlayers.push(player.name);
    }
    correctPlayers.sort();

    questionResults.push({
      questionId: ques.questionId,
      averageAnswerTime: ques.averageAnswerTime,
      percentCorrect: ques.percentCorrect,
      playersCorrectList: correctPlayers
    });
  }

  return {
    usersRankedByScore: users,
    questionResults: questionResults
  };
}
