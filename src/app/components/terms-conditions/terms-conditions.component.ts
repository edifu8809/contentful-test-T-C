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
  locale = 'es';
  slug = '';
  sanitizedIcons: SafeHtml[] = [];
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
        setTimeout(() => this.animateTab(0), 100);
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
}
