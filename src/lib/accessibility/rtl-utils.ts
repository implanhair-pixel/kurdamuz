/**
 * Accessibility and RTL Support Utilities for Dialect Comparison Platform
 * 
 * This utility provides functions and helpers for ensuring proper RTL support
 * and accessibility compliance for Kurdish language content.
 */

/**
 * Check if text is RTL (Right-to-Left)
 */
export function isRTL(text: string): boolean {
  // Kurdish uses Arabic script which is RTL
  const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return rtlRegex.test(text);
}

/**
 * Get text direction based on content
 */
export function getTextDirection(text: string): 'rtl' | 'ltr' {
  return isRTL(text) ? 'rtl' : 'ltr';
}

/**
 * Apply RTL-aware styling
 */
export function getRTLStyles(isRTL: boolean) {
  return {
    direction: isRTL ? 'rtl' as const : 'ltr' as const,
    textAlign: isRTL ? 'right' as const : 'left' as const,
  };
}

/**
 * Generate ARIA label for interactive elements
 */
export function generateAriaLabel(action: string, target: string): string {
  return `${action} ${target}`;
}

/**
 * Check color contrast ratio (WCAG AA requires 4.5:1 for normal text)
 */
export function checkColorContrast(foreground: string, background: string): number {
  // Simplified contrast calculation
  const getLuminance = (hex: string): number => {
    const rgb = hex.match(/\w\w/g)?.map(x => parseInt(x, 16)) || [0, 0, 0];
    const [r, g, b] = rgb.map(c => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(background);
  const l2 = getLuminance(foreground);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG AA standard
 */
export function meetsWCAGAA(foreground: string, background: string): boolean {
  return checkColorContrast(foreground, background) >= 4.5;
}

/**
 * Check if contrast meets WCAG AAA standard
 */
export function meetsWCAGAAA(foreground: string, background: string): boolean {
  return checkColorContrast(foreground, background) >= 7;
}

/**
 * Get accessible focus styles
 */
export function getFocusStyles() {
  return {
    outline: '2px solid #3b82f6',
    outlineOffset: '2px',
  };
}

/**
 * Generate skip link for keyboard navigation
 */
export function generateSkipLink(targetId: string): string {
  return `#${targetId}`;
}

/**
 * Check if element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ];

  return focusableSelectors.some(selector => element.matches(selector));
}

/**
 * Trap focus within a container (for modals)
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleTabKey);

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Announce screen reader message
 */
export function announceToScreenReader(message: string): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Get Kurdish-specific font family
 */
export function getKurdishFontFamily(): string {
  return '"Vazirmatn", "Noto Sans Arabic", "Arial", sans-serif';
}

/**
 * Normalize Kurdish text for search
 */
export function normalizeKurdishText(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670]/g, '') // Remove Arabic diacritics
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Validate Kurdish text input
 */
export function validateKurdishInput(text: string): {
  valid: boolean;
  error?: string;
} {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'Text is required' };
  }

  // Check for valid Kurdish characters
  const kurdishRegex = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\-\'\.,!?]+$/;
  if (!kurdishRegex.test(text)) {
    return { valid: false, error: 'Contains invalid characters for Kurdish text' };
  }

  return { valid: true };
}

/**
 * Get accessible button props
 */
export function getAccessibleButtonProps(label: string, disabled?: boolean) {
  return {
    'aria-label': label,
    'aria-disabled': disabled,
    role: 'button',
    tabIndex: disabled ? -1 : 0,
  };
}

/**
 * Get accessible input props
 */
export function getAccessibleInputProps(label: string, required?: boolean, error?: string) {
  return {
    'aria-label': label,
    'aria-required': required,
    'aria-invalid': !!error,
    'aria-describedby': error ? `${label}-error` : undefined,
  };
}
