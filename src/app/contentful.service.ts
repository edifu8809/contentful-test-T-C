import { Injectable } from '@angular/core';
import { createClient, Entry } from 'contentful';
import { Observable, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ContentfulService {
  private client = createClient({  
  space: 'umc2rtdcxvfp',
  accessToken: 'DRAaUP5qyeABlF3h5Tk1ILeWd4CP3Qg6HjoqIO6_hbA'
  });
  getBrandTerms(slug: string, locale: string): Observable<any> {
    return from(this.client.getEntries({
      content_type: 'brandTerms',
      'fields.slug': slug,
      locale
    }));
  }
  getTermsBySlug(slug: string, locale: string): Observable<any> {
    return from(this.client.getEntries({
      content_type: 'brandTerms',
      'fields.slug': slug,
      locale
    })).pipe(
      map(response => {
        if (response.items.length > 0) {
          const entry = response.items[0];
          return this.mapEntryFields(entry);
        }
        return null;
      })
    );
  }

  private mapEntryFields(entry: Entry<any>): any {
    return {
      slug: entry.fields.slug,
      logoUrl: entry.fields.logo?.fields?.file?.url,
      primaryColor: entry.fields.primaryColor ?? '#ffffff',
      accentColor: entry.fields.accentColor ?? '#ff0000',
      textColor: entry.fields.textColor ?? '#000000',
      tabs: (entry.fields.tabs || []).map((tabRef: any, i: number) => {
        if (!tabRef?.fields) {
          console.warn(`Tab en posición ${i} no tiene fields definidos`, tabRef);
          return null;
        }
        const tab = tabRef.fields;
        return {
          title: tab.title ?? 'Sin título',
          description: tab.description,
          icon: tab.icon?.fields?.file?.url ?? ''
        };
      }).filter(Boolean) // elimina los nulls
    };
  }
  getBrandTermsWithFallback(slug: string, locale: string): Observable<any> {
    return this.getBrandTerms(slug, locale).pipe(
      switchMap((res: any) => {
        if (res.items?.length > 0) {
          return of(res);
        } else if (locale !== 'en-US') {
          console.warn(`No se encontró contenido en-US '${locale}', intentando con 'en-US'`);
          return this.getBrandTerms(slug, 'en-US');
        } else {
          return of(res);
        }
      })
    );
  }
  getTermsWithFieldFallback(slug: string, locale: string): Observable<any> {
    return this.getTermsBySlug(slug, locale).pipe(
      switchMap(localEntry => {
        if (locale === 'en-US' || localEntry == null) {
          return of(localEntry);
        }
  
        return this.getTermsBySlug(slug, 'en-US').pipe(
          map(fallbackEntry => {
            if (!fallbackEntry) return localEntry;
  
            // Rellenar los campos faltantes con los del fallback
            return {
              ...localEntry,
              logoUrl: localEntry.logoUrl || fallbackEntry.logoUrl,
              tabs: (localEntry.tabs || []).map((tab: any, i: number) => {
                const fallbackTab = fallbackEntry.tabs?.[i] || {};
                return {
                  title: tab.title || fallbackTab.title,
                  description: tab.description || fallbackTab.description,
                  icon: tab.icon || fallbackTab.icon
                };
              })
            };
          })
        );
      })
    );
  }
}



