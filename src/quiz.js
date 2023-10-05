import {
  checkauthUserId,
  checkquizId,
  isQuizDescription,
  isQuizName,
} from './helper.js';

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
  quiz.timeLastEdited = Date.now() * 1000;
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

  const quizFound = store.quizzes.find((quiz) => quiz.quizId === quizId);
  const index = store.quizzes.indexOf(quizFound);
  store.quizzes.splice(index, 1);
  setData(store);
  return {}
};

function adminQuizList(authUserId) {
  if (checkauthUserId(authUserId) === undefined) {
    return {error: "AuthUserId is not a valid user"}
  }

  let quizzes = [];
  for (let quiz of store.quizzes) {
    if (authUserId === quiz.quizOwnedby) {
      quizzes.push({
        name: quiz.name,
        quizId: quiz.quizId,
      });
    }
  }


  return {
    quizzes
  };
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

export {
  adminQuizDescriptionUpdate,
  adminQuizCreate,
  adminQuizNameUpdate,
  adminQuizList,
  adminQuizInfo,
  adminQuizRemove
}