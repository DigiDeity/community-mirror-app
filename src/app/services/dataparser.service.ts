import { Component, OnInit, ViewChild, AfterViewInit  } from '@angular/core';
import {MatTable, MatTableDataSource} from '@angular/material/table';
import { CommunityMirrorObject } from '../obejcts/community.mirror.object';
import {  ActivatedRoute,  } from '@angular/router';
import { Constants } from '../global/constants';
import { CommunityMashupService } from 'src/app/communitymashup/communitymashup.service'
import {animate, state, style, transition, trigger} from '@angular/animations';
import {MatPaginator} from '@angular/material/paginator';
import {MatPaginatorModule} from '@angular/material/paginator';

@Component({
  selector: 'app-dataparser',
  templateUrl: './dataparser.services.html',
  styleUrls: ['./dataparser.services.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class DataparserService implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) private paginator!: MatPaginator;
  @ViewChild(MatTable) table!: MatTable<any>;


  // my data
  parsedData: CommunityMirrorObject[] = [{ident: "a_1", title: "Example entry 1", content: "Example Content 1"}];
  // table variables
  displayedColumns: string[] = ['ident', 'title', 'content'];
  dataSource = new MatTableDataSource(this.parsedData);
  expandedElement: CommunityMirrorObject | null;

  

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
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
    //this.dataSource.paginator = this.paginator;

    this.route.queryParamMap
      .subscribe((params) => {
        this.paramsObject = { ...params.keys, ...params };
        this.ident = this.paramsObject.params.articleid;
        this.communityMirrorID= this.paramsObject.params.cmid;
      }
    );
    this.parseMashupData();
  }

  ngOnInit(): void {
    if (this.ident != Constants.ident) {
      //this.dataSource.filter = (<HTMLInputElement>document.getElementById("fitlerinput")).value.trim().toLowerCase();
    }  
    
  }

  increaseCounter(){
    this.dataServiceCounter = this.dataServiceCounter + 1;
    if (this.dataServiceCounter > 100) {
      this.dataServiceCounter = 0;
      this.dataServiceProcessed = true;
      //this.mySubscription.unsubscribe();
      //console.log(this.communitymashup.items);
      
    }
  }

  addRow(){
    this.dataSource.data.push({ident: "a_" + Math.random(), title: "-" + Math.random, content: "Content:" + Math.random})
    this.dataSource.paginator = this.paginator;
    this.table.renderRows();
  }

  parseMashupData(){
    var i = 0.0;
    this.communitymashup.itemIdMap.forEach(element => {
      //this.parsedData.push({ident: element.ident, title: "-", content: element.stringValue});
      this.dataSource.data.push({ident: element.ident, title: "-", content: element.stringValue});
      this.dataSource.paginator = this.paginator;
      this.table.renderRows();
      this.dataServiceCounter = Math.round(this.dataSource.data.length/this.communitymashup.itemIdMap.size*100)
    });
    console.log(this.parsedData)
    //this.dataSource = new MatTableDataSource(this.parsedData); 

  }

}