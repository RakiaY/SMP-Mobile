import { TestBed } from '@angular/core/testing';

import { PostulationServiceService } from './postulation-service.service';

describe('PostulationServiceService', () => {
  let service: PostulationServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostulationServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
