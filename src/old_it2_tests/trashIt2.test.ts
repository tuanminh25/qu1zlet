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

describe('View Trash v1', () => {
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

describe('Restore Trash v1', () => {
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
        duration: 25
      }
    );
  });
});


describe('Empty the trash', () => {
  let user: { token: string };
  let quiz: { quizId: number };
  beforeEach(() => {
    testClear();
    user = testRegister('testuser@example.com', 'Password123', 'Test', 'User').response;
    quiz = testCreateQuiz(user.token, 'My Quiz Name', 'A description of my quiz').response;
    expect(testQuizToTrash(user.token, quiz.quizId).status).toStrictEqual(200);
  });

  // Working cases
  test('One quiz in the trash', () => {
    const response = testEmptyTheTrash(user.token, [quiz.quizId]);
    expect(response.response).toStrictEqual({});
    expect(response.status).toStrictEqual(200);

    const inTrash = testViewTrash(user.token).response.quizzes;
    expect(inTrash).toStrictEqual([]);
  });

  test.only('Many quizies in the trash', () => {
    // Create many quizies
    const quiz2 = testCreateQuiz(user.token, 'Another quiz', 'Yes sir').response;
    const quiz3 = testCreateQuiz(user.token, 'Yes moree quiz', 'Yahooo').response;
    const quiz4 = testCreateQuiz(user.token, 'Even bigger', 'Yellow').response;
    const quiz5 = testCreateQuiz(user.token, 'Can u imagine it', 'No').response;
    const quiz6 = testCreateQuiz(user.token, 'I need to know now', 'Can u love me again?').response;

    // Showing quizs in the system
    const quizList = testQuizList(user.token);
    expect(quizList.response).toStrictEqual({
      quizzes: [
        {
          quizId: quiz2.quizId,
          name: 'Another quiz'
        },
        {
          quizId: quiz3.quizId,
          name: 'Yes moree quiz'
        },
        {
          quizId: quiz4.quizId,
          name: 'Even bigger'
        },
        {
          quizId: quiz5.quizId,
          name: 'Can u imagine it'
        },
        {
          quizId: quiz6.quizId,
          name: 'I need to know now'
        },
      ]
    });

    // Send some of them to the trash
    expect(testQuizToTrash(user.token, quiz4.quizId).status).toStrictEqual(200);
    expect(testQuizToTrash(user.token, quiz6.quizId)).toStrictEqual(200);

    // Show quizs in the trash
    let inTrash = testViewTrash(user.token).response.quizzes;
    expect(inTrash).toStrictEqual([
      {
        quizId: quiz.quizId,
        name: 'My Quiz Name'
      },
      {
        quizId: quiz4.quizId,
        name: 'Even bigger'
      },
      {
        quizId: quiz6.quizId,
        name: 'I need to know now'
      },
    ]);

    // Remove quiz in the trash
    const removeIds = [quiz6.quizId, quiz.quizId, quiz4.quizId];
    const updateResponse = testEmptyTheTrash(user.token, removeIds);
    expect(updateResponse.response).toStrictEqual({});
    expect(updateResponse.status).toStrictEqual(200);
    inTrash = testViewTrash(user.token).response.quizzes;
    expect(inTrash).toStrictEqual([]);
  });

  // Error cases:
  test('QuizId is not in the trash', () => {
    const quiz2 = testCreateQuiz(user.token, 'Another quiz', 'Yes sir').response;
    const remove = [quiz2.quizId];
    const updateResponse = testEmptyTheTrash(user.token, remove);
    expect(updateResponse.response).toStrictEqual(ERROR);
    expect(updateResponse.status).toStrictEqual(400);
  });

  // Token is empty or invalid (does not refer to valid logged in user session)
  test('Token is empty or invalid', () => {
    const remove = [quiz.quizId];
    const updateResponse = testEmptyTheTrash(user.token + 1, remove);
    expect(updateResponse.response).toStrictEqual(ERROR);
    expect(updateResponse.status).toStrictEqual(401);
  });

  // Valid token is provided, but one or more of the Quiz IDs refers to a quiz that this current user does not own
  test('Quiz ID does not refer to a quiz that this user owns, belongs to somebody else', () => {
    const user2 = testRegister('somebody123@unsw.edu.au', 'password2', 'nameFirs', 'nameLas').response;
    const quiz2 = testCreateQuiz(user2.token, 'Quiz by user 2', 'User 2 quiz').response;
    expect(testQuizToTrash(user2.token, quiz2.quizId).status).toStrictEqual(200);

    const remove = [quiz2.quizId];
    const updateResponse = testEmptyTheTrash(user.token, remove);
    expect(updateResponse.response).toStrictEqual(ERROR);
    expect(updateResponse.status).toStrictEqual(403);
  });

  // Quiz ID does not exist
  test('Quiz ID does not exist', () => {
    const remove = [100];
    const updateResponse = testEmptyTheTrash(user.token, remove);
    expect(updateResponse.response).toStrictEqual(ERROR);
    expect(updateResponse.status).toStrictEqual(403);
  });
});

testClear();
