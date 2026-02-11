import { Component, inject, OnInit } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';
import { UtilsService } from 'src/app/services/utils';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { AddUpdateProductComponent } from 'src/app/shared/components/add-update-product/add-update-product.component';
import { User } from 'src/app/models/user.model';
import { Product } from 'src/app/models/product.model'
import { FormsModule } from "@angular/forms";



@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  host: { '[attr.inert]': 'isPageHidden ? "" : null' },
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    HeaderComponent,
    FormsModule
  ]
})
export class HomePage implements OnInit {
  isPageHidden = false;
  supabaseSvc = inject(SupabaseService);
  utilsSvc = inject(UtilsService);

  products: Product[] = [];  // ← AGREGA ESTA LÍNEA
  user = {} as User;     // ← AGREGA ESTA LÍNEA
  loading: boolean = false;

  ngOnInit() {
    this.user = this.utilsSvc.getFromLocalStorage('user');
    this.getProducts();
  }

  async loadUserData() {
    const user = await this.supabaseSvc.getCurrentUser();
    console.log('Usuario actual:', user);
  }

  doRefresh(event) {


    setTimeout(() => {
      this.getProducts();
      event.target.complete();
    }, 1000);
  }

  // Obtener Ganacias
  getProfits() {
    return this.products.reduce((index, product) => index + product.price * product.sold_units, 0);
  }


  // Obtener Products
  async getProducts() {
    this.loading = true;

    try {
      this.products = await this.supabaseSvc.getUserProducts();
      console.log('Productos:', this.products);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } this.loading = false;

  }

  // Agregar o actualizar producto
  async addUpdateProduct(product?: any) {
    let success = await this.utilsSvc.presentModal({
      component: AddUpdateProductComponent,
      componentProps: { product }
    });

    if (success) this.getProducts();
  }


  signOut() {
    this.supabaseSvc.signOut();
  }

  async confirmDeleteProduct(product: any) {
    this.utilsSvc.presentAlert({
      header: 'Eliminar Producto',
      message: '¿Quieres ELiminar Este producto?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
        }, {
          text: 'Si , Eliminar',
          handler: () => {
            this.deleteProduct(product)
          }
        }
      ]
    });
  }

  //Eliminar producto
  async deleteProduct(product: any) {
    const loading = await this.utilsSvc.loading();
    await loading.present();

    try {
      // Eliminar imagen del storage
      if (product.image) {
        const imagePath = product.image.split('/products/')[1]; // Extrae el path de la URL
        await this.supabaseSvc.deleteImage(imagePath);
      }

      // Eliminar producto de la base de datos
      await this.supabaseSvc.deleteProduct(product.id);

      // Mensaje de éxito
      this.utilsSvc.presentToast({
        message: 'Producto eliminado exitosamente',
        duration: 1500,
        color: 'success',
        position: 'middle',
        icon: 'checkmark-circle-outline'
      });

      // Recargar productos
      this.getProducts();

    } catch (error: any) {
      console.error('❌ Error eliminando producto:', error);

      this.utilsSvc.presentToast({
        message: error.message || 'Error al eliminar el producto',
        duration: 3000,
        color: 'danger',
        position: 'middle',
        icon: 'alert-circle-outline'
      });

    } finally {
      loading.dismiss();
    }
  }
  ionViewWillEnter() { this.isPageHidden = false; }
  ionViewWillLeave() { this.isPageHidden = true;
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();}
   }
};