import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const auth = '/v1/admin/auth/';
const authv2 = '/v2/admin/auth/';
const userUrlv2 = '/v2/admin/user/';
const adminQuizUrlV2 = '/v2/admin/quiz/';
const playerV1 = '/v1/player/';

export const validQuestion = {
  question: 'What is the capital of France?',
  duration: 4,
  points: 5,
  answers: [
    { answer: 'Berlin', correct: false },
    { answer: 'Madrid', correct: false },
    { answer: 'Paris', correct: true },
    { answer: 'Rome', correct: false }
  ],
  thumbnailUrl: 'http://example.com/image.jpg'

};

export const footballQues = {
  question: 'England teams',
  duration: 10,
  points: 5,
  answers: [
    { answer: 'Madrid', correct: false },
    { answer: 'Barcelona', correct: false },
    { answer: 'Arsenal', correct: true },
    { answer: 'Bayern', correct: false }
  ],
  thumbnailUrl: 'http://example.com/image.jpg'
};

export const leagueQues = {
  question: 'Champions',
  duration: 15,
  points: 5,
  answers: [
    { answer: 'jayce', correct: false },
    { answer: 'tristana', correct: false },
    { answer: 'lulu', correct: false },
    { answer: 'leblanc', correct: true }
  ],
  thumbnailUrl: 'http://example.com/image.jpg'
};

