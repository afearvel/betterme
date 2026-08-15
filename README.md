# BetterMe

App personal de hábitos, agenda y finanzas. Vive **completa dentro del navegador**:
no hay servidor, no hay base de datos remota, no hay cuenta que crear y no cuesta nada
mantenerla. Los datos se guardan en IndexedDB, la base de datos que el propio navegador
le da a cada sitio.

Estado actual: **los cuatro módulos terminados** — Dinero, Hábitos, Pendientes y Agenda —
más el **patrimonio**: la app sabe cuánto dinero tienes en total, cuánto está apartado en
metas y cuánto sigue libre.

### Qué va en cada módulo

Las tres pestañas se parecen lo suficiente como para dudar. La regla es **una sola
pregunta, y se hace en este orden**:

| Pregunta | Si la respuesta es sí… |
| --- | --- |
| 1. ¿Tiene **hora fija**? | **Agenda** — se repita o no |
| 2. Si no, ¿se repite con un **ritmo**? | **Hábitos** — diario, ciertos días, cada N días |
| 3. Si no, es de **una sola vez** | **Pendientes** |

La pregunta que manda es la primera: **la hora**. Un hábito NO tiene horario; es un
recordatorio de algo que hay que hacer en el día, y la única pregunta que responde es
"¿lo hiciste?". En cuanto algo tiene una hora concreta —un evento, una clase, una rutina
a las 7— es Agenda, **aunque se repita todas las semanas**.

- "Tomar 2 L de agua" → hábito. Todos los días, sin hora.
- "Clase de inglés, cada martes y jueves a las 7" → agenda. Se repite, pero tiene hora.
- "Comida con Ana el jueves a las 2" → agenda.
- "Sacar cita con el dentista" → pendiente: en cuanto la sacas, deja de existir.

Una misma cosa puede vivir en dos lados sin conflicto: "gimnasio" puede ser un hábito
(¿fui hoy?) y además un bloque de agenda los martes a las 7 (¿a qué hora?). Ninguno de
los dos sabe del otro, y está bien así.

Lo que ya hace el módulo de Dinero:

- Registro rápido de gastos e ingresos, con fecha de hoy por defecto y opción de "ayer"
  o cualquier otra fecha sin salir de la pantalla.
- Tocar cualquier movimiento para corregirlo: monto, tipo, sobre, nota y fecha.
- Sobres digitales separados en comprometido y gasto libre.
- Gasto libre diario con "colchón" acumulado del mes, en vez de un límite que se rompe.
- Metas de ahorro con sub-hitos al 25/50/75/100 % y el ritmo necesario por mes y por semana.
- Gráfica de ingresos vs. egresos de los últimos 6 meses (con vista de tabla).
- Historial completo navegable mes por mes.
- Ingreso fijo estimado o, si lo activas en Ajustes, cálculo con tus ingresos reales del mes.
- Respaldo: exportar e importar todo en un archivo `.json`.

Lo que hace el módulo de Hábitos:

- **Ciclos rotativos A / B / C**: varias rutinas que se turnan, una por día. La rotación
  la manda el calendario, no lo que cumpliste — si te saltas B, mañana toca C igual.
- Días de descanso como parte de la rotación: ocupan su turno y cuentan como cumplidos,
  así descansas sin romper la racha.
- Cada ciclo puede correr solo ciertos días de la semana (por ejemplo lunes, miércoles y
  viernes); los demás días la rotación se congela donde iba.
- Rutinas con pasos opcionales (ejercicios, secciones). Al palomear todos, la rutina se
  marca sola.
- **Hábitos sueltos** con su propia frecuencia: diario, días fijos de la semana, o cada N días.
- Marcado sin horario: un toque, cuando sea del día. No hay hora límite ni recordatorios.
- **Rachas sin penalización**: fallar reinicia el contador y nada más. Se guarda tu mejor
  racha y el porcentaje de los últimos 30 días. Si hoy todavía no marcas algo, la racha
  no se rompe: el día no ha terminado.
- Historial en calendario mensual, con el detalle de cualquier día.

