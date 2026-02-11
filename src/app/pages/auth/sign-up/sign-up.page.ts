import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, Validators, FormControl, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { logInOutline, personAddOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { SupabaseService } from 'src/app/services/supabase.service';
import { inject } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { UtilsService } from 'src/app/services/utils';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { CustomInputComponent } from '../../../shared/components/custom-input/custom-input.component';





@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,        // ← Para formGroup
    HeaderComponent,             // ← Para <app-header>
    LogoComponent,               // ← Para <app-logo>
    CustomInputComponent,

  ]
})
export class SignUpPage implements OnInit {

  form = new FormGroup({
    uid: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required, Validators.minLength(4)]),
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

      this.supabaseSvc.signUp(this.form.value as User).then(async res => {
        let uid = res.user.id;
        this.form.controls.uid.setValue(uid);
        this.setUserInfo(uid);

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

  async setUserInfo(uid: string) {
  if (this.form.valid) {

    const loading = await this.utilsSvc.loading();
    await loading.present();

    let path = `users/${uid}`;

    // ✅ Solo los campos que existen en tu tabla
    const userData = {
      uid: uid,
      name: this.form.value.name,
      email: this.form.value.email,
      image: ''
    };

    this.supabaseSvc.setDocument(path, userData).then(async res => {

      this.utilsSvc.saveInLocalStorage('user', userData);
      this.utilsSvc.routerLink('/main/home');
      this.form.reset();

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
    });
  }
}
  getErrorMessage(error: any): string {
    const msg = error?.message?.toLowerCase() || '';

    if (msg.includes('user already registered') || msg.includes('already been registered'))
      return 'Este correo ya está registrado. Intenta iniciar sesión.';

    if (msg.includes('invalid email'))
      return 'El correo electrónico no es válido.';

    if (msg.includes('password should be at least'))
      return 'La contraseña debe tener al menos 6 caracteres.';

    if (msg.includes('network') || msg.includes('fetch'))
      return 'Sin conexión. Revisa tu internet e intenta de nuevo.';

    return 'Ocurrió un error inesperado. Intenta más tarde.';
  }








}


