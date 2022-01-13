import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
  })

export class  ConfigurationService{
    // app
    public static appTitle: string = "CommunityMirror";
    // default queries
    public static ident: string = "a_2";
    public static communityMirrorId: string = "";
    // URL to mashup instance
    public static mashupURL: string = 'https://conf.communitymashup.net/xmlinf/mashup';
    // couldn't load data
    public static couldNotLoadImage: string = 'Eine Grafik konnte leider nicht geladen werden.'; // error message for images
    // snackbar duration
    public static snackbarDuration: number = 3000;
}