import {
  testRegister,
  testCreateQuiz,
  testCreateQuizQuestion,
  testClear,
  testUpdateQuestion,
  testQuizInfo,
  testQuestionDelete,
  testMoveQuizQuestion,
  testDupQuizQuestion,
  testCurrentPlayerInfo,
  testPlayerJoin,
  testGameSessionStart,
  testGameSessionUpdate
} from './testHelper';

const ERROR = { error: expect.any(String) };

function sleepSync(ms: number) {
  const startTime = new Date().getTime();
  while (new Date().getTime() - startTime < ms) {
    // zzzZZ - comment needed so eslint doesn't complain
  }
}

beforeEach(() => {
  testClear();
});

describe('UpdateQuizQuestion', () => {
  let user: { token: string; };
  let quiz: { quizId: number; };
  let question: { questionId: number; };
  const validQuestionUpdate = {
    question: 'What is the capital of Spain?',
    duration: 4,
    points: 5,
    answers: [
      { answer: 'Berlin', correct: false },
      { answer: 'Madrid', correct: true },
      { answer: 'Paris', correct: false },
      { answer: 'Rome', correct: false }
    ],
    thumbnailUrl: 'http://example.com/image.jpg'
  };

  const footballQues = {
    question: 'England teams',
    duration: 10,
    points: 5,
    answers: [
      { answer: 'Madrid', correct: false },
      { answer: 'Barcelona', correct: false },
      { answer: 'Arsenal', correct: true },
      { answer: 'Bayern', correct: false }
    ],
    thumbnailUrl: 'http://example.com/image.jpg'
  };

  const leagueQues = {
    question: 'Champions',
    duration: 15,
    points: 5,
    answers: [
      { answer: 'jayce', correct: false },
      { answer: 'tristana', correct: false },
      { answer: 'lulu', correct: false },
      { answer: 'leblanc', correct: true }
    ],
    thumbnailUrl: 'http://example.com/image.jpg'
  };

  beforeEach(() => {
    user = testRegister('testuser@example.com', 'password123', 'Test', 'User').response;
    quiz = testCreateQuiz(user.token, 'Sample Quiz', 'Sample Description').response;
    question = testCreateQuizQuestion(user.token, quiz.quizId, validQuestionUpdate).response;
  });

  const edgeCases = [
    {
      description: 'Question string is too short',
      update: { ...validQuestionUpdate, question: 'Who?' }
    },
    {
      description: 'Question string is too long',
      update: { ...validQuestionUpdate, question: 'A'.repeat(51) }
    },
    {
      description: 'Too few answers',
      update: { ...validQuestionUpdate, answers: [{ answer: 'Yes', correct: true }] }
    },
    {
      description: 'Too many answers',
      update: {
        ...validQuestionUpdate,
        answers: new Array(7).fill(0).map((_, idx) => ({ answer: `Answer ${idx}`, correct: idx === 0 }))
      }
    },
    {
      description: 'Negative question duration',
      update: { ...validQuestionUpdate, duration: -4 }
    },
    {
      description: 'Invalid points (too low)',
      update: { ...validQuestionUpdate, points: 0 }
    },
    {
      description: 'Invalid points (too high)',
      update: { ...validQuestionUpdate, points: 11 }
    },
    {
      description: 'Short answer string',
      update: {
        ...validQuestionUpdate,
        answers: [{ answer: '', correct: true }, { answer: 'No', correct: false }]
      }
    },
    {
      description: 'Long answer string',
      update: {
        ...validQuestionUpdate,
        answers: [{ answer: 'A'.repeat(31), correct: true }, { answer: 'B', correct: false }]
      }
    },
    {
      description: 'Duplicate answer strings',
      update: {
        ...validQuestionUpdate,
        answers: [{ answer: 'Yes', correct: true }, { answer: 'Yes', correct: false }]
      }
    }
  ];

  edgeCases.forEach(edgeCase => {
    test(edgeCase.description, () => {
      const updatedQuestion = testUpdateQuestion(user.token, quiz.quizId, question.questionId, edgeCase.update);
      expect(updatedQuestion.response).toStrictEqual(ERROR);
      expect(updatedQuestion.status).toBe(400);
    });
  });

  test('Empty token', () => {
    const updatedQuestion = testUpdateQuestion('', quiz.quizId, question.questionId, validQuestionUpdate);
    expect(updatedQuestion.response).toStrictEqual(ERROR);
    expect(updatedQuestion.status).toBe(401);
  });

  test('Invalid token', () => {
    const updatedQuestion = testUpdateQuestion('invalidTokenHere', quiz.quizId, question.questionId, validQuestionUpdate);
    expect(updatedQuestion.response).toStrictEqual(ERROR);
    expect(updatedQuestion.status).toBe(401);
  });

  test('Not an owner of the quiz', () => {
    const anotherUser = testRegister('anotheruser@example.com', 'password1234', 'Another', 'User').response;
    const updatedQuestion = testUpdateQuestion(anotherUser.token, quiz.quizId, question.questionId, validQuestionUpdate);
    expect(updatedQuestion.response).toStrictEqual(ERROR);
    expect(updatedQuestion.status).toBe(403);
  });

  test('Successfully update a question and verify using quiz info', () => {
    const initial = testQuizInfo(user.token, quiz.quizId);
    expect(initial.response).toStrictEqual({
      quizId: question.questionId,
      name: 'Sample Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Sample Description',
      numQuestions: 1,
      questions: [
        {
          questionId: question.questionId,
          question: 'What is the capital of Spain?',
          thumbnailUrl: 'http://example.com/image.jpg',
          duration: 4,
          points: 5,
          answers: [
            {
              answerId: expect.any(Number),
              answer: 'Berlin',
              colour: expect.any(String),
              correct: false
            },
            {
              answerId: expect.any(Number),
              answer: 'Madrid',
              colour: expect.any(String),
              correct: true
            },
            {
              answerId: expect.any(Number),
              answer: 'Paris',
              colour: expect.any(String),
              correct: false
            },
            {
              answerId: expect.any(Number),
              answer: 'Rome',
              colour: expect.any(String),
              correct: false
            },
          ]
        }
      ],
      duration: 4,
      thumbnailUrl: ''
    });
    expect(initial.status).toStrictEqual(200);

    const updateResponse = testUpdateQuestion(user.token, quiz.quizId, question.questionId, footballQues);
    expect(updateResponse.response).toStrictEqual({});
    expect(updateResponse.status).toStrictEqual(200);

    const fetchedQuiz = testQuizInfo(user.token, quiz.quizId);
    expect(fetchedQuiz.response).toStrictEqual({
      quizId: question.questionId,
      name: 'Sample Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Sample Description',
      numQuestions: 1,
      questions: [
        {
          questionId: question.questionId,
          question: 'England teams',
          thumbnailUrl: 'http://example.com/image.jpg',
          duration: 10,
          points: 5,
          answers: [
            {
              answerId: expect.any(Number),
              answer: 'Madrid',
              colour: expect.any(String),
              correct: false
            },
            {
              answerId: expect.any(Number),
              answer: 'Barcelona',
              colour: expect.any(String),
              correct: false
            },
            {
              answerId: expect.any(Number),
              answer: 'Arsenal',
              colour: expect.any(String),
              correct: true
            },
            {
              answerId: expect.any(Number),
              answer: 'Bayern',
              colour: expect.any(String),
              correct: false
            },
          ]
        }
      ],
      duration: 10,
      thumbnailUrl: ''
    });
    expect(fetchedQuiz.status).toStrictEqual(200);
  });

  test('Successfully update correct question without affecting others', () => {
    const question2 = testCreateQuizQuestion(user.token, quiz.quizId, footballQues).response;

    const updateResponse1 = testUpdateQuestion(user.token, quiz.quizId, question2.questionId, leagueQues);
    expect(updateResponse1.status).toStrictEqual(200);
    expect(updateResponse1.response).toStrictEqual({});

    const fetchedQuiz = testQuizInfo(user.token, quiz.quizId);
    expect(fetchedQuiz.status).toStrictEqual(200);
    expect(fetchedQuiz.response).toStrictEqual({
      quizId: question.questionId,
      name: 'Sample Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Sample Description',
      numQuestions: 2,
      questions: [
        {
          questionId: question.questionId,
          question: 'What is the capital of Spain?',
          thumbnailUrl: 'http://example.com/image.jpg',
          duration: 4,
          points: 5,
          answers: [
            {
              answerId: expect.any(Number),
              answer: 'Berlin',
              colour: expect.any(String),
              correct: false
            },
            {
              answerId: expect.any(Number),
              answer: 'Madrid',
              colour: expect.any(String),
              correct: true
            },
            {
              answerId: expect.any(Number),
              answer: 'Paris',
              colour: expect.any(String),
              correct: false
            },
            {
              answerId: expect.any(Number),
              answer: 'Rome',
              colour: expect.any(String),
              correct: false
            },
          ]
        },
        {
          questionId: question2.questionId,
          question: 'Champions',
          thumbnailUrl: 'http://example.com/image.jpg',
          duration: 15,
          points: 5,
          answers: [
            {
              answerId: expect.any(Number),
              answer: 'jayce',
              colour: expect.any(String),
              correct: false
            },
            {
              answerId: expect.any(Number),
              answer: 'tristana',
              colour: expect.any(String),
              correct: false
            },
            {
              answerId: expect.any(Number),
              answer: 'lulu',
              colour: expect.any(String),
              correct: false
            },
            {
              answerId: expect.any(Number),
              answer: 'leblanc',
              colour: expect.any(String),
              correct: true
            },
          ]
        }
      ],
      duration: 19,
      thumbnailUrl: ''
    });
  });
});

