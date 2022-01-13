import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { parseString } from 'xml2js';
import { InformationObject } from './model/informationobject.model';
import { MetaTag } from './model/metatag.model';
import { Connection } from './model/connection.model';
import { Organisation } from './model/organisation.model';
import { Content } from './model/content.model';
import { Person } from './model/person.model';
import { Identifier } from './model/identifier.model';
import { Tag } from './model/tag.model';
import { Item } from './model/item.model';
import { Image } from './model/image.model';
import { BehaviorSubject } from 'rxjs';
import { ConfigurationService } from '../services/configuration/configuration.service';
import { type } from 'os';

@Injectable({
  providedIn: 'root'
})

/*
  TODO
  - error handling in loadFromUrl()
 */

export class CommunityMashupService {

  sourceUrl: string = ConfigurationService.mashupURL;

  public created: any;
  public lastModified: any;
  public items: Array<any> = [];

  constructor(private http: HttpClient) { }

  finishedLoadingFromURL: boolean = false;

  getPersons(metaTagString:string): Person[] | null{
    if (metaTagString == null) {
      return this.itemTypeMap.get('data:Person');
    }
    var metaTag = this.getMetaTag(metaTagString);
    if (metaTag == null) { return null; console.log("metatag "+metaTagString+" not known"); }
    // iterate through items metatagged with requested metatag and filter person items
    var itemArr: Item[] = metaTag.getMetaTaggedItems();
    var result: Person[] = [];
    itemArr.forEach(item => { if (item instanceof Person) { result.push(item); }} );
    return result;
  }

  getContents(metaTagString:string) {
    if (metaTagString == null) {
      return this.itemTypeMap.get('data:Content');
    }
    var metaTag = this.getMetaTag(metaTagString);
    if (metaTag == null) { return null; console.log("metatag "+metaTagString+" not known"); }
    // iterate through items metatagged with requested metatag and filter content items
    var itemArr = metaTag.getMetaTaggedItems();
    var result : Content[] = [];
    itemArr.forEach(item => { if (item instanceof Content) { result.push(item); } });
    return result;
  }

  getOrganisations(metaTagString:string) {
    if (metaTagString == null) {
      return this.itemTypeMap.get('data:Organisation');
    }
    var metaTag = this.getMetaTag(metaTagString);
    if (metaTag == null) { return null; console.log("metatag "+metaTagString+" not known"); }
    // iterate through items metatagged with requested metatag and filter organisation items
    var itemArr = metaTag.getMetaTaggedItems();
    var result : Organisation[] = [];
    itemArr.forEach(item => { if (item instanceof Organisation) { result.push(item); } });
    return result;
  }

  getMetaTags(): MetaTag[] {
    return this.itemTypeMap.get('data:MetaTag');
  }

  getMetaTag(metaTagString:string): MetaTag | null {
    let metaTags:MetaTag[] = this.getMetaTags();
    if (metaTags == null) { return null; }
    var result = null;
    metaTags.forEach(metaTag => { if (metaTag.name == metaTagString) { result = metaTag; }} );
    return result;
  }

  getConnections(fromId:string): Connection[] {
    if (!fromId) {
      return this.itemTypeMap.get('data:Connection');
    }
    var result: Connection[] = [];
    // TBD
    return result;
  }

  getItemById(id:string): any {
    return this.itemIdMap.get(id);
  }

  getItemCount(itemType:string) {
    if (itemType == null) {
      return this.itemIdMap.size;
    }
    var tmpArr = this.itemTypeMap.get(itemType);
    if (tmpArr != null) {
      return tmpArr.length;
    }
    return 0;
  }


  loadFromUrl(): Promise<any> {
    console.log("loadFromUrl");
    let self = this;
    let url = this.sourceUrl;
    const promise = this.http.get(url, {
      responseType: 'text'
    }).toPromise()
      .then(data => {
        console.log('Loading dataset from ' + url);
        if(data) {
        parseString(data, function(err, result) {
          self.created = result['data:DataSet']['$']['created'];
          self.lastModified = result['data:DataSet']['$']['lastModified'];
          self.items = result['data:DataSet']['items'];
          console.log('Finished loading dataset - size=' + self.items.length);
          self.initializeDataSet();
        })}
        return data;
      });
    return promise;
  }


