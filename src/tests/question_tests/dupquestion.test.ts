import {
  testRegister,
  testCreateQuiz,
  testCreateQuizQuestion,
  testClear,
  testQuizInfo,
  testDupQuizQuestion,
} from '../testHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  testClear();
});

describe('Duplicate Quiz Question', () => {
  let user1: { token: string };
  let user2: { token: string };
  let quiz1: { quizId: number };

  let question0: {questionId: number};
  let question1: {questionId: number};
  let question2: {questionId: number};
  let question3: {questionId: number};
  let question4: {questionId: number};

  const validQuestion0 = {
    question: 'What is the capital of France?',
    duration: 4,
    points: 5,
    answers: [{ answer: 'Berlin', correct: false },
      { answer: 'Madrid', correct: false },
      { answer: 'Paris', correct: true },
      { answer: 'Rome', correct: false }],
    thumbnailUrl: 'http://example.com/image.jpg'
  };

  const validQuestion1 = {
    question: 'What is the capital of Spain?',
    duration: 4,
    points: 5,
    answers: [{ answer: 'Berlin', correct: false },
      { answer: 'Madrid', correct: false },
      { answer: 'Paris', correct: true },
      { answer: 'Rome', correct: false }],
    thumbnailUrl: 'http://example.com/image.jpg'
  };

  const validQuestion2 = {
    question: 'What is the capital of Brazil?',
    duration: 4,
    points: 5,
    answers: [{ answer: 'Berlin', correct: false },
      { answer: 'Madrid', correct: false },
      { answer: 'Paris', correct: true },
      { answer: 'Rome', correct: false }],
    thumbnailUrl: 'http://example.com/image.jpg'
  };

  const validQuestion3 = {
    question: 'What is the capital of Vietnam?',
    duration: 4,
    points: 5,
    answers: [{ answer: 'Berlin', correct: false },
      { answer: 'Madrid', correct: false },
      { answer: 'Paris', correct: true },
      { answer: 'Rome', correct: false }],
    thumbnailUrl: 'http://example.com/image.jpg'
  };

  const validQuestion4 = {
    question: 'What is the capital of China?',
    duration: 4,
    points: 5,
    answers: [{ answer: 'Berlin', correct: false },
      { answer: 'Madrid', correct: false },
      { answer: 'Paris', correct: true },
      { answer: 'Rome', correct: false }],
    thumbnailUrl: 'http://example.com/image.jpg'
  };

  beforeEach(() => {
    testClear();
    // First person
    user1 = testRegister('hayden.smith@unsw.edu.au', 'password1', 'nameFirst', 'nameLast').response;
    user2 = testRegister('jayden.smith@unsw.edu.au', 'password123', 'nameFirst', 'nameLast').response;

    quiz1 = testCreateQuiz(user1.token, 'Quiz by Hayden', '').response;
    question0 = testCreateQuizQuestion(user1.token, quiz1.quizId, validQuestion0).response;
    question1 = testCreateQuizQuestion(user1.token, quiz1.quizId, validQuestion1).response;
    question2 = testCreateQuizQuestion(user1.token, quiz1.quizId, validQuestion2).response;
    question3 = testCreateQuizQuestion(user1.token, quiz1.quizId, validQuestion3).response;
    question4 = testCreateQuizQuestion(user1.token, quiz1.quizId, validQuestion4).response;
  });

  // Working cases
  // 200
  // return new question id of the new dup id
  test('Succesfully duplicate 1 question', () => {
    // Duplicate mid
    const res = testDupQuizQuestion(user1.token, quiz1.quizId, question2.questionId);
    expect(res.response).toStrictEqual({ newQuestionId: 6 });
    expect(res.status).toStrictEqual(200);

    const info = testQuizInfo(user1.token, quiz1.quizId).response.questions;
    const list = [];
    for (const question of info) {
      list.push({
        questionId: question.questionId,
        question: question.question,
      });
    }
    expect(list).toStrictEqual([
      {
        question: 'What is the capital of France?',
        questionId: question0.questionId
      },
      {
        question: 'What is the capital of Spain?',
        questionId: question1.questionId
      },
      {
        question: 'What is the capital of Brazil?',
        questionId: question2.questionId
      },
      {
        question: 'What is the capital of Vietnam?',
        questionId: question3.questionId
      },
      {
        question: 'What is the capital of China?',
        questionId: question4.questionId
      },
      {
        question: 'What is the capital of Brazil?',
        questionId: res.response.newQuestionId
      },
    ]);
  });

  // Succesfully move many ques
  test('Succesfully duplicates many questions', () => {
    // Dup last
    const res1 = testDupQuizQuestion(user1.token, quiz1.quizId, question4.questionId);
    expect(res1.response).toStrictEqual({ newQuestionId: 6 });
    expect(res1.status).toStrictEqual(200);

    // Dup 3rd
    const res2 = testDupQuizQuestion(user1.token, quiz1.quizId, question2.questionId);
    expect(res2.response).toStrictEqual({ newQuestionId: 7 });
    expect(res2.status).toStrictEqual(200);

    // Dup first
    const res3 = testDupQuizQuestion(user1.token, quiz1.quizId, question0.questionId);
    expect(res3.response).toStrictEqual({ newQuestionId: 8 });
    expect(res3.status).toStrictEqual(200);

    const info = testQuizInfo(user1.token, quiz1.quizId).response.questions;
    const list = [];
    for (const question of info) {
      list.push({
        questionId: question.questionId,
        question: question.question,
      });
    }
    expect(list).toStrictEqual([
      {
        question: 'What is the capital of France?',
        questionId: question0.questionId
      },
      {
        question: 'What is the capital of Spain?',
        questionId: question1.questionId
      },
      {
        question: 'What is the capital of Brazil?',
        questionId: question2.questionId
      },
      {
        question: 'What is the capital of Vietnam?',
        questionId: question3.questionId
      },
      {
        question: 'What is the capital of China?',
        questionId: question4.questionId
      },
      {
        question: 'What is the capital of China?',
        questionId: res1.response.newQuestionId
      },
      {
        question: 'What is the capital of Brazil?',
        questionId: res2.response.newQuestionId
      },
      {
        question: 'What is the capital of France?',
        questionId: res3.response.newQuestionId
      },
    ]);
  });

  // Error cases
  // 400:
  // Question Id does not refer to a valid question within this quiz
  test('Question Id does not refer to a valid question within this quiz', () => {
    const res = testDupQuizQuestion(user1.token, quiz1.quizId, question4.questionId + 10);
    expect(res.response).toStrictEqual(ERROR);
    expect(res.status).toStrictEqual(400);
  });

  // 401:
  // Token is empty or invalid (does not refer to valid logged in user session)
  // Invalid
  test('Token is empty or invalid', () => {
    const res = testDupQuizQuestion(user1.token + 10000, quiz1.quizId, question4.questionId);
    expect(res.response).toStrictEqual(ERROR);
    expect(res.status).toStrictEqual(401);
  });

  // Empty
  test('Token is empty or invalid', () => {
    const res = testDupQuizQuestion('', quiz1.quizId, question4.questionId);
    expect(res.response).toStrictEqual(ERROR);
    expect(res.status).toStrictEqual(401);
  });

  // 403
  // Valid token is provided, but user is not an owner of this quiz
  test('Valid token is provided, but user is not an owner of this quiz', () => {
    const res = testDupQuizQuestion(user2.token, quiz1.quizId, question4.questionId);
    expect(res.response).toStrictEqual(ERROR);
    expect(res.status).toStrictEqual(403);
  });

  // Valid token is provided, quiz does not exist
  test('Valid token is provided, quiz does not exist', () => {
    const res = testDupQuizQuestion(user1.token, 100, question4.questionId);
    expect(res.response).toStrictEqual(ERROR);
    expect(res.status).toStrictEqual(403);
  });
});

testClear();
