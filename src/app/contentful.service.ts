import { Injectable } from '@angular/core';
import { createClient } from 'contentful';
import { from } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class ContentfulService {


  private client = createClient({
    space: 'umc2rtdcxvfp',
    accessToken: 'DRAaUP5qyeABlF3h5Tk1ILeWd4CP3Qg6HjoqIO6_hbA'
  });

  getBrandTerms(slug: string) {
    return from(this.client.getEntries({
      content_type: 'brandTerms',
      'fields.slug': slug,
      include: 2  // importante para expandir los tabs e íconos
    }));
  }
}