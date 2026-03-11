import { create } from "zustand";

export const useAuthStore = create((set) => ({
  authUser: { name: "Rush", _id: 123, age: 24 },
  isLoggedIn: false,
  isLoading: false,

  login: () => {
    console.log("We just logged in");
    set({ isLoggedIn: true, isLoading: true });
  },
}));