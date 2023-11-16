import {
  testRegister,
  testCreateQuiz,
  testQuizToTrash,
  testClear,
  testQuizList,
} from '../testHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  testClear();
});

describe('adminQuizList v2', () => {
  let user : {token: string};
  let quiz : {quizId: number};

  beforeEach(() => {
    // First person
    user = testRegister('hayden.smith@unsw.edu.au', 'password1', 'nameFirst', 'nameLast').response;
    quiz = testCreateQuiz(user.token, 'Quiz by Hayden', '').response;
  });

  // Working cases
  // One item in list 1 and 0 item in list 2
  test('Successful case: one item in the list', () => {
    // 2nd person
    const registerUser2 = testRegister('jayden2.smith@unsw.edu.au', 'password2', 'nameFirst', 'nameLast');
    const user2 = registerUser2.response;
    // 1 item in list 1
    expect(testQuizList(user.token).response).toStrictEqual({ quizzes: [{ quizId: quiz.quizId, name: 'Quiz by Hayden' }] });
    expect(testQuizList(user.token).status).toStrictEqual(200);

    // No item in list 2
    expect(testQuizList(user2.token).response).toStrictEqual({ quizzes: [] });
    expect(testQuizList(user.token).status).toStrictEqual(200);
  });

  // Many items in list
  test('Successful case: many items in the list', () => {
    // More quizzies from person 1
    const quiz2 = testCreateQuiz(user.token, 'Jayden quiz', 'Jayden content').response;
    const quiz3 = testCreateQuiz(user.token, 'Phaden quiz', 'Phaden content').response;
    const quiz4 = testCreateQuiz(user.token, 'Warden quiz', 'Warden content').response;

    expect(testQuizList(user.token).response).toStrictEqual(
      {
        quizzes: [
          { quizId: quiz.quizId, name: 'Quiz by Hayden' },
          { quizId: quiz2.quizId, name: 'Jayden quiz' },
          { quizId: quiz3.quizId, name: 'Phaden quiz' },
          { quizId: quiz4.quizId, name: 'Warden quiz' },
        ]
      });

    // Removing quizzes
    testQuizToTrash(user.token, quiz3.quizId);

    expect(testQuizList(user.token).response).toStrictEqual(
      {
        quizzes: [
          { quizId: quiz.quizId, name: 'Quiz by Hayden' },
          { quizId: quiz2.quizId, name: 'Jayden quiz' },
          { quizId: quiz4.quizId, name: 'Warden quiz' },
        ]
      });
  });

  // Error cases:
  // Token is empty or invalid (does not refer to valid logged in user session)
  test('Token is empty or invalid (does not refer to valid logged in user session)', () => {
    expect(testQuizList(user.token + 1).response).toStrictEqual(ERROR);
    expect(testQuizList(user.token + 1).status).toStrictEqual(401);
  });
});

testClear();
