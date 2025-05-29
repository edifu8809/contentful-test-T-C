import { TestBed } from '@angular/core/testing';

import { LangSlugGuard } from './lang-slug.guard';

describe('LangSlugGuard', () => {
  let guard: LangSlugGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(LangSlugGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
