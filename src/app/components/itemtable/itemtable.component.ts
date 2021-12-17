import { Component, OnInit, ViewChild, AfterViewInit, Input  } from '@angular/core';
import {MatTable, MatTableDataSource} from '@angular/material/table';
import {MatTabGroup, MatTabsModule} from '@angular/material/tabs';
import { ActivatedRoute,  } from '@angular/router';
import { Constants } from 'src/app/global/constants';
import { CommunityMashupService } from 'src/app/communitymashup/communitymashup.service'
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatPaginator } from '@angular/material/paginator';
import { Person } from 'src/app/communitymashup/model/person.model';
import { Item } from 'src/app/communitymashup/model/item.model';
import { Organisation } from 'src/app/communitymashup/model/organisation.model';



@Component({
  selector: 'app-itemtable',
  templateUrl: './itemtable.component.html',
  styleUrls: ['./itemtable.component.css'],
  animations: [
      trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class ItemtableComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) private paginator!: MatPaginator;
  @ViewChild(MatTable) table!: MatTable<any>;
  @ViewChild(MatTabGroup) tableGroup!: MatTabGroup;
  @ViewChild(Input) filterInput!: Input; 


  // my data
  parsedData: Item[] = [];
  parserDataPersons: Person[] = [];
  parsedDataOrganisations: Organisation[]= [];
  // table variables
  displayedColumnsAll: string[] = ['ident'];
  displayedColumnsPerson: string[] = ['ident','name','title','lastname','firstname'];
  displayedColumnsOrg: string[] = ['ident','name',];

  dataSource = new MatTableDataSource(this.parsedData);
  dataSourcePersons = new MatTableDataSource(this.parserDataPersons)
  dataSourceOrganisations = new MatTableDataSource(this.parsedDataOrganisations)
  expandedElement: Item | null;

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.dataSourcePersons.filter = filterValue.trim().toLowerCase();
    this.dataSourceOrganisations.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  applyFilterIcon() {
    var inputValue: string = (<HTMLInputElement>document.getElementById("filterinput")).value;
    this.dataSource.filter = inputValue;
    this.dataSourcePersons.filter = inputValue;
    this.dataSourceOrganisations.filter = inputValue;
  }

  ngAfterViewInit(): void {
    this.tabClick();
  }

  // mine
  dataServiceProcessed: boolean = false;
  dataServiceCounter = 0;
  paramsObject: any;
  communityMirrorID: string = "";
  ident: string ="";



  constructor(private route: ActivatedRoute, public communitymashup: CommunityMashupService){        
    // table
    this.expandedElement = null;
  }


  ngOnInit(): void {
    this.route.queryParamMap
    .subscribe((params) => {
      this.paramsObject = { ...params.keys, ...params };
      this.ident = this.paramsObject.params.articleid;
      this.communityMirrorID= this.paramsObject.params.cmid;
    }
  );   
    if (this.ident != Constants.ident) {
      // filter for item
    }  
    this.communitymashup.getItemIdMapObserverable().subscribe(
      value => this.parseMashupData()
      )
  }

  parseMashupData(){
    if(this.communitymashup.finishedLoadingFromURL) {
      console.log("Start Mashup Data")
      const myDate = new Date().getTime();
      this.dataSource.data = this.communitymashup.itemArray
      this.dataSourcePersons.data = this.communitymashup.getPersonsArray();
      this.dataSourceOrganisations.data = this.communitymashup.getOrganisationsArray();

      console.warn(this.communitymashup.itemIdMap)
      // setup paginator
      this.tabClick()
      if(this.ident != undefined) {
        this.dataSource.filter = this.ident.toLowerCase();
        this.dataSourceOrganisations.filter = this.ident.toLowerCase();
        this.dataSourcePersons.filter = this.ident.toLowerCase();
      }
      
      // reset variable
      this.dataServiceProcessed = true;
      this.dataServiceCounter = 100;
      console.log(`Finished parsin Mashup Date after ${(new Date().getTime() - myDate)/1000} seconds`)
    }
  }

  tabClick() {
    this.paginator.pageIndex = 0;
    switch(this.tableGroup.selectedIndex) {
      case 2:
        this.dataSource.paginator = this.paginator;
        break;
      case 0:
        this.dataSourcePersons.paginator = this.paginator;
        break;
      case 1:
        this.dataSourceOrganisations.paginator = this.paginator;
        break;
    } 
  }
}