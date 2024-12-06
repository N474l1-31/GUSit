/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { BitacorasService } from './Bitacoras.service';

describe('Service: Bitacoras', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BitacorasService]
    });
  });

  it('should ...', inject([BitacorasService], (service: BitacorasService) => {
    expect(service).toBeTruthy();
  }));
});
