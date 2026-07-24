import { useEffect, useRef, useCallback } from "react";

interface UseKeyboardRestrictionOptions {
  enabled?: boolean;
  onViolation?: (type: string, message: string) => void;
}

const BLOCKED_KEYS: Record<string, { ctrl?: boolean; shift?: boolean; alt?: boolean; meta?: boolean; message: string }> = {
  "F12": { message: "Developer Tools (F12)" },
  "F11": { message: "Fullscreen toggle (F11)" },
  "F5": { message: "Refresh (F5)" },
  "F3": { message: "Search (F3)" },
  "u": { ctrl: true, message: "View Source (Ctrl+U)" },
  "s": { ctrl: true, message: "Save Page (Ctrl+S)" },
  "p": { ctrl: true, message: "Print (Ctrl+P)" },
  "r": { ctrl: true, message: "Refresh (Ctrl+R)" },
  "n": { ctrl: true, message: "New Window (Ctrl+N)" },
  "t": { ctrl: true, message: "New Tab (Ctrl+T)" },
  "w": { ctrl: true, message: "Close Tab (Ctrl+W)" },
  "c": { ctrl: true, message: "Copy (Ctrl+C)" },
  "v": { ctrl: true, message: "Paste (Ctrl+V)" },
  "x": { ctrl: true, message: "Cut (Ctrl+X)" },
  "a": { ctrl: true, message: "Select All (Ctrl+A)" },
  "I": { ctrl: true, shift: true, message: "DevTools Inspector (Ctrl+Shift+I)" },
  "J": { ctrl: true, shift: true, message: "DevTools Console (Ctrl+Shift+J)" },
  "C": { ctrl: true, shift: true, message: "DevTools Elements (Ctrl+Shift+C)" },
  "i": { ctrl: true, shift: true, message: "DevTools (Ctrl+Shift+I)" },
  "j": { ctrl: true, shift: true, message: "DevTools Console (Ctrl+Shift+J)" },
  "Escape": { ctrl: true, shift: true, message: "Task Manager (Ctrl+Shift+Esc)" },
};

export function useKeyboardRestriction(options: UseKeyboardRestrictionOptions = {}) {
  const { enabled = false, onViolation } = options;
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!enabledRef.current) return;

      const key = e.key;
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const alt = e.altKey;

      if (key === "F12") {
        e.preventDefault();
        e.stopPropagation();
        onViolation?.("KEYBOARD_SHORTCUT", "Developer Tools shortcut blocked (F12)");
        return false;
      }

      if (key === "F11") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      if ((key === "F5" || key === "F3") && !ctrl) {
        e.preventDefault();
        e.stopPropagation();
        onViolation?.("KEYBOARD_SHORTCUT", `Refresh blocked (${key})`);
        return false;
      }

      if (ctrl && !shift && !alt) {
        if (["u", "s", "p", "r", "n", "t", "w", "c", "v", "x", "a"].includes(key.toLowerCase())) {
          e.preventDefault();
          e.stopPropagation();
          onViolation?.("KEYBOARD_SHORTCUT", `Shortcut blocked (Ctrl+${key.toUpperCase()})`);
          return false;
        }
      }

      if (ctrl && shift) {
        if (["I", "J", "C", "i", "j"].includes(key)) {
          e.preventDefault();
          e.stopPropagation();
          onViolation?.("KEYBOARD_SHORTCUT", `DevTools shortcut blocked (Ctrl+Shift+${key.toUpperCase()})`);
          return false;
        }
        if (key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }

      if (alt) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      if (e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      return true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "F12" || e.key === "F11" || e.altKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onViolation?.("KEYBOARD_SHORTCUT", "Right-click blocked");
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onViolation?.("COPY_PASTE", "Copy blocked");
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onViolation?.("COPY_PASTE", "Paste blocked");
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onViolation?.("COPY_PASTE", "Cut blocked");
    };

    const handleSelectStart = (e: Event) => {
      e.preventDefault();
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDoubleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("input, textarea, [contenteditable]")) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);
    document.addEventListener("contextmenu", handleContextMenu, true);
    document.addEventListener("copy", handleCopy, true);
    document.addEventListener("paste", handlePaste, true);
    document.addEventListener("cut", handleCut, true);
    document.addEventListener("selectstart", handleSelectStart, true);
    document.addEventListener("dragstart", handleDragStart, true);
    document.addEventListener("dblclick", handleDoubleClick, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
      document.removeEventListener("contextmenu", handleContextMenu, true);
      document.removeEventListener("copy", handleCopy, true);
      document.removeEventListener("paste", handlePaste, true);
      document.removeEventListener("cut", handleCut, true);
      document.removeEventListener("selectstart", handleSelectStart, true);
      document.removeEventListener("dragstart", handleDragStart, true);
      document.removeEventListener("dblclick", handleDoubleClick, true);
    };
  }, [enabled, onViolation]);
}
