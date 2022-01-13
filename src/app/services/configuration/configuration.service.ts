import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
  })

export class  ConfigurationService{
    // app
    public static appTitle: string = "CommunityMirror";
    // default queries
    public static defaultIdent: string = "";
    public static defaultCMId: string = "Unknown";
    // URL to mashup instance
    public static mashupURL: string = 'https://conf.communitymashup.net/xmlinf/mashup';
    // couldn't load data
    public static couldNotLoadImage: string = 'Eine Grafik konnte leider nicht geladen werden.'; // error message for images
    // snackbar duration
    public static snackbarDuration: number = 3000;
    // path fot the image used as a toolbar icon
    public static toolbarLogoPath = "./assets/communitymirrors-logo.png";
    // group tab indexes
    public static personTableGroupIndex = 0;
    public static organisationTableGroupIndex = 1;
    public static contentTableGroupIndex = 2;
    public static allTableGroupIndex = 3;
}