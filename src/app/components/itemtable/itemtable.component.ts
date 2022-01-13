/**
 * Required imports for the class
 */
// Angular imports
import { Component, OnInit, ViewChild, AfterViewInit, Input } from '@angular/core';
import { ActivatedRoute, } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
// Angular Material imports
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { MatPaginator } from '@angular/material/paginator';
import { MatAccordion } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';
// configuration import
import { Config } from 'src/app/services/configuration/configuration.service';

import { CommunityMashupService } from 'src/app/communitymashup/communitymashup.service';
import { Person } from 'src/app/communitymashup/model/person.model';
import { Item } from 'src/app/communitymashup/model/item.model';
import { Organisation } from 'src/app/communitymashup/model/organisation.model';
import { InformationObject } from 'src/app/communitymashup/model/informationobject.model';
import { Content } from 'src/app/communitymashup/model/content.model';

import { Cell, Img, PdfMakeWrapper, Table, Txt } from 'pdfmake-wrapper';
import * as pdfFonts from "pdfmake/build/vfs_fonts"; // fonts provided for pdfmake

import { VCard, VCardEncoding, VCardFormatter } from 'ngx-vcard';

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
  parsedDataContent: Content[] = [];
  // table variables
  displayedColumnsAll: string[] = ['ident'];
  displayedColumnsPerson: string[] = ['ident', 'lastname', 'firstname'];
  displayedColumnsOrg: string[] = ['ident', 'name',];
  displayedColumnsContent: string[] = ['ident', 'name',];
  displayedColumnsTest: string[] = ['Ident'];
  dataSource = new MatTableDataSource(this.parsedData);
  dataSourcePersons = new MatTableDataSource(this.parserDataPersons)
  dataSourceOrganisations = new MatTableDataSource(this.parsedDataOrganisations)
  dataSourceContent = new MatTableDataSource(this.parsedDataContent)
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
  // vCard
  public vCardEncoding: typeof VCardEncoding = VCardEncoding;
  public vCard: VCard = { name: { firstNames: 'John', lastNames: 'Doe' } };
  public generateVCardOnTheFly(person: Person): VCard {
    console.log("vcard")
    return {
      name: { firstNames: person.firstname, lastNames: person.lastname, addtionalNames: person.title },
    };
  };

  constructor(private route: ActivatedRoute, public communitymashup: CommunityMashupService, private _snackBar: MatSnackBar) {
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
      this.dataSourceContent.data = this.communitymashup.getContentArray();

      // setup paginator
      this.tabClick()
      if (this.ident != undefined) {
        this.dataSource.filter = this.ident.toLowerCase();
        this.dataSourceOrganisations.filter = this.ident.toLowerCase();
        this.dataSourcePersons.filter = this.ident.toLowerCase();
        this.dataSourceContent.filter = this.ident.toLocaleLowerCase();
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
      case 3:
        this.dataSource.paginator = this.paginator;
        break;
      case 0:
        this.dataSourcePersons.paginator = this.paginator;
        this.dataSource.paginator = this.paginator;
        break;
      case 1:
        this.dataSourceOrganisations.paginator = this.paginator;
        this.dataSource.paginator = this.paginator;
        break;
      case 2:
        this.dataSourceContent.paginator = this.paginator;
        this.dataSource.paginator = this.paginator;
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
    this._snackBar.open("Creating PDF to download.", '', {duration: Config.snackbarDuration});
    // item attributes
    const pdf = new PdfMakeWrapper();
    console.log(informationObjectToDownload);
    const fileNameDummy = informationObjectToDownload.name + '-' + informationObjectToDownload.ident;
    var imageCounter = 0;
    this.dataServiceProcessed = false;
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
    informationObjectToDownload.binaries.forEach((binary: string) => pdf.add("Binary: " + binary));
    if(informationObjectToDownload.images.length > 0) {
      informationObjectToDownload.images.forEach(async (image: string) => {
        imageCounter += 1;
        await new Img(this.communitymashup.itemIdMap.get(image).fileUrl).build().then(img => { pdf.add(img);
          imageCounter --;
          if(imageCounter == 0) {
            this.downloadPDF(pdf,fileNameDummy)
          }
          console.log(imageCounter)
        }).catch((error) => { this._snackBar.open(Config.couldNotLoadImage, 'OK', {duration: Config.snackbarDuration})
          imageCounter--;
          if(imageCounter == 0) {
            this.downloadPDF(pdf,fileNameDummy)
          }
          console.log(imageCounter)
          })});
    }
  }

    // generate pdf for InformationObject
    generatePdfFileToDownloadItem(itemObject: Item) {
      this._snackBar.open("Creating PDF to download.", '', {duration: Config.snackbarDuration});
      // item attributes
      const pdf = new PdfMakeWrapper();
      this.dataServiceProcessed = false;
      pdf.add("Ident: " + itemObject.ident);
      pdf.add("URI: " + itemObject.uri);
      pdf.add("String Value: " + itemObject.stringValue);
      pdf.add("Created: " + itemObject.created);
      pdf.add("Last modified: " + itemObject.lastModified);
      // references - store idents
      itemObject.connectedTo.forEach((connection: string) => pdf.add("Connected to: " + connection));
      itemObject.identifiedBy.forEach((identification: string) => pdf.add("Identified by: " + identification));
      itemObject.metaTags.forEach((metatag: string) => pdf.add("Meta Tag: " + metatag));
      this.downloadPDF(pdf,itemObject.ident)
    }
    // function to create and download the written PDF File
    // 
    private downloadPDF(pdf: PdfMakeWrapper, fileName: string) {
      this.dataServiceProcessed = true;
      pdf.create().download(fileName);
    }
}