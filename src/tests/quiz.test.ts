import {
  testRegister,
  testCreateQuiz,
  testQuizToTrash,
  testClear,
  testQuizList,
  testCreateQuizQuestion,
  testQuizInfo,
  testQuizNameUpdate,
  testQuizTransfer,
  testQuizDescriptionUpdate,
  testGameSessionStart,
  validQuestion,
  testGameSessionUpdate
} from './testHelper';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  testClear();
});

// Tests:
describe('adminQuizCreate', () => {
  let user: { token: string; };

  beforeEach(() => {
    user = testRegister('testuser@example.com', 'password123', 'Test', 'User').response;
  });

  test('Successful quiz creation', () => {
    const quiz = testCreateQuiz(user.token, 'My Quiz Name', 'A description of my quiz');
    expect(quiz.status).toStrictEqual(200);
  });

  test('Successful quiz create with same name as quiz from another user', () => {
    const quiz = testCreateQuiz(user.token, 'My Quiz Name', 'A description of my quiz');
    const user2 = testRegister('testuser2@example.com', 'password321', 'User', 'Test').response;
    const quiz2 = testCreateQuiz(user2.token, 'My Quiz Name', 'A description of my quiz');
    expect(quiz.status).toStrictEqual(200);
    expect(quiz2.status).toStrictEqual(200);
  });

  test.each([
    { a: 'Roger!', b: 'Duong' },
    { a: 'Roger%', b: 'Duong' },
    { a: 'R', b: 'Duong' },
    { a: 'Roge...r Roge', b: '' },
    { a: '', b: '' },
    { a: 'Roge! djnfdnn 1 !r', b: '' },
  ])('Invalid names : ($a, $b)', ({ a, b }) => {
    const quiz = testCreateQuiz(user.token, a, b);
    expect(quiz.response).toStrictEqual(ERROR);
  });

  test('multiple quizzes should have different id', () => {
    const quiz1 = testCreateQuiz(user.token, 'Dogs', 'I like dogs');
    const quiz2 = testCreateQuiz(user.token, 'Cats', 'I like dogs');
    expect(quiz1.response.quizId).not.toEqual(quiz2.response.quizId);
  });

  test('error for duplicate names', () => {
    const quiz1 = testCreateQuiz(user.token, 'Dogs', 'I like cats');
    expect(quiz1.status).toStrictEqual(200);
    const quiz2 = testCreateQuiz(user.token, 'Dogs', 'I like dogs');
    expect(quiz2.response).toStrictEqual(ERROR);
    expect(quiz2.status).toStrictEqual(400);
  });

  test('Empty Quiz Name and Description', () => {
    const quiz = testCreateQuiz(user.token, '', '');
    expect(quiz.response).toStrictEqual(ERROR);
    expect(quiz.status).toStrictEqual(400);
  });

  test('Long Quiz Name and Description', () => {
    const longName = 'A'.repeat(31);
    const longDescription = 'B'.repeat(101);
    const quiz1 = testCreateQuiz(user.token, longName, 'A description');
    const quiz2 = testCreateQuiz(user.token, 'A valid name', longDescription);
    expect(quiz1.response).toStrictEqual(ERROR);
    expect(quiz2.response).toStrictEqual(ERROR);
    expect(quiz1.status).toStrictEqual(400);
    expect(quiz2.status).toStrictEqual(400);
  });

  test('Check 401 Error is Prioritized Over 400', () => {
    const invalidToken = user.token + 1;
    const emptyName = '';
    const quiz = testCreateQuiz(invalidToken, emptyName, 'A description of my quiz');
    expect(quiz.response).toStrictEqual(ERROR);
    expect(quiz.status).toStrictEqual(401);
  });
});

