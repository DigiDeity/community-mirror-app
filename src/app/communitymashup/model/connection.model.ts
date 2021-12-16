import { Item } from './item.model';
import { CommunityMashupService } from './../communitymashup.service';

export class Connection extends Item {

  // additional attributes
  fromId: string;
  toId: string;

  constructor(item: any, public override service: CommunityMashupService) {
    super(item, service);
    // attributes
    this.fromId = item['from'];
    this.toId = item['to'];
  }

}
