import { getData, setData } from "./dataStore.js";
import validator from 'validator';
import {
  isUserName,
  isPassword,
  checkauthUserId
} from './helper.ts'
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
    } else if (!isUserName(nameFirst)) {
      return {
        error: 'Invalid first name'
      };
    } else if (!isUserName(nameLast)) {
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
        token: 'hello'
      };
    }
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
  
export {
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails,
};
