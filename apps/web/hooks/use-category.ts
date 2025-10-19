import { create } from "zustand";

interface CreateCategoryState {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useCreateCategory = create<CreateCategoryState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

interface EditCategoryState {
  isOpen: boolean;
  categoryId: string;
  name: string;
  onOpen: (categoryId: string, name: string) => void;
  onClose: () => void;
}

export const useEditCategory = create<EditCategoryState>((set) => ({
  isOpen: false,
  categoryId: "",
  name: "",
  onOpen: (categoryId, name) => set({ isOpen: true, categoryId, name }),
  onClose: () => set({ isOpen: false, categoryId: "", name: "" }),
}));

interface DeleteCategoryState {
  isOpen: boolean;
  categoryId: string;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export const useDeleteCategory = create<DeleteCategoryState>((set) => ({
  isOpen: false,
  categoryId: "",
  onOpen: (id: string) => set({ isOpen: true, categoryId: id }),
  onClose: () => set({ isOpen: false, categoryId: "" }),
}));
