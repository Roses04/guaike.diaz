import { supabase } from "./supabase";

const QUEUE_KEY = "offline_queue";

const getOfflineQueue = (): any[] => {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
};

const clearQueue = () => localStorage.removeItem(QUEUE_KEY);

const syncOfflineQueue = async () => {
  const queue = getOfflineQueue();
  for (const item of queue) {
    try {
      await callEndpoint(item.method, item.url, item.data);
    } catch (error) {
      console.warn("Failed to sync queued request:", item, error);
      return;
    }
  }
  clearQueue();
};

const createApiError = (message: string, status = 400): never => {
  const error: any = new Error(message);
  error.response = { data: { message }, status };
  throw error;
};

const normalizeLocation = (ubicacion: any) => {
  if (!ubicacion) return { longitud: 0, latitud: 0 };

  if (typeof ubicacion === "string") {
    const match = ubicacion.match(/POINT\s*\(([-0-9.]+)\s+([-0-9.]+)\)/i);
    if (match) {
      return { longitud: parseFloat(match[1]), latitud: parseFloat(match[2]) };
    }
  }

  if (ubicacion?.type === "Point" && Array.isArray(ubicacion.coordinates)) {
    return { longitud: ubicacion.coordinates[0], latitud: ubicacion.coordinates[1] };
  }

  if (ubicacion?.x !== undefined && ubicacion?.y !== undefined) {
    return { longitud: ubicacion.x, latitud: ubicacion.y };
  }

  return { longitud: 0, latitud: 0 };
};

const buildResponse = (data: any, status = 200) => ({
  data,
  status,
  statusText: status === 200 ? "OK" : "Error",
  headers: {},
  config: {},
});

const getUserRecordByEmail = async (email: string) => {
  const { data, error } = await supabase
    .from("usuarios")
    .select("id, correo, rol_id, roles(nombre)")
    .eq("correo", email)
    .single();

  if (error && error.code !== "PGRST116") {
    createApiError(error.message || "Error al leer usuario");
  }

  if (!data) return null;

  return {
    id: data.id,
    email: data.correo,
    role: Array.isArray(data.roles)
      ? ((data.roles[0] as any)?.nombre || "turista")
      : ((data.roles as any)?.nombre || "turista"),
  };
};

const ensureUserRecord = async (email: string, roleName: string) => {
  const { data: roleData, error: roleError } = await supabase
    .from("roles")
    .select("id,nombre")
    .eq("nombre", roleName)
    .maybeSingle();

  if (roleError) {
    createApiError(roleError.message || "Error al obtener rol");
  }

  let roleId = roleData?.id;
  if (!roleId) {
    const { data: insertedRole, error: insertRoleError } = await supabase
      .from("roles")
      .insert({ nombre: roleName })
      .select("id")
      .maybeSingle();

    if (insertRoleError) {
      createApiError(insertRoleError.message || "Error al crear rol");
    }
    roleId = insertedRole?.id;
  }

  if (!roleId) {
    createApiError("No se pudo determinar el rol del usuario");
  }

  const { error: upsertError } = await supabase.from("usuarios").upsert(
    {
      correo: email,
      contrasena: "",
      rol_id: roleId,
    },
    { onConflict: "correo" }
  );

  if (upsertError) {
    createApiError(upsertError.message || "Error al crear usuario");
  }
};

const getSessionUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return null;
  }
  return data.user;
};

const fetchUsuarioProfile = async () => {
  const sessionUser = await getSessionUser();
  const userEmail = sessionUser?.email;
  if (!userEmail) {
    createApiError("No autorizado", 401);
  }
  const profile = await getUserRecordByEmail(userEmail as string);
  if (!profile) {
    await ensureUserRecord(userEmail as string, "turista");
    return await getUserRecordByEmail(userEmail as string);
  }
  return profile;
};

