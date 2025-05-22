import { TestBed } from '@angular/core/testing';

import { SearchSitterService } from './search-sitter.service';

describe('SearchSitterService', () => {
  let service: SearchSitterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchSitterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
