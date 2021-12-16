import { InformationObject } from './informationobject.model';
import { Person } from './person.model';
import { CommunityMashupService } from './../communitymashup.service';

export class Organisation extends InformationObject {

  // no additional attributes
  // additional references
  // leader:Person, parentOrganisation:Organisation, participants:Person, organizations:Organisation

  constructor(item: any, public override service: CommunityMashupService) {
    super(item, service);
  }

  getLeader(): Person | null{
    // TBD
    return null;
  }

  // TBD: getParentOrganisation
  // TBD: getParticipants
  // TBD: getOrganisations

}
