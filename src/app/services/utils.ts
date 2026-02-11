import { Injectable } from '@angular/core';
import { LoadingController, ToastController, ToastOptions , ModalController, ModalOptions} from '@ionic/angular/standalone';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AlertController, AlertOptions } from '@ionic/angular';


@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  loandingCtrl = inject(LoadingController);
  toasCtrl = inject(ToastController);
  modalCrtl = inject(ModalController)
  router = inject(Router);
  alertCtrl = inject(AlertController);


 async takePicture(promptLabelHeader: string)  {
   return await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.DataUrl,
    source: CameraSource.Prompt,
    promptLabelHeader,
    promptLabelPhoto: 'Selecciona una imagen',
    promptLabelPicture: 'Toma una foto'
  });
};
// alert
  async presentAlert(opts?: AlertOptions) {
    const alert = await this.alertCtrl.create(
      opts
    );
  
    await alert.present();
  }

  //loading
  loading(){
    return this.loandingCtrl.create({ spinner: 'crescent'})
  }

  // toast
  async presentToast(opts?: ToastOptions) {
    const toast = await this.toasCtrl.create(opts);
    toast.present();
  }

//Enruta a cualquier pagina disponible
  routerLink(url: string){
  return this.router.navigateByUrl(url);
  }

 //Guarda un elemento en el local storage
  saveInLocalStorage(key: string, value: any){
    return localStorage.setItem(key, JSON.stringify(value))
  }

  //Obtiene un elemento del local storage
  getFromLocalStorage(key: string){
    return JSON.parse(localStorage.getItem(key))
  }


  //Modal
  async presentModal(opts: ModalOptions) {
    const modal = await this.modalCrtl.create(opts);
    await modal.present();
  
    const { data } = await modal.onWillDismiss();
    if(data)return data; 
  } 
  dismissModal(data?: any){
    return this.modalCrtl.dismiss(data);
  }
}
