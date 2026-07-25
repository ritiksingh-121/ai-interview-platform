import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function useExitHandler({ onExit, navigateTo = "/dashboard" } = {}) {
  const [showExitDialog, setShowExitDialog] = useState(false);
  const exitingRef = useRef(false);
  const navigate = useNavigate();

  const openExitDialog = useCallback(() => {
    if (exitingRef.current) return;
    setShowExitDialog(true);
  }, []);

  const closeExitDialog = useCallback(() => {
    setShowExitDialog(false);
  }, []);

  const handleConfirmExit = useCallback(async () => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    setShowExitDialog(false);

    window.speechSynthesis?.cancel();

    if (onExit) {
      await onExit();
    }

    navigate(navigateTo, { replace: true });
  }, [onExit, navigate, navigateTo]);

  return {
    showExitDialog,
    openExitDialog,
    closeExitDialog,
    handleConfirmExit,
    ExitConfirmationModal: null,
  };
}
