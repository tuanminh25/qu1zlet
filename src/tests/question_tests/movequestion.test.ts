import {
  testRegister,
  testCreateQuiz,
  testCreateQuizQuestion,
  testClear,
  testQuizInfo,
  testMoveQuizQuestion,
} from '../testHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  testClear();
});

describe('Move A Quiz Question', () => {
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

  // Working cases
  describe('Working cases:', () => {
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

    // Succesfully move 1 question
    test('Succesfully move 1 question', () => {
      const res = testMoveQuizQuestion(user1.token, quiz1.quizId, question4.questionId, 3);
      expect(res.response).toStrictEqual({});
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
          question: 'What is the capital of China?',
          questionId: question4.questionId
        },
        {
          question: 'What is the capital of Vietnam?',
          questionId: question3.questionId
        }
      ]);
    });

    // Succesfully move many ques
    test('Succesfully move many questions', () => {
      // China to position 3
      const res1 = testMoveQuizQuestion(user1.token, quiz1.quizId, question4.questionId, 3);
      expect(res1.response).toStrictEqual({});
      expect(res1.status).toStrictEqual(200);

      // Brazil to position 0
      const res2 = testMoveQuizQuestion(user1.token, quiz1.quizId, question2.questionId, 0);
      expect(res2.response).toStrictEqual({});
      expect(res2.status).toStrictEqual(200);

      // France to position 4
      const res3 = testMoveQuizQuestion(user1.token, quiz1.quizId, question0.questionId, 4);
      expect(res3.response).toStrictEqual({});
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
          question: 'What is the capital of Brazil?',
          questionId: question2.questionId
        },
        {
          question: 'What is the capital of Spain?',
          questionId: question1.questionId
        },

        {
          question: 'What is the capital of China?',
          questionId: question4.questionId
        },
        {
          question: 'What is the capital of Vietnam?',
          questionId: question3.questionId
        }, {
          question: 'What is the capital of France?',
          questionId: question0.questionId
        },

      ]);
    });
  });

  // Error cases:
  describe('Error cases:', () => {
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

    // 400
    // Question Id does not refer to a valid question within this quiz
    test('Question Id does not refer to a valid question within this quiz', () => {
      const res = testMoveQuizQuestion(user1.token, quiz1.quizId, question4.questionId + 10, 4);
      expect(res.response).toStrictEqual(ERROR);
      expect(res.status).toStrictEqual(400);
    });

    // NewPosition is less than 0,
    test('NewPosition is less than 0, or NewPosition is greater than n-1 where n is the number of questions', () => {
      const res = testMoveQuizQuestion(user1.token, quiz1.quizId, question4.questionId, 10);
      expect(res.response).toStrictEqual(ERROR);
      expect(res.status).toStrictEqual(400);
    });

    // or NewPosition is greater than n-1 where n is the number of questions
    test('NewPosition is less than 0, or NewPosition is greater than n-1 where n is the number of questions', () => {
      const res = testMoveQuizQuestion(user1.token, quiz1.quizId, question4.questionId, -10);
      expect(res.response).toStrictEqual(ERROR);
      expect(res.status).toStrictEqual(400);
    });

    // NewPosition is the position of the current question
    test('NewPosition is the position of the current question', () => {
      const res = testMoveQuizQuestion(user1.token, quiz1.quizId, question4.questionId, 4);
      expect(res.response).toStrictEqual(ERROR);
      expect(res.status).toStrictEqual(400);
    });

    // 401
    // Token is empty or invalid (does not refer to valid logged in user session)
    // Invalid
    test('Token is empty or invalid', () => {
      const res = testMoveQuizQuestion(user1.token + 10000, quiz1.quizId, question4.questionId, 3);
      expect(res.response).toStrictEqual(ERROR);
      expect(res.status).toStrictEqual(401);
    });

    // Empty
    test('Token is empty or invalid', () => {
      const res = testMoveQuizQuestion('', quiz1.quizId, question4.questionId, 3);
      expect(res.response).toStrictEqual(ERROR);
      expect(res.status).toStrictEqual(401);
    });

    // 403
    // Valid token is provided, but user is not an owner of this quiz
    test('Valid token is provided, but user is not an owner of this quiz', () => {
      const res = testMoveQuizQuestion(user2.token, quiz1.quizId, question4.questionId, 3);
      expect(res.response).toStrictEqual(ERROR);
      expect(res.status).toStrictEqual(403);
    });

    // Valid token is provided, quiz does not exist
    test('Valid token is provided, quiz does not exist', () => {
      const res = testMoveQuizQuestion(user1.token, 100, question4.questionId, 3);
      expect(res.response).toStrictEqual(ERROR);
      expect(res.status).toStrictEqual(403);
    });
  });
});

testClear();
