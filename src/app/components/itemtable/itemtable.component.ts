import { Component, OnInit, ViewChild, AfterViewInit, Input } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, } from '@angular/router';
import { Config } from 'src/app/configurations/config';
import { CommunityMashupService } from 'src/app/communitymashup/communitymashup.service'
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatPaginator } from '@angular/material/paginator';
import { Person } from 'src/app/communitymashup/model/person.model';
import { Item } from 'src/app/communitymashup/model/item.model';
import { Organisation } from 'src/app/communitymashup/model/organisation.model';
import { MatAccordion } from '@angular/material/expansion';
import { Img, PdfMakeWrapper } from 'pdfmake-wrapper';
import * as pdfFonts from "pdfmake/build/vfs_fonts"; // fonts provided for pdfmake
import { InformationObject } from 'src/app/communitymashup/model/informationobject.model';

// If any issue using previous fonts import. you can try this:
// import pdfFonts from "pdfmake/build/vfs_fonts";

// Set the fonts to use
PdfMakeWrapper.setFonts(pdfFonts);

@Component({
  selector: 'app-itemtable',
  templateUrl: './itemtable.component.html',
  styleUrls: ['./itemtable.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class ItemtableComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) private paginator!: MatPaginator;
  @ViewChild(MatTable) table!: MatTable<any>;
  @ViewChild(MatTabGroup) tableGroup!: MatTabGroup;
  @ViewChild(Input) filterInput!: Input;
  @ViewChild(MatAccordion) accordion!: MatAccordion;


  // my data
  parsedData: Item[] = [];
  parserDataPersons: Person[] = [];
  parsedDataOrganisations: Organisation[] = [];
  // table variables
  displayedColumnsAll: string[] = ['ident'];
  displayedColumnsPerson: string[] = ['ident', 'name', 'title', 'lastname', 'firstname'];
  displayedColumnsOrg: string[] = ['ident', 'name',];
  displayedColumnsTest: string[] = ['Ident'];
  dataSource = new MatTableDataSource(this.parsedData);
  dataSourcePersons = new MatTableDataSource(this.parserDataPersons)
  dataSourceOrganisations = new MatTableDataSource(this.parsedDataOrganisations)
  expandedElement: Item | null;
  // selected item
  selectedItem!: Item;




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
  ident: string = "";



  constructor(private route: ActivatedRoute, public communitymashup: CommunityMashupService) {
    // table
    this.expandedElement = null;
  }


  ngOnInit(): void {
    this.route.queryParamMap
      .subscribe((params) => {
        this.paramsObject = { ...params.keys, ...params };
        this.ident = this.paramsObject.params.articleid;
        this.communityMirrorID = this.paramsObject.params.cmid;
      }
      );
    if (this.ident != Config.ident) {
      // filter for item
    }
    this.communitymashup.getItemIdMapObserverable().subscribe(
      value => this.parseMashupData()
    )
  }

  parseMashupData() {
    if (this.communitymashup.finishedLoadingFromURL) {
      console.log("Start Mashup Data")
      const myDate = new Date().getTime();
      this.dataSource.data = this.communitymashup.getItems();
      this.dataSourcePersons.data = this.communitymashup.getPersonsArray();
      this.dataSourceOrganisations.data = this.communitymashup.getOrganisationsArray();

      // setup paginator
      this.tabClick()
      if (this.ident != undefined) {
        this.dataSource.filter = this.ident.toLowerCase();
        this.dataSourceOrganisations.filter = this.ident.toLowerCase();
        this.dataSourcePersons.filter = this.ident.toLowerCase();
      }

      // reset variable
      this.dataServiceProcessed = true;
      this.dataServiceCounter = 100;
      console.log(`Finished parsin Mashup Date after ${(new Date().getTime() - myDate) / 1000} seconds`)
    }
  }

  tabClick() {
    this.paginator.pageIndex = 0;
    switch (this.tableGroup.selectedIndex) {
      case 2:
        this.dataSource.paginator = this.paginator;
        break;
      case 0:
        this.dataSourcePersons.paginator = this.paginator;
        this.dataSource.paginator = this.paginator;
        break;
      case 1:
        this.dataSourceOrganisations.paginator = this.paginator;
        break;
    }
  }

  getSelectedMatTabIndex(): number {
    if (this.tableGroup != undefined) {
      if (this.tableGroup.selectedIndex != null) {
        return this.tableGroup.selectedIndex;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }

  async prepareSelectedItemForDownload(itemToDownload: InformationObject) {
    this.selectedItem = itemToDownload;
    console.warn(this.selectedItem)
    this.generatePdfFileToDownload(itemToDownload);
  }



  // generate pdf for InformationObject
  async generatePdfFileToDownload(informationObjectToDownload: InformationObject) {
    // item attributes
    const pdf = new PdfMakeWrapper();
    pdf.add("Ident: " + informationObjectToDownload.ident);
    pdf.add("URI: " + informationObjectToDownload.uri);
    pdf.add("String Value: " + informationObjectToDownload.stringValue);
    pdf.add("Created: " + informationObjectToDownload.created);
    pdf.add("Last modified: " + informationObjectToDownload.lastModified);
    // references - store idents
    informationObjectToDownload.connectedTo.forEach((connection: string) => pdf.add("Connected to: " + connection));
    informationObjectToDownload.identifiedBy.forEach((identification: string) => pdf.add("Identified by: " + identification));
    informationObjectToDownload.metaTags.forEach((metatag: string) => pdf.add("Meta Tag: " + metatag));
    // additional attributes
    pdf.add("Name: " + informationObjectToDownload.name);
    informationObjectToDownload.alternativeNames.forEach((alternativeName: string) => pdf.add("Alias: " + alternativeName));
    // additional references - store idents
    informationObjectToDownload.metaInformations.forEach((metaInformation: string) => pdf.add("Meta Information: " + metaInformation));
    informationObjectToDownload.categories.forEach((category: string) => pdf.add("Belongs to Category: " + category));
    informationObjectToDownload.tags.forEach((tag: string) => pdf.add("Tag: " + tag));
    informationObjectToDownload.images.forEach(async (image: string) =>
      await new Img(this.communitymashup.itemIdMap.get(image).fileUrl).build().then(
        img => { pdf.add(img) }));
    informationObjectToDownload.binaries.forEach((binary: string) => pdf.add("Binary: " + binary));
    //pdf.add(await new Img("https://www.npmjs.com/npm-avatar/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdmF0YXJVUkwiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci83M2UzMDJlZTBhMjNkMDQ3NWZjZjBhYjMwYmI0NzdkZj9zaXplPTEwMCZkZWZhdWx0PXJldHJvIn0.7W3BgYOOANXBYGAlvylKBUR_NurUv5ITW6sk0an8YTg").build())
    // create and download pdf
    pdf.create().download(informationObjectToDownload.name + '-' + informationObjectToDownload.ident);



  }
}