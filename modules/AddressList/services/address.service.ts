import axios from '../../../helpers/axios';

export async function getAddressStructure() {
  try {
    let {data} = await axios.get('/fieldworker/address/structure');
    return data;
  } catch (error) {
    const err = error.response?.data;
    throw err ?? error;
  }
}

export async function queryAddresses(status: number) {
  try {
    let {data} = await axios.get('/fieldworker/addresses', {
      params: {status},
    });

    return data;
  } catch (error) {
    const err = error.response?.data;
    throw err ?? error;
  }
}
