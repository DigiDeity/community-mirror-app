// Angular importss
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { ConfigurationService } from 'src/app/services/configuration/configuration.service';
/**
 * Component representing the toolbar of the application. 
 * @implements {OnInit}
 */
@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  // Attribute to store the parameter of the querymap
  paramsObject: any;
  // Attribute to store the CommunityMirrorId 
  communityMirrorID: string = ConfigurationService.defaultCMId;
  // Attribute to store the ident of the requestet Item 
  ident: string = ConfigurationService.defaultIdent;
  // Attribute to store the title of the application
  appTitle: string = ConfigurationService.appTitle;
  // Attribute to store the path to the logo used in the toolbar
  toolbarLogoPath = ConfigurationService.toolbarLogoPath;
  /**
   * @constructor
   */
  constructor(private route: ActivatedRoute){ }
  /**
   * Uses routing to access and store queries.
   */
  ngOnInit(): void {
    this.route.queryParamMap
      .subscribe((params) => {
        this.paramsObject = { ...params.keys, ...params };
        this.ident = this.paramsObject.params.articleid;
        this.communityMirrorID= this.paramsObject.params.cmid;
      }
    );
  }
}

