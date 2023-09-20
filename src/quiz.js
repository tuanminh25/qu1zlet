
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
 
function adminQuizList(authUserId) {
  return { quizzes: [
      {
        quizId: 1,
        name: 'My Quiz',
      }
    ]
  }
}

