import {assign, Machine} from 'xstate';

type Context = {
  error?: Error;
  data?: Record<string, unknown>;
};

type Events = {type: 'GET_DATA'};

const machine = Machine<Context, Events>({
  initial: 'idle',
  states: {
    idle: {
      on: {
        GET_DATA: 'loading',
      },
    },
    loading: {
      invoke: {
        src: 'fetch',
        onDone: {
          target: 'idle',
          actions: assign({data: (_, {data}) => data}),
        },
        onError: {
          target: 'error',
          actions: assign({error: (_, {data}) => data}),
        },
      },
    },
    error: {
      on: {
        GET_DATA: 'loading',
      },
    },
  },
});

export default machine;
