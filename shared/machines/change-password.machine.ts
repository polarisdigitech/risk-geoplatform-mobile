import {assign, Machine, sendParent} from 'xstate';
import {changePassword} from '../../modules/Dashboard/services/api';

export type Context = {
  error?: string;
  isFirstTimeLogin?: boolean;
  passwords?: Record<string, string>;
};

export type Events =
  | {type: 'EDIT'; name: string; value: string}
  | {type: 'PASSWORD_CHANGED_CANCELED'}
  | {type: 'SUBMIT'};

const machine = Machine<Context, Events>(
  {
    initial: 'idle',
    on: {
      PASSWORD_CHANGED_CANCELED: {
        actions: sendParent('PASSWORD_CHANGED_CANCELED'),
      },
    },
    states: {
      idle: {
        on: {
          SUBMIT: 'submitting',
          EDIT: {
            actions: assign({
              passwords: ({passwords}, {name, value}) => {
                return {...passwords, [name]: value};
              },
            }),
          },
        },
      },
      submitting: {
        invoke: {
          onDone: 'submitted',
          src: 'changePassword',
          onError: {
            target: 'error',
            actions: assign({error: (_, {data}) => data}),
          },
        },
      },
      submitted: {
        type: 'final',
        entry: sendParent('PASSWORD_CHANGED'),
      },
      error: {
        after: {
          3000: 'idle',
        },
      },
    },
  },
  {
    services: {
      changePassword: ({passwords}) => changePassword(passwords as any),
    },
  },
);

export default machine;
