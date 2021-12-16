import { Metainformation } from './metainformation.model';
import { CommunityMashupService } from './../communitymashup.service';

export class Event extends Metainformation {

  // TBD: date

  constructor(item: any, public override service: CommunityMashupService) {
    super(item, service);
  }

}
