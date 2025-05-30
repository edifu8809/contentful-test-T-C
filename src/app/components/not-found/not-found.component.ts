import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {
  lang: string = 'es'; // valor por defecto

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.lang = this.route.snapshot.paramMap.get('lang') || 'es';
  }
}
