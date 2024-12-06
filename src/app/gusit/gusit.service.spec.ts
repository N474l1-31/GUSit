import { TestBed } from '@angular/core/testing';

import { GusitService } from './gusit.service';

describe('GusitService', () => {
  let service: GusitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GusitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
