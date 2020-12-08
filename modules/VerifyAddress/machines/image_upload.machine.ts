import {assign, createMachine} from 'xstate';
import {uploadPhoto} from '../../../services/address.service';
import {Photo} from '../../../types';

type Context = Photo & {
  error?: any;
  result?: string;
};

export type States =
  | {
      value: 'idle';
      context: Context;
    }
  | {
      value: 'uploading';
      context: Context;
    }
  | {
      value: 'uploaded';
      context: Context & {
        result: string;
      };
    }
  | {
      value: 'error';
      context: Context & {error: string};
    };

export type Events = ({type: 'UPLOAD'} & Photo) | {type: 'RETRY'};

export const uploadMachine = createMachine<Context, Events, States>(
  {
    initial: 'idle',
    id: 'upload-machine',
    states: {
      idle: {
        on: {
          UPLOAD: {
            target: 'uploading',
            actions: assign((_ctx, {uri, imgType, fileName}) => {
              return {uri, imgType, fileName};
            }),
          },
        },
      },
      uploading: {
        invoke: {
          src: 'upload',
          onDone: {
            target: 'uploaded',
            actions: assign({
              result: (_ctx, {data: {message}}) => message,
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
      uploaded: {
        on: {
          UPLOAD: 'uploading',
        },
      },
      error: {
        on: {
          RETRY: 'uploading',
        },
      },
    },
  },
  {
    services: {
      upload: ({uri, imgType: type, fileName: name}) => {
        let formData = new FormData();
        formData.append('image', {uri, type, name});
        return uploadPhoto(formData);
      },
    },
  },
);
