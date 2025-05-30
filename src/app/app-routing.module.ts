import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TermsConditionsComponent } from './components/terms-conditions/terms-conditions.component';
import { LangSlugGuard } from './guards/lang-slug.guard';
import { NotFoundComponent } from './components/not-found/not-found.component';


const routes: Routes = [
  { path: '', redirectTo: '/es/terminos/marca-x', pathMatch: 'full' },
  {
    path: ':lang/terminos/:slug',
    component: TermsConditionsComponent,
    canActivate: [LangSlugGuard]
  },
   
   { path: ':lang/404', component: NotFoundComponent },
   { path: ':lang/**', redirectTo: ':lang/404' },
   { path: '**', redirectTo: '/es/404' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
