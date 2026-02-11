// Archivo de configuración del entorno de desarrollo
// Este archivo será reemplazado en producción por environment.prod.ts

export const environment = {
  // Indica si la app está en modo producción o desarrollo
  production: true,
  
  // Configuración de Supabase (reemplaza con tus credenciales)
  supabase: {
    // URL de tu proyecto de Supabase
    url: 'https://efteccmfpjhhwtpqesop.supabase.co',  // ← Pega tu URL aquí
    
    // Clave pública (anon key) de Supabase
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmdGVjY21mcGpoaHd0cHFlc29wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MDk1NTcsImV4cCI6MjA4NjA4NTU1N30.ZY4bpiGzkJd1aF_As7WAZjwD4DMR-xay9k_Ajc1VJD8'  // ← Pega tu ANON KEY aquí
  }
};

/*
 * Para debugging más fácil en modo desarrollo, puedes importar el siguiente archivo
 * para ignorar errores de stack frames relacionados con zone como `zone.run`, `zoneDelegate.invokeTask`.
 *
 * Este import debe estar comentado en modo producción porque tendrá un impacto negativo
 * en el rendimiento si se lanza un error.
 */
// import 'zone.js/plugins/zone-error';  // Incluido con Angular CLI.