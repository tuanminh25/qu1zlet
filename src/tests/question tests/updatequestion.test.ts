import {
  testRegister,
  testCreateQuiz,
  testCreateQuizQuestion,
  testClear,
  testUpdateQuestion,
  testQuizInfo,
} from '../testHelper';

const ERROR = { error: expect.any(String) };

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