  itemIdMap = new Map();
  itemTypeMap = new Map();

  // itemMap
  itemArray: Item[] = [];

// observers
  private itemIdMapObserver: BehaviorSubject<Map<string,Item>> = new BehaviorSubject<Map<string,Item>>(this.itemIdMap);
  itemGeneralArray: Item[] = [];



  initializeDataSet() {
    // check if DataSet is already initialized ...
    if (this.itemIdMap.size > 0) {
      console.warn("initializeDataSet called with ${{this.itemIdMap.size}} elements already stored");
      return;
    }
    // iterate through the items and create correct classes and indexes
    for(let i=0;i<this.items.length;i++) {
      var item = this.items[i]['$'];
      var itemIdent = item['ident'];
      var itemType = item['xsi:type'];
      this.itemArray.push(new Item(item,this));
      switch (itemType) {
        case 'data:Person':
          item = new Person(item, this);
          break;
        case 'data:Content':
          item = new Content(item, this);
          break;
        case 'data:Organisation':
          item = new Organisation(item, this);
          break;
        case 'data:MetaTag':
          item = new MetaTag(item, this);
          break;
        case 'data:Tag':
          item = new Tag(item, this);
          break;
        case 'data:Identifier':
          item = new Identifier(item, this);
          break;
        case 'data:Connection':
          item = new Connection(item, this);
          break;
        case 'data:Image':
          item = new Image(item, this);
          break;
        // TBD: still some missing ...
      }
      // now store item object in different Maps for quick retrieval
      // a map indexing items by id
      this.itemIdMap.set(itemIdent, item);
      this.itemGeneralArray.push(item);
      // a map storing item arrays for the different types
      var typeArr = this.itemTypeMap.get(itemType);
      if (typeArr == null) {
        typeArr = [];
        this.itemTypeMap.set(itemType, typeArr);
      }
      typeArr.push(item);
    }
    this.finishedLoadingFromURL = true;
    this.itemIdMapObserver.next(this.itemIdMap);
    
  }


  getItems(): Item[] {
    //console.log(this.items)
    //return this.itemTypeMap.get('data:Item');
    return this.itemGeneralArray;
  }
  getPersonsArray(): Person[]{
    return this.itemTypeMap.get('data:Person');
  }
  getOrganisationsArray(): Organisation[]{
    return this.itemTypeMap.get('data:Organisation');
  }
  getContentArray(): Content[]{
    return this.itemTypeMap.get('data:Content');
  }
  getItemIdMapObserverable() {
    return this.itemIdMapObserver.asObservable();
  }

