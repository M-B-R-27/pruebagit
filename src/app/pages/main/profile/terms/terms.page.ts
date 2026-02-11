import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.page.html',
  styleUrls: ['./terms.page.scss'],
  host: { '[attr.inert]': 'isPageHidden ? "" : null' },
  standalone: true,
  imports: [IonicModule, HeaderComponent]
})
export class TermsPage {
  isPageHidden = false;

  ionViewWillEnter() { this.isPageHidden = false; }
  ionViewWillLeave() { this.isPageHidden = true;
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();}

  }

}
