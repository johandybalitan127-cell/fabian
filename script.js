// ==============================
// ELEMENTOS DEL DOM
// ==============================

const inputTarea = document.getElementById("tarea");
const prioridad = document.getElementById("prioridad");
const btnAgregar = document.getElementById("btnAgregar");

const lista = document.getElementById("listaTareas");
const plantilla = document.getElementById("plantilla");

const total = document.getElementById("totalTareas");
const pendientes = document.getElementById("pendientes");
const completadas = document.getElementById("completadas");
const toast = document.getElementById("toast");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const modalInput = document.getElementById("modalInput");
const modalConfirm = document.getElementById("modalConfirm");
const modalCancel = document.getElementById("modalCancel");

const btnTodas = document.getElementById("todas");
const btnPendientes = document.getElementById("pendiente");
const btnCompletadas = document.getElementById("completada");
const themeToggle = document.getElementById("themeToggle");
const THEME_KEY = "modoTema";

// ==============================
// VARIABLES
// ==============================

const STORAGE_KEY = "tareasOrganizador";
let tareas = [];
let filtroActual = "todas";
let ultimaCantidadPendientes = 0;

function cargarTareas() {
    const datos = localStorage.getItem(STORAGE_KEY);
    if (!datos) return;

    try {
        const tareasGuardadas = JSON.parse(datos);
        if (Array.isArray(tareasGuardadas)) {
            tareas = tareasGuardadas.map(tarea => ({
                ...tarea,
                fecha: tarea.fecha || new Date().toLocaleString(),
                completada: Boolean(tarea.completada)
            }));
        }
    } catch (error) {
        console.warn("Error al cargar tareas desde localStorage:", error);
        tareas = [];
    }
}

function guardarTareas() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tareas));
}

function recordarPendientes() {
    const pendientesActivas = tareas.filter(t => !t.completada).length;
    if (pendientesActivas > 0 && ultimaCantidadPendientes === 0) {
        mostrarToast(`Recuerda: tienes ${pendientesActivas} tarea${pendientesActivas === 1 ? "" : "s"} pendiente${pendientesActivas === 1 ? "" : "s"}.`, "success");
    }
    ultimaCantidadPendientes = pendientesActivas;
}

function guardarTema(modo) {
    localStorage.setItem(THEME_KEY, modo);
}

function aplicarTema(modo) {
    document.body.classList.toggle("dark", modo === "dark");
    const icon = themeToggle?.querySelector("i");
    if (icon) {
        icon.className = modo === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
    }
}

function cargarTema() {
    const temaGuardado = localStorage.getItem(THEME_KEY);
    const tema = temaGuardado === "dark" ? "dark" : "light";
    aplicarTema(tema);
}

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const isDark = document.body.classList.contains("dark");
        const nuevoModo = isDark ? "light" : "dark";
        aplicarTema(nuevoModo);
        guardarTema(nuevoModo);
    });
}

// ==============================
// AGREGAR TAREA
// ==============================

btnAgregar.addEventListener("click", agregarTarea);

inputTarea.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        agregarTarea();
    }
});

function agregarTarea() {

    const texto = inputTarea.value.trim();

    if (texto === "") {
        mostrarToast("⚠️ Debes escribir una tarea.", "error");
        inputTarea.focus();
        return;
    }

    const nuevaTarea = {

        id: Date.now(),

        nombre: texto,

        prioridad: prioridad.value,

        completada: false,

        fecha: new Date().toLocaleString()

    };

    tareas.push(nuevaTarea);

    guardarTareas();

    inputTarea.value = "";

    prioridad.value = "Media";

    renderizar();
}

function mostrarToast(mensaje, tipo = "error") {
    if (!toast) return;

    toast.textContent = mensaje;
    toast.className = "toast show " + tipo;

    clearTimeout(toast.hideTimeout);
    toast.hideTimeout = setTimeout(() => {
        toast.className = "toast";
    }, 3200);
}

function actualizarReloj() {
    const horaHand = document.querySelector('.clock-hour');
    const minutoHand = document.querySelector('.clock-minute');
    const segundoHand = document.querySelector('.clock-second');

    if (!horaHand || !minutoHand || !segundoHand) return;

    const ahora = new Date();
    const horas = ahora.getHours() % 12;
    const minutos = ahora.getMinutes();
    const segundos = ahora.getSeconds();

    const gradosHoras = (horas + minutos / 60) * 30;
    const gradosMinutos = (minutos + segundos / 60) * 6;
    const gradosSegundos = segundos * 6;

    horaHand.style.transform = `translate(-50%, -100%) rotate(${gradosHoras}deg)`;
    minutoHand.style.transform = `translate(-50%, -100%) rotate(${gradosMinutos}deg)`;
    segundoHand.style.transform = `translate(-50%, -100%) rotate(${gradosSegundos}deg)`;
}

