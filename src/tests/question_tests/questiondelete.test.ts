import {
  testRegister,
  testCreateQuiz,
  testCreateQuizQuestion,
  testClear,
  testQuizInfo,
  testQuestionDelete,
  testGameSessionStart,
  testGameSessionUpdate,
} from '../testHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  testClear();
});

describe('Question Delete', () => {
  let user: { token: string };
  let quiz: { quizId: number };
  let ques: { questionId: number };
  let gameSession: { sessionId: number};

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
    gameSession = testGameSessionStart(user.token, quiz.quizId, 10).response;
    testGameSessionUpdate(user.token, quiz.quizId, gameSession.sessionId, 'END');
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

testClear();