const getStaticData = async () => {
  const [catRes, parrRes, accRes] = await Promise.all([
    supabase.from("categorias").select("id,nombre,descripcion").order("nombre", { ascending: true }),
    supabase.from("parroquias").select("id,nombre").order("nombre", { ascending: true }),
    supabase.from("opciones_accesibilidad").select("id,etiqueta,icono").order("etiqueta", { ascending: true }),
  ]);

  if (catRes.error) createApiError(catRes.error.message);
  if (parrRes.error) createApiError(parrRes.error.message);
  if (accRes.error) createApiError(accRes.error.message);

  return {
    categorias: catRes.data,
    parroquias: parrRes.data,
    accesibilidades: accRes.data,
  };
};

const loadOperators = async (params: any = {}) => {
  let query = supabase.from("operadores").select(
    "id,usuario_id,nombre_taller,descripcion,telefono_whatsapp,es_verificado,qr_codigo_unico,parroquia_id,categoria_id,ubicacion"
  );

  query = query.eq("es_verificado", true).order("fecha_creacion", { ascending: false });

  if (params.categoria_id) query = query.eq("categoria_id", params.categoria_id);
  if (params.parroquia_id) query = query.eq("parroquia_id", params.parroquia_id);
  if (params.q) {
    query = query.or(`nombre_taller.ilike.%${params.q}%,descripcion.ilike.%${params.q}%`);
  }

  const operatorsRes = await query;
  if (operatorsRes.error) createApiError(operatorsRes.error.message);

  const operatorIds = (operatorsRes.data || []).map((op: any) => op.id);

  const [catsRes, parrsRes, imagesRes] = await Promise.all([
    supabase.from("categorias").select("id,nombre"),
    supabase.from("parroquias").select("id,nombre"),
    operatorIds.length > 0
      ? supabase
          .from("operador_imagenes")
          .select("operador_id,url_imagen,es_principal")
          .in("operador_id", operatorIds)
          .eq("es_principal", true)
      : { data: [], error: null },
  ]);

  if (catsRes.error) createApiError(catsRes.error.message);
  if (parrsRes.error) createApiError(parrsRes.error.message);
  if (imagesRes.error) createApiError(imagesRes.error.message);

  const catMap = new Map((catsRes.data || []).map((item: any) => [item.id, item.nombre]));
  const parrMap = new Map((parrsRes.data || []).map((item: any) => [item.id, item.nombre]));
  const imageMap = new Map((imagesRes.data || []).map((item: any) => [item.operador_id, item.url_imagen]));

  const operators = (operatorsRes.data || []).map((op: any) => {
    const location = normalizeLocation(op.ubicacion);
    return {
      ...op,
      categoria_nombre: catMap.get(op.categoria_id) || "",
      parroquia_nombre: parrMap.get(op.parroquia_id) || "",
      imagen_principal: imageMap.get(op.id) || "",
      longitud: location.longitud,
      latitud: location.latitud,
    };
  });

  if (params.categoria_id || params.parroquia_id) {
    await supabase.from("registros_busqueda").insert([
      {
        categoria_id: params.categoria_id || null,
        parroquia_id: params.parroquia_id || null,
      },
    ]);
  }

  return operators;
};

