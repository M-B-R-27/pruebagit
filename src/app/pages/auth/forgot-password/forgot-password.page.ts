import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from 'src/app/services/supabase.service';
import { UtilsService } from 'src/app/services/utils';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { LogoComponent } from 'src/app/shared/components/logo/logo.component';
import { CustomInputComponent } from 'src/app/shared/components/custom-input/custom-input.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    HeaderComponent,
    LogoComponent,
    CustomInputComponent
  ]
})
export class ForgotPasswordPage implements OnInit {

  // Formulario para solicitar email
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  // Formulario para nueva contraseña
  resetForm = new FormGroup({
    newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  supabaseSvc = inject(SupabaseService);
  utilsSvc = inject(UtilsService);
  route = inject(ActivatedRoute);

  // Estados
  isResetMode: boolean = false; // ← Determina si mostramos el formulario de nueva contraseña
  emailSent: boolean = false;

  async ngOnInit() {
  // Dar tiempo a Angular para renderizar
  await this.checkForRecoveryToken();
}

private async checkForRecoveryToken() {
  // Obtener el fragment de la URL
  const fragment = window.location.hash.substring(1); // Quita el #
  
  if (!fragment) return;

  console.log('📧 Fragment detectado:', fragment);
  
  const params = new URLSearchParams(fragment);
  const type = params.get('type');
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  if (type === 'recovery' && accessToken && refreshToken) {
    console.log('✅ Tokens de recuperación encontrados');
    
    const loading = await this.utilsSvc.loading();
    await loading.present();

    try {
      // Establecer sesión con los tokens
      const result = await this.supabaseSvc.verifyAndSetRecoverySession(
        accessToken, 
        refreshToken
      );

      if (result.success) {
        this.isResetMode = true;
        console.log('✅ Sesión establecida, mostrando formulario');
        
        // Limpiar la URL
        window.history.replaceState({}, '', '/auth/forgot-password');
      } else {
        throw new Error('No se pudo establecer la sesión');
      }

    } catch (error) {
      console.error('❌ Error:', error);
      
      this.utilsSvc.presentToast({
        message: 'El link ha expirado. Solicita uno nuevo.',
        duration: 3000,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
      
      // Redirigir a la vista de solicitar email
      this.isResetMode = false;
      window.history.replaceState({}, '', '/auth/forgot-password');
      
    } finally {
      loading.dismiss();
    }
  }
}

  

  // FUNCIÓN 1: Enviar email de recuperación (tu código original mejorado)
  async submit() {
    if (this.form.valid) {
      const loading = await this.utilsSvc.loading();
      await loading.present();

      try {
        // Verifica si el email existe
        const emailExiste = await this.supabaseSvc.emailExists(this.form.value.email);

        if (!emailExiste) {
          this.utilsSvc.presentToast({
            message: 'El email no está registrado',
            duration: 2500,
            color: 'warning',
            position: 'middle',
            icon: 'alert-circle-outline'
          });
          return;
        }

        // Envía el email de recuperación
        await this.supabaseSvc.sendRecoveryEmail(this.form.value.email);



        this.utilsSvc.presentToast({
          message: 'Correo enviado con éxito. Revisa tu bandeja de entrada',
          duration: 3000,
          color: 'success',
          position: 'middle',
          icon: 'mail-outline'
        });

        this.form.reset();

      } catch (error) {
        console.error(error);
        this.utilsSvc.presentToast({
          message: error.message,
          duration: 2500,
          color: 'danger',
          position: 'middle',
          icon: 'alert-circle-outline'
        });
      } finally {
        loading.dismiss();
      }
    }
  }

  // FUNCIÓN 2: Actualizar la contraseña (NUEVA)
  async updatePassword() {
  if (this.resetForm.valid) {
    const { newPassword, confirmPassword } = this.resetForm.value;

    if (newPassword !== confirmPassword) {
      this.utilsSvc.presentToast({
        message: 'Las contraseñas no coinciden',
        duration: 2500,
        color: 'warning',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
      return;
    }

    const loading = await this.utilsSvc.loading();
    await loading.present();

    try {
      // Actualizar contraseña usando el método del servicio
      const { error } = await this.supabaseSvc.updatePassword(newPassword);

      if (error) throw error;

      this.utilsSvc.presentToast({
        message: '¡Contraseña actualizada correctamente!',
        duration: 2500,
        color: 'success',
        position: 'middle',
        icon: 'checkmark-circle-outline'
      });

      // Cerrar sesión de recuperación
      await this.supabaseSvc.supabase.auth.signOut();

      // Redirigir al login
      setTimeout(() => {
        this.utilsSvc.routerLink('/auth');
      }, 1000);

    } catch (error) {
      console.error(error);
      this.utilsSvc.presentToast({
        message: error.message || 'Error al actualizar la contraseña',
        duration: 2500,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline'
      });
    } finally {
      loading.dismiss();
    }
  }
}
}