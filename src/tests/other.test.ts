import { testRegister, testClear } from './testHelper';

describe('/v1/clear', () => {
  testRegister('Roger@gmail.com', 'password 1', 'Roger', 'Duong');
  test('Successful clear', () => {
    const clear1 = testClear();
    expect(clear1.response).toStrictEqual({});
    expect(clear1.status).toStrictEqual(200);
  });
});
