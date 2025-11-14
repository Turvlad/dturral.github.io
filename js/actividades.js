// actividades.js
// Listado de actividades basado en localStorage.hd_actividades
// Respeta roles: admin ve todo, usuario normal ve solo sus actividades

document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY_ACTIVIDADES = "hd_actividades";

  // Roles expuestos por app.js
  const isAdmin = window.hdIsAdmin === true;
  const currentUser = window.hdCurrentUser || null;

  function loadStoredActivities() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_ACTIVIDADES) || "[]");
    } catch (e) {
      console.error("No se pudo leer hd_actividades", e);
      return [];
    }
  }

  function formatDateYMDtoDMY(ymd) {
    if (!ymd) return "—";
    const [y, m, d] = ymd.split("-");
    if (!y || !m || !d) return ymd;
    return `${d}/${m}/${y}`;
  }

  function formatTiempo(mins) {
    if (mins == null || isNaN(mins)) return "—";
    const total = Math.max(0, Number(mins));
    const h = Math.floor(total / 60);
    const m = total % 60;
    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    return `${hh}:${mm} h`;
  }

  function buildStatusBadge(estatus) {
    const s = (estatus || "").toLowerCase();

    if (s.includes("final")) {
      return '<span class="badge bg-success">Finalizado</span>';
    }
    if (s.includes("curso")) {
      return '<span class="badge bg-warning text-dark">En curso</span>';
    }
    if (s.includes("bloq")) {
      return '<span class="badge bg-danger">Bloqueado</span>';
    }
    if (s.includes("área") || s.includes("area")) {
      return '<span class="badge bg-secondary">Enviado a área</span>';
    }
    if (s.includes("pend")) {
      return '<span class="badge bg-secondary">Pendiente</span>';
    }
    return `<span class="badge bg-secondary">${estatus || "—"}</span>`;
  }

  // --- DOM refs ---
  const tablaBody = document.querySelector("table.table tbody");
  const filtrosForm = document.querySelector(".filter-card form");
  const inputColaborador = document.getElementById("f-colaborador");
  const selectTipo = document.getElementById("f-tipo");
  const selectEstatus = document.getElementById("f-estatus");
  const inputFecha = document.getElementById("f-fecha");

  const headerSubtitle = document.querySelector(
    "#tabla-heading .text-muted.fw-normal"
  );
  const footerSummary = document.querySelector(
    ".card-footer .text-muted.small"
  );

  if (!tablaBody || !filtrosForm) {
    // Página no coincide, salimos
    return;
  }

  // Ajustes de UI según rol
  if (!isAdmin) {
    // Ocultar filtro de colaborador
    if (inputColaborador) {
      const group = inputColaborador.closest(".col-md-3, .col-sm-6, .col");
      if (group) group.classList.add("d-none");
    }
  }

  // 1) Scope base por usuario (RBAC front)
  function applyBaseScope(lista) {
    if (isAdmin || !currentUser) {
      return Array.isArray(lista) ? [...lista] : [];
    }

    const username = (currentUser.username || "").toLowerCase();
    const nombre = (currentUser.nombre || "").toLowerCase();

    return (Array.isArray(lista) ? lista : []).filter((a) => {
      const usuarioReg = (a.usuarioRegistro || "").toLowerCase();
      const colaborador = (a.colaborador || "").toLowerCase();
      const usuarioNombre = (a.usuarioNombre || "").toLowerCase();

      // Regla: usuario normal solo ve lo que él registró o donde él es colaborador
      return (
        usuarioReg === username ||
        colaborador === nombre ||
        colaborador.includes(nombre) ||
        usuarioNombre === nombre
      );
    });
  }

  // 2) Filtros de la UI (se aplican SOBRE el scope base)
  function applyFilters(lista) {
    const base = applyBaseScope(lista);

    const qColab = (inputColaborador?.value || "").trim().toLowerCase();
    const tipo = (selectTipo?.value || "").trim();
    const estatus = (selectEstatus?.value || "").trim();
    const fecha = (inputFecha?.value || "").trim(); // YYYY-MM-DD

    return base.filter((a) => {
      // Colaborador (solo útil realmente en admin, pero se deja por si acaso)
      if (qColab) {
        const nombre = (
          a.colaborador ||
          a.usuarioNombre ||
          a.usuarioRegistro ||
          ""
        ).toLowerCase();
        if (!nombre.includes(qColab)) return false;
      }

      // Tipo
      if (tipo) {
        const tipoAct = (
          a.tipoActividad ||
          a.tipoSolicitud ||
          ""
        ).toLowerCase();
        if (tipoAct !== tipo.toLowerCase()) return false;
      }

      // Estatus
      if (estatus) {
        const s = (a.estatus || "").toLowerCase();
        if (s !== estatus.toLowerCase()) return false;
      }

      // Fecha exacta de registro
      if (fecha) {
        if ((a.fechaRegistro || "").slice(0, 10) !== fecha) return false;
      }

      return true;
    });
  }

  function renderTabla(lista, listaFiltrada) {
    tablaBody.innerHTML = "";

    if (!listaFiltrada.length) {
      tablaBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center text-muted py-4">
            No hay actividades para los filtros seleccionados.
          </td>
        </tr>
      `;
    } else {
      listaFiltrada.forEach((a, idx) => {
        const tr = document.createElement("tr");

        const fechaDmy = formatDateYMDtoDMY(a.fechaRegistro);
        const colaborador =
          a.colaborador || a.usuarioNombre || a.usuarioRegistro || "—";
        const tipo = a.tipoActividad || a.tipoSolicitud || "—";
        const area = a.areaDestino || "—";
        const badge = buildStatusBadge(a.estatus);
        const tiempo = formatTiempo(a.tiempoTotalMin);
        const folio = a.folio || a.id || idx + 1;

        tr.innerHTML = `
          <td>${folio}</td>
          <td>${fechaDmy}</td>
          <td>${colaborador}</td>
          <td>${tipo}</td>
          <td>${area}</td>
          <td>${badge}</td>
          <td>${tiempo}</td>
          <td class="text-end">
            <button
              type="button"
              class="btn btn-sm btn-outline-primary btn-view-actividad"
              data-id="${a.id ?? idx + 1}"
              aria-label="Ver actividad ${a.id ?? idx + 1}"
            >
              <i class="bi bi-eye" aria-hidden="true"></i>
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary btn-edit-actividad"
              data-id="${a.id ?? idx + 1}"
              aria-label="Editar actividad ${a.id ?? idx + 1}"
            >
              <i class="bi bi-pencil" aria-hidden="true"></i>
            </button>
          </td>
        `;

        tablaBody.appendChild(tr);
      });
    }

    const total = lista.length;
    const filtrados = listaFiltrada.length;

    if (headerSubtitle) {
      headerSubtitle.textContent = `(${filtrados} registros)`;
    }

    if (footerSummary) {
      if (!filtrados) {
        footerSummary.textContent = "Sin registros para los filtros aplicados";
      } else {
        footerSummary.textContent = `Mostrando 1–${filtrados} de ${filtrados} registros`;
      }
    }
  }

  function refresh() {
    const lista = loadStoredActivities();
    const filtrada = applyFilters(lista);
    renderTabla(lista, filtrada);
  }

  // Eventos de filtros
  filtrosForm.addEventListener("submit", (e) => {
    e.preventDefault();
    refresh();
  });

  filtrosForm.addEventListener("reset", () => {
    setTimeout(refresh, 0);
  });

  // Delegar clics de Ver / Editar
  tablaBody.addEventListener("click", (e) => {
    const viewBtn = e.target.closest(".btn-view-actividad");
    const editBtn = e.target.closest(".btn-edit-actividad");

    if (viewBtn) {
      const id = viewBtn.dataset.id;
      if (id) {
        window.location.href = `detalle_actividad.html?id=${encodeURIComponent(
          id
        )}`;
      }
      return;
    }

    if (editBtn) {
      const id = editBtn.dataset.id;
      if (!id) return;

      // Cargamos la actividad para validar reglas de edición
      const lista = loadStoredActivities();
      const actividad = lista.find((a) => String(a.id) === String(id));

      if (actividad) {
        const estatusLower = (actividad.estatus || "").toLowerCase();
        const isFinalizada =
          estatusLower.includes("final") || !!actividad.fechaEnvioAgente;

        // Si NO es admin y ya está finalizada, no permitimos editar
        if (!isAdmin && isFinalizada) {
          alert(
            "Esta actividad ya fue finalizada.\nSolo un administrador puede modificarla."
          );
          return;
        }
      }

      // Si pasa las validaciones, mandamos a modo edición
      window.location.href = `registro.html?id=${encodeURIComponent(id)}`;
      return;
    }
  });

  // Primera carga
  refresh();
});
