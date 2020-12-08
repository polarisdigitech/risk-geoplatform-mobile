import axios from '../../../helpers/axios';

export async function getReport() {
  let {data} = await axios.get('/fieldworker/report');
  return data;
}

export const changePassword = async (params: {
  oldPassword: string;
  newPassword: string;
}) => {
  try {
    const {data} = await axios.put('/users/me/change-password', null, {params});
    return data;
  } catch (e) {
    const {response, message} = e;
    throw response?.data.message ?? message;
  }
};
