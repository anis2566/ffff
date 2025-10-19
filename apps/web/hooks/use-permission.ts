import { create } from "zustand";

interface CreatePermissionState {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useCreatePermission = create<CreatePermissionState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

interface EditPermissionState {
  isOpen: boolean;
  permissionId: string;
  module: string;
  action: string;
  roles: string[];
  onOpen: (id: string, module: string, action: string, roles: string[]) => void;
  onClose: () => void;
}

export const useEditPermission = create<EditPermissionState>((set) => ({
  isOpen: false,
  permissionId: "",
  module: "",
  action: "",
  roles: [],
  onOpen: (id: string, module: string, action: string, roles: string[]) =>
    set({ isOpen: true, permissionId: id, module, action, roles }),
  onClose: () => set({ isOpen: false, permissionId: "", module: "", action: "", roles: [] }),
}));


interface DeletePermissionState {
  isOpen: boolean;
  permissionId: string;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export const useDeletePermission = create<DeletePermissionState>((set) => ({
  isOpen: false,
  permissionId: "",
  onOpen: (id: string) => set({ isOpen: true, permissionId: id }),
  onClose: () => set({ isOpen: false, permissionId: "" }),
}));
