import axios from 'axios';
import {serverEndpoint} from '../utils/utils';

export type Login = {
  username: string;
  password: string;
};

export default async function login(params: Login) {
  try {
    let res = await axios.post(serverEndpoint + '/auth/signin', params);

    const {
      data: {
        accessToken,
        firstTimeLoggedIn,
        roles: [{authority}],
      },
    } = res;

    if (authority !== 'ROLE_FIELDWORKER') {
      const e = new Error(
        'Only fieldworkers are allowed to use the mobile app',
      );

      throw e;
    }

    return {accessToken, firstTimeLoggedIn};
  } catch (e) {
    const {response, message} = e;
    throw response?.data.message ?? message;
  }
}
