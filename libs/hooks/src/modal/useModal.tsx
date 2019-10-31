import { useEffect, useState } from "react";

export interface UseModalReturnType {
  isVisible: boolean;
  openModal: () => void;
  closeModal: () => void;
}
export interface UseModalProps {
  initialVisible?: boolean;
}
export function useModal({
  initialVisible = false
}: UseModalProps = {}): UseModalReturnType {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(initialVisible);
  }, [initialVisible]);

  const openModal = (): void => {
    setIsVisible(true);
  };

  const closeModal = (): void => {
    setIsVisible(false);
  };

  return {
    isVisible,
    openModal,
    closeModal
  };
}
