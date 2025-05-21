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
  brand: any;
  tabs: any[] = [];
  activeTab: number = 0;
  constructor(
    private route: ActivatedRoute,
    private contentful: ContentfulService
  ) {}

  ngOnInit() {
    setTimeout(() => this.animateTab(0), 100);
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.contentful.getBrandTerms(slug).subscribe((res: any) => {
      const entry = res.items?.[0]?.fields;
  
      if (!entry) {
        console.warn('No se encontró contenido para este slug:', slug);
        return;
      }
  
      this.brand = {
        logo: entry.logo?.fields?.file?.url || ''
      };
  
      console.log('Tabs recibidos:', entry.tabs);
  
      this.tabs = (entry.tabs || []).map((tab: any) => ({
        title: tab?.fields?.title ?? 'Sin título',
        description: documentToHtmlString(tab?.fields?.description),  // <- Aquí lo convertimos a HTML
        icon: tab?.fields?.icon?.fields?.file?.url ?? ''
      }));
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
