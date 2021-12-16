import { Attachment } from './attachment.model';
import { CommunityMashupService } from './../communitymashup.service';
import { Item } from './item.model';

export class Binary extends Attachment {

  // TBD: bytes
  constructor(item: Attachment, public override service: CommunityMashupService) {
    super(item, service);
  }

}