export function testRegister(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
) {
  const res = request('POST', SERVER_URL + auth + 'register',
    {
      json: {
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast
      }
    }
  );

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testClear() {
  const res = request('DELETE', SERVER_URL + '/v1/clear');

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testLogin(email: string, password: string) {
  const res = request('POST', SERVER_URL + auth + 'login',
    {
      json: {
        email: email,
        password: password
      }
    }
  );

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testLogout(token: string) {
  const res = request('POST', SERVER_URL + authv2 + 'logout',
    {
      headers: {
        token: token
      }
    }
  );

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testGetDetails(token: string) {
  const res = request('GET', SERVER_URL + userUrlv2 + 'details',
    {
      headers: {
        token: token
      }
    }
  );

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testCreateQuiz(token: string, name: string, description: string) {
  const res = request('POST', SERVER_URL + '/v2/admin/quiz', {
    json: {
      name: name,
      description: description,
    },
    headers: {
      token: token,
    },
  });

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export const testQuizList = (token: string) => {
  const res = request('GET', `${SERVER_URL}/v2/admin/quiz/list`, { headers: { token: token } });
  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
};

export function testCreateQuizQuestion(token: string, quizId: number, questionBody: object) {
  const res = request('POST', `${SERVER_URL}/v2/admin/quiz/${quizId}/question`, {
    headers: {
      token: token,
    },
    json: {
      questionBody: questionBody
    },
  });

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testUpdateUserDetails(token: string, email: string, nameFirst: string, nameLast: string) {
  const res = request('PUT', SERVER_URL + '/v2/admin/user/details', {
    headers: {
      token: token,
    },
    json: {
      email: email,
      nameFirst: nameFirst,
      nameLast: nameLast
    },
  });

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testUpdatePassword(
  token: string,
  oldPassword: string,
  newPassword: string
) {
  const res = request('PUT', SERVER_URL + userUrlv2 + 'password',
    {
      headers: {
        token: token
      },
      json: {
        oldPassword: oldPassword,
        newPassword: newPassword
      }
    }
  );

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testQuizToTrash(token: string, quizId: number) {
  const res = request('DELETE', `${SERVER_URL}/v2/admin/quiz/${quizId}`, {
    headers: {
      token: token,
    },
  });

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testUpdateQuestion(
  token: string,
  quizId: number,
  questionId: number,
  questionBody: object
) {
  const res = request('PUT', `${SERVER_URL}/v2/admin/quiz/${quizId}/question/${questionId}`,
    {
      json: {
        questionBody: questionBody,
      },
      headers: {
        token: token,
      },
    });
  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testQuizInfo(token: string, quizId: number) {
  const res = request('GET', `${SERVER_URL}/v2/admin/quiz/${quizId}`, {
    headers: {
      token: token,
    },
  });

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testQuizNameUpdate(token: string, quizId: number, name: string) {
  const res = request('PUT', `${SERVER_URL}/v2/admin/quiz/${quizId}/name`, {
    headers: {
      token: token,
    },
    json: {
      name: name
    }
  });

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testQuizTransfer(token: string, quizId: number, userEmail: string) {
  const res = request('POST', `${SERVER_URL}/v2/admin/quiz/${quizId}/transfer`, {
    headers: {
      token: token,
    },
    json: {
      userEmail: userEmail
    }
  });

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testQuizDescriptionUpdate(token: string, quizId: number, description: string) {
  const res = request('PUT', `${SERVER_URL}/v2/admin/quiz/${quizId}/description`, {
    headers: {
      token: token,
    },
    json: {
      description: description
    },
  });

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testQuestionDelete(token: string, quizId: number, questionId: number) {
  const res = request('DELETE', `${SERVER_URL}/v2/admin/quiz/${quizId}/question/${questionId}`, {
    headers: {
      token: token
    }
  });

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export const testViewTrash = (token: string) => {
  const res = request('GET', `${SERVER_URL}/v2/admin/quiz/trash`, { headers: { token: token } });

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
};

export function testRestoreTrash(token: string, quizId: number) {
  const res = request('POST', `${SERVER_URL}/v2/admin/quiz/${quizId}/restore`, {
    headers: {
      token: token
    }
  });

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testEmptyTheTrash(token: string, quizIds: Array<number>) {
  const res = request('DELETE', SERVER_URL + adminQuizUrlV2 + 'trash/empty', { headers: { token: token }, qs: { quizIds: quizIds } });
  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testMoveQuizQuestion(token: string, quizId: number, questionId: number, newPosition: number) {
  const res = request('PUT', SERVER_URL + '/v1/admin/quiz/' + quizId + '/question/' + questionId + '/move',
    {
      json: {
        token: token,
        newPosition: newPosition
      }
    });

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testDupQuizQuestion(token: string, quizId: number, questionId: number) {
  const res = request('POST', `${SERVER_URL}/v2/admin/quiz/${quizId}/question/${questionId}/duplicate`, {
    headers: {
      token: token,
    }
  });

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testGameSessionStart(token: string, quizId: number, autoStartNum: number) {
  const res = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizId}/session/start`, {
    headers: {
      token: token,
    },
    json: {
      autoStartNum: autoStartNum
    }
  });

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testGameSessionUpdate(token: string, quizId: number, gameSessionId: number, action: string) {
  const res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quizId}/session/${gameSessionId}`, {
    headers: {
      token: token,
    },
    json: {
      action: action
    }
  });

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testGetGameStatus(token: string, quizId: number, gameSessionId: number) {
  const res = request('GET', `${SERVER_URL}/v1/admin/quiz/${quizId}/session/${gameSessionId}`, {
    headers: {
      token: token,
    },
  });

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testPlayerJoin(sessionId: number, name: string) {
  const res = request('POST', SERVER_URL + playerV1 + 'join', {
    json: {
      sessionId: sessionId,
      name: name
    },
  });

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testRandomName(name : string) {
  if (name.length !== 8) {
    return false;
  }

  const existedCharacter: Array<string> = [];
  const existedNumber: Array<number> = [];

  for (let i = 0; i < name.length; i++) {
    // From index 0 to 5
    if (i < 5) {
      // Check for existed and is not a number
      if (!existedCharacter.includes(name[i]) && isNaN(parseInt(name[i]))) {
        existedCharacter.push(name[i]);
      } else {
        return false;
      }
    } else { // For index 5 to 7
      // Check for existed and is a number
      if (!existedNumber.includes(parseInt(name[i])) && !isNaN(parseInt(name[i]))) {
        existedNumber.push(parseInt(name[i]));
      } else {
        return false;
      }
    }
  }

  return true;
}

export function testPlayerStatus(playerId: number) {
  const res = request('GET', SERVER_URL + playerV1 + playerId);
  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testUpdateQuizThumbnail(token: string, quizId: number, imgUrl: string) {
  const res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quizId}/thumbnail/`, {
    headers: {
      token: token,
    },
    json: {
      imgUrl: imgUrl,
    }
  });
  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testCurrentPlayerInfo(playerId: number, questionposition: number) {
  const res = request('GET', SERVER_URL + playerV1 + playerId + '/question/' + questionposition);
  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testGetChatMessages(playerId: number) {
  const res = request('GET', SERVER_URL + playerV1 + playerId + '/chat');
  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testSendChatMessages(playerId: number, messageBody: string) {
  const res = request('POST', SERVER_URL + playerV1 + playerId + '/chat', {
    json: {
      message: {
        messageBody: messageBody
      }
    }
  });
  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testPlayerSubmit(playerId: number, questionPosition: number, answerIds: number[]) {
  const res = request('PUT', SERVER_URL + playerV1 + playerId + `/question/${questionPosition}/answer`, {
    json: {
      answerIds: answerIds
    }
  });
  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testViewSessions(token: string, quizId: number) {
  const res = request('GET', SERVER_URL + `/v1/admin/quiz/${quizId}/sessions`, {
    headers: {
      token: token
    }
  });
  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testPlayerQuesResult(playerId: number, questionPosition: number) {
  const res = request('GET', SERVER_URL + playerV1 + playerId + `/question/${questionPosition}/results`);
  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}