describe('Question Delete', () => {
  let user: { token: string };
  let quiz: { quizId: number };
  let ques: { questionId: number };
  const validQuestion = {
    question: 'What is the capital of France?',
    duration: 6,
    points: 5,
    answers: [
      { answer: 'Berlin', correct: false },
      { answer: 'Madrid', correct: false },
      { answer: 'Paris', correct: true },
      { answer: 'Rome', correct: false }
    ],
    thumbnailUrl: 'http://example.com/image.jpg'
  };
  const footballQues = {
    question: 'England teams',
    duration: 10,
    points: 5,
    answers: [
      { answer: 'Madrid', correct: false },
      { answer: 'Barcelona', correct: false },
      { answer: 'Arsenal', correct: true },
      { answer: 'Bayern', correct: false }
    ],
    thumbnailUrl: 'http://example.com/image.jpg'
  };
  const leagueQues = {
    question: 'Champions',
    duration: 15,
    points: 5,
    answers: [
      { answer: 'jayce', correct: false },
      { answer: 'tristana', correct: false },
      { answer: 'lulu', correct: false },
      { answer: 'leblanc', correct: true }
    ],
    thumbnailUrl: 'http://example.com/image.jpg'
  };

  beforeEach(() => {
    user = testRegister('testuser@example.com', 'password123', 'Test', 'User').response;
    quiz = testCreateQuiz(user.token, 'Sample Quiz', 'Sample Description').response;
    ques = testCreateQuizQuestion(user.token, quiz.quizId, validQuestion).response;
  });

  test('Empty token', () => {
    const delete1 = testQuestionDelete('', quiz.quizId, ques.questionId);
    expect(delete1.response).toStrictEqual(ERROR);
    expect(delete1.status).toStrictEqual(401);
  });

  test('Invalid token', () => {
    const delete1 = testQuestionDelete(user.token + 'random123', quiz.quizId, ques.questionId);
    expect(delete1.response).toStrictEqual(ERROR);
    expect(delete1.status).toStrictEqual(401);
  });

  test('Unathorised user', () => {
    const user2 = testRegister('anotheruser@example.com', 'password1234', 'Another', 'User').response;
    const delete1 = testQuestionDelete(user2.token, quiz.quizId, ques.questionId);
    expect(delete1.response).toStrictEqual(ERROR);
    expect(delete1.status).toStrictEqual(403);
  });

  test('Question Id does not refer to a valid question within this quiz', () => {
    const delete1 = testQuestionDelete(user.token, quiz.quizId, ques.questionId + 100);
    expect(delete1.response).toStrictEqual(ERROR);
    expect(delete1.status).toStrictEqual(400);
  });

  test('Successful delete', () => {
    const delete1 = testQuestionDelete(user.token, quiz.quizId, ques.questionId);
    expect(delete1.response).toStrictEqual({});
    expect(delete1.status).toStrictEqual(200);

    const info = testQuizInfo(user.token, quiz.quizId);
    expect(info.response).toStrictEqual(
      {
        quizId: ques.questionId,
        name: 'Sample Quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Sample Description',
        numQuestions: 0,
        questions: [],
        duration: 0,
        thumbnailUrl: ''
      }
    );
  });

  test('Multiple Questions', () => {
    const ques2 = testCreateQuizQuestion(user.token, quiz.quizId, footballQues).response;
    const ques3 = testCreateQuizQuestion(user.token, quiz.quizId, leagueQues).response;

    const delete1 = testQuestionDelete(user.token, quiz.quizId, ques2.questionId);
    expect(delete1.response).toStrictEqual({});
    expect(delete1.status).toStrictEqual(200);

    const info = testQuizInfo(user.token, quiz.quizId);
    expect(info.response).toStrictEqual(
      {
        quizId: ques.questionId,
        name: 'Sample Quiz',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Sample Description',
        numQuestions: 2,
        questions: [
          {
            questionId: ques.questionId,
            question: 'What is the capital of France?',
            thumbnailUrl: 'http://example.com/image.jpg',
            duration: 6,
            points: 5,
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Berlin',
                colour: expect.any(String),
                correct: false
              },
              {
                answerId: expect.any(Number),
                answer: 'Madrid',
                colour: expect.any(String),
                correct: false
              },
              {
                answerId: expect.any(Number),
                answer: 'Paris',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'Rome',
                colour: expect.any(String),
                correct: false
              },
            ]
          },
          {
            questionId: ques3.questionId,
            question: 'Champions',
            thumbnailUrl: 'http://example.com/image.jpg',
            duration: 15,
            points: 5,
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'jayce',
                colour: expect.any(String),
                correct: false
              },
              {
                answerId: expect.any(Number),
                answer: 'tristana',
                colour: expect.any(String),
                correct: false
              },
              {
                answerId: expect.any(Number),
                answer: 'lulu',
                colour: expect.any(String),
                correct: false
              },
              {
                answerId: expect.any(Number),
                answer: 'leblanc',
                colour: expect.any(String),
                correct: true
              },
            ]
          }
        ],
        duration: 21,
        thumbnailUrl: ''
      }
    );
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

