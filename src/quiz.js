
/**
    adminQuizDescriptionUpdate 
    Update the description of the relevant quiz. 
    Parameters:
    ( authUserId, quizId, description ) 
    Return object:
    { } empty object  
 * */


function adminQuizDescriptionUpdate (authUserId, quizId, description) {
  return {
  }
}

function adminQuizCreate(authUserId, name, description) {
  return {
      quizId: 2,
  }
}

function adminQuizRemove(authUserId, quizId) {
  return {
  }
}

function adminQuizList(authUserId) {
  return { quizzes: [
      {
        quizId: 1,
        name: 'My Quiz',
      }
    ]
>>>>>>> src/quiz.js
  }
}

function adminQuizCreate(authUserId, name, description) {
  return {
      quizId: 2,
  }
}

function adminQuizRemove(authUserId, quizId) {
  return {
  }
}

function adminQuizList(authUserId) {
  return { quizzes: [
      {
        quizId: 1,
        name: 'My Quiz',
      }
    ]
  }
}

function adminQuizInfo(authUserId, quizId) {
  return{
    quizId: 1,
    name: 'My Quiz',
    timeCreated: 1683125870,
    timeLastEdited: 1683125871,
    description: 'This is my quiz',
  }
}

function adminQuizNameUpdate(authUserId, quizId, name){
  return{
  }
}