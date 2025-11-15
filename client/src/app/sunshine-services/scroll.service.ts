import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {

  constructor() { }

  /**
   * Scrolls to the top of the page with smooth behavior
   */
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Scrolls to the top of the page instantly (without smooth behavior)
   */
  scrollToTopInstant(): void {
    window.scrollTo(0, 0);
  }

  /**
   * Scrolls to a specific element by ID
   * @param elementId - The ID of the element to scroll to
   */
  scrollToElement(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * Scrolls to a specific element by class name (first occurrence)
   * @param className - The class name of the element to scroll to
   */
  scrollToElementByClass(className: string): void {
    const element = document.querySelector(`.${className}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
} 