// Simple scroll lock utility
let isLocked = false;
let originalBodyOverflow = '';
let originalHtmlOverflow = '';
let scrollY = 0;

export const lockScroll = () => {
  if (isLocked) return;
  
  isLocked = true;
  scrollY = window.scrollY;
  
  // Store original styles
  originalBodyOverflow = document.body.style.overflow;
  originalHtmlOverflow = document.documentElement.style.overflow;
  
  // Apply scroll lock
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
};

export const unlockScroll = () => {
  if (!isLocked) return;
  
  isLocked = false;
  
  // Restore original styles
  document.body.style.overflow = originalBodyOverflow;
  document.documentElement.style.overflow = originalHtmlOverflow;
  
  // Restore scroll position
  window.scrollTo(0, scrollY);
};

export const isScrollLocked = () => isLocked;
