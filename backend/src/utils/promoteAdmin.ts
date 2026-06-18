import pool from "../config/database.js";

async function promoteAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error("Error: Por favor especifica el correo electrónico del usuario.");
    console.log("Uso: npm run promote-admin <correo_usuario>");
    process.exit(1);
  }

  console.log(`[Admin Utility] Conectando a la base de datos para ascender a: ${email}...`);

  const client = await pool.connect();
  try {
    // 1. Check if the user exists
    const userResult = await client.query(
      "SELECT id, correo, rol_id FROM usuarios WHERE correo = $1",
      [email.trim().toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      console.error(`Error: No se encontró ningún usuario con el correo '${email}'.`);
      process.exit(1);
    }

    const user = userResult.rows[0];

    // 2. Fetch the admin role ID
    const roleResult = await client.query(
      "SELECT id FROM roles WHERE nombre = 'admin'"
    );

    if (roleResult.rows.length === 0) {
      console.error("Error: No se encontró el rol 'admin' en la tabla de roles.");
      process.exit(1);
    }

    const adminRoleId = roleResult.rows[0].id;

    // 3. Promote the user
    await client.query(
      "UPDATE usuarios SET rol_id = $1, verificado = true WHERE id = $2",
      [adminRoleId, user.id]
    );

    console.log(`\n¡Éxito! El usuario '${email}' ahora tiene privilegios de Administrador (admin).`);
    console.log("Puedes iniciar sesión con esta cuenta en el frontend para acceder a la consola.");
  } catch (error) {
    console.error("Error al ejecutar la promoción de administrador:", error);
    process.exit(1);
  } finally {
    client.release();
    // Close the database pool connection so the Node process terminates immediately
    await pool.end();
  }
}

promoteAdmin();
