import {AddressDetails} from '../types';

export const accuracyThreshold = 5;

export const serverEndpoint = 'https://35.195.248.149';

export const networkErrorMsg =
  'There was a network error, check your connection and try again.';

export function formatAddress({texts, images, checkboxes}: AddressDetails) {
  const checks: Record<string, string> = {};
  const _images: Record<string, string> = {};

  for (const label in checkboxes) {
    const checkbox = checkboxes[label];
    checks[label] = Array.from(checkbox).join('|');
  }

  for (const key in images) {
    _images[key] = images[key].cloudUri as string;
  }

  return {...checks, ...texts, ..._images};
}