Lo que hace el módulo de Pendientes:

- **Tareas de una sola vez, sin fechas límite.** Aquí nada vence. Lo único que se
  mide es cuánto lleva esperando cada cosa desde que la anotaste: "lleva 12 días
  aquí", nunca "12 días de retraso".
- Anotar cuesta un toque: la caja de captura vive siempre abierta arriba de la
  pantalla. El resto (nota, importancia, desde cuándo) se acomoda después.
- **Orden automático**: primero la importancia que tú pusiste (alta / normal / baja)
  y, dentro de cada nivel, lo que lleva más tiempo esperando. No hay que arrastrar
  nada ni mantener una lista ordenada a mano.
- **Guardar para después**: esconde un pendiente hasta la fecha que elijas y lo
  regresa solo ese día. No lo marca, no lo borra y no reinicia su antigüedad. El
  contador de cuántos hay guardados siempre se ve.
- **Soltar sin culpa**: a los 45 días, la fila deja de insistir y ofrece un botón
  para borrarlo. Que algo lleve mes y medio ahí casi siempre significa que ya no lo
  quieres hacer, y esa también es una respuesta.
- Lo que cerraste se queda a la vista, con deshacer a un toque, y el número grande
  de la pantalla es cuántas cosas cerraste esta semana — no cuántas te faltan.

Lo que hace el módulo de Agenda:

- **Hasta tres intenciones del día**, sin hora. Responden "¿qué haría que hoy valiera
  la pena?". Son máximo tres a propósito: una lista de veinte intenciones ya no es una
  intención. Viven arriba de la línea de tiempo, así que si el día se desordena y todos
  los horarios se caen, esa mitad sigue en pie.
