import { atom } from "jotai";

export const authState = atom({
  isAuthenticated: false,
  authState: null,
});
