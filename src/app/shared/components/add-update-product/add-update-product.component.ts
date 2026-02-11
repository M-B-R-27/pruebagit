import { Component, OnInit,Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../header/header.component';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, Validators, FormControl, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { logInOutline, personAddOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { SupabaseService } from 'src/app/services/supabase.service';
import { inject } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { UtilsService } from 'src/app/services/utils';
import { CustomInputComponent } from '../../../shared/components/custom-input/custom-input.component';
import { Product } from 'src/app/models/product.model'

@Component({
  selector: 'app-add-update-product',
  templateUrl: './add-update-product.component.html',
  styleUrls: ['./add-update-product.component.scss'],
  standalone: true,
  imports: [IonicModule, HeaderComponent, CommonModule, FormsModule, ReactiveFormsModule, CustomInputComponent]
})
export class AddUpdateProductComponent implements OnInit {

  @Input() product: any;
  
  form = new FormGroup({
    id: new FormControl(''),
    image: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required, Validators.minLength(4)]),
    price: new FormControl(null, [Validators.required, Validators.min(0)]),
    sold_units: new FormControl(null, [Validators.required, Validators.min(0)]),
  })

  supabaseSvc = inject(SupabaseService);
  utilsSvc = inject(UtilsService);

  user = {} as User;

  constructor(private cdr: ChangeDetectorRef) {
    addIcons({
      'log-in-outline': logInOutline,
      'person-add-outline': personAddOutline
    });
  }

  ngOnInit() {
  this.user = this.utilsSvc.getFromLocalStorage('user');
  
  // ✅ AGREGAR ESTO
  if (this.product) {
    this.form.patchValue({
      id: this.product.id,
      image: this.product.image,
      name: this.product.name,
      price: this.product.price,
      sold_units: this.product.sold_units
    });
    
    console.log('📝 Editando producto:', this.product);
  }
  
  this.form.valueChanges.subscribe(val => {
    console.log('Form cambió:', val);
    this.cdr.detectChanges();
  });
}

  // MÉTODO DE PRUEBA
  testButton() {
    alert('🎉 EL BOTÓN FUNCIONA!');
    console.log('🎉 EL BOTÓN FUNCIONA!');
  }

  // Tomar/Seleccionar Imagen
  async takeImage() {
    try {
      const dataUrl = (await this.utilsSvc.takePicture('Imagen del Producto')).dataUrl;
      this.form.controls.image.setValue(dataUrl);
      console.log('✅ Imagen seleccionada');
    } catch (error) {
      console.error('❌ Error al tomar imagen:', error);
    }
  }

  submit(){
    if (this.form.valid) {
      if (this.product) this.updateProduct();
      else this.createProduct()
    }
  }

// Convierte valores de tipo string a number 
  setNumberInputs(){
    let {sold_units,price } = this.form.controls;
    if (sold_units.value) sold_units.setValue(parseFloat(sold_units.value));
    if (price.value) price.setValue(parseFloat(price.value));
  }



 //crear producto
 async createProduct() {
  // ✅ AGREGAR VALIDACIÓN
  if (this.form.invalid) {
    this.utilsSvc.presentToast({
      message: 'Por favor completa todos los campos correctamente',
      duration: 2500,
      color: 'warning',
      position: 'middle',
      icon: 'alert-circle-outline'
    }); 

    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });

    return;
  }

  const loading = await this.utilsSvc.loading();
  await loading.present();

  try {
    // Subir imagen
    let imagePath = `${this.user.uid}/${Date.now()}.jpg`;
    let imageUrl = await this.supabaseSvc.uploadImage(imagePath, this.form.value.image!);

    // Preparar datos del producto
    const productData = {
      name: this.form.value.name,
      price: this.form.value.price,
      sold_units: this.form.value.sold_units,
      image: imageUrl
    };

    // Guardar en Supabase
    const path = `users/${this.user.uid}/products`;
    await this.supabaseSvc.addDocument(path, productData);

    this.utilsSvc.dismissModal({ success: true });

    this.utilsSvc.presentToast({
      message: 'Producto creado exitosamente',
      duration: 1500,
      color: 'success',
      position: 'middle',
      icon: 'checkmark-circle-outline'
    });

  } catch (error: any) {
    console.error('❌ Error:', error);
    
    this.utilsSvc.presentToast({
      message: error.message || 'Error al crear el producto',
      duration: 3000,
      color: 'danger',
      position: 'middle',
      icon: 'alert-circle-outline'
    });

  } finally {
    loading.dismiss();
  }
}

  //actualizar producto
  async updateProduct() {
  const loading = await this.utilsSvc.loading();
  await loading.present();

  try {
    // ✅ DECLARAR imageUrl AQUÍ (fuera del if)
    let imageUrl = this.form.value.image!;  // Por defecto usa la imagen actual
    
    // Subir imagen SOLO si cambió
    if (this.form.value.image !== this.product.image) {
      let dataUrl = this.form.value.image!;
      let imagePath = `${this.user.uid}/${Date.now()}.jpg`;
      imageUrl = await this.supabaseSvc.uploadImage(imagePath, dataUrl);  // ✅ Reasignar
      
      // Actualizar el formulario con la nueva URL
      this.form.controls.image.setValue(imageUrl);
    }

    // Preparar datos del producto
    const productData = {
      name: this.form.value.name,
      price: this.form.value.price,
      sold_units: this.form.value.sold_units,
      image: imageUrl  // ✅ Ahora SÍ existe
    };

    // Actualizar en Supabase
    await this.supabaseSvc.updateProduct(this.product.id, productData);

    this.utilsSvc.dismissModal({ success: true });

    this.utilsSvc.presentToast({
      message: 'Producto actualizado exitosamente',
      duration: 1500,
      color: 'success',
      position: 'middle',
      icon: 'checkmark-circle-outline'
    });

  } catch (error: any) {
    console.error('❌ Error actualizando producto:', error);
    
    this.utilsSvc.presentToast({
      message: error.message || 'Error al actualizar el producto',
      duration: 3000,
      color: 'danger',
      position: 'middle',
      icon: 'alert-circle-outline'
    });

  } finally {
    loading.dismiss();
  }
}



  getFormValidationErrors() {
    const errors: any = {};
    Object.keys(this.form.controls).forEach(key => {
      const controlErrors = this.form.get(key)?.errors;
      if (controlErrors) {
        errors[key] = controlErrors;
      }
    });
    return errors;
  }

} // ← SOLO UNA LLAVE DE CIERRE