import {
  adminQuizCreate, 
  adminQuizRemove,
  adminQuizDescriptionUpdate,
  adminQuizList
} from './quiz.js';

import clear from './other.js';

import {
  adminAuthRegister,
  adminAuthLogin,
} from './auth.js';

const ERROR = { error: expect.any(String) };


describe('adminQuizCreate', () => {
  let user;

  beforeEach(()=> {
    clear();
    user = adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'nameFirst', 'nameLast');
  })


  test("check for the correct return type", () => {
    expect(adminQuizCreate(user.authUserId, 'Cats or Dogs', 'I like dogs')).toStrictEqual({
      quizId: expect.any(Number)
    });
  });

  test("AuthUserId is not a valid user", () => {
    expect(adminQuizCreate(user.authUserId + 1, 'Dogs', 'I like dogs')).toStrictEqual(ERROR);
  });

  test.each([
    {a: 'Roger!', b: 'Duong'},
    {a: 'Roger%', b: 'Duong'},
    {a: 'R', b: 'Duong'},
    {a: 'Roge...r Roge', b: ''},
    {a: '', b: ''},
    {a: 'Roge! djnfdnn 1 !r', b: ''},
    {a: 'RogeRogerRogerRogerRogerRogerRogerRogerr', b: 'D'},
    {a: 'R', b: 'Duong DDuong DngDuongDuong DngDuongDuong DngDuongDuong DngDuongngDuongDuong DngDuongDuong DngDuongDuong DngDuong'},
    {a: 'RogerRogerRogerRogerRogerRogerRoge', b: 'Duong DDuong DngDuongDuong DngDuongDuong DngDuongDuong DngDuongngDuongDuong DngDuongDuong DngDuongDuong DngDuong'},
  ])('Invalid names : ($a, $b)', ({a, b}) => {
    expect(adminQuizCreate(user.authUserId, a, b)).toStrictEqual(ERROR);
  });

  test("non-numerical input for id", () => {
      expect(adminQuizCreate('weee', 'Dogs', 'I like dogs')).toStrictEqual(ERROR);
  });

  test("multiple quizzes should have different id", () => {
    expect(adminQuizCreate(user.authUserId, 'Dogs', 'I like dogs')).
    not.toEqual(adminQuizCreate(user.authUserId, 'Cats', 'I like dogs'));
  });

  test("error for duplicate names", () => {
    adminQuizCreate(user.authUserId, 'Dogs', 'I like cats')
    expect(adminQuizCreate(user.authUserId, 'Dogs', 'I like dogs')).toStrictEqual(ERROR);
  });
});

describe("adminQuizRemove", () => {
  beforeEach(()=> {
    clear();
    user = adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'nameFirst', 'nameLast');
    adminAuthLogin('hayden.smith@unsw.edu.au', 'password1');
    quiz = adminQuizCreate(user.authUserId, 'Quiz 1', 'This is quiz 1');
  });

  test("check for the correct return type", () => {
    expect(adminQuizRemove(user.authUserId, quiz.quizId)).toStrictEqual({})
  });

  test("AuthUserId is not a valid user", () => {
    expect(adminQuizRemove(user.authUserId + 1, quiz.quizId)).toStrictEqual(ERROR);
  });

  test("QuizId is not a valid quiz", () => {
    expect(adminQuizRemove(user.authUserId, quiz.quizId + 1)).toStrictEqual(ERROR);
  });

  test("QuizId is not owned by user", () => {
    const user2 = adminAuthRegister('tracie.smith@unsw.edu.au', 'password1', 'tracie', 'nameLast');
    expect(adminQuizRemove(user2.authUserId, quiz.quizId)).toStrictEqual(ERROR);
  });

  test("non-numerical input for user id", () => {
      expect(adminQuizRemove("hello", quiz.quizId)).toStrictEqual(ERROR);
  });

  test("non-numerical input for quiz id", () => {
    expect(adminQuizRemove(user.authUserId, "hello")).toStrictEqual(ERROR);
  });

  test("remove quiz twice", () => {
    expect(adminQuizRemove(user.authUserId, quiz.quizId)).toStrictEqual({});
    expect(adminQuizRemove(user.authUserId, quiz.quizId)).toStrictEqual(ERROR);
  });
});

