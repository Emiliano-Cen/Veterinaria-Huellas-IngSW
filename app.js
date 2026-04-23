// AUTENTICACIÓN
// AUTENTICACIÓN
// AUTENTICACIÓN
function isAdminLogged() {
  return localStorage.getItem("adminLogged") === "true";
}

function setAdminLogged(val) {
  localStorage.setItem("adminLogged", val ? "true" : "false");
}


// NAVEGACIÓN
// NAVEGACIÓN
// NAVEGACIÓN
const pages = [
  "inicio",
  "contacto",
  "profesionales",
  "servicios",
  "reservar",
  "turnos",
  "loginadmin"
];

function hideAllPages() {
  pages.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("is-active");
  });
}

function showPage(id) {
  hideAllPages();
  const target = document.getElementById(id);
  if (target) target.classList.add("is-active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function routeFromHash() {
  const id = window.location.hash.replace("#", "");

  if (id === "turnos" && !isAdminLogged()) {
    window.location.hash = "loginadmin";
    showPage("loginadmin");
    return;
  }

  if (id === "loginadmin" && isAdminLogged()) {
    window.location.hash = "turnos";
    showPage("turnos");
    renderTurnosAdmin();
    return;
  }

  pages.includes(id) ? showPage(id) : showPage("inicio");
}


// TURNOS
// TURNOS
// TURNOS
let horaSeleccionada = null;

function generarHorarios(intervaloMinutos = 30) {
  const horarios = [];
  let hora = 9;
  let minuto = 0;

  while (hora < 18 || (hora === 18 && minuto === 0)) {
    horarios.push(
      `${hora.toString().padStart(2, "0")}:${minuto.toString().padStart(2, "0")}`
    );

    minuto += intervaloMinutos;

    if (minuto >= 60) {
      hora += Math.floor(minuto / 60);
      minuto = minuto % 60;
    }
  }

  return horarios;
}

function getTurnos() {
  return JSON.parse(localStorage.getItem("turnos")) || [];
}

function saveTurnos(turnos) {
  localStorage.setItem("turnos", JSON.stringify(turnos));
}


// INIT APP
// INIT APP
// INIT APP
function initApp() {

  //MENÚ MOBILE 
  const btnMenu = document.getElementById("menuDesplegable");
  const lista = document.querySelector("nav ul");
  const overlay = document.getElementById("menuOverlay");

  if (btnMenu && lista && overlay) {
    btnMenu.addEventListener("click", () => {
      lista.classList.toggle("mostrar");
      overlay.classList.toggle("activo");
    });

    overlay.addEventListener("click", () => {
      lista.classList.remove("mostrar");
      overlay.classList.remove("activo");
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        lista.classList.remove("mostrar");
        overlay.classList.remove("activo");
      }
    });
  }

  // LINKS
  document.querySelectorAll("nav a[href^='#']").forEach(a => {
    a.addEventListener("click", e => {
      const id = a.getAttribute("href").replace("#", "");
      if (!pages.includes(id)) return;
      e.preventDefault();
      window.location.hash = id;
      showPage(id);
    });
  });

  window.addEventListener("hashchange", routeFromHash);
  routeFromHash();

  // LOGIN
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", e => {
      e.preventDefault();

      const user = document.getElementById("loginUser").value.trim();
      const pass = document.getElementById("loginPass").value;
      const err = document.getElementById("loginError");

      if (user === "admin" && pass === "admin123") {
        setAdminLogged(true);
        window.location.hash = "turnos";
        showPage("turnos");
        renderTurnosAdmin();
        if (err) err.style.display = "none";
      } else {
        if (err) err.style.display = "inline";
      }
    });
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      setAdminLogged(false);
      window.location.hash = "loginadmin";
      showPage("loginadmin");
    });
  }

  // TURNOS
