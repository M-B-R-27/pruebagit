import {  CanActivateFn,Router } from '@angular/router';
import { inject } from '@angular/core'; // ← AGREGADO
import { SupabaseService } from 'src/app/services/supabase.service'; 
import { UtilsService } from '../services/utils'; // ← AGREGADO

// ← Guard funcional moderno (reemplaza a las clases)
export const authGuard: CanActivateFn = async (route, state) => {
  
  // ← Inyectar servicios usando inject() (sin constructor)
  const supabaseSvc = inject(SupabaseService);
  const router = inject(Router);
  const utilsSvc = inject(UtilsService);


  try {
  const user = await supabaseSvc.getCurrentUser();
  if (user) {
    return true;
  } else {
    router.navigate(['/auth']);
    return false;
  }
} catch (error) {
  router.navigate(['/auth']);
  return false;
} 
    
}
