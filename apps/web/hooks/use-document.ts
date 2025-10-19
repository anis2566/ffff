import { create } from "zustand";

interface DeleteDocumentState {
  isOpen: boolean;
  documentId: string;
  onOpen: (id: string) => void;
  onClose: () => void;
}

export const useDeleteDocument = create<DeleteDocumentState>((set) => ({
  isOpen: false,
  documentId: "",
  onOpen: (id: string) => set({ isOpen: true, documentId: id }),
  onClose: () => set({ isOpen: false, documentId: "" }),
}));

interface ToggleReceivedState {
  isOpen: boolean;
  documentId: string;
  hasReceived: boolean;
  onOpen: (id: string, hasReceived: boolean) => void;
  onClose: () => void;
}

export const useToggleReceived = create<ToggleReceivedState>((set) => ({
  isOpen: false,
  documentId: "",
  hasReceived: false,
  onOpen: (id: string, hasReceived: boolean) =>
    set({ isOpen: true, documentId: id, hasReceived }),
  onClose: () => set({ isOpen: false, documentId: "", hasReceived: false }),
}));

interface ToggleFinishedState {
  isOpen: boolean;
  documentId: string;
  hasFinished: boolean;
  onOpen: (id: string, hasFinished: boolean) => void;
  onClose: () => void;
}

export const useToggleFinished = create<ToggleFinishedState>((set) => ({
  isOpen: false,
  documentId: "",
  hasFinished: false,
  onOpen: (id: string, hasFinished: boolean) =>
    set({ isOpen: true, documentId: id, hasFinished }),
  onClose: () => set({ isOpen: false, documentId: "", hasFinished: false }),
}));

interface PushToPrintTaskState {
  isOpen: boolean;
  documentId: string;
  noOfCopy: string;
  onOpen: (id: string, noOfCopy: string) => void;
  onClose: () => void;
}

export const usePushToPrintTask = create<PushToPrintTaskState>((set) => ({
  isOpen: false,
  documentId: "",
  noOfCopy: "",
  onOpen: (id: string, noOfCopy: string) =>
    set({ isOpen: true, documentId: id, noOfCopy }),
  onClose: () => set({ isOpen: false, documentId: "", noOfCopy: "" }),
}));
