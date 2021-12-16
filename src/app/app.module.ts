import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppNavigationBar } from './navigation-bar/app.navigation-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSliderModule } from '@angular/material/slider';
import { HttpClientModule } from '@angular/common/http';
import { DataparserService } from './services/dataparser.service'

import { ToolbarComponent } from './components//toolbar/toolbar.component';
import { ItemtableComponent } from './components/itemtable/itemtable.component'

// Angular Material Imports
import { MatToolbarModule } from '@angular/material/toolbar'; 
import { MatIconModule } from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import {MatStepperModule} from '@angular/material/stepper';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatListModule} from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatTableModule} from '@angular/material/table';
import {MatInputModule } from '@angular/material/input';
import {MatPaginatorModule} from '@angular/material/paginator';

// community mashup






@NgModule({
  declarations: [
    AppComponent,
    AppNavigationBar,
    DataparserService,
    ToolbarComponent,
    ItemtableComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSliderModule,
    HttpClientModule,
    // Material Imports
    MatToolbarModule,
    MatIconModule,
    MatTabsModule,
    MatStepperModule,
    MatButtonToggleModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatListModule,
    MatMenuModule,
    MatFormFieldModule,
    MatTableModule,
    MatInputModule,
    MatPaginatorModule,
    // mashup
  ],
  providers: [MatPaginatorModule],
  bootstrap: [AppComponent,AppNavigationBar,DataparserService]
})
export class AppModule {}
