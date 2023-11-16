import {
  testRegister,
  testCreateQuiz,
  testClear,
  testCreateQuizQuestion,
  testQuizInfo,
} from '../testHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  testClear();
});

describe('adminQuizInfo', () => {
  let user: { token: string };
  let quiz: { quizId: number };
  const validQuestion = {
    question: 'What is the capital of France?',
    duration: 4,
    points: 5,
    answers: [
      { answer: 'Berlin', correct: false },
      { answer: 'Madrid', correct: false },
      { answer: 'Paris', correct: true },
      { answer: 'Rome', correct: false }
    ],
    thumbnailUrl: 'http://example.com/image.jpg'
  };

  beforeEach(() => {
    testClear();
    user = testRegister('testuser@example.com', 'Password123', 'Test', 'User').response;
    quiz = testCreateQuiz(user.token, 'My Quiz Name', 'A description of my quiz').response;
  });

  test('Display Quiz Info - Successful', () => {
    const question = testCreateQuizQuestion(user.token, quiz.quizId, validQuestion).response;
    const quizinfo = testQuizInfo(user.token, quiz.quizId);
    expect(quizinfo.response).toStrictEqual({
      quizId: question.questionId,
      name: 'My Quiz Name',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'A description of my quiz',
      numQuestions: 1,
      questions: [
        {
          questionId: question.questionId,
          question: 'What is the capital of France?',
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
        }
      ],
      duration: 4,
      thumbnailUrl: ''
    });
    expect(quizinfo.status).toStrictEqual(200);
  });

  test('Display Quiz Info - multiple questions', () => {
    const validQuestion2 = {
      question: 'Who is the Goat',
      duration: 10,
      points: 9,
      answers: [
        { answer: 'Penaldo', correct: false },
        { answer: 'Pessi', correct: false },
        { answer: 'Peymar', correct: false },
        { answer: 'Paaland', correct: false },
        { answer: 'Darwizzy', correct: true },
      ],
      thumbnailUrl: 'http://example.com/image.jpg'
    };
    const validQuestion3 = {
      question: 'XDhenlo',
      duration: 10,
      points: 9,
      answers: [
        { answer: 'Nopelol', correct: false },
        { answer: 'Yes yeah', correct: false },
        { answer: 'Darwizzy', correct: true },
      ],
      thumbnailUrl: 'http://example.com/image.jpg'
    };
    const question = testCreateQuizQuestion(user.token, quiz.quizId, validQuestion).response;
    const question2 = testCreateQuizQuestion(user.token, quiz.quizId, validQuestion2).response;
    const question3 = testCreateQuizQuestion(user.token, quiz.quizId, validQuestion3).response;
    const quizinfo = testQuizInfo(user.token, quiz.quizId);
    expect(quizinfo.response).toStrictEqual({
      quizId: question.questionId,
      name: 'My Quiz Name',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'A description of my quiz',
      numQuestions: 3,
      questions: [
        {
          questionId: question.questionId,
          question: 'What is the capital of France?',
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
              correct: false,
              colour: expect.any(String)
            },
          ]
        },
        {
          questionId: question2.questionId,
          question: 'Who is the Goat',
          thumbnailUrl: 'http://example.com/image.jpg',
          duration: 10,
          points: 9,
          answers: [
            {
              answerId: expect.any(Number),
              answer: 'Penaldo',
              colour: expect.any(String),
              correct: false
            },
            {
              answerId: expect.any(Number),
              answer: 'Pessi',
              colour: expect.any(String),
              correct: false
            },
            {
              answerId: expect.any(Number),
              answer: 'Peymar',
              colour: expect.any(String),
              correct: false
            },
            {
              answerId: expect.any(Number),
              answer: 'Paaland',
              colour: expect.any(String),
              correct: false
            },
            {
              answerId: expect.any(Number),
              answer: 'Darwizzy',
              colour: expect.any(String),
              correct: true
            },
          ]
        },
        {
          questionId: question3.questionId,
          question: 'XDhenlo',
          thumbnailUrl: 'http://example.com/image.jpg',
          duration: 10,
          points: 9,
          answers: [
            {
              answerId: expect.any(Number),
              answer: 'Nopelol',
              colour: expect.any(String),
              correct: false
            },
            {
              answerId: expect.any(Number),
              answer: 'Yes yeah',
              colour: expect.any(String),
              correct: false
            },
            {
              answerId: expect.any(Number),
              answer: 'Darwizzy',
              colour: expect.any(String),
              correct: true
            },
          ]
        }
      ],
      duration: 24,
      thumbnailUrl: ''
    });
    expect(quizinfo.status).toStrictEqual(200);
  });

  test('Display Quiz Info without Description or Questions - Successful', () => {
    const badquiz = testCreateQuiz(user.token, 'My Quiz Nameeeee', '').response;
    const quizinfo = testQuizInfo(user.token, badquiz.quizId);
    expect(quizinfo.response).toStrictEqual({
      quizId: expect.any(Number),
      name: 'My Quiz Nameeeee',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: '',
      numQuestions: 0,
      questions: [],
      duration: 0,
      thumbnailUrl: ''
    });
    expect(quizinfo.status).toStrictEqual(200);
  });

  test('Invalid Token', () => {
    const quizinfo = testQuizInfo(user.token + 'abc', quiz.quizId);
    expect(quizinfo.response).toStrictEqual(ERROR);
    expect(quizinfo.status).toStrictEqual(401);
  });

  test('Empty Token', () => {
    const quizinfo = testQuizInfo('', quiz.quizId);
    expect(quizinfo.response).toStrictEqual(ERROR);
    expect(quizinfo.status).toStrictEqual(401);
  });

  test('Unauthorized', () => {
    const unauthorizedUser = testRegister('unauthorized@example.com', 'password123', 'Unauthorized', 'User').response;
    const quizinfo = testQuizInfo(unauthorizedUser.token, quiz.quizId);
    expect(quizinfo.status).toStrictEqual(403);
  });
});

testClear();
