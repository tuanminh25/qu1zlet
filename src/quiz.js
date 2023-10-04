
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
  }
}


/**
 adminQuizInfo
 Obtaining all relevant information about quiz\
 @param {number} authUserId - unique user identifier
 @param {number} quizId - unique quiz identifier

 @returns {array
  {quizId: number,
    name: string,
    timeCreated: number,
    timeLastEdited: number,
    description: string
  }
} - returns information if valid authUserId and quizId entered
@returns {error: string} - invalid parameters entered

**/
function adminQuizInfo(authUserId, quizId) {
  return{
    quizId: 1,
    name: 'My Quiz',
    timeCreated: 1683125870,
    timeLastEdited: 1683125871,
    description: 'This is my quiz',
  }
}

/**
 adminQuizNameUpdate
 Obtaining all relevant information about quiz\
 @param {number} authUserId - unique user identifier
 @param {number} quizId - unique quiz identifier
 @param {string} name - new name of quiz

 @returns [] - updates name of quiz in datastore
 @returns {error: string} - invalid parameters entered
**/

function adminQuizNameUpdate(authUserId, quizId, name){
  return{
  }
}