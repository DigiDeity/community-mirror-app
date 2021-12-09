import { Component, } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {interval, Subscription} from 'rxjs';
import {MatTableDataSource} from '@angular/material/table';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];

@Component({
  selector: 'app-dataparser',
  templateUrl: './dataparser.services.html',
  styleUrls: ['./dataparser.services.css']
})
export class DataparserService{

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource(ELEMENT_DATA);

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // mine
  mySubscription: Subscription
  dataServiceProcessed: boolean = false;
  dataServiceCounter = 0;
  dataXML: string[] = [];
  


  constructor(private http: HttpClient) {        
    // mine
    this.mySubscription= interval(10).subscribe((x =>{
      this.increaseCounter();
    }));
  }

  //mine
  increaseCounter(){
    this.dataServiceCounter = this.dataServiceCounter + 1;
    if (this.dataServiceCounter > 100) {
      this.dataServiceCounter = 0;
      this.dataServiceProcessed = true;
      this.mySubscription.unsubscribe();
    }
    console.log("Progressbar Value: " + this.dataServiceCounter)
  }
}