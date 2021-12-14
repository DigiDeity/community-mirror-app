import { Component} from '@angular/core';
import { Constants } from '../global/constants';
import { ActivatedRoute} from '@angular/router';


@Component({
  selector: 'app-navigation',
  templateUrl: './app.navigation-bar.html',
  styleUrls: ['./app.navigation-bar.css']
})
export class AppNavigationBar {
  paramsObject: any;
  deviceID: string = Constants.deviceID;
  articleID: number = Constants.articleID;
  appTitle: string = Constants.appTitle;
  
  constructor(private route: ActivatedRoute){        
    this.route.queryParamMap
      .subscribe((params) => {
        this.paramsObject = { ...params.keys, ...params };
        this.articleID = this.paramsObject.params.articleid;
        this.deviceID= this.paramsObject.params.cmid;
      }
    );
    
  }
}

