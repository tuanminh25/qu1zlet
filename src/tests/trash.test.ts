import {
  testRegister,
  testCreateQuiz,
  testClear,
  testQuizToTrash,
  testViewTrash,
  testRestoreTrash,
  testQuizList,
  testCreateQuizQuestion,
  testQuizInfo,
  testEmptyTheTrash
} from './testHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  testClear();
});

describe('View Trash', () => {
  let user: { token: string };
  let quiz: { quizId: number };

  beforeEach(() => {
    user = testRegister('testuser@example.com', 'password123', 'Test', 'User').response;
    quiz = testCreateQuiz(user.token, 'Sample Quiz', 'Sample Description').response;
  });

  test('Empty token', () => {
    testQuizToTrash(user.token, quiz.quizId);
    const trash = testViewTrash('');
    expect(trash.status).toStrictEqual(401);
    expect(trash.response).toStrictEqual(ERROR);
  });

  test('Invalid token', () => {
    testQuizToTrash(user.token, quiz.quizId);
    const trash = testViewTrash(user.token + 'randome 2313');
    expect(trash.status).toStrictEqual(401);
    expect(trash.response).toStrictEqual(ERROR);
  });

  test('Simple View trash', () => {
    testQuizToTrash(user.token, quiz.quizId);
    const trash = testViewTrash(user.token);
    expect(trash.status).toStrictEqual(200);
    expect(trash.response).toStrictEqual(
      {
        quizzes: [
          {
            quizId: quiz.quizId,
            name: 'Sample Quiz'
          }
        ]
      }
    );
  });

  test('Many quiz in trash', () => {
    const quiz2 = testCreateQuiz(user.token, 'Sample Quiz2', 'Sample Description2').response;
    const quiz3 = testCreateQuiz(user.token, 'Sample Quiz3', 'Sample Description2').response;
    const quiz4 = testCreateQuiz(user.token, 'Sample Quiz4', 'Sample Description2').response;

    testQuizToTrash(user.token, quiz2.quizId);
    testQuizToTrash(user.token, quiz3.quizId);
    testQuizToTrash(user.token, quiz4.quizId);

    const trash = testViewTrash(user.token);
    expect(trash.status).toStrictEqual(200);
    expect(trash.response).toStrictEqual(
      {
        quizzes: [
          {
            quizId: quiz2.quizId,
            name: 'Sample Quiz2'
          },
          {
            quizId: quiz3.quizId,
            name: 'Sample Quiz3'
          },
          {
            quizId: quiz4.quizId,
            name: 'Sample Quiz4'
          }
        ]
      }
    );
  });

  test('Empty Trash', () => {
    const user2 = testRegister('empty@gmail.com', 'password1232', 'Testlol', 'Userxd').response;
    testQuizToTrash(user.token, quiz.quizId);

    const trash = testViewTrash(user2.token);
    expect(trash.status).toStrictEqual(200);
    expect(trash.response).toStrictEqual(
      {
        quizzes: []
      }
    );
  });
});

