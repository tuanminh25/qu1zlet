import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const auth = '/v1/admin/auth/';
const authv2 = '/v2/admin/auth/';
const userUrlv2 = '/v2/admin/user/';
const adminQuizUrlV2 = '/v2/admin/quiz/';

export const validQuestion = {
  question: 'What is the capital of France?',
  duration: 4,
  points: 5,
  answers: [
    { answer: 'Berlin', correct: false },
    { answer: 'Madrid', correct: false },
    { answer: 'Paris', correct: true },
    { answer: 'Rome', correct: false }
  ]
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
  ]
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
  ]
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
  const res = request('GET', `${SERVER_URL}/v1/admin/quiz/list`, { qs: { token: token } });
  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
};

export function testCreateQuizQuestion(token: string, quizId: number, questionBody: object) {
  const res = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizId}/question`, {
    json: {
      token: token,
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
  const res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quizId}/question/${questionId}`,
    {
      json: {
        token: token,
        questionBody: questionBody
      }
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
  const res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quizId}/name`, {
    json: {
      token: token,
      name: name
    }
  });

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testQuizTransfer(token: string, quizId: number, userEmail: string) {
  const res = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizId}/transfer`, {
    json: {
      token: token,
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
  const res = request('DELETE', `${SERVER_URL}/v1/admin/quiz/${quizId}/question/${questionId}`, {
    qs: {
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
  const res = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizId}/restore`, {
    json: {
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
  const res = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`, {
    json: {
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
