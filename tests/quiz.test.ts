import request from 'sync-request-curl';
import { port, url } from '../src/config.json';
import { testRegister } from './auth.test';

const SERVER_URL = `${url}:${port}`;
const auth = '/v1/admin/auth/'
const ERROR = { error: expect.any(String) };

const testClear = () => { request('DELETE', SERVER_URL + '/v1/clear') };

function testCreateQuiz(token: number, name: string, description: string) {
  const res = request('POST', SERVER_URL + '/v1/admin/quiz', {
    json: {
      token: token,
      name: name,
      description: description,
    },
  });

  return { response: JSON.parse(res.body.toString()), status: res.statusCode };
}

beforeEach(() => {
  testClear();
});

describe('/v1/admin/quiz', () => {
  let user: { token: number; };
  
  beforeEach(() => {
    const user = testRegister('testuser@example.com', 'password123', 'Test', 'User').response;
  });

  test('Successful quiz creation', () => {
    const quiz = testCreateQuiz(user.token, 'My Quiz Name', 'A description of my quiz');
    expect(quiz.response).toStrictEqual({
      quizId: expect.any(Number),
    });
    expect(quiz.status).toStrictEqual(200);
    // TODO: use other functions to check if working eg quizlist.
  });

  test.each([
    { a: 'Roger!', b: 'Duong' },
    { a: 'Roger%', b: 'Duong' },
    { a: 'R', b: 'Duong' },
    { a: 'Roge...r Roge', b: '' },
    { a: '', b: '' },
    { a: 'Roge! djnfdnn 1 !r', b: '' },
  ])('Invalid names : ($a, $b)', ({ a, b }) => {
    const quiz = testCreateQuiz(user.token, a, b);
    expect(quiz.response).toStrictEqual(ERROR);
  });

  test("multiple quizzes should have different id", () => {
    const quiz1 = testCreateQuiz(user.token, 'Dogs', 'I like dogs');
    const quiz2 = testCreateQuiz(user.token, 'Cats', 'I like dogs');
    expect(quiz1.response.quizId).not.toEqual(quiz2.response.quizId);
    expect(quiz2.status).toStrictEqual(400);
  });

  test("error for duplicate names", () => {
    testCreateQuiz(user.token, 'Dogs', 'I like cats');
    const quiz = testCreateQuiz(user.token, 'Dogs', 'I like dogs');
    expect(quiz.response).toStrictEqual(ERROR);
    expect(quiz.status).toStrictEqual(400);
  });
  test("Empty Quiz Name and Description", () => {
    const quiz = testCreateQuiz(user.token, '', '');
    expect(quiz.response).toStrictEqual(ERROR);
    expect(quiz.status).toStrictEqual(400);
  });
  
  test("Long Quiz Name and Description", () => {
    const longName = 'A'.repeat(31); 
    const longDescription = 'B'.repeat(101);
    const quiz1 = testCreateQuiz(user.token, longName, 'A description');
    const quiz2 = testCreateQuiz(user.token, 'A valid name', longDescription);
    expect(quiz1.response).toStrictEqual(ERROR);
    expect(quiz2.response).toStrictEqual(ERROR);
    expect(quiz1.status).toStrictEqual(400);
    expect(quiz2.status).toStrictEqual(400);
  });

  test("Check 400 Error is Prioritized Over 401", () => {
    const invalidToken = user.token + 1;
    const emptyName = '';
    const quiz = testCreateQuiz(invalidToken, emptyName, 'A description of my quiz');
    
    // Check first for 400 Error
    expect(quiz.response).toStrictEqual(ERROR);
    expect(quiz.status).toStrictEqual(400);
  
    // Then check for 401 Error with just the invalid token.
    const quizWithInvalidToken = testCreateQuiz(invalidToken, 'My Quiz Name', 'A description of my quiz');
    expect(quizWithInvalidToken.response).toStrictEqual(ERROR);
    expect(quizWithInvalidToken.status).toStrictEqual(401);
  });
});