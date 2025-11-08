// auth.js
// Lógica de UX para el login + mock de autenticación

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const user = document.getElementById("username");
  const pwd = document.getElementById("password");
  const toggle = document.getElementById("togglePwd");
  const errorMsg = document.getElementById("loginErrorMsg");

  // Si no estamos en la página de login, no hacemos nada
  if (!form || !user || !pwd || !toggle) return;

  // --- Toggle de contraseña accesible ---
  toggle.addEventListener("click", () => {
    const isHidden = pwd.type === "password";
    pwd.type = isHidden ? "text" : "password";

    const icon = toggle.querySelector("i");
    if (icon) {
      icon.classList.toggle("bi-eye", !isHidden);
      icon.classList.toggle("bi-eye-slash", isHidden);
    }

    toggle.setAttribute("aria-pressed", String(isHidden));
    toggle.setAttribute(
      "aria-label",
      isHidden ? "Ocultar contraseña" : "Mostrar contraseña"
    );

    pwd.focus({ preventScroll: true });
  });

  // --- Mock de autenticación (por ahora, sin backend real) ---
  function fakeLogin(usuario, password) {
    // Credenciales de prueba por ahora
    const USER_OK = "dturral";
    const PASS_OK = "1234";

    if (usuario === USER_OK && password === PASS_OK) {
      return {
        token: "dummy-token-123",
        nombre: "David Turral",
        rol: "Admin",
      };
    }

    throw new Error("CREDENCIALES_INVALIDAS");
  }

  function setLoading(isLoading) {
    const elements = form.querySelectorAll("button, input");
    elements.forEach((el) => (el.disabled = isLoading));
  }

  // --- Manejo de submit del formulario ---
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    form.classList.add("was-validated");

    if (!form.checkValidity()) return;

    const usuario = user.value.trim();
    const password = pwd.value.trim();

    if (errorMsg) {
      errorMsg.classList.add("d-none");
      errorMsg.textContent = "";
    }

    setLoading(true);

    try {
      // Aquí luego se cambia fakeLogin por fetch a /api/auth/login
      // Ejemplo futuro:
      // const res = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({usuario, password}) })

      const data = fakeLogin(usuario, password);

      // Guardar "sesión" en localStorage
      localStorage.setItem("hd_token", data.token);
      localStorage.setItem(
        "hd_usuario",
        JSON.stringify({
          username: usuario,
          nombre: data.nombre,
          rol: data.rol,
        })
      );

      // Redirigir a la primera pantalla interna real
      window.location.href = "registro.html";
    } catch (err) {
      console.error(err);
      if (errorMsg) {
        errorMsg.textContent = "Usuario o contraseña incorrectos.";
        errorMsg.classList.remove("d-none");
      } else {
        alert("Usuario o contraseña incorrectos.");
      }
    } finally {
      setLoading(false);
    }
  });

  // UX: marcar campo inválido hasta que el usuario lo toque
  form.querySelectorAll("input[required]").forEach((inp) => {
    inp.addEventListener("input", () => inp.classList.remove("is-invalid"), {
      once: true,
    });
  });

  // Foco inicial suave
  window.requestAnimationFrame(
    () => user && user.focus({ preventScroll: true })
  );
});
