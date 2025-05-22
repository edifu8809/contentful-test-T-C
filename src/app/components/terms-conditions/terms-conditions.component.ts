import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContentfulService } from 'src/app/contentful.service';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import gsap from 'gsap';

@Component({
  selector: 'app-terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.scss']
})
export class TermsConditionsComponent implements OnInit {
  locale = 'es';
  slug = '';
  brand: { logo: string } | null = null;
  tabs: { title: string; description: string; icon: string }[] = [];
  activeTab: number = 0;

  constructor(
    private route: ActivatedRoute,
    private contentful: ContentfulService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.slug = params.get('slug') || '';
      const langParam = params.get('lang') || 'es';
      this.locale = langParam === 'en' ? 'en-US' : 'es-ES';
  
      this.contentful.getTermsWithFieldFallback(this.slug, this.locale).subscribe(data => {
        if (!data) {
          console.warn('No se encontró contenido para este slug:', this.slug);
          return;
        }
  
        this.brand = {
          logo: data.logoUrl || ''
        };
  
        this.tabs = (data.tabs || []).map((tab: any) => ({
          title: tab.title ?? 'Sin título',
          description: typeof tab.description === 'string'
            ? tab.description
            : documentToHtmlString(tab.description),
          icon: tab.icon ?? ''
        }));
  
        this.activeTab = 0;
        setTimeout(() => this.animateTab(0), 100);
      });
    });
  }
  

  loadContent() {
    this.contentful.getBrandTerms(this.slug, this.locale).subscribe((res: any) => {
      const entry = res?.items?.[0]?.fields;

      if (!entry) {
        console.warn('No se encontró contenido para este slug:', this.slug);
        return;
      }

      this.brand = {
        logo: entry.logo?.fields?.file?.url ?? ''
      };

      this.tabs = (entry.tabs || []).map((tab: any) => ({
        title: tab?.fields?.title ?? 'Sin título',
        description: documentToHtmlString(tab?.fields?.description),
        icon: tab?.fields?.icon?.fields?.file?.url ?? ''
      }));

      this.activeTab = 0;
      setTimeout(() => this.animateTab(0), 100);
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