describe('SendQuizToTrash', () => {
  let user: { token: string; };
  let quiz: { quizId: number; };

  beforeEach(() => {
    user = testRegister('testuser@example.com', 'Password123', 'Test', 'User').response;
    quiz = testCreateQuiz(user.token, 'My Quiz Name', 'A description of my quiz').response;
  });

  test('Send Quiz to Trash - Successful', () => {
    expect(quiz.quizId).toBe(1);
    const sendToTrash = testQuizToTrash(user.token, quiz.quizId);
    expect(sendToTrash.response).toStrictEqual({});
    expect(sendToTrash.status).toStrictEqual(200);
  });

  test('Non-Existent User', () => {
    const sendToTrash = testQuizToTrash('76234724334', quiz.quizId);
    expect(sendToTrash.status).toStrictEqual(401);
  });

  test('Empty Token', () => {
    const sendToTrash = testQuizToTrash('', quiz.quizId);
    expect(sendToTrash.status).toStrictEqual(401);
  });

  test('Non-Existent Token', () => {
    const nonExistentToken = 'nonExistentToken';
    const sendToTrash = testQuizToTrash(nonExistentToken, quiz.quizId);
    expect(sendToTrash.status).toStrictEqual(401);
  });

  test('Unauthorized', () => {
    const unauthorizedUser = testRegister('unauthorized@example.com', 'password123', 'Unauthorized', 'User').response;
    const sendToTrash = testQuizToTrash(unauthorizedUser.token, quiz.quizId);
    expect(sendToTrash.status).toStrictEqual(403);
  });

  test('Game hasnt ended', () => {
    testCreateQuizQuestion(user.token, quiz.quizId, validQuestion);
    testGameSessionStart(user.token, quiz.quizId, 1);
    const sendToTrash = testQuizToTrash(user.token, quiz.quizId);
    expect(sendToTrash.status).toStrictEqual(400);
  });
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

describe('QuizNameUpdate', () => {
  let user: { token: string };
  let quiz: { quizId: number };

  beforeEach(() => {
    user = testRegister('testuser@example.com', 'Password123', 'Test', 'User').response;
    quiz = testCreateQuiz(user.token, 'My Quiz Name', 'A description of my quiz').response;
  });

  test('Normal Name Change - Successful', () => {
    const inforObjectOriginal = testQuizInfo(user.token, quiz.quizId).response;
    const nameupdate = testQuizNameUpdate(user.token, quiz.quizId, 'New Quiz Name');
    expect(nameupdate.response).toStrictEqual({});
    expect(nameupdate.status).toStrictEqual(200);
    const inforObjectNew = testQuizInfo(user.token, quiz.quizId).response;
    expect(inforObjectNew.name).toStrictEqual('New Quiz Name');

    expect(inforObjectOriginal.timeLastEdited !== inforObjectNew.timeLastEdited);
  });

  test.each([
    { name: 'ABC' },
    { name: 'A'.repeat(30) },
  ])('Name Change with exactly $name characters - Successful', async ({ name }) => {
    const infoObjectOriginal = testQuizInfo(user.token, quiz.quizId).response;
    const nameUpdate = testQuizNameUpdate(user.token, quiz.quizId, name);

    expect(nameUpdate.response).toStrictEqual({});
    expect(nameUpdate.status).toStrictEqual(200);

    const infoObjectNew = testQuizInfo(user.token, quiz.quizId).response;

    expect(infoObjectNew.name).toStrictEqual(name);

    expect(infoObjectNew.timeLastEdited !== infoObjectOriginal.timeLastEdited);
  });

  // Error Cases
  describe('Name is not alphanumeric', () => {
    test.each([
      { name: 'Exclamation!' },
      { name: 'Question?' },
      { name: '@at' }
    ])('Invalid Name: $name', async ({ name }) => {
      const nameUpdate = testQuizNameUpdate(user.token, quiz.quizId, name);
      const quizinfo = testQuizInfo(user.token, quiz.quizId).response;

      expect(nameUpdate.response).toStrictEqual(ERROR);
      expect(nameUpdate.status).toStrictEqual(400);

      expect(quizinfo.name).toStrictEqual('My Quiz Name');
    });
  });

  test('Name is less than 3 characters', () => {
    const nameUpdate = testQuizNameUpdate(user.token, quiz.quizId, 'hi');
    const quizinfo = testQuizInfo(user.token, quiz.quizId).response;

    expect(nameUpdate.response).toStrictEqual(ERROR);
    expect(nameUpdate.status).toStrictEqual(400);

    expect(quizinfo.name).toStrictEqual('My Quiz Name');
  });

  test('Name is more than 30 characters', () => {
    const nameUpdate = testQuizNameUpdate(user.token, quiz.quizId, 'A'.repeat(31));
    const quizinfo = testQuizInfo(user.token, quiz.quizId).response;

    expect(nameUpdate.response).toStrictEqual(ERROR);
    expect(nameUpdate.status).toStrictEqual(400);

    expect(quizinfo.name).toStrictEqual('My Quiz Name');
  });

  test('Quiz Name in use by same user', () => {
    testCreateQuiz(user.token, 'NewQuiz', 'A description of my quiz');
    const nameUpdate = testQuizNameUpdate(user.token, quiz.quizId, 'NewQuiz');
    const quizinfo = testQuizInfo(user.token, quiz.quizId).response;

    expect(nameUpdate.response).toStrictEqual(ERROR);
    expect(nameUpdate.status).toStrictEqual(400);

    expect(quizinfo.name).toStrictEqual('My Quiz Name');
  });

  test('Invalid Token', () => {
    const nameUpdate = testQuizNameUpdate(user.token + 'abc', quiz.quizId, 'Quiz Name');
    expect(nameUpdate.response).toStrictEqual(ERROR);
    expect(nameUpdate.status).toStrictEqual(401);
  });

  test('Empty Token', () => {
    const nameUpdate = testQuizNameUpdate('', quiz.quizId, 'Quiz Name');
    expect(nameUpdate.response).toStrictEqual(ERROR);
    expect(nameUpdate.status).toStrictEqual(401);
  });

  test('Unauthorized', () => {
    const unauthorizedUser = testRegister('unauthorized@example.com', 'password123', 'Unauthorized', 'User').response;
    const nameUpdate = testQuizNameUpdate(unauthorizedUser.token, quiz.quizId, 'Quiz Name');
    expect(nameUpdate.response).toStrictEqual(ERROR);
    expect(nameUpdate.status).toStrictEqual(403);
  });

  test('Quiz doesnt exist', () => {
    const nameUpdate = testQuizNameUpdate(user.token, quiz.quizId + 23, 'Quiz Name');
    expect(nameUpdate.response).toStrictEqual(ERROR);
    expect(nameUpdate.status).toStrictEqual(403);
  });
});

describe('/v1/admin/quiz/:quizid/transfer', () => {
  const userfrom = {
    email: 'testuser@example.com',
    password: 'Password123',
    nameFirst: 'Usersend',
    nameLast: 'from'
  };
  const userto = {
    email: 'testuser2@example.com',
    password: 'Password321',
    nameFirst: 'UserTransfer',
    nameLast: 'to'
  };
  let userfromtoken: {token: string};
  let usertotoken: {token: string};
  let quiz: { quizId: number };
  let gameSession: { sessionId: number };

  beforeEach(() => {
    userfromtoken = testRegister(userfrom.email, userfrom.password, userfrom.nameFirst, userfrom.nameLast).response;
    usertotoken = testRegister(userto.email, userto.password, userto.nameFirst, userto.nameLast).response;
    quiz = testCreateQuiz(userfromtoken.token, 'My Quiz Name', 'A description of my quiz').response;
    testCreateQuizQuestion(userfromtoken.token, quiz.quizId, validQuestion);
    gameSession = testGameSessionStart(userfromtoken.token, quiz.quizId, 10).response;
    testGameSessionUpdate(userfromtoken.token, quiz.quizId, gameSession.sessionId, 'END');
  });

  // Successful Case
  test('Successfully transfers quiz', () => {
    const quizTransfer = testQuizTransfer(userfromtoken.token, quiz.quizId, userto.email);

    expect(quizTransfer.response).toStrictEqual({});
    expect(quizTransfer.status).toStrictEqual(200);

    // Check that the quiz is now owned by the transfer user
    const transferredQuiz = testQuizInfo(usertotoken.token, quiz.quizId).response;
    expect(transferredQuiz.name).toStrictEqual('My Quiz Name');
    expect(transferredQuiz.description).toStrictEqual('A description of my quiz');
  });

  test('Transferring to an non-existent email - ERROR', () => {
    const quizTransfer = testQuizTransfer(userfromtoken.token, quiz.quizId, 'fakeemail@domain.com');
    expect(quizTransfer.response).toStrictEqual(ERROR);
    expect(quizTransfer.status).toStrictEqual(400);
  });

  test('Transferring to itself - ERROR', () => {
    const quizTransfer = testQuizTransfer(userfromtoken.token, quiz.quizId, userfrom.email);
    expect(quizTransfer.response).toStrictEqual(ERROR);
    expect(quizTransfer.status).toStrictEqual(400);
  });

  test('Not in END state - ERROR', () => {
    testGameSessionUpdate(userfromtoken.token, quiz.quizId, gameSession.sessionId, 'LOBBY');
    const quizTransfer = testQuizTransfer(userfromtoken.token, quiz.quizId, userfrom.email);
    expect(quizTransfer.response).toStrictEqual(ERROR);
    expect(quizTransfer.status).toStrictEqual(400);
  });

  test('Quiz has the same name as a quiz already owned by target - ERROR', () => {
    const quiz2 = testCreateQuiz(usertotoken.token, 'My Quiz Name', 'A description of my quiz').response;
    const ownedquiz2 = testQuizInfo(usertotoken.token, quiz2.quizId).response;
    // Checking the quiz was made correctly and owned by userto
    expect(ownedquiz2.name).toStrictEqual('My Quiz Name');

    const quizTransfer = testQuizTransfer(userfromtoken.token, quiz.quizId, userto.email);
    expect(quizTransfer.response).toStrictEqual(ERROR);
    expect(quizTransfer.status).toStrictEqual(400);
  });

  // Error 401
  test('Invalid Token', () => {
    const quizTransfer = testQuizTransfer(userfromtoken.token + 'abc', quiz.quizId, userto.email);
    expect(quizTransfer.response).toStrictEqual(ERROR);
    expect(quizTransfer.status).toStrictEqual(401);
  });

  test('Empty Token', () => {
    const quizTransfer = testQuizTransfer('', quiz.quizId, userto.email);
    expect(quizTransfer.response).toStrictEqual(ERROR);
    expect(quizTransfer.status).toStrictEqual(401);
  });

  // Error 403
  test('Unauthorized', () => {
    const unauthorizedUser = testRegister('unauthorized@example.com', 'password123', 'Unauthorized', 'User').response;
    const quizTransfer = testQuizTransfer(unauthorizedUser.token, quiz.quizId, userto.email);
    expect(quizTransfer.response).toStrictEqual(ERROR);
    expect(quizTransfer.status).toStrictEqual(403);
  });
});

describe('QuizDescriptionUpdate', () => {
  let user : {token: string};
  let quiz : {quizId: number};
  beforeEach(() => {
    user = testRegister('hayden.smith@unsw.edu.au', 'password1', 'nameFirst', 'nameLast').response;
    quiz = testCreateQuiz(user.token, 'Quiz 1', 'This is quiz 1').response;
  });

  test('Successfully update description', () => {
    const inforObjectOriginal = testQuizInfo(user.token, quiz.quizId).response;

    const updateResponse = testQuizDescriptionUpdate(user.token, quiz.quizId, '');
    expect(updateResponse.response).toStrictEqual({});
    expect(updateResponse.status).toStrictEqual(200);

    const inforObjectNew = testQuizInfo(user.token, quiz.quizId).response;
    expect(inforObjectNew.description).toStrictEqual('');
    expect(inforObjectOriginal.timeLastEdited !== inforObjectNew.timeLastEdited);
  });

  test('Successfully update description', () => {
    const inforObjectOriginal = testQuizInfo(user.token, quiz.quizId).response;

    const updateResponse = testQuizDescriptionUpdate(user.token, quiz.quizId, 'Hello there, hi new updated description');
    expect(updateResponse.response).toStrictEqual({});
    expect(updateResponse.status).toStrictEqual(200);

    const inforObjectNew = testQuizInfo(user.token, quiz.quizId).response;
    expect(inforObjectNew.description).toStrictEqual('Hello there, hi new updated description');

    expect(inforObjectOriginal.timeLastEdited !== inforObjectNew.timeLastEdited);
  });

  test('Description is more than 100 characters in length', () => {
    const updateResponse = testQuizDescriptionUpdate(user.token, quiz.quizId, 'a'.repeat(1000));
    expect(updateResponse.response).toStrictEqual(ERROR);

    expect(updateResponse.status).toStrictEqual(400);
  });

  test('Token is empty or invalid', () => {
    const updateResponse = testQuizDescriptionUpdate(user.token + 1, quiz.quizId, 'Token is empty or invalid');
    expect(updateResponse.response).toStrictEqual(ERROR);
    expect(updateResponse.status).toStrictEqual(401);
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    const updateResponse = testQuizDescriptionUpdate(user.token, quiz.quizId + 1, 'This quiz id does no refer to any quiz');
    expect(updateResponse.response).toStrictEqual(ERROR);
    expect(updateResponse.status).toStrictEqual(403);
  });

  test('Quiz ID does not refer to a quiz that this user owns, belongs to somebody else', () => {
    const user2 = testRegister('somebody@unsw.edu.au', 'Password2', 'Yay', 'Nay').response;
    const updateResponse = testQuizDescriptionUpdate(user2.token, quiz.quizId, 'Try to update user 2 quiz');
    expect(updateResponse.response).toStrictEqual(ERROR);
    expect(updateResponse.status).toStrictEqual(403);
  });
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
