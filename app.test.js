/** @jest-environment jsdom */
const { isAdminLogged, setAdminLogged, initApp} = require("./app.js");


beforeAll(() => {
 global.scrollTo = jest.fn();
  Object.defineProperty(global, "localStorage", {
    value: {
      store: {},
      getItem(key) {
        return this.store[key] || null;
      },
      setItem(key, value) {
        this.store[key] = value.toString();
      },
      clear() {
        this.store = {};
      }
    },
    writable: true
  });
});

describe("Login de administrador", () => {

  beforeEach(() => {
    localStorage.clear();
  });

  test("El admin NO está logueado por defecto", () => {
    expect(isAdminLogged()).toBe(false);
  });

  test("El admin se loguea correctamente", () => {
    setAdminLogged(true);
    expect(isAdminLogged()).toBe(true);
  });

  test("El admin puede cerrar sesión", () => {
    setAdminLogged(true);
    setAdminLogged(false);
    expect(isAdminLogged()).toBe(false);
  });

});

describe("Login con credenciales incorrectas", () => {

  beforeEach(() => {
    document.body.innerHTML = `
      <form id="loginForm">
        <input id="loginUser" />
        <input id="loginPass" />
        <span id="loginError" style="display:none"></span>
      </form>
    `;

    localStorage.clear();

    jest.resetModules();
    require("./app.js");
  });

test("No permite login con datos incorrectos", () => {
  document.getElementById("loginUser").value = "admin";
  document.getElementById("loginPass").value = "malpassword";

  const form = document.getElementById("loginForm");
  form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

  // NO se setea adminLogged
  expect(localStorage.getItem("adminLogged")).toBe(null);

  const error = document.getElementById("loginError");
  expect(error.style.display).toBe("none");
});


});

describe("Flujo de Reserva de Turnos", () => {
  beforeEach(() => {

    global.alert = jest.fn();

    document.body.innerHTML = `
      <select id="serviceSelect"><option value="Peluquería">Peluquería</option></select>
      <input id="dateSelect" value="2026-10-10" />
      <button id="selectConfirm">Confirmar</button>
      <ul id="listaHorarios"></ul>
      
      <input id="ownerName" />
      <input id="ownerPhone" />
      <input id="ownerEmail" />
      <input id="petName" />
      <button id="submitReserva" disabled>Reservar</button>
    `;


    localStorage.clear();
    initApp();
  });

  test("Debe guardar exitosamente un turno cuando los datos son válidos", () => {

    const btnConfirm = document.getElementById("selectConfirm");
    btnConfirm.click();

    const primerHorario = document.querySelector(".horario-item");
    primerHorario.click(); 

    document.getElementById("ownerName").value = "Carlos";
    document.getElementById("ownerPhone").value = "123456789";
    document.getElementById("ownerEmail").value = "carlos@test.com";
    document.getElementById("petName").value = "Dogui";


    const btnSubmit = document.getElementById("submitReserva");
    btnSubmit.click();

    const turnosEnStorage = JSON.parse(localStorage.getItem("turnos"));
    
    expect(turnosEnStorage).toHaveLength(1);
    expect(turnosEnStorage[0]).toMatchObject({
      servicio: "Peluquería",
      cliente: { nombre: "Carlos", mascota: "Dogui" }
    });
    expect(global.alert).toHaveBeenCalledWith("Turno solicitado correctamente");
  });

  test("No debe permitir reservar si no se seleccionó horario", () => {
  document.getElementById("ownerName").value = "Incompleto";
  
  const btnSubmit = document.getElementById("submitReserva");

  btnSubmit.disabled = false; 
  
  btnSubmit.click();

  expect(global.alert).toHaveBeenCalledWith("Complete todos los campos y seleccione un horario");
});
});