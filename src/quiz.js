import {checkauthUserId} from './helper.js';
import { getData, setData } from "./dataStore.js";

let store = getData();


/**
    adminQuizDescriptionUpdate 
    Update the description of the relevant quiz. 
    Parameters:
    ( authUserId, quizId, description ) 
    Return object:
    { } empty object  
 * */
function adminQuizDescriptionUpdate (authUserId, quizId, description) {
  let quiz = checkauthUserId(quizId);

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

export {
  adminQuizDescriptionUpdate,
  adminQuizCreate,
  adminQuizNameUpdate,
  adminQuizList,
  adminQuizInfo
}