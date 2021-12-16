import { Ranking } from './ranking.model';
import { CommunityMashupService } from './../communitymashup.service';

export class StarRanking extends Ranking {

  // TBD: normalizedValue

  constructor(item: any, public override service: CommunityMashupService) {
    super(item, service);
  }

  // TBD: getRankedInformationObject

}