const serviceSelect = document.getElementById("serviceSelect");
const professionalSelect = document.getElementById("professionalSelect");
const dateSelect = document.getElementById("dateSelect");
if (dateSelect) {
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, "0");
  const dd = String(hoy.getDate()).padStart(2, "0");

  dateSelect.min = `${yyyy}-${mm}-${dd}`;
}
dateSelect.addEventListener("change", function () {
  if (!this.value) return;

  const partes = this.value.split("-");
  const año = parseInt(partes[0]);
  const mes = parseInt(partes[1]) - 1; // los meses van 0-11
  const dia = parseInt(partes[2]);

  const fechaSeleccionada = new Date(año, mes, dia);
  const diaSemana = fechaSeleccionada.getDay(); // 0 domingo, 6 sábado

  if (diaSemana === 0 || diaSemana === 6) {
    showFormMessage("No se atiende los fines de semana.", "error");
    this.value = "";
    listaHorarios.innerHTML = "";
    horaSeleccionada = null;
  }
});
const listaHorarios = document.getElementById("listaHorarios");
const btnSubmit = document.getElementById("submitReserva");

//Profesionales
//Profesionales
//Profesionales
const profesionalesPorServicio = {
  veterinaria: [
    { id: "martina", nombre: "Martina Pérez" }
  ],
  estetica: [
    { id: "agustin", nombre: "Agustín Silva" }
  ],
  bano: [
    { id: "sofia", nombre: "Sofía Romero" }
  ]
};
function actualizarProfesionales() {
  if (!professionalSelect) return;

  const servicio = serviceSelect.value;

  professionalSelect.innerHTML = `
    <option value="">Seleccione un profesional (opcional)</option>
  `;

  if (!servicio || !profesionalesPorServicio[servicio]) return;

  profesionalesPorServicio[servicio].forEach(pro => {
    const option = document.createElement("option");
    option.value = pro.id;
    option.textContent = pro.nombre;
    professionalSelect.appendChild(option);
  });
}

//horarios
//horarios
//horarios
function actualizarHorarios() {
  const servicio = serviceSelect.value;
  const fecha = dateSelect.value;

  listaHorarios.innerHTML = "";
  horaSeleccionada = null;

  if (!servicio || !fecha) return;

  const serviceDurations = {
    veterinaria: 30,
    estetica: 60,
    bano: 60
  };

  const intervalo = serviceDurations[servicio] || 30;
  const mensaje = document.getElementById("mensajeHorarios");
  if (mensaje) {
    mensaje.style.display = "none";
  }
  const turnosExistentes = getTurnos();

generarHorarios(intervalo).forEach(hora => {

  const ocupado = turnosExistentes.some(turno =>
    turno.servicio === servicio &&
    turno.fecha === fecha &&
    turno.hora === hora
  );

  if (ocupado) return;

  const li = document.createElement("li");
  li.textContent = hora;
  li.className = "horario-item";

  li.addEventListener("click", () => {
    document
      .querySelectorAll(".horario-item")
      .forEach(h => h.classList.remove("selected"));

    li.classList.add("selected");
    horaSeleccionada = hora;
  });

  listaHorarios.appendChild(li);
});
}

if (serviceSelect && dateSelect) {
  serviceSelect.addEventListener("change", actualizarHorarios);
  dateSelect.addEventListener("change", actualizarHorarios);
  serviceSelect.addEventListener("change", actualizarProfesionales);
}

let messageTimeout = null;