const getOperatorDetail = async (id: string) => {
  const operatorRes = await supabase
    .from("operadores")
    .select("id,usuario_id,nombre_taller,descripcion,direccion_detallada,telefono_whatsapp,es_verificado,qr_codigo_unico,categoria_id,parroquia_id,ubicacion")
    .eq("id", id)
    .single();

  if (operatorRes.error) {
    if (operatorRes.status === 406 || operatorRes.status === 400) createApiError("Operador no encontrado", 404);
    createApiError(operatorRes.error.message);
  }

  const operator = operatorRes.data;
  if (!operator) createApiError("Operador no encontrado", 404);
  const operatorData = operator as any;

  const location = normalizeLocation(operatorData.ubicacion);

  const [catRes, parrRes, imagesRes, accessRes, productsRes, reviewsRes] = await Promise.all([
    supabase.from("categorias").select("nombre").eq("id", operatorData.categoria_id).single(),
    supabase.from("parroquias").select("nombre").eq("id", operatorData.parroquia_id).single(),
    supabase.from("operador_imagenes").select("id,url_imagen,es_principal").eq("operador_id", id).order("es_principal", { ascending: false }),
    supabase.from("operador_accesibilidad").select("accesibilidad(id,etiqueta,icono)").eq("operador_id", id),
    supabase.from("productos").select("id,nombre,descripcion,precio,url_imagen,esta_disponible").eq("operador_id", id).eq("esta_disponible", true).order("id", { ascending: false }),
    supabase.from("resenas").select("id,puntuacion,comentario,qr_verificado,fecha_creacion,usuario:usuarios(correo)").eq("operador_id", id).order("fecha_creacion", { ascending: false }),
  ]);

  if (catRes.error) createApiError(catRes.error.message);
  if (parrRes.error) createApiError(parrRes.error.message);
  if (imagesRes.error) createApiError(imagesRes.error.message);
  if (accessRes.error) createApiError(accessRes.error.message);
  if (productsRes.error) createApiError(productsRes.error.message);
  if (reviewsRes.error) createApiError(reviewsRes.error.message);

  const reviews = (reviewsRes.data || []).map((item: any) => ({
    id: item.id,
    puntuacion: item.puntuacion,
    comentario: item.comentario,
    qr_verificado: item.qr_verificado,
    fecha_creacion: item.fecha_creacion,
    usuario_correo: item.usuario?.correo || "Anónimo",
  }));

  const totalReviews = reviews.length;
  const averageRating = totalReviews === 0 ? 0 : reviews.reduce((sum, item) => sum + (item.puntuacion || 0), 0) / totalReviews;

  return {
    ...operator,
    categoria_nombre: catRes.data?.nombre || "",
    parroquia_nombre: parrRes.data?.nombre || "",
    longitud: location.longitud,
    latitud: location.latitud,
    imagenes: imagesRes.data || [],
    accesibilidades: (accessRes.data || []).map((item: any) => item.accesibilidad),
    productos: productsRes.data || [],
    resenas: reviews,
    calificacion_promedio: averageRating,
    total_resenas: totalReviews,
  };
};

const createOperator = async (payload: any) => {
  const sessionUser = await getSessionUser();
  const userEmail = sessionUser?.email;
  if (!userEmail) createApiError("No autorizado", 401);

  let usuario = await getUserRecordByEmail(userEmail as string);
  if (!usuario) {
    await ensureUserRecord(userEmail as string, "operador");
    usuario = await getUserRecordByEmail(userEmail as string);
  }
  if (!usuario) createApiError("No se pudo obtener información de usuario");

  const { data: operatorData, error: opError } = await supabase
    .from("operadores")
    .insert([
      {
        usuario_id: (usuario as any).id,
        parroquia_id: payload.parroquia_id,
        categoria_id: payload.categoria_id,
        nombre_taller: payload.nombre_taller,
        descripcion: payload.descripcion,
        ubicacion: `SRID=4326;POINT(${payload.longitud} ${payload.latitud})`,
        direccion_detallada: payload.direccion_detallada,
        telefono_whatsapp: payload.telefono_whatsapp,
      },
    ])
    .select("id")
    .single();

  if (opError) createApiError(opError.message);
  const operatorId = operatorData?.id;
  if (!operatorId) createApiError("No se pudo crear el operador");

  const images = [] as any[];
  if (payload.imagen_principal) {
    images.push({ operador_id: operatorId, url_imagen: payload.imagen_principal, es_principal: true, subido_por_usuario_id: (usuario as any).id });
  }
  if (Array.isArray(payload.galeria)) {
    payload.galeria.forEach((url: string) => {
      images.push({ operador_id: operatorId, url_imagen: url, es_principal: false, subido_por_usuario_id: (usuario as any).id });
    });
  }
  if (images.length > 0) {
    const { error: imageError } = await supabase.from("operador_imagenes").insert(images);
    if (imageError) createApiError(imageError.message);
  }

  if (Array.isArray(payload.accesibilidad_ids) && payload.accesibilidad_ids.length > 0) {
    const accessibilityData = payload.accesibilidad_ids.map((accId: number) => ({ operador_id: operatorId, accesibilidad_id: accId }));
    const { error: accessError } = await supabase.from("operador_accesibilidad").insert(accessibilityData);
    if (accessError) createApiError(accessError.message);
  }

  return { message: "Registro del operador exitoso. Pendiente de verificación por la alcaldía.", operatorId };
};

