import Geolocation from 'react-native-geolocation-service';
import {assign, createMachine} from 'xstate';
import {submitAddress} from '../../services/address.service';
import {AddressDetails, Photo} from '../../types';
import formatAddress from '../../utils/format_address';

type StringRecord = Record<string, string>;

type ConnectionStatus = 'offline' | 'online';

type EventsParams = {label: string; value: string};

export type VerifyAddressContext = AddressDetails & {
  error?: Error;
  address?: any;
  errors?: StringRecord;
  status: ConnectionStatus;
  structure?: Record<string, any>[];
  coords?: Geolocation.GeoCoordinates;
};

export type VerifyAddressEvents =
  | {type: 'EDIT'}
  | {type: 'SAVE'}
  | {type: 'RETRY'}
  | {type: 'SUBMIT'}
  | {type: 'GET_STRUCTURE'}
  | ({type: 'EDIT_TEXT'} & EventsParams)
  | ({type: 'TOGGLE_CHECKBOX'} & EventsParams)
  | ({type: 'SET_UPLOADED_IMAGE'} & EventsParams)
  | ({type: 'SET_LOCAL_IMAGE'; label: string} & Photo)
  | {type: 'SET_COORDS'; coords: Geolocation.GeoCoordinates}
  | {type: 'SET_CONNECTION_STATUS'; status: ConnectionStatus};

export type VerifyAddressStates =
  | {value: 'idle'; context: VerifyAddressContext & {addressId: number}}
  | {value: 'fetching_structure'; context: VerifyAddressContext}
  | {value: 'editting'; context: VerifyAddressContext}
  | {value: 'validate_coords'; context: VerifyAddressContext}
  | {value: 'validator'; context: VerifyAddressContext}
  | {value: 'validate'; context: VerifyAddressContext}
  | {value: 'submitting'; context: VerifyAddressContext}
  | {value: 'saving'; context: VerifyAddressContext}
  | {value: 'uploading'; context: VerifyAddressContext}
  | {value: 'saved'; context: VerifyAddressContext}
  | {value: 'submitted'; context: VerifyAddressContext}
  | {value: 'error'; context: VerifyAddressContext & {error: Error}}
  | {value: 'fetching_error'; context: VerifyAddressContext & {error: Error}}
  | {
      value: 'validation_error';
      context: VerifyAddressContext & {errors: StringRecord};
    };

const locationError =
  'Unable to get your location. Make sure your GPS is on and then try again.';

const hasStructure = ({structure}: any) => (structure ? true : false);

export const verifyAddressMachine = createMachine<
  VerifyAddressContext,
  VerifyAddressEvents,
  VerifyAddressStates
