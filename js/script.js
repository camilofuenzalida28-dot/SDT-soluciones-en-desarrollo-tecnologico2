// =========================================================
// SDT — Soluciones en Desarrollo Tecnológico
// Interacciones de la página
// =========================================================

// ---------- CONFIGURACIÓN ----------

// Correo de la empresa: aquí llegan todas las consultas del formulario (servicio FormSubmit).
// Después de activarlo, puedes reemplazarlo por el código que te envía FormSubmit
// para que el correo no quede escrito en el código (ver LEEME.md).
const CORREO = "solucionesdesarrollo98@gmail.com";

// Números de WhatsApp (formato internacional, sin "+" ni espacios).
// No se muestran en la página: solo se usan para abrir la conversación.
// Las consultas se reparten entre ambos números.
const NUMEROS_WHATSAPP = ["56934361183", "56977894839"];

// Seguridad del formulario
const TIEMPO_MINIMO_MS = 3000;      // un robot llena el formulario en menos de 3 segundos
const ESPERA_ENTRE_ENVIOS_MS = 30000; // evita envíos repetidos (30 segundos)
const MAX_NOMBRE = 60;
const MAX_CONSULTA = 800;

// ---------- 1. Año actual en el pie ----------
document.getElementById("anio").textContent = new Date().getFullYear();

// ---------- 2. Borde del encabezado al bajar ----------
const encabezado = document.getElementById("encabezado");
window.addEventListener("scroll", () => {
    encabezado.classList.toggle("con-borde", window.scrollY > 10);
}, { passive: true });

// ---------- 3. WhatsApp sin mostrar el número ----------
// A cada visitante se le asigna uno de los dos números al azar, así las consultas se reparten.
const NUMERO_ASIGNADO = NUMEROS_WHATSAPP[Math.floor(Math.random() * NUMEROS_WHATSAPP.length)];
const SALUDO_WHATSAPP = "Hola SDT, tengo una consulta";
const enlaceDirectoWhatsapp = `https://wa.me/${NUMERO_ASIGNADO}?text=${encodeURIComponent(SALUDO_WHATSAPP)}`;

document.querySelectorAll("#enlaceWhatsapp, .whatsapp-flotante").forEach((enlace) => {
    enlace.href = enlaceDirectoWhatsapp;
    enlace.target = "_blank";
    enlace.rel = "noopener noreferrer";
});

// ---------- Utilidades ----------

// Abre WhatsApp con un mensaje ya escrito
// (se usa un enlace real porque algunos navegadores bloquean window.open)
function abrirWhatsApp(numero, mensaje) {
    const enlace = document.createElement("a");
    enlace.href = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    enlace.target = "_blank";
    enlace.rel = "noopener noreferrer";
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
}

// Limpia el texto escrito por el cliente:
// quita caracteres de control y etiquetas HTML, junta espacios repetidos y respeta el largo máximo
function limpiarTexto(texto, maximo) {
    return texto
        .normalize("NFC")
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E]/g, "")
        .replace(/<[^>]*>/g, "")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
        .slice(0, maximo);
}

// Un nombre solo puede tener letras (con tildes y ñ), espacios, apóstrofo, punto y guion
const PATRON_NOMBRE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]{2,60}$/;

// Detecta enlaces dentro de la consulta (típico del spam)
const PATRON_ENLACE = /(https?:\/\/|www\.)\S+/i;

// Lectura y escritura segura del almacenamiento del navegador
function leerUltimoEnvio() {
    try { return Number(localStorage.getItem("sdt_ultimo_envio")) || 0; } catch { return 0; }
}
function guardarUltimoEnvio(momento) {
    try { localStorage.setItem("sdt_ultimo_envio", String(momento)); } catch { /* sin almacenamiento: se usa la memoria */ }
}

// Muestra u oculta el mensaje de error de un campo
function mostrarError(input, mensaje) {
    const campo = input.closest(".campo");
    campo.classList.toggle("invalido", Boolean(mensaje));
    campo.querySelector(".error").textContent = mensaje || "";
    return !mensaje;
}

