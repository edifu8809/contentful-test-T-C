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
    const lang = route.paramMap.get('lang') || '';
    const slug = route.paramMap.get('slug') || '';
  
    // Validar que lang sea "es" o "en"
    const validLangs = ['es', 'en'];
    if (!validLangs.includes(lang)) {
      return of(this.router.createUrlTree(['/404']));
    }
  
    const localeMap: Record<string, string> = {
      es: 'es-ES',
      en: 'en-US'
    };
  
    const fullLocale = localeMap[lang];
  
    return this.contentfulService.getBrandTermsWithFallback(slug, fullLocale).pipe(
      map(res => {
        const isValid = res?.items?.length > 0;
        return isValid ? true : this.router.createUrlTree(['/404']);
      }),
      catchError(() => of(this.router.createUrlTree(['/404'])))
    );
  }
  
}
