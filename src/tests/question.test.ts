import { Question, User } from '../helper';
import {
  testRegister,
  testCreateQuiz,
  testCreateQuizQuestion,
  testClear,
  testMoveQuizQuestion
} from './testHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  testClear();
});

describe('/v1/admin/quiz/{quizid}/question', () => {
  let user: { token: string; };
  let quiz: { quizId: number; };
  const validQuestion = {
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

  beforeEach(() => {
    user = testRegister('testuser@example.com', 'password123', 'Test', 'User').response;
    quiz = testCreateQuiz(user.token, 'Sample Quiz', 'Sample Description').response;
  });

  test('Successfully create quiz question', () => {
    const question = testCreateQuizQuestion(user.token, quiz.quizId, validQuestion);
    expect(question.response).toHaveProperty('questionId');
    expect(question.status).toBe(200);
  });

  test('Invalid question string length', () => {
    const question = testCreateQuizQuestion(user.token, quiz.quizId, {
      question: 'Who?',
      duration: 4,
      points: 5,
      answers: [
        { answer: 'A', correct: true },
        { answer: 'B', correct: false }
      ]
    });
    expect(question.response).toStrictEqual(ERROR);
    expect(question.status).toBe(400);
  });

  test('Too many answers', () => {
    const question = testCreateQuizQuestion(user.token, quiz.quizId, {
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
    });
    expect(question.response).toStrictEqual(ERROR);
    expect(question.status).toBe(400);
  });

  test('Invalid question duration', () => {
    const question = testCreateQuizQuestion(user.token, quiz.quizId, {
      question: 'What is 2 + 2?',
      duration: -4,
      points: 5,
      answers: [
        { answer: '4', correct: true },
        { answer: '5', correct: false }
      ]
    });
    expect(question.response).toStrictEqual(ERROR);
    expect(question.status).toBe(400);
  });

  test('Sum of question durations exceeds 3 minutes', () => {
    testCreateQuizQuestion(user.token, quiz.quizId, {
      question: 'Is three a number?',
      duration: 100,
      points: 5,
      answers: [
        { answer: 'Yes', correct: true },
        { answer: 'No', correct: false }
      ]
    });

    const finalQuestion = testCreateQuizQuestion(user.token, quiz.quizId, {
      question: 'Final question?',
      duration: 1000,
      points: 5,
      answers: [
        { answer: 'Yes', correct: true },
        { answer: 'No', correct: false }
      ]
    });
    expect(finalQuestion.response).toStrictEqual(ERROR);
    expect(finalQuestion.status).toBe(400);
  });

  test('Points awarded for the question are too low', () => {
    const question = testCreateQuizQuestion(user.token, quiz.quizId, {
      question: 'What is the capital of Spain?',
      duration: 5,
      points: 0,
      answers: [
        { answer: 'Madrid', correct: true },
        { answer: 'Barcelona', correct: false }
      ]
    });
    expect(question.response).toStrictEqual(ERROR);
    expect(question.status).toBe(400);
  });

  test('Answer string is too long', () => {
    const question = testCreateQuizQuestion(user.token, quiz.quizId, {
      question: 'What is the answer to this very long answer option?',
      duration: 5,
      points: 5,
      answers: [
        { answer: 'A'.repeat(31), correct: true }, // 31 characters long
        { answer: 'B', correct: false }
      ]
    });
    expect(question.response).toStrictEqual(ERROR);
    expect(question.status).toBe(400);
  });

  test('Duplicate answer strings', () => {
    const question = testCreateQuizQuestion(user.token, quiz.quizId, {
      question: 'Which of these are colors?',
      duration: 5,
      points: 5,
      answers: [
        { answer: 'Red', correct: true },
        { answer: 'Red', correct: false }
      ]
    });
    expect(question.response).toStrictEqual(ERROR);
    expect(question.status).toBe(400);
  });

  test('No correct answers provided', () => {
    const question = testCreateQuizQuestion(user.token, quiz.quizId, {
      question: 'Which of these are colors?',
      duration: 5,
      points: 5,
      answers: [
        { answer: 'Red', correct: false },
        { answer: 'Blue', correct: false }
      ]
    }
    );
    expect(question.response).toStrictEqual(ERROR);
    expect(question.status).toBe(400);
  });

  test('Question string is too long', () => {
    const question = testCreateQuizQuestion(user.token, quiz.quizId, {
      question: 'A'.repeat(51), // Creates a string with 51 "A" characters
      duration: 10,
      points: 5,
      answers: [
        { answer: 'Yes', correct: true },
        { answer: 'No', correct: false }
      ]
    });
    expect(question.response).toStrictEqual(ERROR);
    expect(question.status).toBe(400);
  });

  test('Empty token', () => {
    const question = testCreateQuizQuestion('', quiz.quizId, validQuestion);
    expect(question.response).toStrictEqual(ERROR);
    expect(question.status).toBe(401);
  });

  test('Invalid token', () => {
    const question = testCreateQuizQuestion('invalidTokenHere', quiz.quizId, validQuestion);
    expect(question.response).toStrictEqual(ERROR);
    expect(question.status).toBe(401);
  });

  test('Not an owner of the quiz', () => {
    const anotherUser = testRegister('anotheruser@example.com', 'password1234', 'Another', 'User').response;
    const question = testCreateQuizQuestion(anotherUser.token, quiz.quizId, validQuestion);
    expect(question.response).toStrictEqual(ERROR);
    expect(question.status).toBe(403);
  });

  test('Prioritise 401 error over 400', () => {
    const question = testCreateQuizQuestion('', 2384, validQuestion);
    expect(question.response).toStrictEqual(ERROR);
    expect(question.status).toBe(401);
  });

  test('Prioritise 403 error over 400', () => {
    const anotherUser = testRegister('anotheruser@example.com', 'password1234', 'Another', 'User').response;
    const question = testCreateQuizQuestion(anotherUser.token, quiz.quizId, validQuestion);
    expect(question.response).toStrictEqual(ERROR);
    expect(question.status).toBe(403);
  });
});

describe("Move A Quiz Question", () => {
  let user1: { token: string; };
  let user2: { token: string; };
  let quiz1: { quizId: number; };
  let quiz2: { quizId: number; };

  let question1: {questionId: number};
  let question2: {questionId: number};
  let question3: {questionId: number};
  let question4: {questionId: number};
  let question5: {questionId: number};

  const validQuestion1 = {
    question: 'What is the capital of France?',
    duration: 4,
    points: 5,
    answers: [{}]
  };

  const validQuestion2 = {
    question: 'What is the capital of Spain?',
    duration: 4,
    points: 5,
    answers: [{}]
  };

  const validQuestion3 = {
    question: 'What is the capital of Brazil?',
    duration: 4,
    points: 5,
    answers: [{}]
  };

  const validQuestion4 = {
    question: 'What is the capital of Vietnam?',
    duration: 4,
    points: 5,
    answers: [{}]
  };

  const validQuestion5 = {
    question: 'What is the capital of China?',
    duration: 4,
    points: 5,
    answers: [{}]
  };


  // Working cases
  describe("Working cases:", () => {
    beforeEach(() => {
      testClear();
      // First person
      user1 = testRegister('hayden.smith@unsw.edu.au', 'password1', 'nameFirst', 'nameLast').response;
      user2 = testRegister('jayden.smith@unsw.edu.au', 'password123', 'nameFirst', 'nameLast').response;

      quiz1 = testCreateQuiz(user1.token, 'Quiz by Hayden', '').response;
      question1 = testCreateQuizQuestion(user1.token, quiz1.quizId, validQuestion1).response;
      question2 = testCreateQuizQuestion(user1.token, quiz1.quizId, validQuestion2).response;
      question3 = testCreateQuizQuestion(user1.token, quiz1.quizId, validQuestion3).response;
      question4 = testCreateQuizQuestion(user1.token, quiz1.quizId, validQuestion4).response;
      question5 = testCreateQuizQuestion(user1.token, quiz1.quizId, validQuestion5).response;
      
      // Second person
      quiz2 = testCreateQuiz(user1.token, 'Quiz by Hayden', '').response;

    });

    // test("Succesfully move 1 ques")

    // test("Succesfully move many ques")

  })


  // Error cases:
  describe("Error cases:", () => {
    beforeEach(() => {
      testClear();
      // First person
      user1 = testRegister('hayden.smith@unsw.edu.au', 'password1', 'nameFirst', 'nameLast').response;
      user2 = testRegister('jayden.smith@unsw.edu.au', 'password123', 'nameFirst', 'nameLast').response;

      quiz1 = testCreateQuiz(user1.token, 'Quiz by Hayden', '').response;
      question1 = testCreateQuizQuestion(user1.token, quiz1.quizId, validQuestion1).response;
      question2 = testCreateQuizQuestion(user1.token, quiz1.quizId, validQuestion2).response;
      question3 = testCreateQuizQuestion(user1.token, quiz1.quizId, validQuestion3).response;
      question4 = testCreateQuizQuestion(user1.token, quiz1.quizId, validQuestion4).response;
      question5 = testCreateQuizQuestion(user1.token, quiz1.quizId, validQuestion5).response;

      // Second person
      quiz2 = testCreateQuiz(user1.token, 'Quiz by Hayden', '').response;

    })
 
    // 400
    // Question Id does not refer to a valid question within this quiz
    test("Question Id does not refer to a valid question within this quiz", () => {
      const res = testMoveQuizQuestion(user1.token, quiz1.quizId, question5.questionId + 10, 4);
      expect(res.response).toStrictEqual({error: "Question Id does not refer to a valid question within this quiz: " + question5.questionId})
      expect(res.status).toStrictEqual(400);
    })

    // NewPosition is less than 0, 
    test("NewPosition is less than 0, or NewPosition is greater than n-1 where n is the number of questions", () => {
      const res = testMoveQuizQuestion(user1.token, quiz1.quizId, question5.questionId, 10);
      expect(res.response).toStrictEqual({error: "NewPosition is less than 0, or NewPosition is greater than n-1 where n is the number of questions: " + 10})
      expect(res.status).toStrictEqual(400);
    })

    // or NewPosition is greater than n-1 where n is the number of questions
    test("NewPosition is less than 0, or NewPosition is greater than n-1 where n is the number of questions", () => {
      const res = testMoveQuizQuestion(user1.token, quiz1.quizId, question5.questionId, -10);
      expect(res.response).toStrictEqual({error: "NewPosition is less than 0, or NewPosition is greater than n-1 where n is the number of questions: " + -10})
      expect(res.status).toStrictEqual(400);
    })

    // NewPosition is the position of the current question
    test("NewPosition is the position of the current question", () => {
      const res = testMoveQuizQuestion(user1.token, quiz1.quizId, question5.questionId, 4);
      expect(res.response).toStrictEqual({error: "NewPosition is the position of the current question: " + 4})
      expect(res.status).toStrictEqual(400);
    })

    // 401
    // Token is empty or invalid (does not refer to valid logged in user session)
    // Invalid
    test("Token is empty or invalid", () => {
      const res = testMoveQuizQuestion(user1.token + 10000, quiz1.quizId, question5.questionId, 3);
      expect(res.response).toStrictEqual({error: "Token is empty or invalid"})
      expect(res.status).toStrictEqual(401);
    })

    // Empty
    test("Token is empty or invalid", () => {
      const res = testMoveQuizQuestion('', quiz1.quizId, question5.questionId, 3);
      expect(res.response).toStrictEqual({error: "Token is empty or invalid"})
      expect(res.status).toStrictEqual(401);
    })

    // 403
    // Valid token is provided, but user is not an owner of this quiz
    test("Valid token is provided, but user is not an owner of this quiz", () => {
      const res = testMoveQuizQuestion(user2.token, quiz1.quizId, question5.questionId, 3);
      expect(res.response).toStrictEqual({error: "Valid token is provided, but user is not an owner of this quiz"});
      expect(res.status).toStrictEqual(403);
    })

  })


})


testClear();
