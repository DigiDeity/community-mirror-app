import { Item } from './item.model';
import { Image } from './image.model';
import { CommunityMashupService } from './../communitymashup.service';

export class InformationObject extends Item {

  // additional attributes
  name: string;
  alternativeNames: string[] = [];
  // additional references - store idents
  metaInformations: string[] = [];
  categories: string[] = [];
  tags: string[] = [];
  images: string[] = [];
  binaries: string[] = [];
  starRankings: string[] = [];
  thumbRankings: string[] = [];
  viewRankings: string[] = [];

  constructor(item: any, public override service: CommunityMashupService) {
    super(item, service);
    // attributes
    this.name = item['name'];
    var tmps = item['alternativeNames'];
    if(tmps) {
      var tmpsArr = tmps.split(",");
      tmpsArr.forEach((aName: string) => this.alternativeNames.push(aName));
    }
    // reference metaInformations
    tmps = item['metaInformations'];
    if(tmps) {
      var tmpsArr = tmps.split(" ");
      tmpsArr.forEach((id: string) => this.metaInformations.push(id));
    }
    // reference categories
    tmps = item['categories'];
    if(tmps) {
      tmpsArr = tmps.split(" ");
      tmpsArr.forEach((id: string) => this.categories.push(id));
    }
    // reference tags
    tmps = item['tags'];
    if(tmps) {
      tmpsArr = tmps.split(" ");
      tmpsArr.forEach((id: string) => this.tags.push(id));
    }
    // reference images
    tmps = item['images'];
    if(tmps) {
      tmpsArr = tmps.split(" ");
      tmpsArr.forEach((id: string) => this.images.push(id));
    }
    // reference binaries
    tmps = item['binaries'];
    if(tmps) {
      tmpsArr = tmps.split(" ");
      tmpsArr.forEach((id: string) => this.binaries.push(id));
    }
    // TBD: Rankings
  }

  // TBD: getCategories()
  // TBD: getTags()
  // TBD: getBinaries()
  // TBD: getMetaInformations()
  // TBD: getStarRankings()
  // TBD: getThumbRankings()
  // TBD: getViewRankings()

  // get all attached images
  getImages() : Image[] {
    var result:Image[] = [];
    this.images.forEach(id => {
      result.push(this.service.getItemById(id))
    } );
    return result;
  }

  // get all items connected to this information object
  // (either directly or via connectedTo)
  override getConnectedItems() : Item[] {
    return super.getConnectedItems();
  }

}
