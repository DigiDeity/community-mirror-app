import { Item } from './item.model';
import { CommunityMashupService } from './../communitymashup.service';

export class Classification extends Item {

  constructor(item: Item, public override service: CommunityMashupService) {
    super(item, service);
  }

}
