import {assign, createMachine, sendParent} from 'xstate';
import login from '../../services/auth.service';

export type Context = {
  data?: any;
  error?: string;
  username?: string;
  password?: string;
  errors?: Map<string, string>;
};

export type Schema =
  | {value: 'idle'; context: Context}
  | {value: 'error'; context: Context}
  | {value: 'editing'; context: Context}
  | {value: 'validate'; context: Context}
  | {value: 'validationError'; context: Context}
  | {value: 'authenticating'; context: Context}
  | {value: 'authenticated'; context: Context};

export type Events =
  | {type: 'EDIT'}
  | {type: 'AUTHENTICATE'}
  | {type: 'EDIT.field'; name: string; value: string};

const machine = createMachine<Context, Events, Schema>(
  {
    initial: 'idle',
    context: {},
    states: {
      idle: {
        on: {
          EDIT: 'editing',
        },
      },
      error: {
        exit: 'clearError',
        after: {
          3000: 'editing',
        },
      },
      validationError: {
        exit: 'clearErrors',
        after: {
          3000: 'idle',
        },
      },
      editing: {
        on: {
          AUTHENTICATE: 'validate',
          'EDIT.field': {
            actions: assign((ctx, {name, value}) => {
              return {...ctx, [name]: value};
            }),
          },
        },
      },
      validate: {
        invoke: {
          src: 'validate',
          onDone: 'authenticating',
          onError: {
            target: 'validationError',
            actions: assign({errors: (_, {data}) => data}),
          },
        },
      },
      authenticating: {
        invoke: {
          src: 'authenticate',
          onDone: {
            target: 'authenticated',
            actions: assign({data: (_, {data}) => data}),
          },
          onError: {
            target: 'error',
            actions: assign({error: (_, {data}) => data}),
          },
        },
      },
      authenticated: {
        type: 'final',
        entry: sendParent(({data}) => ({type: 'AUTHENTICATED', ...data})),
      },
    },
  },
  {
    actions: {
      clearError: assign((ctx) => ({...ctx, error: undefined})),
      clearErrors: assign((ctx) => ({...ctx, errors: undefined})),
    },
    services: {
      authenticate: ({username, password}: any) => login({username, password}),
      validate: ({password, username}) => {
        const errors = new Map();

        if (!username || (username && !username.trim())) {
          errors.set('username', 'Username cannot be empty');
        }

        if (!password || (password && !password.trim())) {
          errors.set('password', 'Password cannot be empty');
        }

        if (errors.size > 0) {
          return Promise.reject(errors);
        }

        return Promise.resolve();
      },
    },
  },
);

export default machine;
