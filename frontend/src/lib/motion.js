export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.07 } },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.94 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

export const slideRight = {
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export const slideUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: 24, transition: { duration: 0.2 } },
};
