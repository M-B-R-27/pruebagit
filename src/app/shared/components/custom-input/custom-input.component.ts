import { Component, OnInit,Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  mailOutline, 
  lockClosedOutline, 
  eyeOutline, 
  eyeOffOutline,
  shieldOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-custom-input',
  templateUrl: './custom-input.component.html',
  styleUrls: ['./custom-input.component.scss'],
  standalone: true,
  imports: [FormsModule,CommonModule,ReactiveFormsModule,IonicModule ]
})
export class CustomInputComponent  implements OnInit {
  @Input() control!: FormControl;
  @Input() type!: string; 
  @Input() label!: string;
  @Input() autocomplete!: string;
  @Input() icon!: string;

  isPassword!: boolean; 
  hide: boolean = true;
  
  constructor() {
    addIcons({
      'mail-outline': mailOutline,
      'lock-closed-outline': lockClosedOutline,
      'eye-outline': eyeOutline,
      'eye-off-outline': eyeOffOutline,
      'shield-outline': shieldOutline
    });
  }

  ngOnInit() {
    if (this.type == 'password') this.isPassword = true;
  }

  showOrHidePassword() {
  this.hide = !this.hide;
  if (this.hide) {
    this.type = 'password';
  } else {
    this.type = 'text';
  }
}}
