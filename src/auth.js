/**
  * Register a user with an email, password, and names,
  *  then returns their authUserId value.
  * @param {string} email
  * @param {string} password 
  * @param {string} nameFirst
  * @param {string} nameLast 
  * @returns {number} authUserId
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
  * @returns {number} authUserId
*/
function adminAuthLogin(email, password) {
  return {
    authUserId: 1
  }
}

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
    

