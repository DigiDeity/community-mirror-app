import { Classification } from './classification.model';
import { CommunityMashupService } from './../communitymashup.service';

export class Tag extends Classification {

  constructor(item: any, public override service: CommunityMashupService) {
    super(item, service);
  }

  // TBD: getTagged()

}