>(
  {
    initial: 'idle',
    on: {
      SET_CONNECTION_STATUS: {
        target: undefined,
        actions: assign({status: (_ctx, {status}) => status}),
      },
      EDIT_TEXT: {
        target: 'editing',
        actions: assign((ctx, {label, value}) => {
          return {...ctx, texts: {...ctx.texts, [label]: value}};
        }),
      },
      SET_COORDS: {
        actions: assign((ctx, {coords}) => {
          return {...ctx, coords};
        }),
      },
      SET_LOCAL_IMAGE: {
        target: 'editing',
        actions: assign((ctx, {label, ...image}) => {
          return {...ctx, images: {...ctx.images, [label]: image}};
        }),
      },
      SET_UPLOADED_IMAGE: {
        target: 'editing',
        actions: assign((ctx, {label, value}) => {
          const image = ctx.images[label];
          return {
            ...ctx,
            images: {
              ...ctx.images,
              [label]: {...image, cloudUri: value},
            },
          };
        }),
      },
      TOGGLE_CHECKBOX: {
        target: 'editing',
        actions: assign((ctx, {label, value}) => {
          const checks = ctx.checkboxes;
          const checkboxes = checks[label] ?? new Set();

          // Check if selected value is already
          // among the recorded checked items.
          if (checkboxes.has(value)) {
            // Remove item from checked list
            checkboxes.delete(value);
          } else {
            // Add item to checked list
            checkboxes.add(value);
          }

          // Re-assign all the checkd values with
          // the label of the given field.
          checks[label] = checkboxes;

          return {...ctx, checkboxes: checks};
        }),
      },
    },
    states: {
      idle: {
        on: {
          EDIT: 'editing',
          GET_STRUCTURE: 'fetching_structure',
        },
      },
      fetching_structure: {
        invoke: {
          src: 'fetch_structure',
          onError: {
            target: 'error',
            actions: 'setError',
          },
          onDone: {
            target: 'idle',
            actions: assign({structure: (_ctx, {data}) => data}),
          },
        },
      },
      editing: {
        entry: assign((ctx) => ({...ctx, errors: undefined})),
        on: {
          SUBMIT: 'validator',
        },
      },
      validator: {
        always: [
          {target: 'validate', cond: 'hasStructure'},
          {target: 'validate_coords', cond: 'noStructure'},
        ],
      },
      validate: {
        invoke: {
          src: 'validate',
          onDone: 'validate_coords',
          onError: {
            target: 'validation_error',
            actions: assign((ctx, {data}) => ({...ctx, errors: data})),
          },
        },
      },
      validate_coords: {
        invoke: {
          onDone: 'submitting',
          src: 'validateCoords',
          onError: {
            target: 'error',
            actions: 'setError',
          },
        },
      },
      submitting: {
        always: [
          {target: 'uploading', cond: 'isOnline'},
          {target: 'saving', cond: 'isOffline'},
        ],
      },
      saving: {
        invoke: {
          onDone: 'saved',
          src: 'saveMachineState',
          onError: {
            target: 'error',
            actions: 'setError',
          },
        },
      },
      uploading: {
        invoke: {
          src: 'upload',
          onDone: 'submitted',
          onError: {
            target: 'error',
            actions: 'setError',
          },
        },
      },
      saved: {
        entry: 'notifySaved',
        on: {
          SUBMIT: 'uploading',
        },
      },
      submitted: {
        type: 'final',
        entry: 'notifySubmitted',
      },
      validation_error: {},
      error: {
        after: {
          3000: {
            target: 'editing',
            actions: assign((ctx) => ({...ctx, error: undefined})),
          },
        },
      },
    },
  },
  {
    actions: {
      setError: assign((_ctx, {data}: any) => ({..._ctx, error: data})),
    },
    guards: {
      hasStructure,
      noStructure: (ctx) => !hasStructure(ctx),
      isOnline: ({status}) => status === 'online',
      isOffline: ({status}) => status === 'offline',
    },
    services: {
      validateCoords: ({coords}) => {
        if (!coords) {
          const err = new Error('Location error');
          err.message = locationError;
          return Promise.reject(err);
        }

        return Promise.resolve();
      },
      validate: ({texts, status, images, structure = [], checkboxes}) => {
        let errors = {} as any;

        for (const address of structure) {
          let value;
          const {fieldName, fieldType, required} = address;

          if (fieldType === 'image') {
            const {uri, cloudUri} = images[fieldName] ?? {};
            value = status === 'offline' ? uri : cloudUri;
          } else if (fieldType === 'check') {
            value = checkboxes[fieldName];
          } else {
            value = texts[fieldName];
          }

          if (value && value instanceof Set) {
            if (value.size <= 0) {
              errors[fieldName] = 'This field is required';
            }
          } else {
            if (!value && required) {
              errors[fieldName] = 'This field is required';
            }
          }
        }

        if (Object.keys(errors).length > 0) {
          return Promise.reject(errors);
        }

        return Promise.resolve();
      },
      upload: (ctx) => {
        const {
          coords,
          address: {id},
        } = ctx;

        const data = formatAddress(ctx);
        const {latitude, longitude} = coords as any;
        return submitAddress({id, data, latitude, longitude});
      },
    },
  },
);
