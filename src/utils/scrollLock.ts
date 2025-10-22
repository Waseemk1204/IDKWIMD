// Enhanced scroll lock utility with mobile support
let isLocked = false;
let originalBodyOverflow = '';
let originalHtmlOverflow = '';
let originalBodyPosition = '';
let originalBodyTop = '';
let originalBodyWidth = '';
let originalBodyHeight = '';
let scrollY = 0;

// Check if device is mobile
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth <= 768 ||
         ('ontouchstart' in window);
};

export const lockScroll = () => {
  if (isLocked) return;
  
  isLocked = true;
  scrollY = window.scrollY;
  
  // Store original styles
  originalBodyOverflow = document.body.style.overflow;
  originalHtmlOverflow = document.documentElement.style.overflow;
  originalBodyPosition = document.body.style.position;
  originalBodyTop = document.body.style.top;
  originalBodyWidth = document.body.style.width;
  originalBodyHeight = document.body.style.height;
  
  if (isMobile()) {
    // Mobile-specific scroll lock (less aggressive)
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    // Prevent touch scrolling without breaking layout
    document.body.style.touchAction = 'none';
    document.documentElement.style.touchAction = 'none';
    
    // Add CSS classes for additional mobile support
    document.body.classList.add('scroll-locked');
    document.documentElement.classList.add('scroll-locked');
  } else {
    // Desktop scroll lock
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }
};

export const unlockScroll = () => {
  if (!isLocked) return;
  
  isLocked = false;
  
  // Restore original styles
  document.body.style.overflow = originalBodyOverflow;
  document.documentElement.style.overflow = originalHtmlOverflow;
  document.body.style.position = originalBodyPosition;
  document.body.style.top = originalBodyTop;
  document.body.style.width = originalBodyWidth;
  document.body.style.height = originalBodyHeight;
  
  // Restore touch action
  document.body.style.touchAction = '';
  document.documentElement.style.touchAction = '';
  
  // Remove CSS classes
  document.body.classList.remove('scroll-locked');
  document.documentElement.classList.remove('scroll-locked');
  
  // Restore scroll position
  window.scrollTo(0, scrollY);
};

export const isScrollLocked = () => isLocked;
