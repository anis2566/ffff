import { create } from "zustand";

interface CreateRoleState {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useCreateRole = create<CreateRoleState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

interface EditRoleState {
  isOpen: boolean;
  roleId: string;
  name: string;
  description?: string;
  onOpen: (roleId: string, name: string, description?: string) => void;
  onClose: () => void;
}

export const useEditRole = create<EditRoleState>((set) => ({
  isOpen: false,
  roleId: "",
  name: "",
  description: "",
  onOpen: (roleId, name, description) =>
    set({ isOpen: true, roleId, name, description }),
  onClose: () => set({ isOpen: false, roleId: "", name: "", description: "" }),
}));

interface DeleteRoleState {
  isOpen: boolean;
  roleId: string;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export const useDeleteRole = create<DeleteRoleState>((set) => ({
  isOpen: false,
  roleId: "",
  onOpen: (id: string) => set({ isOpen: true, roleId: id }),
  onClose: () => set({ isOpen: false, roleId: "" }),
}));
