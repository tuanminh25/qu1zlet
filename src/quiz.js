import { getData, setData } from "./dataStore.js";


let store = getData();

let quiz_id = 0;

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
  if (store.quizzes.some((quiz) => quiz.name === name)) {
    return {
      error: 'Quiz name already exists'
    };
  } else if (!isQuizName(name)) {
    return {
      error: 'Invalid quiz name'
    };
  } else if (typeof(authUserId) !== "number") {
    return {
      error: 'User ID should be a number'
    };
  } else if (!isQuizDescription(description)) {
    return {
      error: 'Invalid quiz description'
    };
  }

  const userExists = store.users.find((user) => user.userId === authUserId);
  if (!userExists) {
    return {
      error: 'User not found'
    };
  }

  const newQuiz = {
    quizId: quiz_id++,
    name: name,
    timeCreated: Date.now() * 1000,
    timeLastEdited: Date.now() * 1000,
    description: description,
    quizOwnedby: authUserId,
  };

  store.quizzes.push(newQuiz);
  setData(store);

  return {
      quizId: quiz_id,
    }
}

function isQuizName(name) {
  if (name.length < 3 || name.length > 30) {
    return false;
  } else if (/^[\w\s]+$/.test(name) === false) {
    return false;
  } else {
    return true;
  }
}

function isQuizDescription(name) {
  if (name.length > 100) {
    return false;
  } else {
    return true;
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

function adminQuizNameUpdate(authUserId, quizId, name){
  return{
  }
}

export {
  adminQuizCreate,
  adminQuizRemove,
  adminQuizDescriptionUpdate
}