  addTestItems() {
  // Item
  var dummyItem = this.itemGeneralArray[this.itemGeneralArray.length-1];
  dummyItem.ident = "a_TestItem" 
  dummyItem.uri = "https://www.unibw.de/inf2"
  dummyItem.stringValue = "This is an Item."
  dummyItem.created = "2022-01-09T00:30:34.934+0100";
  dummyItem.lastModified = "2022-01-09T00:30:34.934+0100";
  dummyItem.connectedTo = ["a_2","a_3","a_4"]
  dummyItem.identifiedBy = ["a_5","a_6","a_7"]
  dummyItem.metaTags = ["a_8","a_9","a_10"]
  // Person
  var dummyPerson = new Person(this.itemGeneralArray.length-1, this);
  dummyPerson.ident = "a_TestPerson"
  dummyPerson.title = "Von" 
  dummyPerson.lastname = "Mustermann"
  dummyPerson.firstname = "Max"
  dummyPerson.dateOfBirth = "01.01.2000"
  dummyPerson.stringValue = "This is a Person."
  dummyPerson.uri = "https://www.unibw.de/inf2"
  dummyPerson.connectedTo = ["a_2","a_3","a_4"]
  dummyPerson.identifiedBy = ["a_5","a_6","a_7"]
  dummyPerson.metaTags = ["a_8","a_9","a_10"]
  dummyPerson.created = "2022-01-09T00:30:34.934+0100";
  dummyPerson.lastModified = "2022-01-09T00:30:34.934+0100";
  dummyPerson.images = ["test_Person"]
  // Organisation
  var dummyOrg = new Organisation(this.itemGeneralArray.length-1,this);
  dummyOrg.ident = "a_TestOrg"
  dummyOrg.name = "Test Organisation"
  dummyOrg.alternativeNames = ["Alias 1","Alias 2"]
  dummyOrg.stringValue = "This is an Organisation."
  dummyOrg.uri = "https://www.unibw.de/inf2"
  dummyOrg.connectedTo = ["a_2","a_3","a_4"]
  dummyOrg.identifiedBy = ["a_5","a_6","a_7"]
  dummyOrg.metaTags = ["a_8","a_9","a_10"]
  dummyOrg.created = "2022-01-09T00:30:34.934+0100";
  dummyOrg.lastModified = "2022-01-09T00:30:34.934+0100";
  dummyOrg.images = ["test_Organisation1","test_Organisation2", "test_Organisation3" ]
  // Content
  var dummyContent = new Content(this.itemGeneralArray.length-1,this)
  dummyContent.ident = "a_TestContent"
  dummyContent.locale = "Locale."
  dummyContent.name = "Test Content"
  dummyContent.alternativeNames = ["Alias 3", "Alias 4"]
  dummyContent.uri = "https://www.unibw.de/inf2"
  dummyContent.connectedTo = ["a_2","a_3","a_4"]
  dummyContent.identifiedBy = ["a_5","a_6","a_7"]
  dummyContent.metaTags = ["a_8","a_9","a_10"]
  dummyContent.created = "2022-01-09T00:30:34.934+0100";
  dummyContent.lastModified = "2022-01-09T00:30:34.934+0100";
  dummyContent.images = ["test_Content1", "test_Content2"]
  // images
  var dummyImage = new Image(this.itemGeneralArray.length-1,this);
  dummyImage.ident = "test_Person"
  dummyImage.fileUrl = "https://www.pngitem.com/pimgs/m/111-1114669_blank-person-hd-png-download.png"
  this.itemIdMap.set(dummyImage.ident, dummyImage)
  var dummyImage = new Image(this.itemGeneralArray.length-1,this);
  dummyImage.ident = "test_Organisation1"
  dummyImage.fileUrl = "https://de.academic.ru/pictures/dewiki/83/Signet_unibw.jpg"
  this.itemIdMap.set(dummyImage.ident, dummyImage)
  var dummyImage = new Image(this.itemGeneralArray.length-1,this);
  dummyImage.ident = "test_Organisation2"
  dummyImage.fileUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/GitHub_logo_2013.svg/250px-GitHub_logo_2013.svg.png"
  this.itemIdMap.set(dummyImage.ident, dummyImage)
  var dummyImage = new Image(this.itemGeneralArray.length-1,this);
  dummyImage.ident = "test_Organisation3"
  dummyImage.fileUrl = "https://de.wikipedia.org/wiki/Wikipedia:Hauptseite#/media/Datei:Sir_William_Petre_from_NPG.jpg"
  this.itemIdMap.set(dummyImage.ident, dummyImage)
  var dummyImage = new Image(this.itemGeneralArray.length-1,this);
  dummyImage.ident = "test_Content1"
  dummyImage.fileUrl = "https://www.stateofdigitalpublishing.com/wp-content/uploads/2018/10/content.jpg"
  this.itemIdMap.set(dummyImage.ident, dummyImage)
  var dummyImage = new Image(this.itemGeneralArray.length-1,this);
  dummyImage.ident = "test_Content2"
  dummyImage.fileUrl = "http://blog.sqzin.com/wp-content/uploads/2018/01/content.jpg"
  this.itemIdMap.set(dummyImage.ident, dummyImage)

  this.itemGeneralArray.push(dummyItem);
  this.itemTypeMap.get('data:Person').push(dummyPerson);
  this.itemTypeMap.get('data:Organisation').push(dummyOrg);
  this.itemTypeMap.get('data:Content').push(dummyContent)
}

}
