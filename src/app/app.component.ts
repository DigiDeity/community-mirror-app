import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'community-mirror-app';
  
  constructor(private route: ActivatedRoute, private router: Router) {
  }
  ngOnInit() {};  
}
