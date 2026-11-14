import { mostrarToast } from "../../common/utils/alertas.js";
import { crearUsuariosApi } from "./usuarios.api.js";
import { crearUsuariosStore } from "./usuarios.store.js";
import { crearTablaUsuarios } from "./components/tablaUsuarios.js";
import { actualizarStatsUsuarios } from "./components/statsUsuarios.js";
import { crearPaginacionUsuarios } from "./components/paginacionUsuarios.js";
import { crearModalEditarUsuario } from "./modales/editarUsuario.js";
import { crearModalCrearUsuario } from "./modales/crearUsuario.js";

export async function iniciarUsuarios() {
    const api = crearUsuariosApi();
    const store = crearUsuariosStore();
    const notificar = mostrarToast;

    const selectFiltroRol = document.getElementById("select-filtro-rol");
    const inputBuscarUsuario = document.getElementById("buscar-usuario");
    const tbodyUsuarios = document.getElementById("tabla-body-usuarios");

    const modalEdicion = document.getElementById("modal-usuario");
    const formEdicion = document.getElementById("form-usuario");
    const btnBorrarUsuario = document.getElementById("btn-borrar-usuario");
    const modalCrear = document.getElementById("modal-crear-usuario");
    const formCrear = document.getElementById("form-crear-usuario");

    const renderizar = () => {
        tabla.render(store.obtenerPagina());
        actualizarStatsUsuarios(store.obtenerBase());
        paginacion.render();
    };

    const modalEditar = crearModalEditarUsuario({
        modal: modalEdicion,
        form: formEdicion,
        botonBorrar: btnBorrarUsuario,
        api,
        notificar,
        onActualizado: cargarUsuarios,
    });

    const tabla = crearTablaUsuarios({
        tbody: tbodyUsuarios,
        onEditar(id) {
            const user = store.obtenerBase().find((item) => String(item.id) === String(id));
            if (user) modalEditar.abrir(user);
        },
    });

    const paginacion = crearPaginacionUsuarios({ store, render: renderizar });

    crearModalCrearUsuario({
        modal: modalCrear,
        form: formCrear,
        api,
        notificar,
        onCreado: cargarUsuarios,
    });

    async function cargarUsuarios() {
        try {
            const datos = await api.listar();
            store.establecerBase(datos.usuarios || datos);
            renderizar();
        } catch (error) {
            console.error(error);
            notificar("No se pudieron cargar los usuarios", true);
        }
    }

    function aplicarFiltrosUsuarios() {
        store.filtrar({
            termino: inputBuscarUsuario ? inputBuscarUsuario.value : "",
            rol: selectFiltroRol ? selectFiltroRol.value : "todos",
        });
        renderizar();
    }

    if (selectFiltroRol) {
        selectFiltroRol.addEventListener("change", aplicarFiltrosUsuarios);
    }
    if (inputBuscarUsuario) {
        inputBuscarUsuario.addEventListener("input", aplicarFiltrosUsuarios);
    }

    const cabeceras = document.querySelectorAll(".sortable-usuario");
    cabeceras.forEach((cabecera) => {
        cabecera.addEventListener("click", () => {
            store.ordenar(cabecera.getAttribute("data-sort"));

            cabeceras.forEach((th) => {
                const icono = th.querySelector("i");
                if (icono) {
                    icono.setAttribute("data-lucide", "arrow-up-down");
                    icono.style.color = "#a1a1aa";
                }
            });

            const iconoActivo = cabecera.querySelector("i");
            if (iconoActivo) {
                iconoActivo.setAttribute("data-lucide", store.esOrdenAscendente() ? "arrow-up" : "arrow-down");
                iconoActivo.style.color = "#759627";
                renderizar();
            }
        });
    });

    const btnMenuUsuarios = document.querySelector('[data-nav="vista-usuarios"]');
    if (btnMenuUsuarios) {
        btnMenuUsuarios.addEventListener("click", () => {
            if (store.obtenerBase().length === 0) {
                cargarUsuarios();
            }
        });
    }
}
