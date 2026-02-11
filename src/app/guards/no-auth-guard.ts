import { CanActivateFn , Router  } from '@angular/router';
import { inject } from '@angular/core'; // ← AGREGADO
import { SupabaseService } from 'src/app/services/supabase.service';
import { UtilsService } from '../services/utils'; // ← AGREGADO

export const noAuthGuard: CanActivateFn =async  (route, state) => {
  
  // ← Inyectar servicios usando inject() (sin constructor)
  const supabaseSvc = inject(SupabaseService);
  const router = inject(Router);
  const utilsSvc = inject(UtilsService);

  try {
  const user = await supabaseSvc.getCurrentUser();
  if (!user) {
    return true;
  } else {
    router.navigate(['/main/home']);
    return false;
  }
} catch (error) {
  return true;
}

    };
    
  


