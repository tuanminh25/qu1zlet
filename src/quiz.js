import { getData, setData } from "./dataStore.js";

let store = getData();

let user_id = 0;

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
  if (store.quizzes.find((quiz) => quiz.name === name)) {
    return {
      error: 'Quiz name already exists'
    };
  } else if (!isQuizName(name)) {
    return {
      error: 'Invalid quiz name'
    };
  } else if (!store.users.find((user) => user.userId === authUserId)) {
    return {
      error: 'User not found'
    };
  } else if (!isQuizDescription(description)) {
    return {
      error: 'Invalid quiz description'
    };
  } else {
    quiz_id++;

    store.quiz.push({
      quizId: quiz_id,
      name: name,
      timeCreated: getTime() * 1000,
      timeLastEdited: getTime() * 1000,
      description: description,
      quizOwnedby: authUserId,
    })
    
    setData(store);
    return quiz_id;
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