import { Injectable, inject } from '@angular/core';
import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { UtilsService } from './utils';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  public supabase: SupabaseClient;
  private utilsSvc = inject(UtilsService);

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.key,
      {
        auth: {
          detectSessionInUrl: false,  // ← DESACTIVAR detección automática
          persistSession: false,       // ← DESACTIVAR persistencia
          autoRefreshToken: false      // ← DESACTIVAR auto-refresh
        }
      }
    );
  }

  // ============================================
  // AUTENTICACIÓN
  // ============================================

  async signIn(user: User) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password
    });

    if (error) throw error;
    return data;
  }

  async signUp(user: User) {
    const { data, error } = await this.supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: {
          name: user.name
        }
      }
    });

    if (error) throw error;
    return data;
  }

  async updateAuthEmail(newEmail: string) {
  const { data, error } = await this.supabase.auth.updateUser({
    email: newEmail
  });

  if (error) throw error;
  return data;
}

  async updateUser(uid: string, updateData: Partial<User>) {
    const { data, error } = await this.supabase
      .from('users')
      .update(updateData)
      .eq('uid', uid)
      .select()
      .single();

    if (error) throw error;
    return data;
  }


  async sendRecoveryEmail(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:8100/auth/forgot-password'
    });
    if (error) throw error;
  }

  // ← AGREGA ESTE MÉTODO NUEVO AQUÍ
  async updatePassword(newPassword: string) {
    return await this.supabase.auth.updateUser({
      password: newPassword
    });
  }
  // ← AGREGAR ESTE MÉTODO NUEVO
  async verifyAndSetRecoverySession(accessToken: string, refreshToken: string) {
    try {
      // Establecer la sesión con los tokens
      const { data, error } = await this.supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error setting session:', error);
      return { success: false, error };
    }
  }

  async emailExists(email: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    return !!data;
  }

  async signOut() {
    await this.supabase.auth.signOut();
    localStorage.removeItem('user');
    this.utilsSvc.routerLink('/auth');
  }

  async getCurrentUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  // ============================================
  // BASE DE DATOS
  // ============================================



  async setDocument(path: string, data: any) {
    const [table, id] = path.split('/');

    const { error } = await this.supabase
      .from(table)
      .upsert({ ...data, uid: id });

    if (error) throw error;
  }






  async getDocument(path: string) {
    const [table, id] = path.split('/');

    const { data, error } = await this.supabase
      .from(table)
      .select('*')
      .eq('uid', id)
      .single();

    if (error) throw error;
    return data;
  }


  async addDocument(path: string, data: any) {
    const pathParts = path.split('/');
    const table = pathParts[pathParts.length - 1];

    // Obtén el usuario autenticado
    const { data: { user }, error: userError } = await this.supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Usuario no autenticado');
    }

    console.log(' Insertando en tabla:', table);
    console.log(' User ID:', user.id);
    console.log(' Data:', data);

    const { data: result, error } = await this.supabase
      .from(table)
      .insert({
        ...data,
        user_id: user.id  // ← ESTO ES LO IMPORTANTE
      })
      .select()
      .single();

    if (error) {
      console.error(' Error:', error);
      throw error;
    }

    console.log(' Producto guardado:', result);
    return result;
  }




  //  Actualizar producto
  //  Actualizar producto
  async updateProduct(productId: string, data: any) {
    // Extraer campos que NO deben actualizarse
    const { id, user_id, created_at, ...updateData } = data;

    console.log('🔄 Actualizando producto:', productId);
    console.log('📝 Datos a actualizar:', updateData);

    const { data: result, error } = await this.supabase
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error actualizando:', error);
      throw error;
    }

    console.log('✅ Producto actualizado:', result);
    return result;
  }

  //  Eliminar producto
  async deleteProduct(productId: string) {
    const { error } = await this.supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;
  }

  // ============================================
  // STORAGE
  // ============================================

  async uploadImage(path: string, dataUrl: string) {
    const base64Data = dataUrl.split(',')[1];
    const blob = this.base64ToBlob(base64Data, 'image/jpeg');


    const { data, error } = await this.supabase.storage
      .from('products')
      .upload(path, blob, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) {
      throw error;
    }

    const { data: urlData } = this.supabase.storage
      .from('products')
      .getPublicUrl(path);

    return urlData.publicUrl;
  }

  //  Eliminar imagen
  async deleteImage(path: string) {
    const { error } = await this.supabase.storage
      .from('products')
      .remove([path]);

    if (error) throw error;
  }

  private base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }

  async getUserProducts() {
    const { data: { user }, error: userError } = await this.supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Usuario no autenticado');
    }




    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id)
      .order('sold_units', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // obtener ruta de imagen con su url
  getFilePath(url: string): { fullPath: string } {
    // Extraer la ruta del archivo
    const bucketName = 'products';
    const pattern = `/storage/v1/object/public/${bucketName}/`;
    const startIndex = url.indexOf(pattern);

    const fullPath = startIndex !== -1
      ? url.substring(startIndex + pattern.length)
      : url;

    return { fullPath };
  }

}