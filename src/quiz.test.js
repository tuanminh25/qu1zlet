import {
  adminQuizCreate, 
  adminQuizRemove,
  adminQuizDescriptionUpdate,
} from './quiz.js';

import clear from './other.js';

import {
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails,
  
} from './auth.js';

const ERROR = { error: expect.any(String) };

describe('adminQuizCreate', () => {
  let user;

  beforeEach(()=> {
    clear();
    user = adminAuthRegister('hayden.smith@unsw.edu.au', 'password1', 'nameFirst', 'nameLast');
  })

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
});

describe("adminQuizDescriptionUpdate", () => {
  beforeEach(()=> {
    clear();
    const user = adminAuthRegister('hayden.smith@unsw.edu.au', 'password', 'nameFirst', 'nameLast');
    adminAuthLogin('hayden.smith@unsw.edu.au', 'password');
    let quiz = adminQuizCreate(user.authUserId, 'Quiz 1', 'This is quiz 1');
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
