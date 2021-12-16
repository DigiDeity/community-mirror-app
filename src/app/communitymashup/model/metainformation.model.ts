import { Extension } from './extension.model';
import { CommunityMashupService } from './../communitymashup.service';

export class Metainformation extends Extension {

  constructor(item: any, public override service: CommunityMashupService) {
    super(item, service);
  }

  // TBD: getInformatioObjects()

}
