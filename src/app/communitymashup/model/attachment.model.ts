import { Extension } from './extension.model';
import { CommunityMashupService } from './../communitymashup.service';
import { Item } from './item.model';

export class Attachment extends Extension {

  // additional attributes
  fileUrl: string;
  cachedFileUrl: string ="";
  cachedOnly: boolean = false; // TBD
  fileExtension: string;
  fileIdentifier: string;
  cachedFileName: string = "";
  noCache: boolean = false; // TBD

  constructor(item: Attachment, public override service: CommunityMashupService) {
    super(item, service);
    // attributes
    this.fileUrl = item['fileUrl'];
    this.fileExtension = item['fileExtension'];
    this.fileIdentifier = item['fileIdentifier'];
  }

}
