import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Validamos que las variables de entorno existan
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las variables de entorno de Supabase.');
}

/**
 * Clase de Servicio para gestionar la infraestructura de datos de GUAIKE.DÍAZ.
 * Diseñada bajo un patrón Singleton para asegurar una única instancia del cliente.
 */
class SupabaseService {
  private static instance: SupabaseService;
  private client: SupabaseClient;

  private constructor() {
    this.client = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true, // Crucial para mantener la sesión si el usuario se desconecta
        autoRefreshToken: true,
      },
    });
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  public getClient(): SupabaseClient {
    return this.client;
  }
}

// Exportamos la instancia única del cliente listo para usar
export const supabase = SupabaseService.getInstance().getClient();