import {
  testRegister,
  testCreateQuiz,
  testCreateQuizQuestion,
  testClear,
  testMoveQuizQuestion,
  testQuestionsList,
  testDupQuizQuestion
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
      { answer: 'Rome', correct: false }]
  };

  const validQuestion1 = {
    question: 'What is the capital of Spain?',
    duration: 4,
    points: 5,
    answers: [{ answer: 'Berlin', correct: false },
      { answer: 'Madrid', correct: false },
      { answer: 'Paris', correct: true },
      { answer: 'Rome', correct: false }]
  };

  const validQuestion2 = {
    question: 'What is the capital of Brazil?',
    duration: 4,
    points: 5,
    answers: [{ answer: 'Berlin', correct: false },
      { answer: 'Madrid', correct: false },
      { answer: 'Paris', correct: true },
      { answer: 'Rome', correct: false }]
  };

  const validQuestion3 = {
    question: 'What is the capital of Vietnam?',
    duration: 4,
    points: 5,
    answers: [{ answer: 'Berlin', correct: false },
      { answer: 'Madrid', correct: false },
      { answer: 'Paris', correct: true },
      { answer: 'Rome', correct: false }]
  };

  const validQuestion4 = {
    question: 'What is the capital of China?',
    duration: 4,
    points: 5,
    answers: [{ answer: 'Berlin', correct: false },
      { answer: 'Madrid', correct: false },
      { answer: 'Paris', correct: true },
      { answer: 'Rome', correct: false }]
  };

  // Additional support test question
  test('Question List test', () => {
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

    const list = testQuestionsList(user1.token, quiz1.quizId);
    expect(list.response).toStrictEqual([
      {
        question: 'What is the capital of France?',
        questionId: 1
      },
      {
        question: 'What is the capital of Spain?',
        questionId: 2
      },
      {
        question: 'What is the capital of Brazil?',
        questionId: 3
      },
      {
        question: 'What is the capital of Vietnam?',
        questionId: 4
      },
      {
        question: 'What is the capital of China?',
        questionId: 5
      }
    ]);
  });

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

      const list = testQuestionsList(user1.token, quiz1.quizId);
      expect(list.response).toStrictEqual([
        {
          question: 'What is the capital of France?',
          questionId: 1
        },
        {
          question: 'What is the capital of Spain?',
          questionId: 2
        },
        {
          question: 'What is the capital of Brazil?',
          questionId: 3
        },
        {
          question: 'What is the capital of China?',
          questionId: 5
        },
        {
          question: 'What is the capital of Vietnam?',
          questionId: 4
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

      const list = testQuestionsList(user1.token, quiz1.quizId);
      expect(list.response).toStrictEqual([
        {
          question: 'What is the capital of Brazil?',
          questionId: 3
        },
        {
          question: 'What is the capital of Spain?',
          questionId: 2
        },

        {
          question: 'What is the capital of China?',
          questionId: 5
        },
        {
          question: 'What is the capital of Vietnam?',
          questionId: 4
        }, {
          question: 'What is the capital of France?',
          questionId: 1
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
      expect(res.response).toStrictEqual({ error: 'Question Id does not refer to a valid question within this quiz: ' + (question4.questionId + 10) });
      expect(res.status).toStrictEqual(400);
    });

    // NewPosition is less than 0,
    test('NewPosition is less than 0, or NewPosition is greater than n-1 where n is the number of questions', () => {
      const res = testMoveQuizQuestion(user1.token, quiz1.quizId, question4.questionId, 10);
      expect(res.response).toStrictEqual({ error: 'NewPosition is less than 0, or NewPosition is greater than n-1 where n is the number of questions: ' + 10 });
      expect(res.status).toStrictEqual(400);
    });

    // or NewPosition is greater than n-1 where n is the number of questions
    test('NewPosition is less than 0, or NewPosition is greater than n-1 where n is the number of questions', () => {
      const res = testMoveQuizQuestion(user1.token, quiz1.quizId, question4.questionId, -10);
      expect(res.response).toStrictEqual({ error: 'NewPosition is less than 0, or NewPosition is greater than n-1 where n is the number of questions: ' + -10 });
      expect(res.status).toStrictEqual(400);
    });

    // NewPosition is the position of the current question
    test('NewPosition is the position of the current question', () => {
      const res = testMoveQuizQuestion(user1.token, quiz1.quizId, question4.questionId, 4);
      expect(res.response).toStrictEqual({ error: 'NewPosition is the position of the current question: ' + 4 });
      expect(res.status).toStrictEqual(400);
    });

    // 401
    // Token is empty or invalid (does not refer to valid logged in user session)
    // Invalid
    test('Token is empty or invalid', () => {
      const res = testMoveQuizQuestion(user1.token + 10000, quiz1.quizId, question4.questionId, 3);
      expect(res.response).toStrictEqual({ error: 'Token is empty or invalid' });
      expect(res.status).toStrictEqual(401);
    });

    // Empty
    test('Token is empty or invalid', () => {
      const res = testMoveQuizQuestion('', quiz1.quizId, question4.questionId, 3);
      expect(res.response).toStrictEqual({ error: 'Token is empty or invalid' });
      expect(res.status).toStrictEqual(401);
    });

    // 403
    // Valid token is provided, but user is not an owner of this quiz
    test('Valid token is provided, but user is not an owner of this quiz', () => {
      const res = testMoveQuizQuestion(user2.token, quiz1.quizId, question4.questionId, 3);
      expect(res.response).toStrictEqual({ error: 'Valid token is provided, but user is not an owner of this quiz' });
      expect(res.status).toStrictEqual(403);
    });

    // Valid token is provided, quiz does not exist
    test('Valid token is provided, quiz does not exist', () => {
      const res = testMoveQuizQuestion(user1.token, 100, question4.questionId, 3);
      expect(res.response).toStrictEqual({ error: 'Valid token is provided, quiz does not exist: ' + 100 });
      expect(res.status).toStrictEqual(403);
    });
  });
});



