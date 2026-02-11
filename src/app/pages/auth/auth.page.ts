import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, Validators, FormControl, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { CustomInputComponent } from 'src/app/shared/components/custom-input/custom-input.component';
import { IonicModule } from '@ionic/angular';
import { LogoComponent } from 'src/app/shared/components/logo/logo.component';
import { logInOutline, personAddOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { RouterModule } from '@angular/router';
import { SupabaseService } from 'src/app/services/supabase.service';
import { inject } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { UtilsService } from 'src/app/services/utils';



@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,  // ← AGREGAR
  imports: [        // ← AGREGAR
    CommonModule,
    FormsModule,
    HeaderComponent,
    CustomInputComponent,
    ReactiveFormsModule,
    IonicModule,
    LogoComponent,
    RouterModule,
    ReactiveFormsModule,        // ← Para formGroup
    HeaderComponent,             // ← Para <app-header>
    LogoComponent,               // ← Para <app-logo>
    CustomInputComponent
  ]
})
export class AuthPage implements OnInit {

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  })

  supabaseSvc = inject(SupabaseService);
  utilsSvc = inject(UtilsService);


  constructor(private cdr: ChangeDetectorRef) {
    addIcons({
      'log-in-outline': logInOutline,
      'person-add-outline': personAddOutline
    });
  }

  ngOnInit() {
    this.form.valueChanges.subscribe(val => {
      console.log('Form cambió:', val);
      this.cdr.detectChanges();  // ← Agrega esto
    });
  }

  async submit() {
    if (this.form.valid) {

      const loading = await this.utilsSvc.loading();
      await loading.present();

      this.supabaseSvc.signIn(this.form.value as User).then(res => {

        this.getUserInfo(res.user.id);

      }).catch(error => {
        console.log(error);

        this.utilsSvc.presentToast({
          message: this.getErrorMessage(error),
          duration: 3000,
          color: 'danger',
          position: 'middle',
          icon: 'alert-circle-outline'
        });

      }).finally(() => {
        loading.dismiss();
      })
    }
  }

  async getUserInfo(uid: string) {
    if (this.form.valid) {

      const loading = await this.utilsSvc.loading();
      await loading.present();

      let path = `users/${uid}`;

      this.supabaseSvc.getDocument(path).then((user: User) => {

        this.utilsSvc.saveInLocalStorage('user', user);
        this.utilsSvc.routerLink('/main/home');
        this.form.reset();

        this.utilsSvc.presentToast({
          message: `Te damos la bienvenida ${user.name}`,
          duration: 1500,
          color: 'primary',
          position: 'middle',
          icon: 'person-circle-outline'
        });

      }).catch(error => {
        console.log(error);

        this.utilsSvc.presentToast({
          message: this.getErrorMessage(error),
          duration: 3000,
          color: 'danger',
          position: 'middle',
          icon: 'alert-circle-outline'
        });

      }).finally(() => {
        loading.dismiss();
      })
    }
  }

  getErrorMessage(error: any): string {
  const msg = error?.message?.toLowerCase() || '';
  const code = error?.code || '';

  if (msg.includes('invalid login credentials') || msg.includes('invalid email or password'))
    return 'Correo o contraseña incorrectos.';

  if (msg.includes('email not confirmed'))
    return 'Debes confirmar tu correo antes de ingresar.';

  if (msg.includes('cannot coerce') || code === 'PGRST116')
    return 'No encontramos tu perfil. Por favor regístrate de nuevo.';

  if (msg.includes('network') || msg.includes('fetch'))
    return 'Sin conexión. Revisa tu internet.';

  return 'Ocurrió un error inesperado. Intenta más tarde.';
}


}
