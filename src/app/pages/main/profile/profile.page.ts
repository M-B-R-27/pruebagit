import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { IonicModule } from '@ionic/angular';
import { SupabaseService } from 'src/app/services/supabase.service';
import { UtilsService } from 'src/app/services/utils';
import { SharedModule } from 'src/app/shared/shared-module';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  imports: [IonicModule, SharedModule, CommonModule, RouterModule],
  host: { '[attr.inert]': 'isPageHidden ? "" : null' } 
})




export class ProfilePage implements OnInit {
  isPageHidden = false;

  supabaseSvc = inject(SupabaseService);
  utilsSvc = inject(UtilsService);
  cdr = inject(ChangeDetectorRef);
  ngOnInit() { }

  ionViewWillEnter() { this.isPageHidden = false; }  // ← Estas 2 líneas
  ionViewWillLeave() { this.isPageHidden = true; 
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  user(): User | null {
    return this.utilsSvc.getFromLocalStorage('user');
  }

  // Tomar/Seleccionar Imagen
  async takeImage() {
    let user = this.user();


    if (!user) {
      this.utilsSvc.presentToast({
        message: 'No se encontró información del usuario',
        duration: 2000,
        color: 'warning',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
      return;
    }

    try {
      // Primero espera a que el usuario seleccione la imagen
      const dataUrl = (await this.utilsSvc.takePicture('Imagen del Perfil')).dataUrl;

      // Ahora sí muestra el loading (después de seleccionar la imagen)
      const loading = await this.utilsSvc.loading();
      await loading.present();

      try {
        let imagePath = `${user.uid}/profile_${Date.now()}`;
        const newImageUrl = await this.supabaseSvc.uploadImage(imagePath, dataUrl);

        // Actualiza la imagen en la tabla users
        await this.supabaseSvc.updateUser(user.uid, { image: newImageUrl });

        user.image = newImageUrl;
        this.utilsSvc.saveInLocalStorage('user', user);

        this.cdr.detectChanges();
        this.utilsSvc.presentToast({
          message: 'Imagen actualizada exitosamente',
          duration: 1500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline'
        });

      } finally {
        loading.dismiss();
      }

    } catch (error: any) {

      this.utilsSvc.presentToast({
        message: error.message || 'Error al actualizar el perfil',
        duration: 3000,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    }
  }
}