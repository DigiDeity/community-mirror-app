import { Component, OnInit } from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { Config } from 'src/app/configurations/config';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  paramsObject: any;
  communityMirrorID: string = Config.communityMirrorId;
  ident: string = Config.ident;
  appTitle: string = Config.appTitle;
  
  constructor(private route: ActivatedRoute){ }

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

