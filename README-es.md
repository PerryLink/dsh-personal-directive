# dsh-personal-directive

> Release stamp: `0.2.9` (2026-10-04).

> ⚠️ Este proyecto se retiró del ecosistema DSH y ya no participa en ningún listado de catálogo (2026-09-13).

- **Canal de la tienda 1024**: ejecuta `npm i -g dsh1024` una vez y luego `dsh1024 plugin --profile web add dsh-personal-directive` (cuenta para el ranking de instalaciones de [deepseek1024.com](https://deepseek1024.com)).

Edición **de framework** del fork de «Infinite Generation One» para DeepSeek Harness: conserva la forma de plugin del repositorio original (inyección de system prompt + herramienta + interruptor en tiempo de ejecución en la barra superior), pero **no distribuye el contenido del prompt original** — lo sustituye por una directiva de marcador de posición neutra que puedes reemplazar por tus propias instrucciones personales.

> Este proyecto es una edición personal derivada del proyecto original, no una publicación oficial del autor original.

## Origen del proyecto

Proyecto original:

- GitHub: https://github.com/Minglink/dsh-infinite-gen-1
- Nombre: dsh-infinite-gen-1 / 无限一代 (Infinite Generation One)
- Autor original: Minglink

Esta edición de framework conserva la estructura del plugin original (inyección del segmento de prompt, herramienta `personal_directive_profile`, interruptor superior en la Web) y añade un control visual en la parte superior de la Web, además de sustituir el contenido del prompt por una directiva de marcador de posición neutra (véase «Atribución y licencia»).

## Qué añade esta edición

Respecto al repositorio original, este proyecto añade principalmente:

- Registra los botones «Directiva: activada / Directiva: desactivada» en la parte superior de DeepSeek Harness Web, justo después de «completar indicación».
- Cambia el estado del prompt mediante la interfaz remota en tiempo de ejecución, no desinstalando el plugin.
- El plugin permanece instalado y cargado; al desactivarlo solo el segmento de system prompt de esta directiva personal devuelve contenido vacío.
- Activar o desactivar solo afecta a las solicitudes posteriores del modelo; no modifica las solicitudes ya enviadas.
- Conserva la forma de la herramienta original `personal_directive_profile` (en el original se llamaba `infinite_gen1_profile`).
- Las dependencias vienen del registro npm (para desarrollo local puedes modificar el código y reempaquetar/instalar).

La posición del interruptor la controla una ranura de la UI de DSH:

```text
conversation.session.header.actions
```

Este proyecto usa el orden `1010` para colocarse después del botón existente «completar indicación».

## Estructura del directorio

```text
dsh-personal-directive/
├── index.js                         # Punto de entrada del plugin del lado del servidor Harness y conmutador en tiempo de ejecución
├── lib/
│   └── client.js                    # Conmutador visual de la barra superior
├── scripts/
│   ├── check-client-contract.mjs    # Comprobación del contrato del host (puerta de existencia de símbolos)
│   ├── check-typert-codec.mjs       # Puerta del codec Typert (una sola cara: create())
│   ├── probe-typert-codec-contract.mjs  # Mide el contrato del codec contra el host instalado
│   └── lib/                         # Helpers compartidos de análisis/origen/reescritura de las puertas
├── prompts/
│   └── personal-directive.md        # Directiva de marcador de posición neutra (sustituible por tu contenido)
├── cordis.patch.yml                 # Declaración de inserción del bundle
├── package.json                     # Metadatos del bundle/cliente de Harness
├── pnpm-lock.yaml                   # Archivo de bloqueo de dependencias local
└── README.md
```

## Requisitos del entorno

- DeepSeek Harness instalado y `dsh web` arrancando correctamente.
- El comando `dsh plugin` disponible.
- `pnpm` en el PATH.
- Este tutorial de instalación está pensado para el perfil `web`.

## Instalación

### Desde GitHub

Se recomienda instalar directamente desde GitHub:

```powershell
dsh plugin --profile web add github:PerryLink/dsh-personal-directive
```

Si `dsh` no está en el PATH, usa el comando del directorio de instalación de DSH:

```powershell
& "D:/deepseek-harness/node_modules/.bin/dsh.cmd" plugin --profile web add github:PerryLink/dsh-personal-directive
```

Tras una instalación correcta, DSH hará automáticamente lo siguiente:

1. Añadir el plugin a las `dependencies` de `~/.dsh/profiles/web/package.json`.
2. Añadir `dsh-personal-directive` a `dsh.profile.bundles`.
3. Aplicar el `cordis.patch.yml` que trae el plugin.
4. Instalar las dependencias del lado servidor y del cliente Web del plugin.

Después reinicia por completo `dsh web` y recarga la página:

```text
http://127.0.0.1:3080
```

### Alternativa de instalación local (git / pack)

Adecuada para desarrollo, modificación del código o restauración desde una copia local. La instalación por git también instala las dependencias:

```powershell
dsh plugin --profile <p> add github:PerryLink/dsh-personal-directive
```

Sustituye `<p>` por el nombre del perfil de destino (por ejemplo `web`).

También puedes empaquetar primero e instalar desde el tarball local:

```powershell
npm pack
dsh plugin --profile <p> add ./dsh-personal-directive-0.2.0.tgz
```

La instalación empaquetada también instala las dependencias. Tras modificar el código hay que reempaquetar, reinstalar y reiniciar `dsh web` para cargar el nuevo código del Host o del cliente Web.

### Cambiar de un enlace local a la versión de GitHub

Si el perfil ya tiene un enlace local con el mismo nombre, elimina primero la dependencia antigua:

```powershell
dsh plugin --profile web remove dsh-personal-directive
dsh plugin --profile web add github:PerryLink/dsh-personal-directive
```

### Actualización

Para actualizar a la última versión tras instalar desde GitHub:

```powershell
dsh plugin --profile web update dsh-personal-directive
```

Reinicia por completo `dsh web` después de actualizar.

### Desinstalación

Desinstalar solo elimina el plugin; no borra otros bundles del usuario:

```powershell
dsh plugin --profile web remove dsh-personal-directive
```

El interruptor «Directiva: activada / Directiva: desactivada» de la parte superior es un conmutador en tiempo de ejecución y no equivale al comando de desinstalación anterior.

## Uso del interruptor

Tras reiniciar, busca en la barra superior:

```text
完成提示    指令：开启
```

Al pulsarlo cambia a:

```text
完成提示    指令：关闭
```

Este interruptor solo controla si el prompt en tiempo de ejecución surte efecto:

- Activado: la siguiente solicitud del modelo incluye la directiva personal de `prompts/personal-directive.md`.
- Desactivado: el plugin sigue instalado, pero el segmento de system prompt de este proyecto queda vacío.
- No elimina el plugin de las `dependencies` del perfil.
- No elimina el plugin de `dsh.profile.bundles`.
- No borra el directorio del plugin personal.

## Verificar que surte efecto

### Estado en la barra superior

Que el botón muestre «Directiva: activada» o «Directiva: desactivada» indica el estado del conmutador en tiempo de ejecución del servidor.

### Ver la solicitud real al modelo

1. Cambia a «Directiva: activada».
2. Crea una sesión nueva y envía un mensaje normal.
3. Abre «Trayectoria» en la parte superior.
4. Selecciona la solicitud del Assistant que acabas de hacer.
5. Abre el detalle «System Prompt / 系统提示词» de la derecha.
6. Busca la siguiente característica de la directiva de marcador de posición:

```text
# Personal Directive
```

Con el interruptor activado verás ese contenido. Cambia a «Directiva: desactivada», envía un mensaje nuevo y revisa la nueva solicitud: ya no deberías ver esas características.

Nota: al desactivarlo, los demás system prompts del propio Harness siguen presentes; este proyecto solo retira su propio segmento de prompt.

## Desarrollo local y comprobaciones

```powershell
cd <this repository>
pnpm install --ignore-workspace
pnpm run harness:check
pnpm test
```

Además de la comprobación de sintaxis, `harness:check` ejecuta la **comprobación del contrato del host** (`scripts/check-client-contract.mjs`). Toma cada símbolo que `lib/client.js` desestructura de `@deepseek-ai/dsh-client-ui-primitives` del host y lo verifica contra la superficie de tipos del host (`lib/types/**/*.d.ts`) **y** sus exportaciones en tiempo de ejecución (`lib/index.js`); también comprueba que los valores de `variant` pasados a `Button` sigan perteneciendo a la unión `ButtonVariant` del host. **Un símbolo que el host haya eliminado se reporta por nombre con salida distinta de cero**, de modo que esta clase de regresión silenciosa (no montar) ya no puede pasar por `node --check` — que solo demuestra que el archivo se analiza, mientras que `React.createElement(undefined)` no lanza hasta que React lo renderiza.

La comprobación localiza automáticamente un checkout del host (un `deepseek-harness` hermano de este repositorio, un directorio ancestro o una raíz de unidad conocida), o puedes indicarlo explícitamente:

```powershell
node scripts/check-client-contract.mjs --host D:/deepseek-harness
$env:DSH_HOST_ROOT = "D:/deepseek-harness"; pnpm run check:client-contract
```

Si informa de que no encuentra ningún checkout del host, define `DSH_HOST_ROOT` con la ruta de tu checkout de DeepSeek Harness.

`harness:check` también ejecuta la **comprobación del codec Typert** (`scripts/check-typert-codec.mjs`). Un codec de invocación Typert es `{ mode: 'strict', typeSymbol, create }`; en la línea 0.1.5 era `{ mode, typeSymbol, schema }`, y el host 0.1.7 rechaza la forma antigua al montar — `validateCodec` lanza `typert: <id> result strict codec has no create() factory`, la fila del plugin no se activa y nada más en este repositorio puede verlo: el literal antiguo es un objeto perfectamente válido, así que `node --check` pasa y un Context de prueba lo acepta. Esta comprobación es el espejo local de esa regla del host. Construye los artefactos reales de ambas caras — el manifiesto `TYPERT` exportado por `index.js` y la contribución que `lib/client.js` entrega a `ctx.remote.$mount` —, recorre cada descriptor y exige que cada codec lleve una **función** `create()` y ningún miembro `schema`, nombrando el id de invocación infractor. `test/typert-mount.test.mjs` va más allá: registra ambas caras con un `@deepseek-ai/dsh-typert-registry` real sobre un `Context` real de Cordis, y luego reconstruye en memoria el codec rechazado de la línea 0.1.5 y comprueba que el registro lo rechaza — de modo que queda probado que la puerta puede fallar.

```powershell
node scripts/check-typert-codec.mjs
```

`scripts/probe-typert-codec-contract.mjs` responde a la otra mitad de la pregunta contra el host *instalado*, en lugar de contra la lectura que este repositorio hace de él: registra un codec `{ mode, typeSymbol, schema }` y un codec `create()` en ambas caras con el registro real, y comprueba que el primero se rechaza y el segundo se acepta. Ejecútalo tras subir de línea de host para volver a medir la suposición que codifica la puerta.

```powershell
pnpm run probe:typert-codec
```

Comprobar la composición del bundle del perfil Web:

```powershell
dsh --profile web --dump-config
```

La salida debería incluir:

```text
id: personal-directive
name: dsh-personal-directive
```

## Seguridad y alcance de uso

Esta edición de framework **no incluye el contenido del prompt original**: lo que se publica es una directiva de marcador de posición neutra (`prompts/personal-directive.md`); el comportamiento en tiempo de ejecución es el mismo que el de cualquier plugin de «inyección de segmento de system prompt» y solo afecta al texto de instrucciones que tú aportes.

Este proyecto no modifica los pesos del modelo ni elude las políticas de seguridad independientes del servicio remoto de modelos, los permisos del sistema operativo o los permisos reales de herramientas del Harness.

## Atribución y licencia

Este proyecto se basa explícitamente en el siguiente proyecto original:

```text
https://github.com/Minglink/dsh-infinite-gen-1
```

Debe conservarse la atribución al autor original y al proyecto original.

El `LICENSE` de la raíz de este repositorio es una declaración MIT del mantenedor de este repositorio para el código nuevo y el código de integración de este proyecto. No sustituye automáticamente los derechos de autor del proyecto original, ni implica que el prompt y el código originales del autor hayan sido relicenciados.

En el momento de preparar este proyecto no se encontró en el repositorio original ningún archivo `LICENSE` explícito ni identificación de licencia de GitHub. Por ello, esta edición de framework adopta la tercera vía de licencia indicada en el README original: **publicar solo el framework de código sin el prompt original** — `prompts/personal-directive.md` se ha sustituido por una directiva de marcador de posición neutra, y cada usuario puede aportar su propio contenido de instrucciones (la ruta original está en el enlace de GitHub anterior; verifica por tu cuenta el estado de licencia del original).

La declaración MIT de este repositorio no debe interpretarse como una autorización del autor original sobre el contenido original. Si el autor original añade una licencia más adelante, actualiza esta sección y el archivo de licencia del repositorio en consecuencia.

## Agradecimientos

Gracias al autor del proyecto original, Minglink, por aportar la implementación original y el planteamiento de prompt de `dsh-infinite-gen-1`. Este repositorio solo añade sobre esa base la gestión del directorio personal, el conmutador en tiempo de ejecución de la barra superior de Harness Web y el código de integración relacionado.
