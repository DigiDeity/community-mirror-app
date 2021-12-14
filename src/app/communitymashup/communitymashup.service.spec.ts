import { TestBed } from '@angular/core/testing';

import { CommunityMashupService } from './communitymashup.service';

describe('CommunitymashupService', () => {
  let service: CommunityMashupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommunityMashupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