describe('adminQuizInfo', () => {
  let user;
  let quiz;

  //Working cases:
  test("Valid UserId and QuizId shows relevant info", () => {
    expect(adminQuizInfo(user.authUserId, quiz.quizId)).toStrictEqual({quiz:
      {
        quizId: '1',
        name: 'Quiz 1',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'This is quiz 1',
      }
    });
  });

  //Error Cases:
  //UserId does not refer to valid user
  test("UserId is not a valid user", () => {
    expect(adminQuizInfo(user.authUserId + 1, 1)).toStrictEqual(ERROR);
  });

  //QuizId does not refer to a valid quiz
  test("QuizId does not refer to a valid quiz", () => {
    expect(adminQuizInfo(user.authUserId, 17)).toStrictEqual(ERROR);
  });

  //QuizId refers to a quiz that does not belong to user
  test("QuizId does not belong to user", () => {
    const user2 = adminAuthRegister('hayden.smith2@unsw.edu.au', 'password2', 'nameFirst2', 'nameLast2');
    adminAuthLogin('hayden.smith2@unsw.edu.au', 'password2');
    let quiz = adminQuizCreate(user2.authUserId, 'Quiz 2', 'This is quiz 2');
    expect(adminQuizInfo(user.authUserId, 2)).toStrictEqual(ERROR);
    expect(adminQuizInfo(user2.authUserId, 1)).toStrictEqual(ERROR);
  });
})

describe("adminQuizDescriptionUpdate", () => {
  let user;
  let quiz;
  beforeEach(()=> {
    clear();
    user = adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'nameFirst', 'nameLast');
    adminAuthLogin('hayden.smith@unsw.edu.au', 'password1');
    quiz = adminQuizCreate(user.authUserId, 'Quiz 1', 'This is quiz 1');
  })

  // Working cases: 
  // Empty description cases
  test("Successfully update description", () => {
    expect(adminQuizDescriptionUpdate(user.authUserId, quiz.quizId, '')).toStrictEqual({});
    let inforObject = adminQuizInfo(user.authUserId, quiz.quizId);
    expect(inforObject.description).toStrictEqual('');
  
  });

  // Any normal cases
  test("Successfully update description", () => {
    expect(adminQuizDescriptionUpdate(user.authUserId, quiz.quizId, 'Hello there, hi new updated description')).toStrictEqual({});
    let inforObject = adminQuizInfo(user.authUserId, quiz.quizId);
    expect(inforObject.description).toStrictEqual('Hello there, hi new updated description');
 
  });

  // Error cases:

  // AuthUserId is not a valid user
  test("AuthUserId is not a valid user", () => {
    expect(adminQuizDescriptionUpdate(user.authUserId + 1, quiz.quizId, 'Auth user id is not valid here')).toStrictEqual(ERROR);
  });

  // Quiz ID does not refer to a valid quiz
  test("Quiz ID does not refer to a valid quiz", () => {
    expect(adminQuizDescriptionUpdate(user.authUserId, quiz.quizId + 1, 'This quiz id does no refer to any quiz')).toStrictEqual(ERROR);
  });

  // Quiz ID does not refer to a quiz that this user owns
  test("Quiz ID does not refer to a quiz that this user owns, belongs to somebody else", () => {
    let user2 = adminAuthRegister('somebody@unsw.edu.au', 'password2', 'nameFirst2', 'nameLast2');
    adminAuthLogin('somebody@unsw.edu.au', 'password2');
    let quiz2 = adminQuizCreate(user2.authUserId, 'Quiz by user 2', 'User 2 quiz');
    expect(adminQuizDescriptionUpdate(user.authUserId, quiz2.quizId, 'Try to update user 2 quiz')).toStrictEqual(ERROR);
   
  });

  // Description is more than 100 characters in length (note: empty strings are OK)
  test("Description is more than 100 characters in length", () => {
    expect(adminQuizDescriptionUpdate(user.authUserId, quiz.quizId, 'avfwuevfg72q3fv3 r3y2urguyg23rg3t26rg32gr327gr7162gr671trgfjfjsbfsjfbsjhbfsbfsajbfjkwebf823g78grjwbfjewbqurweqbubrweuyrbuywqgruyweqgruwqgrwugreuwgruwgruwgruwgrweuygr293hrownfksnfkasdnfoihrf932hrhwrbjwabfwgf7ghseifbkwnf23noi32j893u2r9owhekfnwafbwafb732yr9q2yhriqwhrbfkwebfwakbf92qohrwqhefkasnfk,sa dfwhr9832urjwrnfefnoi3wjr0329jrowjflwnfmekqjr34jronfke fwrhf392hr9hjoqwnrlaenfa flwenmfo23ue021jeownrlewnfakbfhwgbfyu32gr8723gr92hrwenflasmnflam3902ur0ujonlwanfl')).toStrictEqual(ERROR);
  });
})

