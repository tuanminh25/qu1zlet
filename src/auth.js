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
  * @param {string} email
  * @param {string} password 
  * @returns {{authUserId: number}} 
*/
function adminAuthLogin(email, password) {
  return {
    authUserId: 1
  }
}

/**
  * Given an admin user's authUserId, return details about the user.
  *"name" is the first and last name concatenated with a single space between them
  *numSuccessfulLogins includes logins direct via registration, and is counted from the moment of registration starting at 1
  *numFailedPasswordsSinceLastLogin is reset every time they have a successful login, 
  *and simply counts the number of attempted logins that failed due to incorrect password, only since the last login
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
  return { user:
    {
      userId: 1,
      name: 'Hayden Smith',
      email: 'hayden.smith@unsw.edu.au',
      numSuccessfulLogins: 3,
      numFailedPasswordsSinceLastLogin: 1,
    }
  }
}
    
export {
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails,
};
