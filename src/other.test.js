import clear from "./other";
import { adminQuizCreate } from "./quiz";
import {
	adminAuthRegister,
	adminUserDetails
} from './auth.js';
const ERROR = { error: expect.any(String) };
describe('clear', () => {
	test('returns empty dictionary', () => {
		expect(clear()).toStrictEqual({});
	});
	test('multiple users', () => {
		const user1 = adminAuthRegister('hayden.smith@unsw.edu.au', 'password', 'nameFirst', 'nameLast');
		const user2 = adminAuthRegister('henlo@gmail.com', 'password', 'rrr', 'wowowow');
		const quiz1 = adminQuizCreate(user1.authUserId, 'Henlo', '');
		clear();
		expect(adminUserDetails(user1.authUserId)).toStrictEqual(ERROR);
		expect(adminUserDetails(user2.authUserId)).toStrictEqual(ERROR);
	});
});