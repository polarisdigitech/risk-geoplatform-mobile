export type LatLng = {
  latitude: number;
  longitude: number;
};

export interface Photo {
  uri: string;
  imgType: string;
  fileName: string;
}

export type PendingImage = Photo & {cloudUri?: string};

export interface AddressDetails {
  texts: Record<string, string>;
  images: Record<string, PendingImage>;
  checkboxes: Record<string, Set<string>>;
}
