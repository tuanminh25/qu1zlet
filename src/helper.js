import { getData, setData } from "./dataStore.js";


let store = getData();

/**
  * Given a quiz id
  *
  * @param {string} quizId
  * @returns { user: 
  *   {
  *     quizId,
  *     name,
  *     timeCreated,
  *     timeLastEdited,
  *     description,
  *   }
  * }
  * @returns {undefined} - quizId is not a valid quiz id 
*/

export function checkquizId(quizId) {
    const quiz = store.quizzes.find((quiz) => quiz.quizId === quizId);
    return quiz;
}

/**
  * Given a an auth user id
  *
  * @param {string} authUserId
  * @returns { user: 
    *   {
    *   userId: number,
    *   name : string,
    *   email : string,
    *   numSuccessfulLogins: number,
    *   numFailedPasswordsSinceLastLogin: number
    *   }
    * }
    * @returns {undefined} - AuthUserId is not a valid user
  */
export function checkauthUserId(authUserId) {
    const user = store.users.find((user) => user.userId === authUserId);
    return user;
}

/**
  * Checks if password is valid
  * 
  * @param {string} password
  * @returns {boolean} 
*/
export function isPassword(password) {
    if (password.length < 8) {
      return false;
    } else if (/\d/.test(password) === false || /[a-zA-Z]/.test(password) === false) {
      return false;
    } else {
      return true;
    }
  }
  
/**
  * Checks if password is valid
  * 
  * @param {string} password
  * @returns {boolean} 
*/ 
export function isUserName(name) {
  if (name.length < 2 || name.length > 20) {
    return false;
  } else if (/^[a-zA-Z\s'-]+$/.test(name) === false) {
    return false;
  } else {
    return true;
  }
}


/**
  * Checks whether the string follows the requirements for a name.
  * 
  * @param {string} name
  * @returns {boolean} 
*/
export function isQuizName(name) {
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
export function isQuizDescription(name) {
  if (name.length > 100) {
    return false;
  } else {
    return true;
  }
}
