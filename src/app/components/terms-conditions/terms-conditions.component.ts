import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContentfulService } from 'src/app/contentful.service';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { Title, Meta, SafeHtml, DomSanitizer } from '@angular/platform-browser';
import gsap from 'gsap';

@Component({
  selector: 'app-terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.scss']
})
export class TermsConditionsComponent implements OnInit {
  private dropdownsEnhanced = false;
  locale = 'es';
  slug = '';
  isMobile = false;
  sanitizedIcons: SafeHtml[] = [];
  activeMobileTab: number | null = null;
  brand: {
    logo: string;
    nombre: string;
    primaryColor: string;
    accentColor: string;
    textColor: string;
    logoFooter: string;
    copyrightFooter: string;
  } | null = null;
  seo: {
    title: string;
    description: string;
    favicon: string;
  } = { title: '', description: '', favicon: '' };
  tabs: { title: string; description: string; icon: string }[] = [];
  activeTab: number = 0;

  constructor(
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private contentful: ContentfulService,
    private titleService: Title,
    private metaService: Meta
  ) {}

  ngOnInit() {
    this.checkIsMobile();
    window.addEventListener('resize', this.checkIsMobile.bind(this));
    this.route.paramMap.subscribe(params => {
      this.slug = params.get('slug') || '';
      const langParam = params.get('lang') || 'es';
      this.locale = langParam === 'en' ? 'en-US' : 'es-ES';
  
      this.contentful.getTermsWithFieldFallback(this.slug, this.locale).subscribe(data => {
        console.log('DATA COMPLETA:', data); 
        if (!data) {
          console.warn('No se encontró contenido para este slug:', this.slug);
          return;
        }
  
        // Configurar info de marca
        this.brand = {
          logo: data.logoUrl || '',
          nombre: data.nombre,
          primaryColor: data.primaryColor,
          accentColor: data.accentColor,
          textColor: data.textColor,
          logoFooter: data.logoFooter,
          copyrightFooter: data.copyrightFooter
        };

        // SEO info
        this.seo = {
          title: data.seoTitle,
          description: data.seoDescription,
          favicon: data.faviconUrl
        };

        // Aplicar título y meta description
        this.titleService.setTitle(this.seo.title || 'Default Title');
        this.metaService.updateTag({
          name: 'description',
          content: this.seo.description || ''
        });

        // Cambiar favicon
        if (this.seo.favicon) {
          const link: HTMLLinkElement =
            document.querySelector("link[rel*='icon']") || document.createElement('link');
          link.type = 'image/x-icon';
          link.rel = 'shortcut icon';
          link.href = this.seo.favicon;
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        console.log(this.brand)
        
        this.tabs = (data.tabs || []).map((tab: any) => {
          const iconHtml = tab.icon && tab.icon.nodeType === 'document'
            ? documentToHtmlString(tab.icon)
            : '';
            
          return {
            title: tab.title ?? 'Sin título',
            description: typeof tab.description === 'string'
              ? tab.description
              : documentToHtmlString(tab.description),
            icon: this.sanitizer.bypassSecurityTrustHtml(tab.icon || '')
          };
        });
      
        this.activeTab = 0;
        setTimeout(() => {
          this.animateTab(this.activeTab);
          this.enhanceDropdowns(); // transforma <h3> en acordeones
        }, 100);
      });
    });
  }
  ngOnDestroy(): void {
    window.removeEventListener('resize', this.checkIsMobile.bind(this));
  }
  
  checkIsMobile(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  ngAfterViewInit(): void {
    if (!this.dropdownsEnhanced) {
      this.enhanceDropdowns();
      this.dropdownsEnhanced = true;
    }
  }
  enhanceDropdowns(): void {
    const isMobile = window.innerWidth <= 768; // breakpoint
  
    if (!isMobile) return;
  
    const contents = document.querySelectorAll('.rich-text-content');
  
    contents.forEach(content => {
      const children = Array.from(content.children);
      let currentDropdown: HTMLElement | null = null;
  
      children.forEach(child => {
        if (child.tagName === 'H2') {
          const button = document.createElement('button');
          button.className = 'dropdown-toggle';
          button.type = 'button';
  
          // Crea span para el título
          const titleSpan = document.createElement('span');
          titleSpan.textContent = child.textContent || '';
          titleSpan.className = 'dropdown-title';
  
          // Crea span para el símbolo
          const symbolSpan = document.createElement('span');
          symbolSpan.className = 'toggle-symbol';
          symbolSpan.textContent = '+';
  
          // Agrega los spans al botón
          button.appendChild(titleSpan);
          button.appendChild(symbolSpan);
  
          // Crea el contenido
          const section = document.createElement('div');
          section.className = 'dropdown-content';
  
          button.onclick = () => {
            const isOpen = section.classList.contains('open');
  
            // Cierra todos los dropdowns y cambia símbolos a +
            document.querySelectorAll('.dropdown-content.open').forEach(openSection => {
              openSection.classList.remove('open');
              const btn = openSection.previousElementSibling as HTMLButtonElement;
              if (btn?.querySelector('.toggle-symbol')) {
                (btn.querySelector('.toggle-symbol') as HTMLElement).textContent = '+';
              }
            });
  
            if (!isOpen) {
              section.classList.add('open');
              symbolSpan.textContent = '–';
            }
          };
  
          child.replaceWith(button);
          button.insertAdjacentElement('afterend', section);
          currentDropdown = section;
        } else if (currentDropdown) {
          currentDropdown.appendChild(child);
        }
      });
    });
  }
  
  
  

  selectTab(index: number) {
    if (index === this.activeTab) return;
    this.activeTab = index;
    setTimeout(() => this.animateTab(index), 0);
  }

  animateTab(index: number) {
    gsap.fromTo(
      `.tab-content:nth-child(${index + 1})`,
      { autoAlpha: 0, y: 20 },
      { autoAlpha: 1, y: 0, duration: 0.5 }
    );
  }
  toggleMobileTab(index: number): void {
    this.activeMobileTab = this.activeMobileTab === index ? null : index;
  }
}
