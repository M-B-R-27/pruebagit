import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { addIcons } from 'ionicons';
import * as icons from 'ionicons/icons';
import { defineCustomElements } from '@ionic/pwa-elements/loader';


// Registrar todos los iconos
addIcons(icons);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

defineCustomElements(window);