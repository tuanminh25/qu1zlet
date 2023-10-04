import {checkauthUserId, checkquizId} from './helper.js';
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
  let quiz = checkquizId(quizId);

  // Returning errors
  if (checkauthUserId(authUserId) === undefined) {
    return {error : 'AuthUserId is not a valid user'}
  }

  if (quiz === undefined) {
    return {error : 'Quiz ID does not refer to a valid quiz'}
  }

  if (description.length > 100) {
    return {error : 'Description is more than 100 characters in length'}
  }

  // Working case
  quiz.description = description;

  return {

  }
}

/**
  * Given basic details about a new quiz, create one for the logged in user. 
  *  then returns a quizId.
  * 
  * @param {number} authUserId
  * @param {string} name 
  * @param {string} description
  * @returns {{ quizId: number }} 
*/
function adminQuizCreate(authUserId, name, description) {
  // Error checking.
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
      quizId: newQuiz.quizId,
    }
}

/**
  * Checks whether the string follows the requirements for a name.
  * 
  * @param {string} name
  * @returns {boolean} 
*/
function isQuizName(name) {
  if (name.length < 3 || name.length > 30) {
    return false;
  } else if (/^[\w\s]+$/.test(name) === false) {
    return false;
  } else {
    return true;
  }
}

/**
  * Checks whether the string follows the requirements for a description.
  * 
  * @param {string} name
  * @returns {boolean} 
*/
function isQuizDescription(name) {
  if (name.length > 100) {
    return false;
  } else {
    return true;
  }
}

/**
  * Given a particular quiz, permanently remove the quiz.
  * 
  * @param {number} authUserId
  * @param {number} quizId 
  * @returns {} 
*/
function adminQuizRemove(authUserId, quizId) {
  if (typeof(authUserId) !== "number") {
    return {
      error: 'User ID should be a number'
    };
  } else if (typeof(quizId) !== "number") {
    return {
      error: 'Quiz ID should be a number'
    };
  }

  // Checks if the quiz and the user exists in the data.
  const quizExists = store.quizzes.find((quiz) => quiz.quizId === quizId);
  const userExists = store.users.find((person) => person.userId === authUserId);
  if (!quizExists) {
    return {
      error: 'Quiz does not exist'
    };
  } else if (!userExists) {
    return {
      error: 'Person does not exist'
    };
  } else if (quizExists.quizOwnedby !== authUserId) {
    return {
      error: 'Person does not own the quiz'
    };
  };

  const index = store.quizzes.indexOf((quiz) => quiz.quizId === quizId);
  store.quizzes.splice(index);
  setData(store);
  return {}
};

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

export {
  adminQuizDescriptionUpdate,
  adminQuizCreate,
  adminQuizNameUpdate,
  adminQuizList,
  adminQuizInfo,
  adminQuizRemove
}