// Envía la consulta al correo de la empresa
function enviarAlCorreo(datos, trampa) {
    return fetch(`https://formsubmit.co/ajax/${CORREO}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
            _subject: `Nueva consulta web: ${datos["Interés"]} — ${datos.Nombre}`,
            _template: "table",
            _captcha: "false",
            _honey: trampa,
            ...datos
        })
    })
        .then((respuesta) => respuesta.json().catch(() => ({})).then((resultado) => ({ respuesta, resultado })))
        .then(({ respuesta, resultado }) => {
            // Mientras el formulario no esté activado, FormSubmit responde pidiendo activación:
            // la consulta igual queda registrada y se envía el correo de activación.
            const pendienteActivacion = /activ/i.test(resultado.message || "");
            if (!pendienteActivacion && (!respuesta.ok || String(resultado.success) !== "true")) {
                throw new Error(resultado.message || "No se pudo enviar al correo");
            }
        });
}

// ---------- 4. Formulario de consultas ----------
const formulario = document.getElementById("formConsulta");
const nota = document.getElementById("notaConsulta");
const campoConsulta = document.getElementById("consulta");
const contador = document.getElementById("contador");
const OPCIONES_INTERES = Array.from(document.getElementById("interes").options).map((o) => o.value).filter(Boolean);
const momentoCarga = Date.now();
let ultimoEnvio = leerUltimoEnvio();

function mostrarNota(tipo, texto) {
    nota.className = tipo === "error" ? "form-nota form-nota--error" : "form-nota";
    nota.textContent = texto;
}

// Contador de caracteres de la consulta
function actualizarContador() {
    contador.textContent = `${campoConsulta.value.length} / ${MAX_CONSULTA}`;
}
campoConsulta.addEventListener("input", actualizarContador);
actualizarContador();

formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    // 1) Filtros contra robots: campo trampa lleno o formulario llenado demasiado rápido.
    //    Se responde como si todo saliera bien para no darle pistas al robot.
    const trampa = document.getElementById("trampa").value;
    if (trampa || Date.now() - momentoCarga < TIEMPO_MINIMO_MS) {
        mostrarNota("ok", "Gracias, recibimos tu consulta.");
        return;
    }

    // 2) Evita envíos repetidos seguidos
    const espera = ultimoEnvio + ESPERA_ENTRE_ENVIOS_MS - Date.now();
    if (espera > 0) {
        mostrarNota("error", `Ya enviaste una consulta. Espera ${Math.ceil(espera / 1000)} segundos para enviar otra.`);
        return;
    }

    const nombre = document.getElementById("nombre");
    const interes = document.getElementById("interes");

    // 3) Limpieza y validación de cada dato
    const nombreLimpio = limpiarTexto(nombre.value, MAX_NOMBRE);
    const consultaLimpia = limpiarTexto(campoConsulta.value, MAX_CONSULTA);

    const valido = [
        mostrarError(nombre, PATRON_NOMBRE.test(nombreLimpio) ? "" : "Ingresa tu nombre usando solo letras."),
        mostrarError(interes, OPCIONES_INTERES.includes(interes.value) ? "" : "Elige una opción."),
        mostrarError(campoConsulta,
            consultaLimpia.length < 10 ? "Cuéntanos un poco más (mínimo 10 caracteres)." :
            PATRON_ENLACE.test(consultaLimpia) ? "Por seguridad, no incluyas enlaces en la consulta." : "")
    ].every(Boolean);

    if (!valido) {
        nota.textContent = "";
        formulario.querySelector(".invalido input, .invalido select, .invalido textarea")?.focus();
        return;
    }

    const datos = {
        "Nombre": nombreLimpio,
        "Interés": interes.value,
        "Consulta": consultaLimpia
    };

    ultimoEnvio = Date.now();
    guardarUltimoEnvio(ultimoEnvio);

    // 4) La consulta se envía al correo de la empresa
    const boton = formulario.querySelector('button[type="submit"]');
    boton.disabled = true;
    mostrarNota("ok", "Enviando tu consulta…");

    enviarAlCorreo(datos, trampa)
        .then(() => {
            mostrarNota("ok", "¡Recibimos tu consulta! Te responderemos a la brevedad. También se abrió WhatsApp por si quieres conversar ahora.");
            formulario.reset();
            actualizarContador();
        })
        .catch(() => {
            mostrarNota("error", `No pudimos enviar tu consulta por correo. Escríbenos a ${CORREO} o usa la conversación de WhatsApp que se abrió.`);
        })
        .finally(() => { boton.disabled = false; });

    // 5) Además se abre WhatsApp con la consulta (sin mostrar el número en la página)
    abrirWhatsApp(NUMERO_ASIGNADO,
        `${SALUDO_WHATSAPP}.\n` +
        `• Nombre: ${datos.Nombre}\n` +
        `• Me interesa: ${datos["Interés"]}\n` +
        `• Consulta: ${datos.Consulta}`
    );
});

// Quita el error de un campo apenas la persona lo corrige
formulario.querySelectorAll("input, select, textarea").forEach((control) => {
    control.addEventListener("input", () => {
        const campo = control.closest(".campo");
        if (campo && campo.classList.contains("invalido")) mostrarError(control, "");
    });
});

// ---------- 5. Fotos: si alguna no carga (sin internet), queda un fondo de respaldo ----------
document.querySelectorAll(".foto__marco img").forEach((imagen) => {
    const marcarSinFoto = () => imagen.parentElement.classList.add("sin-foto");
    imagen.addEventListener("error", marcarSinFoto);
    if (imagen.complete && imagen.naturalWidth === 0 && imagen.src) marcarSinFoto();
});

