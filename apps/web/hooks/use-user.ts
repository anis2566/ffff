import { create } from "zustand";

interface DeleteUserState {
  isOpen: boolean;
  userId: string;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export const useDeleteUser = create<DeleteUserState>((set) => ({
  isOpen: false,
  userId: "",
  onOpen: (id: string) => set({ isOpen: true, userId: id }),
  onClose: () => set({ isOpen: false, userId: "" }),
}));

interface ChangeRoleState {
  isOpen: boolean;
  userId: string;
  roles: string[];
  onOpen: (id: string, roles: string[]) => void;
  onClose: () => void;
}

export const useChangeRole = create<ChangeRoleState>((set) => ({
  isOpen: false,
  userId: "",
  roles: [],
  onOpen: (id: string, roles: string[]) =>
    set({ isOpen: true, userId: id, roles: roles }),
  onClose: () => set({ isOpen: false, userId: "", roles: [] }),
}));
