import {AddressDetails} from '../types';

export default function formatAddress({
  texts,
  images,
  checkboxes,
}: AddressDetails) {
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
