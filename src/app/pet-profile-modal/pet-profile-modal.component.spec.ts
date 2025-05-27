import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PetProfileModalComponent } from './pet-profile-modal.component';

describe('PetProfileModalComponent', () => {
  let component: PetProfileModalComponent;
  let fixture: ComponentFixture<PetProfileModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PetProfileModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PetProfileModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
