import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { User } from 'src/app/models/user.model';
import { SupabaseService } from 'src/app/services/supabase.service';
import { UtilsService } from 'src/app/services/utils';
import { SharedModule } from 'src/app/shared/shared-module';
import { CustomInputComponent } from 'src/app/shared/components/custom-input/custom-input.component';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
  host: { '[attr.inert]': 'isPageHidden ? "" : null' },
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    CustomInputComponent,
    HeaderComponent
]
})
export class EditProfilePage implements OnInit {
  isPageHidden = false;
  supabaseSvc = inject(SupabaseService);
  utilsSvc = inject(UtilsService);
  cdr = inject(ChangeDetectorRef);
  loading = false;

  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(4)]),
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  user(): User | null {
    return this.utilsSvc.getFromLocalStorage('user');
  }

  ngOnInit() {
    const u = this.user();
    if (u) {
      this.form.controls.name.setValue(u.name || '');
      this.form.controls.email.setValue(u.email || '');
    }
  }

  async takeImage() {
    const u = this.user();
    if (!u) return;

    try {
      const dataUrl = (await this.utilsSvc.takePicture('Imagen del Perfil')).dataUrl;
      const load = await this.utilsSvc.loading();
      await load.present();

      try {
        const imagePath = `${u.uid}/profile_${Date.now()}`;
        const newImageUrl = await this.supabaseSvc.uploadImage(imagePath, dataUrl);
        await this.supabaseSvc.updateUser(u.uid, { image: newImageUrl });

        u.image = newImageUrl;
        this.utilsSvc.saveInLocalStorage('user', u);
        this.cdr.detectChanges();

        this.utilsSvc.presentToast({
          message: 'Foto actualizada exitosamente',
          duration: 1500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline'
        });
      } finally {
        load.dismiss();
      }
    } catch (error: any) {
      this.utilsSvc.presentToast({
        message: error.message || 'Error al actualizar la foto',
        duration: 3000,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    }
  }

  async submit() {
  if (this.form.invalid) return;
  const u = this.user();
  if (!u) return;

  this.loading = true;
  const load = await this.utilsSvc.loading();
  await load.present();

  try {
    const updatedData: Partial<User> = {
      name: this.form.value.name!,
      email: this.form.value.email!,
    };

    const emailChanged = updatedData.email !== u.email;

    // ✅ VALIDAR formato de email real (opcional pero recomendado)
    if (emailChanged && !this.isValidEmail(updatedData.email!)) {
      throw new Error('Por favor ingresa un correo válido');
    }

    // ✅ Actualizar la tabla users
    await this.supabaseSvc.updateUser(u.uid, updatedData);

    // ✅ Si cambió el email, actualizar Authentication
    if (emailChanged) {
      try {
        await this.supabaseSvc.updateAuthEmail(updatedData.email!);
        
        // ✅ SOLO guardar el nombre, NO el email nuevo hasta confirmar
        const updatedUser = { ...u, name: updatedData.name };
        this.utilsSvc.saveInLocalStorage('user', updatedUser);
        
        // ✅ UN SOLO MENSAJE cuando cambia email
        this.utilsSvc.presentToast({
          message: '📧 Se envió un correo de confirmación. Revisa tu bandeja de entrada para completar el cambio.',
          duration: 6000,
          color: 'warning',
          position: 'middle',
          icon: 'mail-outline'
        });
        
      } catch (authError: any) {
        // Si falla Auth, revertir en la tabla
        await this.supabaseSvc.updateUser(u.uid, { email: u.email });
        throw new Error(`Error al actualizar el email: ${authError.message}`);
      }
    } else {
      // ✅ SOLO actualizar nombre (sin cambio de email)
      const updatedUser = { ...u, ...updatedData };
      this.utilsSvc.saveInLocalStorage('user', updatedUser);
      
      // ✅ UN SOLO MENSAJE cuando NO cambia email
      this.utilsSvc.presentToast({
        message: '✅ Perfil actualizado exitosamente',
        duration: 2000,
        color: 'success',
        position: 'middle',
        icon: 'checkmark-circle-outline'
      });
    }

    this.utilsSvc.routerLink('/main/profile');

  } catch (error: any) {
    this.utilsSvc.presentToast({
      message: error.message || 'Error al actualizar el perfil',
      duration: 3000,
      color: 'danger',
      position: 'middle',
      icon: 'alert-circle-outline'
    });
  } finally {
    load.dismiss();
    this.loading = false;
  }
}

// ✅ MÉTODO PARA VALIDAR EMAIL REAL
private isValidEmail(email: string): boolean {
  // Regex más estricta para emails válidos
  const emailRegex = /^[a-zA-Z0-9]+([\._\-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9]+([\.-]?[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;
  
  // Validar formato
  if (!emailRegex.test(email)) {
    return false;
  }
  
  // Validar que no tenga caracteres inválidos
  const invalidChars = /[<>()[\]\\,;:\s@"]/;
  if (invalidChars.test(email.split('@')[0])) {
    return false;
  }
  
  return true;
}

  ionViewWillEnter() { this.isPageHidden = false; }
  ionViewWillLeave() { this.isPageHidden = true;
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();}
   }
}