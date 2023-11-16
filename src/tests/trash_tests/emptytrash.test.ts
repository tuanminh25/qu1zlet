import {
  testRegister,
  testCreateQuiz,
  testClear,
  testQuizToTrash,
  testViewTrash,
  testQuizList,
  testEmptyTheTrash
} from '../testHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  testClear();
});

describe('Empty the trash v2', () => {
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

  test('Many quizies in the trash', () => {
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
    expect(testQuizToTrash(user.token, quiz6.quizId).status).toStrictEqual(200);

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
