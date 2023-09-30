/**
  * Register a user with an email, password, and names,
  *  then returns their authUserId value.
  * @param {string} email
  * @param {string} password 
  * @param {string} nameFirst
  * @param {string} nameLast 
  * @returns {{authUserId: number}} 
*/
function adminAuthRegister(email, password, nameFirst, nameLast) {
  return {
    authUserId: 1
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
};
