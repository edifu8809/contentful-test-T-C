import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ContentfulService } from 'src/app/contentful.service';
@Injectable({
  providedIn: 'root'
})
export class LangSlugGuard implements CanActivate {
  private allowedLangs = ['es', 'en'];

  constructor(
    private contentfulService: ContentfulService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    const lang = route.paramMap.get('lang') || 'es'; // default a 'es' si no hay lang
    const slug = route.paramMap.get('slug') || '';
  
    if (!this.allowedLangs.includes(lang)) {
      return of(this.router.createUrlTree([`/${lang}/404`]));
    }
  
    const localeMap: Record<string, string> = {
      es: 'es-ES',
      en: 'en-US'
    };
  
    const fullLocale = localeMap[lang];
  
    return this.contentfulService.getBrandTermsWithFallback(slug, fullLocale).pipe(
      map(res => {
        const isValid = res?.items?.length > 0;
        return isValid ? true : this.router.createUrlTree([`/${lang}/404`]);
      }),
      catchError(() => of(this.router.createUrlTree([`/${lang}/404`])))
    );
  }
  
}
