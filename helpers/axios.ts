import axios from 'axios';
import authService from '../shared/machines/auth.machine';
import {serverEndpoint} from '../utils/utils';

import useAuthStore from '../shared/stores/authentication.store';

const instance = axios.create({baseURL: serverEndpoint});

// Attach token to every request
instance.interceptors.request.use((request) => {
  const {token} = useAuthStore.getState();
  request.headers.Authorization = `Bearer ${token}`;
  return request;
});

// instance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     const status = error.response?.status;

//     console.log('interceptor');

//     // If request was to refresh the users' token,
//     // and token refresh fails, log the user out.
//     if (
//       status === 401 &&
//       originalRequest.url !== `${serverEndpoint}/auth/signin`
//     ) {
//       // authService.send('LOGOUT');
//       return Promise.reject(error);
//     }

//     // If request failure is due to expired token,
//     // attempt to refresh the token. And then retry the
//     // original failed request.
//     // if (status === 401 && !originalRequest._retry) {
//     //   originalRequest._retry = true;

//     //   console.log('request failed');

//     //   return new Promise((resolve) => {
//     //     const subscription = authService.subscribe(async (state) => {
//     //       console.warn(state.value);

//     //       if (state.matches({loggedIn: 'refreshDone'})) {
//     //         const {token} = state.context;
//     //         // originalRequest.headers.Authorization = 'Bearer ' + token;

//     //         console.log('refresh done');

//     //         let req = await instance(originalRequest);

//     //         subscription.unsubscribe();
//     //         resolve(req);
//     //       }
//     //     });

//     //     console.log('refresh event sent');

//     //     authService.send('REFRESH_TOKEN');
//     //   });
//     // }

//     return Promise.reject(error);
//   },
// );

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  function (error) {
    const originalRequest = error.config;

    if (
      error.response.status === 401 &&
      originalRequest.url === `${serverEndpoint}/auth/refresh`
    ) {
      authService.send('LOGOUT');
      return Promise.reject(error);
    }

    console.log(error, error.response);

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      return new Promise((resolve) => {
        const subscription = authService.subscribe(async (state) => {
          console.warn(state.value);

          if (state.matches({loggedIn: 'refreshDone'})) {
            // originalRequest.headers.Authorization = 'Bearer ' + token;

            console.log('refresh done');

            let req = await instance(originalRequest);

            subscription.unsubscribe();

            resolve(req);
          }
        });

        console.log('refresh event sent');

        authService.send('REFRESH_TOKEN');
      });
    }

    return Promise.reject(error);
  },
);

export default instance;
