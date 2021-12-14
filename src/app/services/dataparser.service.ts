import { Component, OnInit, } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {interval, Subscription} from 'rxjs';
import {MatTableDataSource} from '@angular/material/table';
import { CommunityMirrorObject } from '../obejcts/community.mirror.object';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Constants } from '../global/constants';
import { CommunityMashupService } from 'src/app/communitymashup/communitymashup.service'

const MASHUP_DATA: CommunityMirrorObject[] = [
  {name: "Test1", value: 5, id: 1},
  {name: "Test2", value: 7, id: 2},
  {name: "Test3", value: 9, id: 3},
  {name: "Test4", value: 11, id: 4},
]


@Component({
  selector: 'app-dataparser',
  templateUrl: './dataparser.services.html',
  styleUrls: ['./dataparser.services.css']
})

export class DataparserService implements OnInit{

  displayedColumns: string[] = ['name', 'value', 'id'];
  dataSource = new MatTableDataSource(MASHUP_DATA);

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // mine
  mySubscription: Subscription
  dataServiceProcessed: boolean = false;
  dataServiceCounter = 0;
  dataXML: string[] = [];
  paramsObject: any;
  deviceID: string = "";
  articleID: string ="";


  constructor(private route: ActivatedRoute, public communitymashup: CommunityMashupService){        
    // mine
    this.mySubscription= interval(10).subscribe((x =>{
      this.increaseCounter();
    }));
    this.route.queryParamMap
      .subscribe((params) => {
        this.paramsObject = { ...params.keys, ...params };
        this.articleID = this.paramsObject.params.articleid;
        this.deviceID= this.paramsObject.params.cmid;
      }
    );
    
  }

  ngOnInit(): void {
    if (this.articleID != Constants.deviceID) {
      this.dataSource.filter = (<HTMLInputElement>document.getElementById("fitlerinput")).value.trim().toLowerCase();
    }
    this.communitymashup.loadFromUrl();
    console.log(this.communitymashup.getMetaTags());
  }

  increaseCounter(){
    this.dataServiceCounter = this.dataServiceCounter + 1;
    if (this.dataServiceCounter > 100) {
      this.dataServiceCounter = 0;
      this.dataServiceProcessed = true;
      this.mySubscription.unsubscribe();
    }
  }

  getMetaTags() { return this.communitymashup.getMetaTags(); }
}