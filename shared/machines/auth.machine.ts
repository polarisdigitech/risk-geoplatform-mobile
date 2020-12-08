import {assign, createMachine, interpret, spawn} from 'xstate';
import {log} from 'xstate/lib/actions';
import {refreshToken} from '../../services/refresh_token';
import useAuthStore from '../stores/authentication.store';
import changePasswordMachine from './change-password.machine';
import loginMachine from './login.machine';

type Context = {
  error?: string;
  loginRef?: any;
  token?: string;
  passwordRef?: any;
  isFirstTimeLogin?: boolean;
  errors?: Map<string, string>;
  fields?: Record<string, string>;
};

type Schema =
  | {value: 'loggedOut'; context: Context}
  | {value: {loggedOut: 'error'}; context: Context}
  | {value: {loggedOut: 'editing'}; context: Context}
  | {value: {loggedOut: 'validate'}; context: Context}
  | {value: {loggedOut: 'validationError'}; context: Context}
  | {value: {loggedOut: 'authenticating'}; context: Context}
  | {value: 'loggedIn'; context: Context}
  | {
      value: {
        loggedIn: 'idle' | 'refreshing' | 'refreshDone' | 'changePassword';
      };
      context: Context & {token: string};
    };

type Events =
  | {type: 'LOGOUT'}
  | {type: 'REFRESH_TOKEN'}
  | {type: 'PASSWORD_CHANGED'}
  | {type: 'CHANGE_PASSWORD'}
  | {type: 'PASSWORD_CHANGED_CANCELED'}
  | {type: 'EDIT'; name: string; value: string}
  | {type: 'AUTHENTICATED'; accessToken: string; firstTimeLoggedIn: boolean};

const machine = createMachine<Context, Events, Schema>(
  {
    id: 'auth',
    context: {},
    initial: 'loggedOut',
    states: {
      loggedOut: {
        entry: assign((ctx) => {
          return {loginRef: spawn(loginMachine)};
        }),
        on: {
          AUTHENTICATED: {
            target: '#auth.loggedIn',
            actions: [
              'assignToken',
              (_, {accessToken}) => {
                useAuthStore.setState({token: accessToken});
              },
            ],
          },
        },
      },
      loggedIn: {
        id: 'loggedIn',
        initial: 'idle',
        entry: assign((ctx) => {
          const {isFirstTimeLogin} = ctx;

          return {
            ...ctx,
            passwordRef: spawn(
              changePasswordMachine.withContext({isFirstTimeLogin}),
            ),
          };
        }),
        states: {
          idle: {
            on: {
              REFRESH_TOKEN: 'refreshing',
              CHANGE_PASSWORD: 'changePassword',
              LOGOUT: {
                target: '#auth.loggedOut',
                actions: ['clearToken', log((_, e) => e)],
              },
            },
          },
          changePassword: {
            on: {
              PASSWORD_CHANGED_CANCELED: 'idle',
              PASSWORD_CHANGED: '#auth.loggedOut',
            },
          },
          refreshing: {
            invoke: {
              src: 'refreshToken',
              onError: {
                actions: ['clearToken', log((_, e) => e)],
                target: '#auth.loggedOut',
              },
              onDone: {
                target: 'refreshDone',
                actions: assign({token: (_, {data}) => data}),
              },
            },
          },
          refreshDone: {
            after: {
              2000: 'idle',
            },
          },
        },
      },
    },
  },
  {
    actions: {
      clearToken: assign((ctx) => ({...ctx, token: undefined})),
      clearError: assign((ctx) => ({...ctx, error: undefined})),
      clearErrors: assign((ctx) => ({...ctx, errors: undefined})),
      assignToken: assign((_, {accessToken, firstTimeLoggedIn}: any) => {
        return {
          token: accessToken,
          isFirstTimeLogin: firstTimeLoggedIn,
        };
      }),
    },
    services: {refreshToken},
  },
);

const service = interpret(machine);

service.start();

export default service;
