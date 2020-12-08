import axios from '../helpers/axios';
import {LatLng} from '../types';

export async function uploadPhoto(formData: FormData) {
  try {
    const {data} = await axios.post('/address/image', formData);
    return data;
  } catch (e) {
    console.log(e, e?.response, e?.response.data);
  }
}

export async function findAddress(addressId: number) {
  let {data} = await axios.get('/address/fetch/single', {
    params: {addressId},
  });

  return data;
}

export async function submitAddress({
  id,
  latitude,
  longitude,
  data = {},
}: {
  data: any;
  id: string;
} & LatLng) {
  try {
    let req = await axios.post('/fieldworker/verify', data, {
      params: {
        lat: latitude,
        address_id: id,
        long: longitude,
      },
    });

    return req.data;
  } catch (e) {
    console.log(e, e?.response, e?.response.data);
  }
}
