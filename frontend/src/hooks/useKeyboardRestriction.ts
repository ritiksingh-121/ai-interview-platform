import { useEffect, useRef, useCallback } from "react";

interface UseKeyboardRestrictionOptions {
  enabled?: boolean;
  onViolation?: (type: string, message: string) => void;
}

export function useKeyboardRestriction(options: UseKeyboardRestrictionOptions = {}) {
  const { enabled = false, onViolation } = options;
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabledRef.current) return;

    const key = e.key;
    const ctrl = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;
    const alt = e.altKey;

    if (key === "F12") {
      e.preventDefault(); e.stopPropagation();
      onViolation?.("KEYBOARD_SHORTCUT", "Developer Tools shortcut blocked (F12)");
      return false;
    }

    if (key === "F11") {
      e.preventDefault(); e.stopPropagation();
      return false;
    }

    if ((key === "F5" || key === "F3") && !ctrl) {
      e.preventDefault(); e.stopPropagation();
      onViolation?.("KEYBOARD_SHORTCUT", `Refresh blocked (${key})`);
      return false;
    }

    if (key === "F1" || key === "F2" || key === "F4" || key === "F6" || key === "F7" || key === "F8" || key === "F9" || key === "F10") {
      e.preventDefault(); e.stopPropagation();
      return false;
    }

    if (ctrl && !shift && !alt) {
      if (["u", "s", "p", "r", "n", "t", "w", "c", "v", "x", "a", "f"].includes(key.toLowerCase())) {
        e.preventDefault(); e.stopPropagation();
        onViolation?.("KEYBOARD_SHORTCUT", `Shortcut blocked (Ctrl+${key.toUpperCase()})`);
        return false;
      }
    }

    if (ctrl && shift) {
      if (["I", "J", "C", "i", "j"].includes(key)) {
        e.preventDefault(); e.stopPropagation();
        onViolation?.("KEYBOARD_SHORTCUT", `DevTools shortcut blocked (Ctrl+Shift+${key.toUpperCase()})`);
        return false;
      }
      if (key === "Escape" || key === "Esc") {
        e.preventDefault(); e.stopPropagation();
        onViolation?.("KEYBOARD_SHORTCUT", "Task Manager shortcut blocked (Ctrl+Shift+Esc)");
        return false;
      }
      if (key.toLowerCase() === "d") {
        e.preventDefault(); e.stopPropagation();
        onViolation?.("KEYBOARD_SHORTCUT", "Bookmark shortcut blocked (Ctrl+Shift+D)");
        return false;
      }
      if (key.toLowerCase() === "b") {
        e.preventDefault(); e.stopPropagation();
        onViolation?.("KEYBOARD_SHORTCUT", "Bookmark sidebar blocked (Ctrl+Shift+B)");
        return false;
      }
      if (key.toLowerCase() === "o") {
        e.preventDefault(); e.stopPropagation();
        onViolation?.("KEYBOARD_SHORTCUT", "Bookmark manager blocked (Ctrl+Shift+O)");
        return false;
      }
    }

    if (alt && !ctrl && !shift) {
      if (["ArrowLeft", "ArrowRight"].includes(key)) {
        e.preventDefault(); e.stopPropagation();
        return false;
      }
      if (key.toLowerCase() === "d" || key.toLowerCase() === "f") {
        e.preventDefault(); e.stopPropagation();
        return false;
      }
      if (key === "Tab" || key === "Escape") {
        e.preventDefault(); e.stopPropagation();
        return false;
      }
    }

    if (e.metaKey) {
      e.preventDefault(); e.stopPropagation();
      return false;
    }

    return true;
  }, [onViolation]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (!enabledRef.current) return;
    if (e.key === "F12" || e.key === "F11" || e.altKey || e.metaKey) {
      e.preventDefault(); e.stopPropagation();
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault(); e.stopPropagation();
      onViolation?.("CONTEXT_MENU", "Right-click blocked");
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault(); e.stopPropagation();
      onViolation?.("COPY_PASTE", "Copy blocked");
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault(); e.stopPropagation();
      onViolation?.("COPY_PASTE", "Paste blocked");
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault(); e.stopPropagation();
      onViolation?.("COPY_PASTE", "Cut blocked");
    };

    const handleSelectStart = (e: Event) => {
      e.preventDefault();
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      onViolation?.("DRAG_DROP", "Drag & drop blocked");
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);
    document.addEventListener("contextmenu", handleContextMenu, true);
    document.addEventListener("copy", handleCopy, true);
    document.addEventListener("paste", handlePaste, true);
    document.addEventListener("cut", handleCut, true);
    document.addEventListener("selectstart", handleSelectStart, true);
    document.addEventListener("dragstart", handleDragStart, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
      document.removeEventListener("contextmenu", handleContextMenu, true);
      document.removeEventListener("copy", handleCopy, true);
      document.removeEventListener("paste", handlePaste, true);
      document.removeEventListener("cut", handleCut, true);
      document.removeEventListener("selectstart", handleSelectStart, true);
      document.removeEventListener("dragstart", handleDragStart, true);
    };
  }, [enabled, onViolation, handleKeyDown, handleKeyUp]);
}
