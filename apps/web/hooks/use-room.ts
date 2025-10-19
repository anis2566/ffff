import { create } from "zustand";

interface DeleteRoomState {
  isOpen: boolean;
  roomId: string;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export const useDeleteRoom = create<DeleteRoomState>((set) => ({
  isOpen: false,
  roomId: "",
  onOpen: (id: string) => set({ isOpen: true, roomId: id }),
  onClose: () => set({ isOpen: false, roomId: "" }),
}));
