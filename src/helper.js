import { getData, setData } from "./dataStore.js";


let store = getData();

/**
  * Given a an auth user id
  *
  * 
  * @param {string} quizId
  * @returns { user: 
    *   {
    *   quizId,
    *   name,
    *   timeCreated,
    *   timeLastEdited,
    *   description,
    *   }
    * }
    * 
    * 
    * @returns {undefined} - quizId is not a valid quiz id 
  */


function checkquizId(quizId) {
    const quiz = store.quizzes.find((quiz) => quiz.quizId === quizId);
    return quiz;
}



/**
  * Given a an auth user id
  *
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
function checkauthUserId(authUserId) {
    const user = store.users.find((user) => user.userId === authUserId);
    return user;
}


function isPassword(password) {
    if (password.length < 8) {
      return false;
    } else if (/\d/.test(password) === false || /[a-zA-Z]/.test(password) === false) {
      return false;
    } else {
      return true;
    }
  }
  
  function isName(name) {
    if (name.length < 2 || name.length > 20) {
      return false;
    } else if (/^[a-zA-Z\s'-]+$/.test(name) === false) {
      return false;
    } else {
      return true;
    }
  }

export {
    checkauthUserId,
    checkquizId,
    isName,
    isPassword,


};


