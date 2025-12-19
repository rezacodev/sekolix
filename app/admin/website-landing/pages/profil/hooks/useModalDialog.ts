import { useState } from "react";

export interface ModalState {
  isOpen: boolean;
  title?: string;
  message?: string;
  type?: "success" | "error" | "warning" | "info" | "confirm";
  confirmText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function useModalDialog() {
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: "info",
  });

  const showSuccess = (title: string, message?: string) => {
    setModal({
      isOpen: true,
      type: "success",
      title,
      message,
    });
    setTimeout(() => setModal({ isOpen: false }), 2000);
  };

  const showError = (title: string, message?: string) => {
    setModal({
      isOpen: true,
      type: "error",
      title,
      message,
    });
  };

  const showWarning = (title: string, message?: string) => {
    setModal({
      isOpen: true,
      type: "warning",
      title,
      message,
    });
  };

  const showConfirm = (
    title: string,
    message: string | undefined,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    setModal({
      isOpen: true,
      type: "confirm",
      title,
      message,
      confirmText: "Hapus",
      onConfirm,
      onCancel,
    });
  };

  const closeModal = () => {
    setModal({ isOpen: false });
  };

  return {
    modal,
    showSuccess,
    showError,
    showWarning,
    showConfirm,
    closeModal,
  };
}