const getEvents = async () => {
  const { data, error } = await supabase
    .from("eventos")
    .select("id,titulo,descripcion,url_imagen,fecha_inicio,fecha_fin,ubicacion")
    .order("fecha_inicio", { ascending: true });
  if (error) createApiError(error.message);

  return (data || []).map((event: any) => {
    const location = normalizeLocation(event.ubicacion);
    return {
      ...event,
      longitud: location.longitud,
      latitud: location.latitud,
    };
  });
};

const createEvent = async (payload: any) => {
  const { data, error } = await supabase.from("eventos").insert([
    {
      titulo: payload.titulo,
      descripcion: payload.descripcion,
      ubicacion: `SRID=4326;POINT(${payload.longitud} ${payload.latitud})`,
      fecha_inicio: payload.fecha_inicio,
      fecha_fin: payload.fecha_fin,
      url_imagen: payload.url_imagen,
    },
  ]);

  if (error) createApiError(error.message);
  return { message: "Evento publicado exitosamente sobre el mapa.", event: data?.[0] };
};

const deleteEvent = async (id: string) => {
  const { error } = await supabase.from("eventos").delete().eq("id", id);
  if (error) createApiError(error.message);
  return { message: "Evento eliminado con éxito." };
};

const validateQr = async (body: any) => {
  const { data, error } = await supabase
    .from("operadores")
    .select("id")
    .eq("qr_codigo_unico", body.qr_uuid)
    .eq("es_verificado", true)
    .single();

  if (error) createApiError(error.message);
  if (!data) createApiError("Código QR inválido. No pertenece a ningún taller verificado.", 404);
  const operador = data as any;
  return { valido: true, operador_id: operador.id, message: "Visita física validada. Formulario de reseña desbloqueado." };
};

const createReview = async (body: any) => {
  const sessionUser = await getSessionUser();
  const userEmail = sessionUser?.email;
  if (!userEmail) createApiError("No autorizado", 401);

  let usuario = await getUserRecordByEmail(userEmail as string);
  if (!usuario) {
    await ensureUserRecord(userEmail as string, "turista");
    usuario = await getUserRecordByEmail(userEmail as string);
  }
  if (!usuario) createApiError("No se pudo obtener información de usuario");

  const review = {
    operador_id: body.operador_id,
    usuario_id: (usuario as any).id,
    puntuacion: body.puntuacion,
    comentario: body.comentario,
    qr_verificado: body.qr_verificado || false,
  };

  const { error } = await supabase.from("resenas").insert([review]);
  if (error) createApiError(error.message);
  return { message: "Reseña publicada con éxito." };
};

const getPendingOperators = async () => {
  const { data, error } = await supabase
    .from("operadores")
    .select("id,nombre_taller,descripcion,telefono_whatsapp,es_verificado,direccion_detallada,parroquia_id,categoria_id,usuario_id,ubicacion")
    .eq("es_verificado", false)
    .order("fecha_creacion", { ascending: false });

  if (error) createApiError(error.message);

  const pendingData = data || [];
  const [catsRes, parrsRes, usersRes, imagesRes] = await Promise.all([
    supabase.from("categorias").select("id,nombre"),
    supabase.from("parroquias").select("id,nombre"),
    supabase.from("usuarios").select("id,correo"),
    supabase
      .from("operador_imagenes")
      .select("operador_id,url_imagen,es_principal")
      .in("operador_id", pendingData.map((op: any) => op.id))
      .eq("es_principal", true),
  ]);

  if (catsRes.error) createApiError(catsRes.error.message);
  if (parrsRes.error) createApiError(parrsRes.error.message);
  if (usersRes.error) createApiError(usersRes.error.message);
  if (imagesRes.error) createApiError(imagesRes.error.message);

  const catMap = new Map((catsRes.data || []).map((item: any) => [item.id, item.nombre]));
  const parrMap = new Map((parrsRes.data || []).map((item: any) => [item.id, item.nombre]));
  const userMap = new Map((usersRes.data || []).map((item: any) => [item.id, item.correo]));
  const imageMap = new Map((imagesRes.data || []).map((item: any) => [item.operador_id, item.url_imagen]));

  return (data || []).map((op: any) => ({
    ...op,
    categoria_nombre: catMap.get(op.categoria_id) || "",
    parroquia_nombre: parrMap.get(op.parroquia_id) || "",
    usuario_correo: userMap.get(op.usuario_id) || "",
    imagen_principal: imageMap.get(op.id) || "",
    longitud: normalizeLocation(op.ubicacion).longitud,
    latitud: normalizeLocation(op.ubicacion).latitud,
  }));
};

