
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

/**
  * Given basic details about a new quiz, create one for the logged in user. 
  *  then returns a quizId.
  * @param {number} authUserId
  * @param {string} name 
  * @param {string} description
  * @returns {{ quizId: number }} 
*/
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