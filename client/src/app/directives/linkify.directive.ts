import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appLinkify]'
})
export class LinkifyDirective {

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  @HostListener('input') onInput() {
    this.linkify();
  }

  private linkify() {
    const text = this.el.nativeElement.value;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const linkifiedText = text.replace(urlRegex, (url: any) => `<a href="${url}" target="_blank">${url}</a>`);
    this.renderer.setProperty(this.el.nativeElement, 'innerHTML', linkifiedText);
  }
}
