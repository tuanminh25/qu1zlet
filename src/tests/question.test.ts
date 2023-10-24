import request from 'sync-request-curl';
import { port, url } from '../config.json';
import { testRegister } from './auth.test';
import { testCreateQuiz } from './quiz.test';

const SERVER_URL = `${url}:${port}`;
const ERROR = { error: expect.any(String) };

const testClear = () => { request('DELETE', SERVER_URL + '/v1/clear') };

export function testCreateQuizQuestion(token: string, quizId: number, body: object) {
    const res = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizId}/question`, {
      json: {
        token: token,
        ...body
      },
    });
  
    return { response: JSON.parse(res.body.toString()), status: res.statusCode };
  }

describe('/v1/admin/quiz/{quizid}/question', () => {
  let user: { token: string; };
  let quiz: { quizId: number; };

  beforeEach(() => {
      testClear();
      user = testRegister('testuser@example.com', 'password123', 'Test', 'User').response;
      quiz = testCreateQuiz(user.token, 'Sample Quiz', 'Sample Description').response;
  });

  test('Successfully create quiz question', () => {
    const question = testCreateQuizQuestion(user.token, quiz.quizId, {
    questionBody: {
      question: 'What is the capital of France?',
      duration: 4,
      points: 5,
      answers: [
      { answer: 'Berlin', correct: false },
      { answer: 'Madrid', correct: false },
      { answer: 'Paris', correct: true },
      { answer: 'Rome', correct: false }
      ]
    }
    });
    expect(question.response).toHaveProperty('questionId');
    expect(question.status).toBe(200);
  });

  test('Invalid question string length', () => {
    const question = testCreateQuizQuestion(user.token, quiz.quizId, {
      questionBody: {
        question: 'Who?',
        duration: 4,
        points: 5,
        answers: [
        { answer: 'A', correct: true },
        { answer: 'B', correct: false }
        ]
      }
    });
    expect(question.response).toStrictEqual(ERROR);
    expect(question.status).toBe(400);
  });

  test('Too many answers', () => {
    const question = testCreateQuizQuestion(user.token, quiz.quizId, {
      questionBody: {
        question: 'Which of the following are prime numbers?',
        duration: 4,
        points: 5,
        answers: [
        { answer: '2', correct: true },
        { answer: '3', correct: true },
        { answer: '4', correct: false },
        { answer: '5', correct: true },
        { answer: '6', correct: false },
        { answer: '7', correct: true },
        { answer: '8', correct: false },
        ]
    }
    });
    expect(question.response).toStrictEqual(ERROR);
    expect(question.status).toBe(400);
  });
});
