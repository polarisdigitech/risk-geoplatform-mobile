import {assign, Machine} from 'xstate';
import {getAddressStructure, queryAddresses} from '../services/address.service';

interface AddressStateSchema {
  states: {
    idle: {};
    loading: {};
    error: {};
  };
}

interface AddressContext {
  error?: Error;
  status: number;
  structure?: any;
  addresses?: Record<string, any>[];
}

type AddressEvents = {type: 'FETCH'};

const UNVERIFIED_STATUS = 3;

/**
 * This state machine is responsible for
 * getting the addresses assigned to
 * a given field worker.
 */
export const addressMachine = Machine<
  AddressContext,
  AddressStateSchema,
  AddressEvents
>(
  {
    initial: 'idle',
    id: 'addressMachine',
    context: {
      status: UNVERIFIED_STATUS,
    },
    states: {
      idle: {
        on: {
          FETCH: 'loading',
        },
      },
      loading: {
        invoke: {
          src: 'fetch',
          onDone: {
            target: 'idle',
            actions: assign((_ctx, {data: {structure, addresses}}) => {
              return {addresses, structure};
            }),
          },
          onError: {
            target: 'error',
            actions: assign({
              error: (_ctx, {data}) => data,
            }),
          },
        },
      },
      error: {
        on: {
          FETCH: 'loading',
        },
      },
    },
  },
  {
    services: {
      fetch: async ({status}) => {
        let [structure, {addresses}] = await Promise.all([
          getAddressStructure(),
          queryAddresses(status),
        ]);

        return {structure, addresses};
      },
    },
  },
);
