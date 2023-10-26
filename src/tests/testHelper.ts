import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const auth = '/v1/admin/auth/';
const userUrl = '/v1/admin/user/';

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
  const res = request('POST', SERVER_URL + auth + 'logout',
    {
      json: {
        token: token
      }
    }
  );

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testGetDetails(token: string) {
  const res = request('GET', SERVER_URL + '/v1/admin/user/details',
    {
      qs: {
        token: token
      }
    }
  );

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testCreateQuiz(token: string, name: string, description: string) {
  const res = request('POST', SERVER_URL + '/v1/admin/quiz', {
    json: {
      token: token,
      name: name,
      description: description,
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
  const res = request('PUT', SERVER_URL + '/v1/admin/user/details', {
    json: {
      token: token,
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
  const res = request('PUT', SERVER_URL + userUrl + 'password',
    {
      json: {
        token: token,
        oldPassword: oldPassword,
        newPassword: newPassword
      }
    });

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

export function testQuizToTrash(token: string, quizId: number) {
  const res = request('DELETE', `${SERVER_URL}/v1/admin/quiz/${quizId}`, {
    qs: {
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
  const res = request('GET', `${SERVER_URL}/v1/admin/quiz/${quizId}`, {
    qs: {
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
  const res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quizId}/description`, {
    json: {
      token: token,
      description: description
    }
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
