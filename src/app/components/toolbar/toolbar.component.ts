import { Component, OnInit } from '@angular/core';
import { Constants } from 'src/app/global/constants'
import { ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
  paramsObject: any;
  communityMirrorID: string = Constants.communityMirrorId;
  ident: string = Constants.ident;
  appTitle: string = Constants.appTitle;
  
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

