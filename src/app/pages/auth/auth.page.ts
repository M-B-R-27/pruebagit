import { Component, OnInit,ChangeDetectorRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, Validators ,FormControl,ReactiveFormsModule,FormGroup } from '@angular/forms';
import { 
  IonContent, 
} from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { CustomInputComponent } from 'src/app/shared/components/custom-input/custom-input.component';
import { IonicModule } from '@ionic/angular';
import { LogoComponent } from 'src/app/shared/components/logo/logo.component';
import { logInOutline, personAddOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { RouterModule } from '@angular/router';

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
    ReactiveFormsModule ,
    IonicModule,
    LogoComponent,
    RouterModule
  ]
})
export class AuthPage implements OnInit {

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('',[Validators.required])
  })

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

  submit(){
    console.log(this.form.value);
  }
}
