// app.js
// Comportamiento global: guard de autenticación básico + logout

document.addEventListener("DOMContentLoaded", () => {
  const path = location.pathname.split("/").pop() || "index.html";
  const isLoginPage = path === "" || path === "index.html";

  const token = localStorage.getItem("hd_token");

  // Si no estoy en login y no hay token, regreso a login
  if (!isLoginPage && !token) {
    window.location.href = "index.html";
    return;
  }

  // Si ya hay token y estoy en login, mando directo a registro (opcional)
  if (isLoginPage && token) {
    // Si prefieres siempre mostrar login, comenta estas dos líneas
    //window.location.href = 'registro.html';
    //return;
  }

  // Logout: cualquier link que vaya a index.html limpiará la "sesión"
  document.querySelectorAll('a[href$="index.html"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      // Si quieres que algunas ligas no hagan logout, luego podemos afinar con data-attrs
      localStorage.removeItem("hd_token");
      localStorage.removeItem("hd_usuario");
    });
  });
  // --- Pintar nombre/rol del usuario en el header ---
  const usuarioStr = localStorage.getItem("hd_usuario");
  if (usuarioStr) {
    try {
      const usuario = JSON.parse(usuarioStr);

      // Nombre visible
      document.querySelectorAll("[data-usuario-nombre]").forEach((el) => {
        el.textContent = usuario.nombre || usuario.username || "Usuario";
      });

      // Rol visible (si decides usarlo)
      document.querySelectorAll("[data-usuario-rol]").forEach((el) => {
        el.textContent = usuario.rol || el.textContent || "";
      });
    } catch (e) {
      console.error("No se pudo leer hd_usuario", e);
    }
  }
});