const verifyOperator = async (id: string, body: any) => {
  const { error } = await supabase.from("operadores").update({ es_verificado: body.es_verificado }).eq("id", id);
  if (error) createApiError(error.message);
  return { message: `Operador ${body.es_verificado ? "verificado" : "desverificado"} con éxito.` };
};

const getAdminStats = async () => {
  const [verifiedRes, pendingRes, reviewsRes, usersRes, catStatsRes, parrStatsRes, timelineRes] = await Promise.all([
    supabase.from("operadores").select("id", { count: "exact" }).eq("es_verificado", true),
    supabase.from("operadores").select("id", { count: "exact" }).eq("es_verificado", false),
    supabase.from("resenas").select("puntuacion,qr_verificado"),
    supabase.from("usuarios").select("id", { count: "exact" }),
    supabase.from("registros_busqueda").select("categoria_id, categorias(nombre)").neq("categoria_id", null),
    supabase.from("registros_busqueda").select("parroquia_id, parroquias(nombre)").neq("parroquia_id", null),
    supabase.from("registros_busqueda").select("fecha_busqueda").gte("fecha_busqueda", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  if (verifiedRes.error) createApiError(verifiedRes.error.message);
  if (pendingRes.error) createApiError(pendingRes.error.message);
  if (reviewsRes.error) createApiError(reviewsRes.error.message);
  if (usersRes.error) createApiError(usersRes.error.message);
  if (catStatsRes.error) createApiError(catStatsRes.error.message);
  if (parrStatsRes.error) createApiError(parrStatsRes.error.message);
  if (timelineRes.error) createApiError(timelineRes.error.message);

  const totalReviews = reviewsRes.data?.length || 0;
  const qrTotal = (reviewsRes.data || []).filter((item: any) => item.qr_verificado).length;

  const categoryStats = (catStatsRes.data || []).reduce((acc: any, item: any) => {
    const nombre = item.categorias?.nombre || "Desconocido";
    const existing = acc.find((row: any) => row.categoria_nombre === nombre);
    if (existing) existing.cantidad += 1;
    else acc.push({ categoria_nombre: nombre, cantidad: 1 });
    return acc;
  }, []);

  const parroquiaStats = (parrStatsRes.data || []).reduce((acc: any, item: any) => {
    const nombre = item.parroquias?.nombre || "Desconocido";
    const existing = acc.find((row: any) => row.parroquia_nombre === nombre);
    if (existing) existing.cantidad += 1;
    else acc.push({ parroquia_nombre: nombre, cantidad: 1 });
    return acc;
  }, []);

  const timelineData: any[] = [];
  const last7Days = Array.from({ length: 7 }, (_, idx) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - idx));
    return date.toISOString().split("T")[0];
  });

  last7Days.forEach((day) => timelineData.push({ fecha: day, cantidad: 0 }));

  (timelineRes.data || []).forEach((item: any) => {
    const day = new Date(item.fecha_busqueda).toISOString().split("T")[0];
    const existing = timelineData.find((row) => row.fecha === day);
    if (existing) existing.cantidad += 1;
  });

  return {
    metricas: {
      operadores_verificados: verifiedRes.count || 0,
      operadores_pendientes: pendingRes.count || 0,
      total_resenas: totalReviews,
      resenas_verificadas_qr: qrTotal,
      total_usuarios: usersRes.count || 0,
    },
    busquedas_por_categoria: categoryStats,
    busquedas_por_parroquia: parroquiaStats,
    busquedas_linea_tiempo: timelineData,
  };
};

