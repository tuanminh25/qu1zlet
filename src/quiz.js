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
      quizId: newQuiz.quizId,
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

/**
  * Given a particular quiz, permanently remove the quiz.
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
  adminQuizCreate,
  adminQuizRemove,
  adminQuizDescriptionUpdate
}
