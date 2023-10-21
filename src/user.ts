import { isToken, load, save } from "./helper";

/**
  * Given an admin user's authUserId, return details about the user.
  *
  * @param {string} token
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
export function adminUserDetails(token: string) {
const session = isToken(token);

if (!session) {
    return {
    error: 'Invalid token'
    };
}

const data = load();
const user = data.users.find((user) => user.userId === session.userId);

const userName = user.nameFirst + ' ' + user.nameLast;
return {
    user:
    {
    userId: user.userId,
    name: userName,
    email: user.email,
    numSuccessfulLogins: user.numSuccessfulLogins,
    numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin,
    }
};
}