describe('Restore Trash', () => {
  let user: { token: string };
  let quiz: { quizId: number };

  beforeEach(() => {
    user = testRegister('testuser@example.com', 'password123', 'Test', 'User').response;
    quiz = testCreateQuiz(user.token, 'Sample Quiz', 'Sample Description').response;
    testQuizToTrash(user.token, quiz.quizId);
  });

  test('Empty token', () => {
    const restore = testRestoreTrash('', quiz.quizId);
    expect(restore.status).toStrictEqual(401);
    expect(restore.response).toStrictEqual(ERROR);
  });

  test('Invalid token', () => {
    const restore = testRestoreTrash(user.token + 'randomre123', quiz.quizId);
    expect(restore.status).toStrictEqual(401);
    expect(restore.response).toStrictEqual(ERROR);
  });

  test('Valid token is provided, but user is not an owner of this quiz', () => {
    const user2 = testRegister('testuserheblo@example.com', 'password1234', 'Testfaker', 'Userdopemain').response;
    const restore = testRestoreTrash(user2.token, quiz.quizId);
    expect(restore.status).toStrictEqual(403);
    expect(restore.response).toStrictEqual(ERROR);
  });

  test('Quiz ID refers to a quiz that is not currently in the trash', () => {
    const restore = testRestoreTrash(user.token, quiz.quizId + 123);
    expect(restore.status).toStrictEqual(400);
    expect(restore.response).toStrictEqual(ERROR);
  });

  test('Quiz name of the restored quiz is already used by another active quiz', () => {
    testCreateQuiz(user.token, 'Sample Quiz', 'Sample Description');
    const restore = testRestoreTrash(user.token, quiz.quizId);
    expect(restore.status).toStrictEqual(400);
    expect(restore.response).toStrictEqual(ERROR);
  });

  test('Successful simple restore', () => {
    const trash = testViewTrash(user.token).response;
    expect(trash).toStrictEqual({
      quizzes: [
        {
          quizId: quiz.quizId,
          name: 'Sample Quiz'
        }
      ]
    });

    const restore = testRestoreTrash(user.token, quiz.quizId);
    expect(restore.status).toStrictEqual(200);
    expect(restore.response).toStrictEqual({});

    const view = testQuizList(user.token).response;
    expect(view).toStrictEqual({
      quizzes: [
        {
          quizId: quiz.quizId,
          name: 'Sample Quiz'
        }
      ]
    });

    const trashAfter = testViewTrash(user.token).response;
    expect(trashAfter).toStrictEqual({
      quizzes: []
    });
  });

  test('Multiple quizzes', () => {
    const quiz2 = testCreateQuiz(user.token, 'Sample Quiz2', 'Sample Description2').response;
    const quiz3 = testCreateQuiz(user.token, 'Sample Quiz3', 'Sample Description2').response;
    const quiz4 = testCreateQuiz(user.token, 'Sample Quiz4', 'Sample Description2').response;

    const restore = testRestoreTrash(user.token, quiz.quizId);
    expect(restore.status).toStrictEqual(200);
    expect(restore.response).toStrictEqual({});

    // in original order
    const view = testQuizList(user.token).response;
    expect(view).toStrictEqual({
      quizzes: [
        {
          quizId: quiz.quizId,
          name: 'Sample Quiz'
        },
        {
          quizId: quiz2.quizId,
          name: 'Sample Quiz2'
        },
        {
          quizId: quiz3.quizId,
          name: 'Sample Quiz3'
        },
        {
          quizId: quiz4.quizId,
          name: 'Sample Quiz4'
        }
      ]
    });

    testQuizToTrash(user.token, quiz2.quizId);
    testRestoreTrash(user.token, quiz2.quizId);

    const view2 = testQuizList(user.token).response;
    expect(view2).toStrictEqual({
      quizzes: [
        {
          quizId: quiz.quizId,
          name: 'Sample Quiz'
        },
        {
          quizId: quiz2.quizId,
          name: 'Sample Quiz2'
        },
        {
          quizId: quiz3.quizId,
          name: 'Sample Quiz3'
        },
        {
          quizId: quiz4.quizId,
          name: 'Sample Quiz4'
        }
      ]
    });
  });

  test('Contains same question', () => {
    const quiz2 = testCreateQuiz(user.token, 'Sample Quiz 2', 'Sample Description').response;
    const footballQues = {
      question: 'England teams',
      duration: 10,
      points: 5,
      answers: [
        { answer: 'Madrid', correct: false },
        { answer: 'Barcelona', correct: false },
        { answer: 'Arsenal', correct: true },
        { answer: 'Bayern', correct: false }
      ]
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
      ]
    };

    const ques = testCreateQuizQuestion(user.token, quiz2.quizId, footballQues).response;
    const ques2 = testCreateQuizQuestion(user.token, quiz2.quizId, leagueQues).response;

    testQuizToTrash(user.token, quiz2.quizId);
    testRestoreTrash(user.token, quiz2.quizId);

    const info = testQuizInfo(user.token, quiz2.quizId).response;
    expect(info).toStrictEqual(
      {
        quizId: ques2.questionId,
        name: 'Sample Quiz 2',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Sample Description',
        numQuestions: 2,
        questions: [
          {
            questionId: ques.questionId,
            question: 'England teams',
            thumbnailUrl: '',
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
          },
          {
            questionId: ques2.questionId,
            question: 'Champions',
            thumbnailUrl: '',
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
        duration: 25,
        thumbnailUrl: ''
      }
    );
  });
});

testClear();
