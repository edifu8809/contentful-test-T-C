import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TermsConditionsComponent } from './components/terms-conditions/terms-conditions.component';


const routes: Routes = [
  { path: '', redirectTo: '/terminos/marca-x', pathMatch: 'full' },
  { path: 'terminos/:slug', component: TermsConditionsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
