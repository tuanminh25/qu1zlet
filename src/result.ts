import {
  findPlayerFromId,
  findGameSession,
} from './helper';
import { ReturnQuestResult, ReturnFinalResults, UsersRanked, QuestionData, GameState } from './interface';
import HttpError from 'http-errors';

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