function capitalizarTexto(texto) {
  return texto
    .toLowerCase()
    .split(" ")
    .filter(p => p !== "")
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}
//reservar botón
//reservar botón
//reservar botón
if (btnSubmit) {

  function showFormMessage(texto, tipo) {
    const formMessage = document.getElementById("formMessage");
    if (!formMessage) return;

    formMessage.textContent = texto;
    formMessage.className = "form-message " + tipo;

    if (messageTimeout) {
      clearTimeout(messageTimeout);
    }

    messageTimeout = setTimeout(() => {
      formMessage.textContent = "";
      formMessage.className = "form-message";
    }, 8000);
  }
    btnSubmit.addEventListener("click", () => {
      let nombre = document.getElementById("ownerName").value.trim();
      let mascota = document.getElementById("petName").value.trim();
      nombre = capitalizarTexto(nombre);
      mascota = capitalizarTexto(mascota);
      const celular = document.getElementById("ownerPhone").value.trim();
      const email = document.getElementById("ownerEmail").value.trim();
      const servicio = document.getElementById("serviceSelect").value;
      const fecha = document.getElementById("dateSelect").value;
      let profesional = null;
      if (professionalSelect && professionalSelect.value !== "") {
        profesional = professionalSelect.options[professionalSelect.selectedIndex].text;
      }

      const formMessage = document.getElementById("formMessage");
formMessage.textContent = "";
formMessage.className = "form-message";

let errores = [];

// validaciones
// validaciones
// validaciones
if (!nombre || nombre.trim() === "") {
  errores.push("Ingrese el nombre del dueño.");
}

if (!celular || celular.trim() === "") {
  errores.push("Ingrese un celular.");
}

if (!email || email.trim() === "") {
  errores.push("Ingrese un email.");
}

if (!mascota || mascota.trim() === "") {
  errores.push("Ingrese el nombre de la mascota.");
}

if (!servicio) {
  errores.push("Seleccione un servicio.");
}

if (!fecha) {
  errores.push("Seleccione una fecha.");
}

if (!horaSeleccionada) {
  errores.push("Seleccione un horario.");
}


if (celular && !/^09\d{7}$/.test(celular)) {
  errores.push("El celular debe comenzar con 09 y tener 9 dígitos.");
}

if (email && !/^[^\s@]+@[^\s@]+\.(com|com\.uy|org|net|edu|edu\.uy)$/.test(email)) {
  errores.push("Ingrese un email válido.");
}

if (fecha) {
  const hoy = new Date();
  const fechaSeleccionada = new Date(fecha);
  hoy.setHours(0, 0, 0, 0);

  if (fechaSeleccionada < hoy) {
    errores.push("La fecha no puede ser anterior al día actual.");
  }
}


if (errores.length > 0) {
  showFormMessage(errores[0], "error");
  return;
}

const turnos = getTurnos();

      turnos.push({
        id: Date.now(),
        servicio,
        profesional,
        fecha,
        hora: horaSeleccionada,
        cliente: { nombre, celular, email, mascota }
      });

      saveTurnos(turnos);

      showFormMessage("Turno solicitado correctamente", "success");
      document.getElementById("reservaForm").reset();
        serviceSelect.value = "";
        dateSelect.value = "";
        listaHorarios.innerHTML = "";
        horaSeleccionada = null;

        const mensajeInicial = document.getElementById("mensajeHorarios");
        if (mensajeInicial) {
          mensajeInicial.style.display = "block";
}
    });
  }
}


// Ver Turnos
// Ver Turnos
// Ver Turnos
function renderTurnosAdmin() {
  const contenedor = document.getElementById("turnosList");
  if (!contenedor) return;

  const turnos = getTurnos();
  contenedor.innerHTML = "";

  if (turnos.length === 0) {
    contenedor.innerHTML = "<p>No hay turnos cargados.</p>";
    return;
  }

  turnos.forEach(t => {
    contenedor.innerHTML += `
      <div style="border-bottom:1px solid #ddd;padding:8px 0">
        <strong>${t.servicio.toUpperCase()}</strong><br>
        Profesional: ${t.profesional ? t.profesional : "No especificado"}<br>
        Mascota: ${t.cliente.mascota}<br>
        Dueño: ${t.cliente.nombre}<br>
        Contacto: ${t.cliente.celular} | ${t.cliente.email}<br>
        Fecha: ${t.fecha} - ${t.hora}
      </div>
    `;
  });
}


// Ejecutar SOLO en navegador
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", initApp);
}




// EXPORTS PARA JEST
if (typeof module !== "undefined") {
  module.exports = {
    isAdminLogged,
    setAdminLogged,
    initApp
  };
}
