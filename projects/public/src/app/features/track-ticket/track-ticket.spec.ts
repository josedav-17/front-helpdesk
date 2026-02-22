import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackTicket } from './track-ticket';

describe('TrackTicket', () => {
  let component: TrackTicket;
  let fixture: ComponentFixture<TrackTicket>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackTicket]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrackTicket);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
