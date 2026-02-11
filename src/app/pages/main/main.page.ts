import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "src/app/shared/components/header/header.component";
import { SharedModule } from 'src/app/shared/shared-module';
import { SupabaseService } from 'src/app/services/supabase.service';
import { UtilsService } from 'src/app/services/utils';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
  host: { '[attr.inert]': 'isPageHidden ? "" : null' },
  standalone: true,
  imports: [IonicModule, RouterModule, CommonModule, HeaderComponent, SharedModule]
})
export class MainPage implements OnInit {
  isPageHidden = false;
  pages = [
    { title: 'Inicio', url: '/main/home', icon: 'home-outline' },
    { title: 'Perfil', url: '/main/profile', icon: 'person-outline' },
  ]

  router = inject(Router);
  supabaseSvc = inject(SupabaseService);
  utilsSvc = inject(UtilsService);


  currentPath: string = '';
  ngOnInit() {
    this.router.events.subscribe((event: any) => {
      if (event?.url) this.currentPath = event.url;
    })
  }

  user(): User {
    return this.utilsSvc.getFromLocalStorage('user');
  }

  //Cerrar sesión
  signOut() {
    this.supabaseSvc.signOut();
  }

  ionViewWillEnter() {
    this.isPageHidden = false;
  }

  ionViewWillLeave() {
    this.isPageHidden = true;
    // Quitar el foco de cualquier elemento enfocado
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

}
