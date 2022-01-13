// Angular importss
import { Component, OnInit, ViewChild, AfterViewInit, Input } from '@angular/core';
import { ActivatedRoute, } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
// Angular Material importss
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { MatPaginator } from '@angular/material/paginator';
import { MatAccordion } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';
// configuration service import
import { ConfigurationService } from 'src/app/services/configuration/configuration.service';
// communitymashupservice and model imports
import { CommunityMashupService } from 'src/app/communitymashup/communitymashup.service';
import { Person } from 'src/app/communitymashup/model/person.model';
import { Item } from 'src/app/communitymashup/model/item.model';
import { Organisation } from 'src/app/communitymashup/model/organisation.model';
import { InformationObject } from 'src/app/communitymashup/model/informationobject.model';
import { Content } from 'src/app/communitymashup/model/content.model';
// pdfmake-wrapper imports
import { Cell, Img, PdfMakeWrapper, Table, Txt } from 'pdfmake-wrapper';
import * as pdfFonts from "pdfmake/build/vfs_fonts"; // fonts provided for pdfmake
PdfMakeWrapper.setFonts(pdfFonts);
// ngx-vcard import
import { VCard, VCardEncoding, VCardFormatter } from 'ngx-vcard';
import { MatButton } from '@angular/material/button';

