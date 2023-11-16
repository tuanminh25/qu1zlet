import {
  testRegister,
  testCreateQuiz,
  testClear,
} from '../testHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  testClear();
});

describe('adminQuizCreate', () => {
  let user: { token: string; };

  beforeEach(() => {
    user = testRegister('testuser@example.com', 'password123', 'Test', 'User').response;
  });

  test('Successful quiz creation', () => {
    const quiz = testCreateQuiz(user.token, 'My Quiz Name', 'A description of my quiz');
    expect(quiz.status).toStrictEqual(200);
  });

  test('Successful quiz create with same name as quiz from another user', () => {
    const quiz = testCreateQuiz(user.token, 'My Quiz Name', 'A description of my quiz');
    const user2 = testRegister('testuser2@example.com', 'password321', 'User', 'Test').response;
    const quiz2 = testCreateQuiz(user2.token, 'My Quiz Name', 'A description of my quiz');
    expect(quiz.status).toStrictEqual(200);
    expect(quiz2.status).toStrictEqual(200);
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

  test('multiple quizzes should have different id', () => {
    const quiz1 = testCreateQuiz(user.token, 'Dogs', 'I like dogs');
    const quiz2 = testCreateQuiz(user.token, 'Cats', 'I like dogs');
    expect(quiz1.response.quizId).not.toEqual(quiz2.response.quizId);
  });

  test('error for duplicate names', () => {
    const quiz1 = testCreateQuiz(user.token, 'Dogs', 'I like cats');
    expect(quiz1.status).toStrictEqual(200);
    const quiz2 = testCreateQuiz(user.token, 'Dogs', 'I like dogs');
    expect(quiz2.response).toStrictEqual(ERROR);
    expect(quiz2.status).toStrictEqual(400);
  });

  test('Empty Quiz Name and Description', () => {
    const quiz = testCreateQuiz(user.token, '', '');
    expect(quiz.response).toStrictEqual(ERROR);
    expect(quiz.status).toStrictEqual(400);
  });

  test('Long Quiz Name and Description', () => {
    const longName = 'A'.repeat(31);
    const longDescription = 'B'.repeat(101);
    const quiz1 = testCreateQuiz(user.token, longName, 'A description');
    const quiz2 = testCreateQuiz(user.token, 'A valid name', longDescription);
    expect(quiz1.response).toStrictEqual(ERROR);
    expect(quiz2.response).toStrictEqual(ERROR);
    expect(quiz1.status).toStrictEqual(400);
    expect(quiz2.status).toStrictEqual(400);
  });

  test('Check 401 Error is Prioritized Over 400', () => {
    const invalidToken = user.token + 1;
    const emptyName = '';
    const quiz = testCreateQuiz(invalidToken, emptyName, 'A description of my quiz');
    expect(quiz.response).toStrictEqual(ERROR);
    expect(quiz.status).toStrictEqual(401);
  });
});

testClear();
