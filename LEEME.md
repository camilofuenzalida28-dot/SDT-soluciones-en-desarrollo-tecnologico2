# SDT — Soluciones en Desarrollo Tecnológico

## Cómo abrirlo
1. Descomprime el `.zip`.
2. Haz doble clic en `index.html` para verlo en el navegador.
3. Para editarlo, abre la carpeta `sdt-web` en Visual Studio Code (Archivo → Abrir carpeta).

## Estructura
```
sdt-web/
├── index.html      → estructura y textos
├── css/styles.css  → diseño, colores y adaptación a celular
├── js/script.js    → formulario de consultas, WhatsApp y correo
└── img/logo.svg    → logo SDT
```

## Formulario de consultas
- El cliente escribe su nombre, qué le interesa y su consulta.
- Al enviar:
  1. la consulta llega al correo **solucionesdesarrollo98@gmail.com** (servicio FormSubmit), y
  2. se abre WhatsApp con la consulta escrita, por si el cliente quiere conversar al instante.
- Los números de WhatsApp **no se muestran** en la página. Están en `js/script.js`
  (`NUMEROS_WHATSAPP`) y las consultas se reparten al azar entre ambos.
  El botón flotante y el enlace "Escríbenos por WhatsApp" también usan esos números.

## Activar el correo (una sola vez, obligatorio)
1. Abre la página con **Live Server** en VS Code (clic derecho en `index.html` → "Open with Live Server")
   o ya publicada en internet. Con doble clic (archivo local) el envío al correo puede fallar.
2. Envía una consulta de prueba desde el formulario.
3. Revisa la bandeja de solucionesdesarrollo98@gmail.com (también la carpeta de spam),
   abre el correo de FormSubmit y presiona **"Activate Form"**.
4. Desde ese momento, cada consulta llega al correo con los datos ordenados en una tabla.

Recomendado: FormSubmit te enviará un código. Reemplaza el correo en la línea
`const CORREO = "...";` de `js/script.js` por ese código, para que tu dirección
no quede escrita en el código de la página. El correo seguirá visible en la sección de contacto.

## Fotografías
Las cuatro fotos de la sección "Así nace tu proyecto" son de **Unsplash**, con licencia de uso
libre (incluso comercial), sin pedir permiso y sin obligación de dar crédito. Igual se incluyen
los créditos de los fotógrafos al pie de la sección, como buena práctica.
- Se cargan desde internet. Sin conexión, se muestra un fondo azul cuadriculado en su lugar.
- Para tenerlas dentro del proyecto: descárgalas desde los enlaces de los créditos, guárdalas
  en `img/` y cambia cada `src` en `index.html` (por ejemplo `img/paso-1.jpg`).

## Seguridad incluida
**En la página (funciona siempre):**
- Política de contenido (CSP): el navegador solo acepta los archivos propios de la página,
  las fuentes de Google, las fotos de Unsplash y FormSubmit. Bloquea código insertado por terceros.
- Los enlaces externos no comparten datos de la página (`noopener noreferrer`).
- Formulario:
  - campo trampa invisible y bloqueo de envíos hechos en menos de 3 segundos (robots);
  - espera de 30 segundos entre consultas, para evitar envíos repetidos;
  - limpieza del texto: quita etiquetas HTML y caracteres ocultos, y limita el largo;
  - el nombre solo acepta letras, y la consulta no acepta enlaces (spam);
  - los números de WhatsApp no aparecen en el HTML: solo existen en el JavaScript.

**En el servidor (al publicar):** sube también `.htaccess` (Apache/cPanel) o `_headers`
(Netlify/Cloudflare). Agregan: bloqueo de marcos externos, HTTPS obligatorio, protección de
tipos de archivo y bloqueo de cámara, micrófono y ubicación.
Activa el HTTPS obligatorio solo cuando tu dominio ya tenga certificado SSL.

