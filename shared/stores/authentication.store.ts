import create from 'zustand';

type Store = {
  token?: string;
  setToken(token: string | undefined): void;
};

const useAuthStore = create<Store>((set) => ({
  setToken(token: string) {
    set({token});
  },
}));

export default useAuthStore;