setInterval(actualizarReloj, 1000);
actualizarReloj();

let modalConfirmCallback = null;

function abrirModal({
    title,
    message,
    value = "",
    placeholder = "",
    confirmText = "Aceptar",
    cancelText = "Cancelar",
    showInput = true,
    onConfirm
}) {
    if (!modal) return;

    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalInput.value = value;
    modalInput.placeholder = placeholder;
    modalInput.style.display = showInput ? "block" : "none";
    modalConfirm.textContent = confirmText;
    modalCancel.textContent = cancelText;
    modal.classList.add("open");

    modalConfirmCallback = onConfirm;
    if (showInput) {
        setTimeout(() => modalInput.focus(), 100);
    }
}

function cerrarModal() {
    if (!modal) return;
    modal.classList.remove("open");
    modalConfirmCallback = null;
}

modalConfirm?.addEventListener("click", () => {
    if (!modalConfirmCallback) return;

    const result = modalConfirmCallback(modalInput.value);
    if (result !== false) {
        cerrarModal();
    }
});

modalCancel?.addEventListener("click", cerrarModal);
modal?.addEventListener("click", (event) => {
    if (event.target === modal) cerrarModal();
});

// ==============================
// RENDERIZAR
// ==============================

function renderizar() {

    lista.innerHTML = "";

    let tareasMostrar = tareas;

    if (filtroActual === "pendientes") {

        tareasMostrar = tareas.filter(t => !t.completada);

    }

    if (filtroActual === "completadas") {

        tareasMostrar = tareas.filter(t => t.completada);

    }

    tareasMostrar.forEach(tarea => {

        const clon = plantilla.content.cloneNode(true);

        clon.querySelector(".nombre").textContent = tarea.nombre;

        clon.querySelector(".fecha").textContent = tarea.fecha;

        const prioridadSpan = clon.querySelector(".prioridad");

        prioridadSpan.textContent = tarea.prioridad;

        prioridadSpan.classList.remove("alta", "media", "baja");

        if (tarea.prioridad === "Alta") {

            prioridadSpan.classList.add("alta");

        }

        if (tarea.prioridad === "Media") {

            prioridadSpan.classList.add("media");

        }

        if (tarea.prioridad === "Baja") {

            prioridadSpan.classList.add("baja");

        }

        const tarjeta = clon.querySelector(".tarea");

        if (tarea.completada) {

            tarjeta.classList.add("completada");

        }

        // Completar

        clon.querySelector(".completar").addEventListener("click", () => {

            tarea.completada = !tarea.completada;

            guardarTareas();
            renderizar();

        });

        // Editar

        clon.querySelector(".editar").addEventListener("click", () => {
            abrirModal({
                title: "Editar tarea",
                message: "Modifica el nombre de la tarea:",
                value: tarea.nombre,
                placeholder: "Nueva tarea...",
                confirmText: "Guardar",
                cancelText: "Cancelar",
                showInput: true,
                onConfirm: (valor) => {
                    const textoEditado = valor.trim();
                    if (textoEditado === "") {
                        mostrarToast("La tarea no puede quedar vacía.", "error");
                        return false;
                    }
                    tarea.nombre = textoEditado;
                    guardarTareas();
                    renderizar();
                    return true;
                }
            });
        });

        // Eliminar

        clon.querySelector(".eliminar").addEventListener("click", () => {
            abrirModal({
                title: "Eliminar tarea",
                message: "¿Deseas eliminar esta tarea?",
                showInput: false,
                confirmText: "Eliminar",
                cancelText: "Cancelar",
                onConfirm: () => {
                    tareas = tareas.filter(t => t.id !== tarea.id);
                    guardarTareas();
                    renderizar();
                    return true;
                }
            });
        });

        lista.appendChild(clon);

    });

    actualizarContadores();
    recordarPendientes();

}

// ==============================
// CONTADORES
// ==============================

function actualizarContadores() {

    total.textContent = tareas.length;

    pendientes.textContent = tareas.filter(t => !t.completada).length;

    completadas.textContent = tareas.filter(t => t.completada).length;

}

// ==============================
// FILTROS
// ==============================

btnTodas.addEventListener("click", () => {

    filtroActual = "todas";

    activarBoton(btnTodas);

    renderizar();

});

btnPendientes.addEventListener("click", () => {

    filtroActual = "pendientes";

    activarBoton(btnPendientes);

    renderizar();

});

btnCompletadas.addEventListener("click", () => {

    filtroActual = "completadas";

    activarBoton(btnCompletadas);

    renderizar();

});

// ==============================
// BOTÓN ACTIVO
// ==============================

function activarBoton(boton) {

    document.querySelectorAll(".filtros button").forEach(btn => {

        btn.classList.remove("activo");

    });

    boton.classList.add("activo");

}

// ==============================
// INICIO
// ==============================

cargarTareas();
renderizar();