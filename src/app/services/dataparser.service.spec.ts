import { TestBed } from '@angular/core/testing';

import { DataparserService } from './dataparser.service';

describe('DataparserService', () => {
  let service: DataparserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataparserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