/**
 * Class representing the data set of the instance which was imported by communitymashup.service
 */
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
  constructor(private route: ActivatedRoute, public communitymashup: CommunityMashupService, private _snackBar: MatSnackBar) {
    // table
    this.expandedElement = null;
  }
  /**
   * Access references to HTML Objects via @ViewChild
   */
  // paginator used for the table
  @ViewChild(MatPaginator) private paginator!: MatPaginator;
  // table used to store the dataset
  @ViewChild(MatTable) table!: MatTable<any>;
  // table group to display the categories
  @ViewChild(MatTabGroup) tableGroup!: MatTabGroup;
  // input to filter the dataset
  @ViewChild(Input) filterInput!: Input;
  // html object to use the extension effect
  @ViewChild(MatAccordion) accordion!: MatAccordion;
  // hidden button
  @ViewChild('downloadButtonNormalVCF', { read: MatButton }) hiddenButton! : MatButton; 
  // dummies to store the raw data of the dataset
  private parsedData: Item[] = [];
  private parserDataPersons: Person[] = [];
  private parsedDataOrganisations: Organisation[] = [];
  private parsedDataContent: Content[] = [];
  // variables to declare used columns depending on the catergory
  public displayedColumnsAll: string[] = ['ident'];
  public displayedColumnsPerson: string[] = ['ident', 'lastname', 'firstname'];
  public displayedColumnsOrg: string[] = ['ident', 'name',];
  public displayedColumnsContent: string[] = ['ident', 'name',];
  // data source for all items
  public dataSource = new MatTableDataSource(this.parsedData);
  // data source for Persons
  public dataSourcePersons = new MatTableDataSource(this.parserDataPersons)
  // data source for Orgranisations
  public dataSourceOrganisations = new MatTableDataSource(this.parsedDataOrganisations)
  // data source for Content
  public dataSourceContent = new MatTableDataSource(this.parsedDataContent)
  public expandedElement: Item | null;
  // attribute to store the currently selected item
  public selectedItem!: Item;
  // boolean to check whether the process bar needs to be running
  public dataServiceProcessed: boolean = false;
  // stores the value for the process bar
  public dataServiceCounter = 0;
  // object to store the query values
  private paramsObject: any;
  // stores the query cmid | default cmid 
  public communityMirrorID: string = ConfigurationService.defaultCMId;
  // store the query ident | default ident
  public queryIdent: string = ConfigurationService.defaultIdent;
  /**
   *  Function to apply the filter to the data sources
   */
  applyFilter(event: Event) {
    // get filter value
    const filterValue = (event.target as HTMLInputElement).value;
    // apply filter value
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.dataSourcePersons.filter = filterValue.trim().toLowerCase();
    this.dataSourceOrganisations.filter = filterValue.trim().toLowerCase();
    this.dataSourceContent.filter = filterValue.trim().toLocaleLowerCase();
    // reset paginator
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  /**
   *  Function to apply the filter to the data sources if used by the icon
   */
  applyFilterIcon() {
    var inputValue: string = (<HTMLInputElement>document.getElementById("filterinput")).value;
    this.dataSource.filter = inputValue;
    this.dataSourcePersons.filter = inputValue;
    this.dataSourceOrganisations.filter = inputValue;
    this.dataSourceContent.filter = inputValue;
  }
  /**
   * Executed after the init of the view to update the paginator according to the selected Tab
   */
  ngAfterViewInit(): void {
    this.tabClick();
  }
  /**
   * Stores query parameters into local variables
   */
  ngOnInit(): void {
    this.route.queryParamMap
      .subscribe((params) => {
        this.paramsObject = { ...params.keys, ...params };
        this.queryIdent = this.paramsObject.params.articleid;
        this.communityMirrorID = this.paramsObject.params.cmid;
      }
      );
    if (this.queryIdent != ConfigurationService.defaultIdent) {
      // filter for item
    }
    this.communitymashup.getItemIdMapObserverable().subscribe(
      value => this.parseMashupData()
    )
  }
  /**
   * restore 
   */
  parseMashupData() {
    if (this.communitymashup.finishedLoadingFromURL) {
      this.communitymashup.addTestItems();
      console.log("Start Mashup Data")
      const myDate = new Date().getTime();
      this.dataSource.data = this.communitymashup.getItems();
      this.dataSourcePersons.data = this.communitymashup.getPersonsArray();
      this.dataSourceOrganisations.data = this.communitymashup.getOrganisationsArray();
      this.dataSourceContent.data = this.communitymashup.getContentArray();

      // search for query ident
      this.tabClick();
      if (this.queryIdent != ConfigurationService.defaultIdent && this.communitymashup.getItemById(this.queryIdent) != undefined ) {
        if(this.communitymashup.getPersonsArray().includes(this.communitymashup.getItemById(this.queryIdent))) {
          console.log("Person")
          this.setTabGroupIndex(ConfigurationService.personTableGroupIndex);
        } else if(this.communitymashup.getOrganisationsArray().includes(this.communitymashup.getItemById(this.queryIdent))) {
          console.log("Org")
          this.setTabGroupIndex(ConfigurationService.organisationTableGroupIndex);
        } else if(this.communitymashup.getContentArray().includes(this.communitymashup.getItemById(this.queryIdent))) {
          console.log("Content")
          this.setTabGroupIndex(ConfigurationService.contentTableGroupIndex);
        } else {
          console.log("All")
          this.setTabGroupIndex(ConfigurationService.allTableGroupIndex);
        }
        this.dataSource.filter = this.queryIdent.toLowerCase();
        this.dataSourceOrganisations.filter = this.queryIdent.toLowerCase();
        this.dataSourcePersons.filter = this.queryIdent.toLowerCase();
        this.dataSourceContent.filter = this.queryIdent.toLocaleLowerCase();
      }
      // reset variable
      this.dataServiceProcessed = true;
      this.dataServiceCounter = 100;
      console.log(`Finished parsin Mashup Date after ${(new Date().getTime() - myDate) / 1000} seconds`)
    }
  }

  private isPerson(item: any): item is Person { return true }
  private isOrganisation(item: any): item is Organisation { return true }
  private isContent(item: any): item is Content { return true }
  /**
   * Function executed of a tab of the tab group is clicked
   */
  tabClick() {
    this.paginator.pageIndex = 0;
    switch (this.tableGroup.selectedIndex) {
      case ConfigurationService.allTableGroupIndex:
        this.dataSource.paginator = this.paginator;
        break;
      case ConfigurationService.personTableGroupIndex:
        this.dataSourcePersons.paginator = this.paginator;
        this.dataSource.paginator = this.paginator;
        break;
      case ConfigurationService.organisationTableGroupIndex:
        this.dataSourceOrganisations.paginator = this.paginator;
        this.dataSource.paginator = this.paginator;
        break;
      case ConfigurationService.contentTableGroupIndex:
        this.dataSourceContent.paginator = this.paginator;
        this.dataSource.paginator = this.paginator;
        break;
    }
  }
  /**
   * select tab
   */
  setTabGroupIndex(pIndex : number) {
    if (this.tableGroup.selectedIndex!=null){
      this.tableGroup.selectedIndex = pIndex
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

  /**
   * vCard/VCF
   */
  // vCard variables
  public vCardEncoding: typeof VCardEncoding = VCardEncoding;
  public vCard: VCard = { name: { firstNames: 'John', lastNames: 'Doe' },};


  /**
   * Genereates a vCard file on the fly
   * @param person 
   * @returns 
   */
  public generateVCardOnTheFly(person: Person) {
    this.vCard = {name: { firstNames: person.firstname, lastNames: person.lastname, addtionalNames: person.title}}
  };


/**
 * PDF
 */
 generatePdfFileToDownload(item: any) {
  if(this.communitymashup.getPersonsArray().includes(item) || this.communitymashup.getOrganisationsArray().includes(item) || this.communitymashup.getContentArray().includes(item)) {
    this.generatePdfFileToDownloadInormationObject(item);
  } else {
    this.generatePdfFileToDownloadItem(item);

  }
}

  // generate pdf for InformationObject
  async generatePdfFileToDownloadInormationObject(informationObjectToDownload: InformationObject) {
    this._snackBar.open("Creating PDF to download.", '', {duration: ConfigurationService.snackbarDuration});
    console.log(informationObjectToDownload)
    this.dataServiceProcessed = false;
    var tmpstring = "";
    var imageCounter = 0;
    const pdf = new PdfMakeWrapper();
    // item attributes
    pdf.info({
      title: 'Document for Item' + informationObjectToDownload.ident,
      author: 'CommunityMirrorWebApp',
      subject: 'Item',
    });
    // create specialized header
    var fileName = ""
    if(this.communitymashup.getPersonsArray().includes(this.communitymashup.getItemById(informationObjectToDownload.ident))) {
      var personObject : Person = this.communitymashup.getItemById(informationObjectToDownload.ident);
      if(personObject.title != undefined && personObject.title.length > 0) {
        fileName += personObject.title + " "
      }
      if(personObject.firstname != undefined && personObject.firstname.length > 0) {
        fileName += personObject.firstname + " "
      }
      if(personObject.lastname != undefined && personObject.lastname.length > 0) {
        fileName += personObject.lastname + " "
      }
      pdf.add(new Txt(fileName + "(" + informationObjectToDownload.ident + ")").bold().color('blue').fontSize(29).end)
      

    } else if(this.communitymashup.getOrganisationsArray().includes(this.communitymashup.getItemById(informationObjectToDownload.ident))) {

      var orgObject : Organisation = this.communitymashup.getItemById(informationObjectToDownload.ident);
      pdf.add(new Txt(fileName + " (" + informationObjectToDownload.ident + ")").bold().color('blue').fontSize(29).end)


    } else if(this.communitymashup.getContentArray().includes(this.communitymashup.getItemById(informationObjectToDownload.ident))) {

      var contentObject : Person = this.communitymashup.getItemById(informationObjectToDownload.ident);
      pdf.add(new Txt(fileName +  " (" + informationObjectToDownload.ident + ")").bold().color('blue').fontSize(29).end)


    }
    if(informationObjectToDownload.uri != undefined) {
      pdf.add(new Table([
        [ new Txt('URI').end, new Txt(informationObjectToDownload.uri).end],
      ]).end)
    }
    if(informationObjectToDownload.stringValue != undefined && informationObjectToDownload.stringValue.length > 0) {
      pdf.add(new Table([
        [ new Txt('String Value').end, new Txt(informationObjectToDownload.stringValue).end],
      ]).end)
    }
    if(informationObjectToDownload.created != undefined && informationObjectToDownload.created.length > 0) {
      pdf.add(new Table([
        [ new Txt('Created').end, new Txt(informationObjectToDownload.created).end],
      ]).end)
    }
    if(informationObjectToDownload.lastModified != undefined && informationObjectToDownload.lastModified.length > 0) {
      pdf.add(new Table([
        [ new Txt('Last Modified').end, new Txt(informationObjectToDownload.lastModified).end],
      ]).end)
    }
    // meta
    if(informationObjectToDownload.alternativeNames.length > 0) {
      tmpstring = "";
      informationObjectToDownload.alternativeNames.forEach((s: string) => tmpstring = tmpstring += s + "\n" )
      pdf.add(new Table([
        [ new Txt('Alternative Name').end, new Txt(tmpstring).end],
      ]).end)
    }
    if(informationObjectToDownload.metaInformations.length > 0) {
      tmpstring = "";
      informationObjectToDownload.metaInformations.forEach((s: string) => tmpstring = tmpstring += s + "\n" )
      pdf.add(new Table([
        [ new Txt('MetaInformation').end, new Txt(tmpstring).end],
      ]).end)
    }
    if(informationObjectToDownload.categories.length > 0) {
      tmpstring = "";
      informationObjectToDownload.categories.forEach((s: string) => tmpstring = tmpstring += s + "\n" )
      pdf.add(new Table([
        [ new Txt('Categories').end, new Txt(tmpstring).end],
      ]).end)
    }
    if(informationObjectToDownload.tags.length > 0) {
      tmpstring = "";
      informationObjectToDownload.tags.forEach((s: string) => tmpstring = tmpstring += s + "\n" )
      pdf.add(new Table([
        [ new Txt('Tags').end, new Txt(tmpstring).end],
      ]).end)
    }
    if(informationObjectToDownload.binaries.length > 0) {
      tmpstring = "";
      informationObjectToDownload.binaries.forEach((s: string) => tmpstring = tmpstring += s + "\n" )
      pdf.add(new Table([
        [ new Txt('Binaries').end, new Txt(tmpstring).end],
      ]).end)
    }
    if(informationObjectToDownload.connectedTo.length > 0) {
      tmpstring = "";
      informationObjectToDownload.connectedTo.forEach((s: string) => tmpstring = tmpstring += s + "\n" )
      pdf.add(new Table([
        [ new Txt('Connected To').end, new Txt(tmpstring).end],
      ]).end)
    }
    if(informationObjectToDownload.identifiedBy.length > 0) {
      tmpstring = "";
      informationObjectToDownload.identifiedBy.forEach((s: string) => tmpstring = tmpstring += s + "\n" );
      pdf.add(new Table([
        [ new Txt('Identified By').end, new Txt(tmpstring).end],
      ]).end)
    }
    if(informationObjectToDownload.metaTags.length > 0) {
      tmpstring = "";
    informationObjectToDownload.metaTags.forEach((s: string) => tmpstring = tmpstring += s + "\n");
      pdf.add(new Table([
        [ new Txt('Meta Tags').end, new Txt(tmpstring).end],
      ]).end)
    }
    // images
    const myDate = new Date().getTime();
    if(informationObjectToDownload.images.length > 0) {
      informationObjectToDownload.images.forEach(async (image: string) => {
        imageCounter += 1;
        await new Img(this.communitymashup.itemIdMap.get(image).fileUrl).build().then(img => { pdf.add(img);
          imageCounter --;
          console.log(imageCounter)
          if(imageCounter == 0) {
            this.downloadPDF(pdf,fileName + informationObjectToDownload.ident)
          }
          console.log(imageCounter)
        }).catch((error) => { this._snackBar.open(ConfigurationService.couldNotLoadImage, 'OK', {duration: ConfigurationService.snackbarDuration})
          imageCounter--;
          console.log(imageCounter)
          if(imageCounter == 0) {
            this.downloadPDF(pdf,fileName + '_' + informationObjectToDownload.ident)
          }
          console.log(imageCounter)
          })});
    } else {
      this.downloadPDF(pdf,fileName + '_' + informationObjectToDownload.ident)
    }
  }

  // generate pdf for InformationObject
  generatePdfFileToDownloadItem(itemObject: Item) {
    this._snackBar.open("Creating PDF to download.", '', {duration: ConfigurationService.snackbarDuration});
    this.dataServiceProcessed = false;
    // item attributes
    const pdf = new PdfMakeWrapper();
    pdf.info({
      title: 'Document for Item' + itemObject.ident,
      author: 'CommunityMirrorWebApp',
      subject: 'Item',
    });
    pdf.add(new Txt('Item: ' + itemObject.ident).bold().color('blue').fontSize(29).end)
    if(itemObject.uri != undefined) {
      pdf.add(new Table([
        [ new Txt('URI').end, new Txt(itemObject.uri).end],
      ]).end)
    }
    if(itemObject.stringValue.length > 0) {
      pdf.add(new Table([
        [ new Txt('String Value').end, new Txt(itemObject.stringValue).end],
      ]).end)
    }
    if(itemObject.created.length > 0) {
      pdf.add(new Table([
        [ new Txt('Created').end, new Txt(itemObject.created).end],
      ]).end)
    }
    if(itemObject.lastModified.length > 0) {
      pdf.add(new Table([
        [ new Txt('Last Modified').end, new Txt(itemObject.lastModified).end],
      ]).end)
    }
    if(itemObject.connectedTo.length > 0) {
      var connectedTo = "";
      itemObject.connectedTo.forEach((connection: string) => connectedTo = connectedTo += connection + "\n" )
      pdf.add(new Table([
        [ new Txt('Connected To').end, new Txt(connectedTo).end],
      ]).end)
    }
    if(itemObject.identifiedBy.length > 0) {
      var identifiedBy = "";
      itemObject.identifiedBy.forEach((identification: string) => identifiedBy = identifiedBy += identification + "\n" );
      pdf.add(new Table([
        [ new Txt('Identified By').end, new Txt(identifiedBy).end],
      ]).end)
    }
    if(itemObject.metaTags.length > 0) {
      var metaTags = "";
      itemObject.metaTags.forEach((metatag: string) => metaTags = metaTags += metatag + "\n");
      pdf.add(new Table([
        [ new Txt('Meta Tags').end, new Txt(metaTags).end],
      ]).end)
    }
    this.downloadPDF(pdf,itemObject.ident)
  }
    
  // function to create and download the written PDF File
  // 
  private downloadPDF(pdf: PdfMakeWrapper, fileName: string) {
    console.log("Download")
    this.dataServiceProcessed = true;
    pdf.create().download(fileName);
  }
}