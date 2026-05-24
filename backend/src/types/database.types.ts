export interface Rol {
  id: number;
  nombre: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Parroquia {
  id: number;
  nombre: string;
}

export interface OpcionAccesibilidad {
  id: number;
  etiqueta: string;
  icono?: string;
}

export interface Usuario {
  id: number;
  correo: string;
  contrasena: string;
  rol_id: number;
  ultimo_acceso?: Date;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
}

export interface Operador {
  id: number;
  usuario_id: number;
  parroquia_id: number;
  categoria_id: number;
  nombre_taller: string;
  descripcion?: string;
  ubicacion: {
    type: string;
    coordinates: number[]; // [longitud, latitud]
  } | string;
  longitude?: number;
  latitude?: number;
  direccion_detallada?: string;
  telefono_whatsapp?: string;
  es_verificado: boolean;
  qr_codigo_unico: string;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
}

export interface OperadorImagen {
  id: number;
  operador_id: number;
  url_imagen: string;
  es_principal: boolean;
  subido_por_usuario_id?: number;
  fecha_subida: Date;
}

export interface Producto {
  id: number;
  operador_id: number;
  nombre: string;
  descripcion?: string;
  precio?: number;
  url_imagen?: string;
  esta_disponible: boolean;
  fecha_creacion: Date;
}

export interface Resena {
  id: number;
  operador_id: number;
  usuario_id: number;
  puntuacion: number;
  comentario?: string;
  qr_verificado: boolean;
  fecha_creacion: Date;
}

export interface Evento {
  id: number;
  titulo: string;
  descripcion?: string;
  ubicacion: {
    type: string;
    coordinates: number[];
  } | string;
  longitude?: number;
  latitude?: number;
  fecha_inicio: Date;
  fecha_fin: Date;
  url_imagen?: string;
  fecha_creacion: Date;
}

export interface RegistroBusqueda {
  id: number;
  usuario_id?: number;
  categoria_id?: number;
  parroquia_id?: number;
  fecha_busqueda: Date;
}
