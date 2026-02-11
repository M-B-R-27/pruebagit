// Importa las funciones principales de configuración de Angular
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';

// Importa la configuración del router
import { provideRouter } from '@angular/router';
import { RouteReuseStrategy } from '@angular/router';

// Importa los providers de Ionic
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

// Importa las rutas de la aplicación
import { routes } from './app.routes';

// Configuración global de la aplicación standalone
export const appConfig: ApplicationConfig = {
  providers: [
    // Define la estrategia de reutilización de rutas de Ionic
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    
    // Optimiza la detección de cambios agrupando eventos
    provideZoneChangeDetection({ eventCoalescing: true }),
    
    // Configura el sistema de rutas
    provideRouter(routes),
    
    // Provee todos los servicios de Ionic (ModalController, AlertController, etc.)
    provideIonicAngular()
  ]
};