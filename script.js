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

const btnTodas = document.getElementById("todas");
const btnPendientes = document.getElementById("pendiente");
const btnCompletadas = document.getElementById("completada");

// ==============================
// VARIABLES
// ==============================

let tareas = [];
let filtroActual = "todas";

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
        alert("⚠️ Debes escribir una tarea.");
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

    inputTarea.value = "";

    prioridad.value = "Media";

    renderizar();
}

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

            renderizar();

        });

        // Editar

        clon.querySelector(".editar").addEventListener("click", () => {

            let nuevoTexto = prompt("Editar tarea:", tarea.nombre);

            if (nuevoTexto === null) return;

            nuevoTexto = nuevoTexto.trim();

            if (nuevoTexto === "") {

                alert("La tarea no puede quedar vacía.");

                return;

            }

            tarea.nombre = nuevoTexto;

            renderizar();

        });

        // Eliminar

        clon.querySelector(".eliminar").addEventListener("click", () => {

            const confirmar = confirm("¿Deseas eliminar esta tarea?");

            if (!confirmar) return;

            tareas = tareas.filter(t => t.id !== tarea.id);

            renderizar();

        });

        lista.appendChild(clon);

    });

    actualizarContadores();

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

renderizar();