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
    

