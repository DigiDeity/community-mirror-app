import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemtableComponent } from './itemtable.component';

describe('ItemtableComponent', () => {
  let component: ItemtableComponent;
  let fixture: ComponentFixture<ItemtableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemtableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemtableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