const callEndpoint = async (method: string, url: string, payload?: any): Promise<any> => {
  const route = url.startsWith("/") ? url : `/${url}`;
  const lowerMethod = method.toLowerCase();

  if (lowerMethod === "get" && route === "/auth/profile") {
    const profile = await fetchUsuarioProfile();
    return buildResponse(profile);
  }

  if (lowerMethod === "post" && route === "/auth/login") {
    const { email, password } = payload || {};
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) createApiError(error.message, 401);
    const session = data.session;
    if (!session) createApiError("No se pudo iniciar sesión", 401);
    
    // Check if user record already exists to preserve their role (e.g. admin or operator)
    let profile = await getUserRecordByEmail(email as string);
    if (!profile) {
      await ensureUserRecord(email as string, "turista");
      profile = await getUserRecordByEmail(email as string);
    }
    
    if (!profile) createApiError("No se pudo obtener perfil de usuario");
    return buildResponse({ token: (session as any).access_token, user: profile });
  }

  if (lowerMethod === "post" && route === "/auth/register") {
    const { email, password, role, name, phone } = payload || {};
    const profileData = {
      role,
      full_name: name,
      phone,
    };

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: profileData,
      },
    });

    if (error) createApiError(error.message);
    await ensureUserRecord(email, role || "turista");
    return buildResponse({ message: "Usuario registrado exitosamente" }, 201);
  }

  if (lowerMethod === "get" && route === "/operators/static-data") {
    const data = await getStaticData();
    return buildResponse(data);
  }

  if (lowerMethod === "get" && route === "/operators") {
    const operators = await loadOperators(payload || {});
    return buildResponse(operators);
  }

  if (lowerMethod === "get" && route === "/operators/pending") {
    const pending = await getPendingOperators();
    return buildResponse(pending);
  }

  if (lowerMethod === "get" && route.startsWith("/operators/") && !route.endsWith("/verify")) {
    const id = route.split("/").pop() || "";
    const operator = await getOperatorDetail(id);
    return buildResponse(operator);
  }

  if (lowerMethod === "post" && route === "/operators") {
    const result = await createOperator(payload);
    return buildResponse(result, 201);
  }

  if (lowerMethod === "patch" && route.startsWith("/operators/") && route.endsWith("/verify")) {
    const id = route.split("/")[2];
    const result = await verifyOperator(id, payload);
    return buildResponse(result);
  }

  if (lowerMethod === "get" && route === "/events") {
    const events = await getEvents();
    return buildResponse(events);
  }

  if (lowerMethod === "post" && route === "/events") {
    const result = await createEvent(payload);
    return buildResponse(result, 201);
  }

  if (lowerMethod === "delete" && route.startsWith("/events/")) {
    const id = route.split("/").pop() || "";
    const result = await deleteEvent(id);
    return buildResponse(result);
  }

  if (lowerMethod === "post" && route === "/reviews/validate-qr") {
    const result = await validateQr(payload);
    return buildResponse(result);
  }

  if (lowerMethod === "post" && route === "/reviews") {
    const result = await createReview(payload);
    return buildResponse(result, 201);
  }

  if (lowerMethod === "get" && route === "/stats/admin") {
    const stats = await getAdminStats();
    return buildResponse(stats);
  }

  createApiError(`Ruta no implementada: ${method.toUpperCase()} ${route}`);
};

const api = {
  get: async (url: string, config?: any) => callEndpoint("get", url, config?.params),
  post: async (url: string, data?: any) => callEndpoint("post", url, data),
  patch: async (url: string, data?: any) => callEndpoint("patch", url, data),
  delete: async (url: string, data?: any) => callEndpoint("delete", url, data),
  request: async (config: any) => callEndpoint(config.method || "get", config.url, config.data || config.params),
};

export { getOfflineQueue, syncOfflineQueue };
export default api;
