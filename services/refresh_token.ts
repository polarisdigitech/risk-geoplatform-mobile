import axios from '../helpers/axios';

export async function refreshToken() {
  try {
    let {data} = await axios.post('/auth/refresh');

    console.log(data);

    return data;
  } catch (e) {
    console.log(e, e?.response, e?.response?.data);
    throw e;
  }
}