describe.only("Duplicate Quiz Question", () => {
  let user1: { token: string };
  let user2: { token: string };
  let quiz1: { quizId: number };
  let quiz2: { quizId: number };
  let errorQuiz: {quizId: 100};


  let question0: {questionId: number};
  let question1: {questionId: number};
  let question2: {questionId: number};
  let question3: {questionId: number};
  let question4: {questionId: number};


  const validQuestion0 = {
    question: 'What is the capital of France?',
    duration: 4,
    points: 5,
    answers: [     { answer: 'Berlin', correct: false },
    { answer: 'Madrid', correct: false },
    { answer: 'Paris', correct: true },
    { answer: 'Rome', correct: false }]
  };


  const validQuestion1 = {
    question: 'What is the capital of Spain?',
    duration: 4,
    points: 5,
    answers: [     { answer: 'Berlin', correct: false },
    { answer: 'Madrid', correct: false },
    { answer: 'Paris', correct: true },
    { answer: 'Rome', correct: false }]
  };


  const validQuestion2 = {
    question: 'What is the capital of Brazil?',
    duration: 4,
    points: 5,
    answers: [     { answer: 'Berlin', correct: false },
    { answer: 'Madrid', correct: false },
    { answer: 'Paris', correct: true },
    { answer: 'Rome', correct: false }]
  };


  const validQuestion3 = {
    question: 'What is the capital of Vietnam?',
    duration: 4,
    points: 5,
    answers: [     { answer: 'Berlin', correct: false },
    { answer: 'Madrid', correct: false },
    { answer: 'Paris', correct: true },
    { answer: 'Rome', correct: false }]
  };


  const validQuestion4 = {
    question: 'What is the capital of China?',
    duration: 4,
    points: 5,
    answers: [     { answer: 'Berlin', correct: false },
    { answer: 'Madrid', correct: false },
    { answer: 'Paris', correct: true },
    { answer: 'Rome', correct: false }]
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


    // Second person
    quiz2 = testCreateQuiz(user1.token, 'Quiz by Hayden', '').response;
  })


  // Working cases
  // 200
  // return new question id of the new dup id
  test("Succesfully duplicate 1 question", () => {
    // Duplicate mid
    const res = testDupQuizQuestion(user1.token, quiz1.quizId, question2.questionId);
    // expect(res.response).toStrictEqual({newQuestionId: 6})
    expect(res.status).toStrictEqual(200);


    const list = testQuestionsList(user1.token, quiz1.quizId);
    expect(list.response).toStrictEqual([
      {
        question: 'What is the capital of France?',
        questionId: 1
      },
      {
        question: 'What is the capital of Spain?',
        questionId: 2
      },
      {
        question: 'What is the capital of Brazil?',
        questionId: 3
      },
      {
        question: 'What is the capital of Vietnam?',
        questionId: 4
      },
      {
        question: 'What is the capital of China?',
        questionId: 5
      },
      {
        question: 'What is the capital of Brazil?',
        questionId: 6
      },
    ])
  })


 // Succesfully move many ques
 test("Succesfully duplicates many questions", () => {
  // Dup last
  const res1 = testDupQuizQuestion(user1.token, quiz1.quizId, question4.questionId);
  expect(res1.response).toStrictEqual({newQuestionId: 5})
  expect(res1.status).toStrictEqual(200);


  // Dup 3rd
  const res2 = testDupQuizQuestion(user1.token, quiz1.quizId, question2.questionId);
  expect(res2.response).toStrictEqual({newQuestionId: 6})
  expect(res2.status).toStrictEqual(200);


  // Dup first
  const res3 = testDupQuizQuestion(user1.token, quiz1.quizId, question0.questionId);
  expect(res3.response).toStrictEqual({newQuestionId: 7})
  expect(res3.status).toStrictEqual(200);


  const list = testQuestionsList(user1.token, quiz1.quizId);
  expect(list.response).toStrictEqual([
    {
      question: 'What is the capital of France?',
      questionId: 1
    },
    {
      question: 'What is the capital of Spain?',
      questionId: 2
    },
    {
      question: 'What is the capital of Brazil?',
      questionId: 3
    },
    {
      question: 'What is the capital of Vietnam?',
      questionId: 4
    },
    {
      question: 'What is the capital of China?',
      questionId: 5
    },
    {
      question: 'What is the capital of China?',
      questionId: 6
    },
    {
      question: 'What is the capital of Brazil?',
      questionId: 7
    },
    {
      question: 'What is the capital of France?',
      questionId: 8
    },
  ])
})














  // Error cases
  // 400:
  // Question Id does not refer to a valid question within this quiz
  test("Question Id does not refer to a valid question within this quiz", () => {
    const res = testDupQuizQuestion(user1.token, quiz1.quizId, question4.questionId + 10);
    expect(res.response).toStrictEqual({error: "Question Id does not refer to a valid question within this quiz: " + (question4.questionId + 10)})
    expect(res.status).toStrictEqual(400);
  })


  // 401:
  // Token is empty or invalid (does not refer to valid logged in user session)
  // Invalid
  test("Token is empty or invalid", () => {
    const res = testDupQuizQuestion(user1.token + 10000, quiz1.quizId, question4.questionId);
    expect(res.response).toStrictEqual({error: "Token is empty or invalid"})
    expect(res.status).toStrictEqual(401);
  })


  // Empty
  test("Token is empty or invalid", () => {
    const res = testDupQuizQuestion('', quiz1.quizId, question4.questionId);
    expect(res.response).toStrictEqual({error: "Token is empty or invalid"})
    expect(res.status).toStrictEqual(401);
  })


  // 403
  // Valid token is provided, but user is not an owner of this quiz
  test("Valid token is provided, but user is not an owner of this quiz", () => {
    const res = testDupQuizQuestion(user2.token, quiz1.quizId, question4.questionId);
    expect(res.response).toStrictEqual({error: "Valid token is provided, but user is not an owner of this quiz"});
    expect(res.status).toStrictEqual(403);
  })


  // Valid token is provided, quiz does not exist
  test("Valid token is provided, quiz does not exist", () => {
    const res = testDupQuizQuestion(user1.token, 100 , question4.questionId);
    expect(res.response).toStrictEqual({error: "Valid token is provided, quiz does not exist: " + 100});
    expect(res.status).toStrictEqual(403);
  })


})


testClear();