describe("adminQuizInfo", () => {
  beforeEach(() => {
    clear();
    const user = adminAuthRegister('hayden.smith@unsw.edu.au', 'password', 'nameFirst', 'nameLast');
    adminAuthLogin('hayden.smith@unsw.edu.au', 'password');
    let quiz = adminQuizCreate(user.authUserId, 'Quiz 1', 'This is quiz 1');
  });

  test("Valid UserId and QuizId shows relevant info", () => {
    expect(adminQuizInfo(user.authUserId, quiz.quizId)).toStrictEqual({quiz:
      {
        quizId: '1',
        name: 'Quiz 1',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'This is quiz 1',
      }
    });
  });

  test("UserId is not a valid user", () => {
    expect(adminQuizInfo(user.authUserId + 1, 1)).toStrictEqual(ERROR);
  });

  test("QuizId does not refer to a valid quiz", () => {
    expect(adminQuizInfo(user.authUserId, 17)).toStrictEqual(ERROR);
  });

  test("QuizId does not belong to user", () => {
    const user2 = adminAuthRegister('hayden.smith2@unsw.edu.au', 'password2', 'nameFirst2', 'nameLast2');
    adminAuthLogin('hayden.smith2@unsw.edu.au', 'password2');
    let quiz = adminQuizCreate(user2.authUserId, 'Quiz 2', 'This is quiz 2');
    expect(adminQuizInfo(user.authUserId, 2)).toStrictEqual(ERROR);
    expect(adminQuizInfo(user2.authUserId, 1)).toStrictEqual(ERROR);
  });
})


describe("adminQuizList", () => {
  let user;
  let quiz;

  beforeEach(()=> {
    clear();
    // First person 
    user = adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'nameFirst', 'nameLast');
    adminAuthLogin('hayden.smith@unsw.edu.au', 'password1');
    quiz = adminQuizCreate(user.authUserId, 'First quiz by Hayden', '')
  })

  // Working cases

  // One item in list 1 and 0 item in list 2
  test ("Successful case: one item in the list", () => {
    // 2nd person
    let user2 = adminAuthRegister('jayden2.smith@unsw.edu.au', 'password2', 'nameFirst', 'nameLast');
    adminAuthLogin('jayden2.smith@unsw.edu.au', 'password2');
    
    // 1 item in list 1
    expect(adminQuizList(user.authUserId)).toStrictEqual({ quizzes: [{quizId: quiz.quizId, name: 'First quiz by Hayden'}]})


    // No item in list 2
    expect(adminQuizList(user2.authUserId)).toStrictEqual({ quizzes: []})
  })

  // Many items in list
  test.only ("Successful case: many items in the list", () => {
    // More quizzies from person 1
    let quiz2 = adminQuizCreate(user.authUserId, 'Hayden second quiz', 'This is quiz 2');
    let quiz3 = adminQuizCreate(user.authUserId, 'Hayden third quiz', 'This is quiz 3');
    let quiz4 = adminQuizCreate(user.authUserId, 'Hayden 4th quiz', 'This is quiz 4');


    expect(adminQuizList(user.authUserId)).toStrictEqual(
    { quizzes: [
      {quizId: quiz.quizId, name: 'First quiz by Hayden'}, 
      {quizId: quiz2.quizId, name: 'Hayden second quiz'},
      {quizId: quiz3.quizId, name: 'Hayden third quiz'},
      {quizId: quiz4.quizId, name: 'Hayden 4th quiz'},
    ]});

    // Removing quizzes
    adminQuizRemove(user.authUserId, quiz3.quizId);
    
    expect(adminQuizList(user.authUserId)).toStrictEqual(
      { quizzes: [
      {quizId: quiz.quizId, name: 'First quiz by Hayden'}, 
      {quizId: quiz2.quizId, name: 'Hayden second quiz'},
      {quizId: quiz4.quizId, name: 'Hayden 4th quiz'},
    ]});

  })

  // Error cases

  // AuthUserId is not a valid user
  test("AuthUserId is not a valid user", () => {
    expect(adminQuizList(user.authUserId + 1)).toStrictEqual(ERROR)
  })  
})