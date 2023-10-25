import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const auth = '/v1/admin/auth/';

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

export const testClear = () => { request('DELETE', SERVER_URL + '/v1/clear'); };

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

export function testCreateQuizQuestion(token: string, quizId: number, questionBody: object) {
  const res = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizId}/question`, {
    json: {
      token: token,
      questionBody: questionBody
    },
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