describe('Current question information for a player', () => {
  let user1: { token: string };
  let quiz1: { quizId: number };

  let player1: {playerId: number};

  let game1: { sessionId: number};

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
      { answer: 'Madrid', correct: true },
      { answer: 'Paris', correct: false },
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
    duration: 3,
    points: 10,
    answers: [{ answer: 'Hanoi', correct: true },
      { answer: 'Madrid', correct: false },
      { answer: 'Paris', correct: false },
      { answer: 'Rome', correct: false }],
    thumbnailUrl: 'http://example.com/image111.jpg'

  };

  const validQuestion4 = {
    question: 'What is the capital of Italy?',
    duration: 4,
    points: 5,
    answers: [{ answer: 'Berlin', correct: false },
      { answer: 'Madrid', correct: false },
      { answer: 'Paris', correct: false },
      { answer: 'Rome', correct: true }],
    thumbnailUrl: 'http://example.com/image.jpg'
  };

  beforeEach(() => {
    testClear();
    // First person
    user1 = testRegister('hayden.smith@unsw.edu.au', 'password1', 'nameFirst', 'nameLast').response;

    quiz1 = testCreateQuiz(user1.token, 'Quiz by Hayden', '').response;
    expect(testCreateQuizQuestion(user1.token, quiz1.quizId, validQuestion0).status).toStrictEqual(200);
    expect(testCreateQuizQuestion(user1.token, quiz1.quizId, validQuestion1).status).toStrictEqual(200);
    expect(testCreateQuizQuestion(user1.token, quiz1.quizId, validQuestion2).status).toStrictEqual(200);
    expect(testCreateQuizQuestion(user1.token, quiz1.quizId, validQuestion3).status).toStrictEqual(200);
    expect(testCreateQuizQuestion(user1.token, quiz1.quizId, validQuestion4).status).toStrictEqual(200);

    game1 = testGameSessionStart(user1.token, quiz1.quizId, 10).response;
    player1 = testPlayerJoin(game1.sessionId, 'Luca').response;
  });

  // Error cases:
  test('player ID does not exist', () => {
    const player1info = testCurrentPlayerInfo(player1.playerId + 100, 1);
    expect(player1info.status).toStrictEqual(400);
    expect(player1info.response).toStrictEqual(ERROR);
  });

  test('question position is not valid for the session this player is in', () => {
    let player1info = testCurrentPlayerInfo(player1.playerId, 6);
    expect(player1info.status).toStrictEqual(400);
    expect(player1info.response).toStrictEqual(ERROR);

    player1info = testCurrentPlayerInfo(player1.playerId, -10);
    expect(player1info.status).toStrictEqual(400);
    expect(player1info.response).toStrictEqual(ERROR);
  });

  test('Session is not currently on this question', () => {
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'NEXT_QUESTION').status).toStrictEqual(200);
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'SKIP_COUNTDOWN').status).toStrictEqual(200);
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'GO_TO_ANSWER').status).toStrictEqual(200);
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'NEXT_QUESTION').status).toStrictEqual(200);

    // Gone through this question
    let player1info = testCurrentPlayerInfo(player1.playerId, 1);
    expect(player1info.status).toStrictEqual(400);
    expect(player1info.response).toStrictEqual(ERROR);

    // Havent come to this question
    player1info = testCurrentPlayerInfo(player1.playerId, 3);
    expect(player1info.status).toStrictEqual(400);
    expect(player1info.response).toStrictEqual(ERROR);

    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'END').status).toStrictEqual(200);
  });

  test('Session is in LOBBY or END state', () => {
    // LOBBY state
    let player1info = testCurrentPlayerInfo(player1.playerId, 1);
    expect(player1info.status).toStrictEqual(400);
    expect(player1info.response).toStrictEqual(ERROR);

    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'END').status).toStrictEqual(200);

    // END state
    player1info = testCurrentPlayerInfo(player1.playerId, 3);
    expect(player1info.status).toStrictEqual(400);
    expect(player1info.response).toStrictEqual(ERROR);
  });

  // Working cases
  test('In the first question', () => {
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'NEXT_QUESTION').status).toStrictEqual(200);
    const player1info = testCurrentPlayerInfo(player1.playerId, 1);
    expect(player1info.status).toStrictEqual(200);
    expect(player1info.response).toStrictEqual({
      questionId: expect.any(Number),
      question: validQuestion0.question,
      duration: validQuestion0.duration,
      thumbnailUrl: validQuestion0.thumbnailUrl,
      points: validQuestion0.points,
      answers: [{ answer: 'Berlin', colour: expect.any(String), answerId: expect.any(Number) },
        { answer: 'Madrid', colour: expect.any(String), answerId: expect.any(Number) },
        { answer: 'Paris', colour: expect.any(String), answerId: expect.any(Number) },
        { answer: 'Rome', colour: expect.any(String), answerId: expect.any(Number) }],
    });

    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'END').status).toStrictEqual(200);
  });

  test('In the first question then the 4th question', () => {
    // Go to question 1
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'NEXT_QUESTION').status).toStrictEqual(200);
    const player1info = testCurrentPlayerInfo(player1.playerId, 1);
    expect(player1info.status).toStrictEqual(200);
    expect(player1info.response).toStrictEqual({
      questionId: expect.any(Number),
      question: validQuestion0.question,
      duration: validQuestion0.duration,
      thumbnailUrl: validQuestion0.thumbnailUrl,
      points: validQuestion0.points,
      answers: [{ answer: 'Berlin', colour: expect.any(String), answerId: expect.any(Number) },
        { answer: 'Madrid', colour: expect.any(String), answerId: expect.any(Number) },
        { answer: 'Paris', colour: expect.any(String), answerId: expect.any(Number) },
        { answer: 'Rome', colour: expect.any(String), answerId: expect.any(Number) }],
    });
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'SKIP_COUNTDOWN').status).toStrictEqual(200);
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'GO_TO_ANSWER').status).toStrictEqual(200);

    // TO question 2
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'NEXT_QUESTION').status).toStrictEqual(200);
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'SKIP_COUNTDOWN').status).toStrictEqual(200);
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'GO_TO_ANSWER').status).toStrictEqual(200);

    // TO question 3
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'NEXT_QUESTION').status).toStrictEqual(200);
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'SKIP_COUNTDOWN').status).toStrictEqual(200);
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'GO_TO_ANSWER').status).toStrictEqual(200);

    // TO question 4
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'NEXT_QUESTION').status).toStrictEqual(200);
    const player1info4 = testCurrentPlayerInfo(player1.playerId, 4);
    expect(player1info4.status).toStrictEqual(200);
    expect(player1info4.response).toStrictEqual({
      questionId: expect.any(Number),
      question: validQuestion3.question,
      duration: validQuestion3.duration,
      thumbnailUrl: validQuestion3.thumbnailUrl,
      points: validQuestion3.points,
      answers: [{ answer: 'Hanoi', colour: expect.any(String), answerId: expect.any(Number) },
        { answer: 'Madrid', colour: expect.any(String), answerId: expect.any(Number) },
        { answer: 'Paris', colour: expect.any(String), answerId: expect.any(Number) },
        { answer: 'Rome', colour: expect.any(String), answerId: expect.any(Number) }],
    });

    // End session
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'END').status).toStrictEqual(200);
  });

  test('In the first question wait to second question', () => {
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'NEXT_QUESTION').status).toStrictEqual(200);
    const player1info = testCurrentPlayerInfo(player1.playerId, 1);
    expect(player1info.status).toStrictEqual(200);
    expect(player1info.response).toStrictEqual({
      questionId: expect.any(Number),
      question: validQuestion0.question,
      duration: validQuestion0.duration,
      thumbnailUrl: validQuestion0.thumbnailUrl,
      points: validQuestion0.points,
      answers: [{ answer: 'Berlin', colour: expect.any(String), answerId: expect.any(Number) },
        { answer: 'Madrid', colour: expect.any(String), answerId: expect.any(Number) },
        { answer: 'Paris', colour: expect.any(String), answerId: expect.any(Number) },
        { answer: 'Rome', colour: expect.any(String), answerId: expect.any(Number) }],
    });

    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'SKIP_COUNTDOWN').status).toStrictEqual(200);
    sleepSync(4 * 1000);
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'GO_TO_ANSWER').status).toStrictEqual(200);
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'NEXT_QUESTION').status).toStrictEqual(200);

    const player1info2 = testCurrentPlayerInfo(player1.playerId, 2);
    expect(player1info2.status).toStrictEqual(200);
    expect(player1info2.response).toStrictEqual({
      questionId: expect.any(Number),
      question: validQuestion1.question,
      duration: validQuestion1.duration,
      thumbnailUrl: validQuestion1.thumbnailUrl,
      points: validQuestion1.points,
      answers: [{ answer: 'Berlin', colour: expect.any(String), answerId: expect.any(Number) },
        { answer: 'Madrid', colour: expect.any(String), answerId: expect.any(Number) },
        { answer: 'Paris', colour: expect.any(String), answerId: expect.any(Number) },
        { answer: 'Rome', colour: expect.any(String), answerId: expect.any(Number) }],
    });

    // End session
    expect(testGameSessionUpdate(user1.token, quiz1.quizId, game1.sessionId, 'END').status).toStrictEqual(200);
  });
});

testClear();
