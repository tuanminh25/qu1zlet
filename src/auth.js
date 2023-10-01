import { getData, setData } from "./dataStore.js";
import validator from 'validator';

let store = getData();

let user_id = 0;
/**
  * Register a user with an email, password, and names,
  * then returns their authUserId value.
  * 
  * @param {string} email
  * @param {string} password 
  * @param {string} nameFirst
  * @param {string} nameLast 
  * @returns {{authUserId: number}} 
*/
function adminAuthRegister(email, password, nameFirst, nameLast) {
  if (!validator.isEmail(email)) {
    return {
      error: 'Invalid email'
    };
  } else {
    if (store.users.find((user) => user.email === email)) {
      return {
        error: 'Email address is used by another user'
      };
    } else if (!isPassword(password)) {
      return {
        error: 'Invalid password'
      };
    } else if (!isName(nameFirst)) {
      return {
        error: 'Invalid first name'
      };
    } else if (!isName(nameLast)) {
      return {
        error: 'Invalid last name'
      };
    } else {
      user_id++;

      store.users.push({
        userId: user_id,
        nameFirst: nameFirst,
        nameLast: nameLast,
        email: email,
        password: password,
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      })
      
      setData(store);
      return {
        authUserId: user_id
      };
    }
  }
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

/**
  * Given a registered user's email and password
  * returns their authUserId value.
  * 
  * @param {string} email
  * @param {string} password 
  * @returns {{authUserId: number}} 
*/
function adminAuthLogin(email, password) {
  const user = store.users.find((user) => user.email === email);
  if (user === undefined) {
    return {
      error: 'Email address does not exist'
    };
  } else {
    if (user.password !== password) {
      user.numFailedPasswordsSinceLastLogin++;
      return {
        error: 'Password is not correct for the given email'
      };
    } else {
      user.numSuccessfulLogins++;
      user.numFailedPasswordsSinceLastLogin = 0;
      return {
        authUserId: user.userId
      };
    }
  }
}

/**
  * Given an admin user's authUserId, return details about the user.
  *
  * @param {number} authUserId - unique identifier
  * @returns { user: 
  *   {
  *   userId: number,
  *   name : string,
  *   email : string,
  *   numSuccessfulLogins: number,
  *   numFailedPasswordsSinceLastLogin: number
  *   }
  * }
  * @returns {error: string} - AuthUserId is not a valid user
*/
function adminUserDetails(authUserId) {
  const user = checkauthUserId(authUserId);
  
  if (user === undefined) {
    return {
      error : 'AuthUserId is not a valid use;'
    }
  } else {
    const userName = user.nameFirst + ' ' + user.nameLast;
    return { user:
      {
        userId: user.userId,
        name: userName,
        email: user.email,
        numSuccessfulLogins: user.numSuccessfulLogins,
        numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin,
      }
    }
  }
}

/**
  * Given a registered user's email and password
  * returns their authUserId value.
  * 
  * @param {string} email
  * @param {Object} user
  */
function checkauthUserId(authUserId) {
  const user = store.users.find((user) => user.userId === authUserId);
  return user;
}
    
export {
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails,

  checkauthUserId,
};