- **Bloques con hora**, con duración, y también **bloques sin hora fija** ("pasar a la
  farmacia") que se agrupan aparte en vez de colarse en la línea de tiempo fingiendo un
  horario que no tienen.
- **Repetición semanal** para lo que tiene hora fija y vuelve cada semana: "cada martes y
  jueves a las 7, desde agosto y hasta diciembre". Se guarda como **una sola fila**.
- **Cambios sueltos sin tocar la serie**: mover solo esa clase a otro día, ponerle otra
  hora solo ese día, o cancelar solo ese día. La regla no se entera.
- **El pasado no regaña.** Un bloque de ayer que no marcaste se apaga y ya: no se pone
  rojo, no dice "no cumpliste" y no suma a ningún contador de fallas — ese contador no
  existe en esta app. Aparecen dos salidas: **"Sí lo hice"** (marcar tarde, sin
  penalización y sin límite de tiempo) y **"Pásalo a hoy"**. No hay porcentaje de
  cumplimiento en ninguna pantalla de este módulo.
- **"Lo que sigue"**: al abrir la app en el día de hoy, lo primero que ves es qué está
  pasando ahora y qué viene después, con cuánto falta.
- **Aviso de encimados**, no bloqueo: si dos bloques se pisan te lo dice en gris y ya.
  A veces encimar es a propósito.
- **Sin notificaciones, y con una salida honesta**: cada bloque se puede mandar al
  Calendario del iPhone como archivo `.ics` (ver más abajo el porqué).

---

## Correrla en tu computadora

Necesitas [Node.js](https://nodejs.org) (versión 20 o más nueva).

```bash
npm install     # solo la primera vez
npm run dev
npm run prueba  # revisa toda la lógica pura: hábitos, pendientes y agenda (sin navegador)
```

Abre la dirección que imprime la terminal (`http://localhost:5173`).

Como `npm run dev` usa `--host`, también imprime una dirección tipo
`http://192.168.1.x:5173`. Esa la puedes abrir desde tu iPhone **estando en la misma
red WiFi y con la compu prendida** — sirve para probar rápido, pero no es la forma
final de usarla (ver abajo).

---

## Ponerla en tu iPhone (gratis, y funciona en la calle)

La idea: subir los archivos ya compilados a un hosting estático gratuito. Un hosting
estático solo entrega archivos; no ejecuta nada, no guarda nada, y por eso no cuesta.

1. Crea un repositorio en GitHub y sube esta carpeta.
2. En el repo: **Settings → Pages → Source: GitHub Actions**, y elige el flujo de Vite
   (o sube la carpeta `dist/` a una rama `gh-pages`).
3. Cuando termine, te da una URL tipo `https://tuusuario.github.io/betterme/`.
4. Abre esa URL **en Safari** del iPhone → botón Compartir → **Agregar a inicio**.

Desde ese momento tienes un ícono que abre a pantalla completa, sin barra de Safari,
y que funciona sin internet porque el service worker guardó la app en el teléfono.

> **Tiene que ser `https://`.** iOS no permite instalar apps web ni guardar la caché
> sobre `http://`, y por eso servirla desde tu PC en la red local no funciona bien.
> GitHub Pages ya trae HTTPS incluido.

---

## Lo importante que debes saber

**Los datos viven en un solo dispositivo.** Si usas la app en el iPhone, los datos están
en el iPhone. Abrirla en la compu te da una app vacía: no se sincronizan, porque no hay
servidor entre ambos.

**Respalda seguido.** En *Ajustes → Exportar* baja un `.json` con todo. Guárdalo en
Archivos o iCloud. Si borras datos de Safari, desinstalas la app de la pantalla de
inicio o cambias de teléfono, ese archivo es tu única manera de recuperar el historial.
*Importar* lo restaura.

Dato a favor: iOS borra el almacenamiento de sitios que no visitas en 7 días, **pero
no el de las apps agregadas a la pantalla de inicio**. Por eso vale la pena instalarla
en lugar de dejarla como pestaña.

---

## Cómo está organizado

```
src/
  db/db.js                 Esquema de IndexedDB y todas las operaciones de datos
  lib/format.js            Dinero y fechas
  lib/finance.js           Las cuentas del mes: gasto libre diario, sobres, ritmo de metas
  lib/patrimonio.js        El total, lo apartado, lo libre y las reglas de reparto
  lib/habits.js            Rotación de ciclos, frecuencias, rachas y cumplimiento
  lib/todos.js             Antigüedad, posponer y orden de los pendientes
  lib/agenda.js            Horas, repetición, excepciones, "lo que sigue" y .ics
  components/              Piezas reutilizables (Card, Button, Sheet, Bar…)
  screens/                 Una pantalla por pestaña
  features/finanzas/       Las piezas del módulo de Dinero
  features/habitos/        Las piezas del módulo de Hábitos
  features/pendientes/     Las piezas del módulo de Pendientes
  features/agenda/         Las piezas del módulo de Agenda
pruebas-patrimonio.mjs     Pruebas de la lógica del patrimonio
pruebas-habitos.mjs        Pruebas de la lógica de hábitos
pruebas-pendientes.mjs     Pruebas de la lógica de pendientes
pruebas-agenda.mjs         Pruebas de la lógica de agenda
prueba-navegador.mjs       Prueba en Chromium real: migración v4→v5 y el recorrido completo
```

`npm run prueba` corre los cuatro archivos de pruebas, uno tras otro (172 casos).

Regla que se sostiene sola: **`lib/` no sabe que existe React**. Son funciones que
reciben números y regresan números, así que puedes leerlas y corregirlas sin pelearte
con la interfaz.

### Reglas de datos

- **El dinero siempre es un entero de pesos.** Nada de centavos ni decimales.
- Cada registro trae `id` (uuid) y `updatedAt`, por si algún día quieres sincronizar
  entre dispositivos sin rehacer el esquema.
- **El esquema de Dexie va por escalones.** `version(1)` es dinero, `version(2)` es
  hábitos, `version(3)` es pendientes, `version(4)` es agenda, `version(5)` es la
  bitácora de las metas (`goalMoves`). Al agregar un módulo se
  escribe un bloque `version(n)` nuevo con **solo las tablas nuevas**; nunca se edita un
  bloque anterior, o la base que ya está en el teléfono se rompe al abrir la app.
- Dato curioso por si lo ves en las herramientas del navegador: Dexie guarda en
  IndexedDB la versión **multiplicada por 10**. El `version(5)` del código se ve como
  versión 50 en el navegador. No está roto, es así a propósito (deja hueco por si hace
  falta un escalón intermedio).
- **Las horas se guardan como texto `'HH:MM'` de 24 horas con cero adelante**, en un
  campo aparte de la fecha, y la duración en minutos enteros. Nunca un instante
  absoluto. El porqué está abajo.
- **Los booleanos que necesiten índice se guardan como 1 / 0**, no como
  `true` / `false`: IndexedDB no sabe indexar booleanos. Por eso `active` en hábitos
  y `done` en pendientes son números.
- Al agregar una tabla hay que extender `exportBackup` e `importBackup` y subir el
  `version` del respaldo (va en **5**). La importación tolera respaldos viejos: si el
  archivo no trae una tabla, esa tabla simplemente queda vacía. Un respaldo de la v1,
  v2, v3 o v4 se restaura sin reventar; a un respaldo viejo con metas se le siembra su
  bitácora al importarlo.

### Cómo se cuenta tu dinero (patrimonio)

Toda la app de Dinero se apoya en tres números y una regla:

```
total    = saldo inicial + todos los ingresos − todos los gastos
apartado = suma de lo guardado en TODAS las metas
libre    = total − apartado
```

- El **saldo inicial** (Ajustes → *Tu punto de partida*) es el dinero que ya tenías el
  día que empezaste a usar la app. No es un ingreso: no sale en los movimientos ni en la
  gráfica del mes. Sin él, el total arrancaría en $0 y solo sería correcto dentro de
  varios años.
- Son **todos** los movimientos desde siempre, no los del mes. Eso lo separa del resto
  del módulo, que sí piensa en meses.
- **Apartar no es gastar.** Abonar a una meta no mueve dinero a ningún lado: le pone una
  etiqueta. Por eso abonar nunca cambia el total, solo el reparto.

**La regla de oro: no puedes repartir dinero que no existe.** La suma de lo apartado
nunca puede pasarse del total, así que abonar está topado al dinero libre. Y esa
validación **no vive en el formulario**: vive en `abonarMeta` dentro de `db.js`, que
rehace la cuenta leyendo la base dentro de la misma transacción que va a escribir. Si
viviera en la pantalla, bastaría con dejar dos pestañas abiertas para apartar dos veces
el mismo dinero.

Los tres movimientos que puede tener una meta, y en qué se diferencian:

| Movimiento | Qué hace | ¿Cambia tu total? |
| --- | --- | --- |
| **Abonar** | dinero libre pasa a estar apartado | no |
| **Retirar** | lo apartado vuelve a estar libre | no |
| **Usar meta** | ya lo gastaste: registra el gasto Y vacía lo apartado | **sí, baja** |

`usarMeta` hace las dos cosas de forma atómica a propósito: si lo hicieras a mano en dos
pasos y se te olvidara uno, las cuentas quedarían chuecas para siempre.

Lo apartado (`goal.saved`) **no se puede escribir a mano** desde ninguna pantalla —
`updateGoal` descarta ese campo. Solo se mueve por los tres caminos de arriba, que son
los que revisan el tope. Cada uno deja una línea en `goalMoves`, la bitácora que ves al
abrir la meta.

**Un gasto que se pasa del dinero libre no se bloquea.** Ya pasó en la vida real, y
obligarte a mentirle a la app sería peor que el problema. Lo que hace es subir una hoja
que te dice cuánto falta y te ofrece tres salidas: sacar la diferencia de la meta que tú
elijas (si la meta no alcanza sola, la hoja se queda abierta con el faltante ya
actualizado y tomas el resto de otra), cambiar el monto, o cancelar. Al fondo queda un
"registrarlo de todos modos" para cuando de verdad quieras dejar tu dinero libre en rojo.

Cuando la cuenta sí se descuadra —borrar un ingreso viejo, bajar el saldo inicial— el
dinero libre se pinta en negativo y la app te dice cuánto retirar para volver a cuadrar.
Nunca inventa un número bonito para tapar el problema.

### Cómo se calcula tu gasto libre diario

```
comprometido = suma de los sobres marcados como "fijo"
libre del mes = ingreso mensual − comprometido − ahorro mensual
diario        = libre del mes ÷ días del mes
```

El **colchón** compara lo que llevas gastado contra lo que te tocaba haber gastado a
estas alturas del mes. Positivo = vas holgado. Negativo = vas adelantado, pero nada se
bloquea ni se pone en rojo permanente: solo se ve.

### Cómo se decide qué rutina toca hoy

```
días activos transcurridos = cuántos días "de trabajo" del ciclo van desde su fecha
                             de arranque hasta hoy
posición = días activos transcurridos MÓDULO cantidad de rutinas
```

`MÓDULO` es el residuo de la división: con 3 rutinas, el día 7 da `7 % 3 = 1`, o sea la
segunda rutina. Es toda la fórmula. Nota que **en ningún lado aparece si cumpliste o no**:
por eso la rotación nunca se atora esperándote.

Cambiar la fecha de arranque o los días activos de un ciclo recorre qué rutina cae en cada
día, hacia adelante y hacia atrás. Lo que ya marcaste no se borra: las palomitas están
guardadas por rutina y fecha, no por posición.

### Cómo se cuentan las rachas

Se recorren los días hacia atrás y **solo cuentan los días en que la cosa tocaba**. Un
hábito de lunes y jueves no se rompe por no hacerlo un martes. La racha se corta en el
primer día que tocaba y no cumpliste.

La única excepción es hoy: si hoy toca y aún no lo marcas, no se considera fallo y la
cuenta empieza desde ayer. En cuanto lo palomees, hoy suma.

### Cómo se ordenan los pendientes

Cada pendiente guarda un campo `since` con la fecha desde la que espera. **No es una
fecha límite** — nombrarlo `dueDate` habría sido el primer paso para acabar con
"vencido" en rojo, que es justo lo que esta app no hace. `since` mide antigüedad.

```
orden = importancia (alta, normal, baja)
        y dentro de cada nivel, más días esperando = más arriba
```

Solo con esos dos datos la lista se acomoda sola: no hay flechas para subir y bajar
ni números de prioridad que mantener. Lo viejo flota hacia arriba sin que hagas nada.

Un pendiente puede estar en tres estados, y son excluyentes:

| Estado | Cómo se guarda | Qué pasa |
| --- | --- | --- |
| esperando | `done: 0` y sin `snoozeUntil` futuro | sale en la bandeja |
| guardado para después | `snoozeUntil` > hoy | se esconde y vuelve solo ese día |
| hecho | `done: 1` y `doneAt` con la fecha | pasa a "Ya está", con deshacer |

Posponer **no** toca `since`: si algo lleva 20 días esperando y lo guardas una
semana, al volver sigue llevando 27, no 7. Esconderlo no es empezar de cero.

Como un pendiente se hace una sola vez, no hay tabla de historial: basta `doneAt` con
la última (y única) fecha en la que se cerró.

### Por qué la hora es texto y no un instante

La tentación es guardar un `Date` o un número de milisegundos. Para esta app es un error:
un instante absoluto **se mueve si el teléfono cambia de zona horaria**. Si anotas
"desayuno a las 9:00" y viajas a otro país, el bloque saltaría solo a las 7:00. Pero tú
no querías decir "un momento del tiempo universal", querías decir "cuando el reloj marque
las 9".

Guardando el texto `'09:00'`, la hora es lo que dice el reloj de pared, esté donde esté el
teléfono. Es la misma razón por la que las fechas son `'AAAA-MM-DD'`.

El cero adelante no es cosmético:

```
'09:00' < '14:30'   ✅  el orden alfabético ES el cronológico
 '9:00' > '14:30'   ❌  el texto compara carácter por carácter, y '9' es mayor que '1'
```

Se guarda en 24 horas y se **muestra** en 12 (`2:30 pm`), porque así se lee la hora en
México. Es normal elegir un formato para guardar (el que ordena bien) y otro para la
pantalla (el que se lee bien).

La duración se guarda en minutos en vez de una hora de fin: mover un bloque conserva su
largo sin recalcular nada, y evita el caso feo de un bloque que cruza la medianoche. Si
uno se pasara de las 23:59, se corta ahí: un bloque que cruza el día son **dos** bloques.

### Cómo se guarda algo que se repite

Un bloque tiene dos formas posibles, y el campo `repite` (1 / 0) dice cuál:

| `repite` | Cómo se guarda | Ejemplo |
| --- | --- | --- |
| `0` | `date` con un día suelto | "Comida con Ana el 20 de agosto a las 2" |
| `1` | `weekdays` + `startDate` + `endDate` opcional | "Cada martes y jueves a las 7, todo el semestre" |

**Una serie es UNA fila**, aunque dure un semestre: los días se calculan al pintar la
pantalla, no se escriben en la base. La alternativa —generar de golpe seis meses de
filas— llena la base de miles de registros y, peor, **se te acaba sin avisar** el día que
llegas al final.

### Cómo se guarda "esta semana la clase es a las 4"

El bloque dice lo que pasa **en teoría**. La tabla `blockDays` dice lo que pasó **de
verdad** un día concreto: si lo marcaste, si lo moviste, si lo cancelaste o si ese día
cambió de hora.

La identidad de una ocurrencia es la pareja **(bloque, fecha original)**. Aunque muevas la
clase del martes al miércoles, su excepción sigue viviendo en el martes; así, si la mueves
otra vez, no se arman cadenas de mudanzas.

Solo existen filas de los días que tocaste. **Un semestre de clases sin cambios no ocupa
ni una sola fila** en `blockDays`. Es la misma idea de `checks` en hábitos: se guarda lo
que hiciste, no lo que dejaste de hacer.

Un caso que ya está resuelto: si mueves una clase y después cambias los días de la serie
de modo que el día original ya no existía, la mudanza queda huérfana y simplemente no se
dibuja, en vez de aparecer un evento fantasma.

### Cómo se ve el pasado (la decisión más importante del módulo)

Un bloque de un día que ya pasó y que no marcaste **se apaga y ya**. No hay rojo, no hay
la palabra "no cumpliste", y no existe ningún contador de fallas ni porcentaje de
cumplimiento en todo el módulo. Lo único que aparecen son dos salidas:

- **"Sí lo hice"** — marcar tarde, sin penalización y sin fecha de caducidad.
- **"Pásalo a hoy"** — por si sigue teniendo sentido hacerlo.

El pasado es material de trabajo, no un expediente en tu contra. Hay una prueba
automática que recorre todas las variantes de texto de estado y **revienta si alguna vez
aparece** "no cumpliste", "fallaste", "atrasado", "vencido" o similares, para que no se
cuele en un descuido dentro de seis meses.

### Por qué no hay recordatorios

Esta app es una web guardada en la pantalla de inicio del iPhone. Ahí las notificaciones
**no son confiables**: en iOS solo existen si la app está instalada, y además harían falta
un servidor de push encendido las 24 horas, que cuesta dinero y rompe la regla de
presupuesto cero. Prometerte una alarma que a veces no suena es peor que no prometer nada.

Lo que sí hace la app, que es honesto:

1. Al abrir el día de hoy, lo primero que ves es **qué está pasando ahora y qué sigue**.
2. Cada bloque tiene un botón que baja un archivo **`.ics`** para el **Calendario del
   iPhone**, que sí sabe avisar y ya vive en tu teléfono. Si el bloque se repite, viaja
   la regla completa (una `RRULE`), no cuarenta eventos sueltos.

En el `.ics` la hora va **sin zona horaria** (lo que el estándar llama "hora flotante"),
igual que la guardamos nosotros: las 2 son las 2 marque lo que marque el reloj del mundo.
Lo que **no** viaja al calendario son los cambios sueltos de un día; el archivo lleva la
regla, no los parches.
