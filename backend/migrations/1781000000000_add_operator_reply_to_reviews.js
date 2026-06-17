export const shorthands = undefined;

export const up = (pgm) => {
  pgm.addColumn("resenas", {
    respuesta_operador: { type: "text", default: null },
    fecha_respuesta: { type: "timestamp", default: null },
  });
};

export const down = (pgm) => {
  pgm.dropColumn("resenas", ["respuesta_operador", "fecha_respuesta"]);
};
