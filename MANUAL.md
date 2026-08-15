# BetterMe · Instructivo de uso

Tu dinero, tus hábitos, tus pendientes y tu día en una sola app, dentro de tu teléfono.

Este documento tiene dos partes. La primera es corta y explica cómo se usa la app
en el día a día. La segunda es la referencia completa: cada pantalla, cada botón y
las reglas exactas con las que la app calcula lo que te muestra. Léete la primera
parte hoy; la segunda consúltala cuando te haga falta.

**Sitio:** https://afearvel.github.io/betterme/ · Versión 0.1 · Agosto 2026

> Hay una versión en PDF de este mismo documento, lista para imprimir o guardar en
> iCloud Drive: [`BetterMe-Instructivo.pdf`](BetterMe-Instructivo.pdf).

---

## Índice

1. [Qué es BetterMe y dónde viven tus datos](#1--qué-es-betterme-y-dónde-viven-tus-datos)
2. [La regla de oro: dónde va cada cosa](#2--la-regla-de-oro-dónde-va-cada-cosa)
3. [Los primeros 15 minutos](#3--los-primeros-15-minutos)
4. [Cómo se usa en el día a día](#4--cómo-se-usa-en-el-día-a-día)
5. [Referencia · Dinero](#5--referencia--dinero)
6. [Referencia · Hábitos](#6--referencia--hábitos)
7. [Referencia · Pendientes](#7--referencia--pendientes)
8. [Referencia · Agenda](#8--referencia--agenda)
9. [Ajustes y respaldo](#9--ajustes-y-respaldo)
10. [Cuando algo se ve raro](#10--cuando-algo-se-ve-raro)
11. [Las reglas exactas, en una tabla](#11--las-reglas-exactas-en-una-tabla)

---

## 1 · Qué es BetterMe y dónde viven tus datos

BetterMe es una app web que vive en la pantalla de inicio de tu iPhone. Se abre como
cualquier otra app y funciona **sin internet**, porque no hay ningún servidor detrás:
todo el programa se descargó una vez a tu teléfono y ahí se quedó.

Eso tiene una consecuencia que conviene entender antes de empezar a usarla: **tus
datos viven únicamente en ese teléfono**. No hay cuenta, no hay contraseña y no hay
copia en la nube. Nadie más los puede ver — y nadie más los puede recuperar por ti.

> **Lo único que protege tus datos**
>
> En **Ajustes → Respaldo → Exportar** la app baja un archivo
> `betterme-2026-08-15.json` con absolutamente todo. Guárdalo en Archivos o iCloud
> Drive. Hazlo **una vez al mes**, o después de cualquier tarde en la que hayas
> capturado mucho. Es la única red de seguridad que existe.

La app tiene cuatro pestañas abajo, más Ajustes en la esquina de arriba:

| Pestaña | Para qué es |
| --- | --- |
| **Dinero** | Registrar gastos e ingresos, ver cuánto puedes gastar hoy, sobres y metas de ahorro. |
| **Hábitos** | Lo que se repite con un ritmo pero no tiene hora. Se palomea y ya. |
| **Pendientes** | La bandeja de cosas de una sola vez. Sin fechas límite. |
| **Agenda** | Lo que tiene hora fija, se repita o no. Más las intenciones del día. |
| **Ajustes** | Tu ingreso y ahorro mensual, y el respaldo. |

Los cuatro módulos **no se conocen entre sí**. Un pendiente no se convierte en bloque
de agenda, y un hábito no aparece en la agenda. Es a propósito: cada uno responde una
pregunta distinta y mezclarlos los volvería un revoltijo.

---

## 2 · La regla de oro: dónde va cada cosa

Esta es la única duda que te va a dar de verdad al principio, y tiene una respuesta
corta. **No preguntes «¿cada cuándo pasa?». Pregunta «¿tiene hora?».**

> **Las tres preguntas, en este orden**
>
> **1. ¿Tiene una hora fija?** → **Agenda**. Se repita o no. Una clase todos los
> martes a las 2 es Agenda, no un hábito.
>
> **2. Si no tiene hora, ¿se repite con un ritmo?** → **Hábitos**. «Tomar agua»,
> «leer 20 minutos», «gimnasio». Pasa cuando pase, pero pasa.
>
> **3. Si no tiene hora y pasa una sola vez** → **Pendientes**. «Sacar cita con el
> dentista», «cambiar el foco».

Fíjate en que **la repetición no decide nada**. Lo que decide es la hora. Un hábito en
esta app es, literalmente, «algo que hay que hacer hoy en algún momento» — si tuviera
hora dejaría de ser un recordatorio y sería una cita.

### Y sí, algo puede estar en dos lugares a la vez

El gimnasio puede ser un **hábito** («¿fui hoy?») y además un **bloque de agenda** los
martes a las 7 pm. Son dos registros distintos que no saben uno del otro: palomear el
hábito no marca el bloque, y marcar el bloque no palomea el hábito. Eso no es un
error, es la forma en que está diseñada. Si te resulta redundante, quédate con uno solo.

| Si lo que quieres es… | Va en |
| --- | --- |
| Clase de inglés, martes y jueves 2:00 pm | Agenda (se repite) |
| Comida con Ana el sábado a las 3 | Agenda (una vez) |
| Tomar 2 litros de agua, todos los días | Hábitos (diario) |
| Gimnasio lunes, miércoles y viernes | Hábitos (días fijos) |
| Rutina A / B / C que se turna día con día | Hábitos (ciclo) |
| Regar las plantas cada 3 días | Hábitos (cada N días) |
| Sacar cita con el dentista | Pendientes |
| Devolver el libro que me prestaron | Pendientes |
| Hoy quiero terminar el capítulo 3 | Agenda → intenciones |

> **La cuarta pregunta**
>
> «Hoy quiero que pase esto» — sin hora, sin ritmo, solo hoy — no es ninguna de las
> tres. Eso son las **intenciones**, arriba en la Agenda. Caben tres al día y
> desaparecen con el día. Sirven para que un día siga significando algo aunque todos
> los horarios se te caigan.

---

## 3 · Los primeros 15 minutos

Antes de usarla en serio, dedícale un rato a dejarla configurada. Solo hay una cosa
que *tienes* que hacer (el ingreso), el resto es acomodo.

### Paso obligatorio: dile cuánto ganas

1. Toca el engrane arriba a la derecha → **Ajustes**.
2. Escribe tu **ingreso mensual** aproximado. Solo pesos enteros, sin centavos ni comas.
3. Escribe tu **ahorro mensual**: lo que apartas *antes* de gastar, no lo que te sobra al final.
4. Toca **Guardar**. Abajo aparece el desglose completo de cómo llegó al número diario.

Sin este paso, la pantalla de Dinero te dirá «Falta decirle a la app cuánto ganas al
mes». Todo lo demás funciona, pero el número grande —el que de verdad usarás a
diario— no se puede calcular.

### Acomoda tus sobres

La app viene con seis sobres de ejemplo, todos en $0: **Renta**, **Transporte** y
**Servicios** como comprometidos, y **Comida**, **Antojos** y **Otros** como gasto
libre. Tócalos para ponerles tus montos reales, bórralos si no aplican, agrega los que
te falten.

> **La diferencia que más importa**
>
> Un sobre **Comprometido** se descuenta de tu ingreso *antes* de calcular cuánto
> puedes gastar al día. Un sobre de **Gasto libre** no: lo que gastes ahí sale de tu
> dinero del día a día. La renta es comprometida; los antojos no.

### Lo que puedes dejar para después

- **Hábitos, Pendientes y Agenda** arrancan vacíos y cada uno tiene un botón
  **Crear un ejemplo para ver cómo funciona**. Úsalo, mira cómo se comporta, y
  bórralo — no deja rastro.
- **Metas de ahorro**: empieza con una sola y pequeña. Ver una barra llenarse funciona
  mejor que ver tres estancadas.

### Instálala bien en el iPhone

1. Abre **afearvel.github.io/betterme** en Safari.
2. Toca los **•••** a la derecha de la barra de dirección (en iOS 26 el botón Compartir se mudó ahí).
3. Elige **Agregar a inicio**.
4. Deja **encendido** el interruptor «Abrir como app web». Esto es lo que hace que se
   abra a pantalla completa y —más importante— que tus datos no se borren cuando
   limpies el historial de Safari.

> **Lo que sí borra todo**
>
> Quitar el icono de la pantalla de inicio, cambiar o restaurar el teléfono, o que iOS
> necesite espacio desesperadamente. Borrar el historial de Safari **no** la afecta,
> siempre que la hayas agregado a inicio. Aun así: exporta tu respaldo.

---

## 4 · Cómo se usa en el día a día

Esta es la parte que importa. Si solo te llevas una página de todo el documento, que
sea esta.

### Al despertar · 30 segundos

- Abre **Agenda**. Arriba está **Lo que sigue**: qué está pasando ahora y qué viene
  después, con cuánto falta. Es lo primero que ves y suele ser lo único que necesitas saber.
- Escribe **una intención**. Una, no tres. «¿Qué haría que hoy valiera la pena?».
  Caben hasta tres, pero una escrita vale más que tres aspiracionales.
- Pasa a **Hábitos** y mira el `0 / 4` de arriba. Ya sabes qué te toca hoy y qué
  rutina cae en cada ciclo.

### Durante el día · en el momento, no después

- **Gastaste algo** → pestaña Dinero, teclea el monto, toca el sobre, **Registrar**.
  Dos toques. Hazlo ahí mismo, en la fila de la caja: lo que dejas para la noche no se
  registra nunca.
- **Se te ocurrió algo que hacer** → pestaña Pendientes, escríbelo en la caja de
  arriba, palomita del teclado. Sácalo de tu cabeza y sigue con lo tuyo.
- **Cumpliste un hábito** → palomita. También puedes marcarlo en la noche de un jalón;
  no hay horarios.
- **Terminaste un bloque de la agenda** → palomita en la fila. Los ya marcados dejan
  de aparecer en «Lo que sigue».

### En la noche · 2 minutos

- **Hábitos**: palomea lo que hiciste. Lo que no, déjalo. Nadie te va a decir nada —
  la app no tiene ningún contador de fallas.
- **Dinero**: mira el **Colchón del mes**. Positivo significa que vas por debajo de tu
  ritmo y ese margen es tuyo. Negativo significa que vas adelantado en gasto, y se
  compensa solo los próximos días.
- **Agenda**: si movieron algo de mañana, muévelo ahora que lo tienes fresco.

### El domingo · 5 minutos

- **Pendientes**: mira el número grande de arriba, «Esta semana cerraste N». Ese es el
  marcador. Lo que sigue esperando es normal; una bandeja con cosas dentro no es un
  problema.
- Lo que lleve mucho tiempo ahí y ya no quieras hacer: la app te va a ofrecer un botón
  **Ya no** a los 45 días. Úsalo sin culpa. Es una respuesta válida.
- **Agenda**: pásale el pulgar a la tira de días de la semana que viene. Los días con
  puntito tienen algo.

### Cada mes · 5 minutos

- **Ajustes → Exportar**. Guarda el archivo en iCloud Drive. Esto no es opcional.
- **Dinero → Últimos 6 meses**: mira si los egresos están comiéndose a los ingresos.
  Toca **ver tabla** si prefieres los números exactos a las barras.
- **Dinero → Ver todo →** te lleva al Historial, mes por mes, con ingresos, egresos y balance.
- Si tu ingreso cambió, actualízalo en Ajustes: todo el cálculo del gasto diario
  cuelga de ese número.

> **La forma correcta de usar esta app**
>
> Capturar toma segundos y revisar toma minutos. Si algún día te saltas todo, no pasa
> nada: no hay rachas que se rompan por no abrirla, ni porcentajes de cumplimiento que
> te esperen con malas noticias. La app está construida a propósito para que volver
> después de una semana ausente no duela.

---

## 5 · Referencia · Dinero

Es la pestaña que abre por defecto. Se lee de arriba abajo: primero registras, luego
ves las consecuencias.

### Registro rápido (lo primero de la pantalla)

1. Elige **Gasto** o **Ingreso**. Arranca siempre en Gasto.
2. Teclea el monto. El teclado numérico se abre solo. **Solo pesos enteros**: la app
   no maneja centavos en ninguna parte.
3. Si es gasto, toca el sobre. La tira se desliza de lado y siempre hay una opción **Sin sobre**.
4. Nota opcional (para que en tres semanas sepas qué fue ese gasto de $340).
5. **Registrar**.

La fecha es **hoy** automáticamente y está escondida a propósito. Si estás capturando
algo de ayer, toca **Cambiar fecha** y el botón de guardar cambiará a
**Registrar · ayer** para que no se te pase.

### «Te queda hoy»: el número grande

Así se calcula, y vale la pena entenderlo porque es el corazón de todo el módulo:

```
  Ingreso del mes
− todos los sobres Comprometidos
− tu ahorro mensual
─────────────────────────────────────────────
= libre al mes  ÷ días del mes  = tu gasto diario

Te queda hoy = gasto diario − lo que ya gastaste hoy
```

> **La trampa que hay que entender**
>
> Un gasto cuenta contra tu día si **no** está en un sobre Comprometido. Eso incluye
> los gastos marcados **Sin sobre**. Si registras la renta como «Sin sobre», te va a
> comer el gasto libre de varios días de golpe. La renta debe ir en un sobre
> Comprometido — así ya está descontada desde arriba y no te vuelve a pegar.

### El colchón del mes

Debajo del número grande. Compara lo que llevas gastado contra lo que te *tocaba*
haber gastado a estas alturas del mes:

| Si dice | Significa |
| --- | --- |
| **+$1,200** | Vas por debajo de tu ritmo planeado. Ese margen es tuyo y se acumula. |
| **−$800** | Vas por arriba de tu ritmo. Se compensa solo los próximos días — no es una deuda ni un regaño. |

Es la razón por la que un día caro no arruina el mes: el colchón mira el mes completo,
no el día suelto.

### Sobres

Un sobre es una etiqueta con presupuesto opcional. Se agrupan en dos bloques en
pantalla, **Comprometido** y **Gasto libre**, y cada uno muestra su total gastado del mes.

| Campo | Qué hace |
| --- | --- |
| **Nombre** | Lo que verás en la tira de chips al registrar. |
| **Tipo** | **Comprometido** = se resta del ingreso antes de calcular tu diario. **Gasto libre** = sale de tu dinero del día. |
| **Presupuesto** | Tope mensual, solo para ver la barra. Déjalo en **0** si no quieres tope: la barra simplemente no aparece. |

La barra de cada sobre se pone naranja al pasar el 80 % y roja al excederse. Excederte
no bloquea nada; solo se ve. Toca cualquier sobre para editarlo o borrarlo.

### Metas de ahorro

Nombre, cuánto necesitas, cuánto llevas y —opcional— una fecha objetivo. Si pones la
fecha, la app calcula el ritmo: **cuánto al mes y cuánto por semana** para llegar. Sin
fecha, solo te dice cuánto falta.

Cada meta se parte sola en cuatro hitos: **25 %, 50 %, 75 % y 100 %**. Los que ya
alcanzaste se ponen en verde. El botón **Abonar** suma dinero a la meta; es un contador
aparte y **no** registra un movimiento en tus gastos.

### Gráfica y movimientos

- **Últimos 6 meses**: barras de ingresos (azul) vs egresos (naranja). El botón
  **ver tabla** cambia a números exactos con el balance de cada mes.
- **Movimientos**: los últimos 8. Toca cualquiera para corregir monto, tipo, sobre,
  nota o fecha — o borrarlo.
- **Ver todo →** abre el **Historial**: un mes a la vez con flechas, y arriba los
  totales de ingresos, egresos y balance. No puedes avanzar más allá del mes actual.

---

## 6 · Referencia · Hábitos

Dos cosas distintas viven en esta pestaña: **hábitos sueltos** (cada uno con su
frecuencia) y **ciclos** (varias rutinas que se turnan día con día). Ninguno tiene hora.

### La tarjeta de arriba

La fecha, un `2 / 5` con lo que llevas del día, una barra y —si la tienes— tu racha de
**días completos**: días seguidos en los que cerraste absolutamente todo lo que
tocaba. Cuando cierras el día dice «Cerraste el día. Nada más que hacer».

### Hábitos sueltos

| Frecuencia | Cómo funciona |
| --- | --- |
| **Diario** | Todos los días, sin excepción. |
| **Días fijos** | Eliges los días de la semana. Debe quedar al menos uno. |
| **Cada N días** | Se cuenta desde la **fecha de inicio**, no desde la última vez que lo cumpliste. |

El campo **Empieza el** es importante: antes de esa fecha el hábito no cuenta ni para
la racha ni para el porcentaje. Si retomas algo viejo, no le pongas la fecha original o
arrastrarás meses de huecos.

Los hábitos que hoy no tocan bajan a una sección **«Hoy no tocan»**, en gris, con un
guion en lugar de palomita. **No se pueden marcar**, y es a propósito: la racha solo
debe contar los días que el propio hábito pedía.

Al editar un hábito aparece **Pausar**: deja de aparecer y de contar, pero conserva
todo su historial. Es lo que quieres en lugar de borrar cuando algo se detiene
temporalmente.

### Ciclos: rutinas que se turnan

Un ciclo es un nombre, una fecha de arranque y una **lista ordenada de rutinas**. Ese
orden *es* la rotación: primer día la 1, segundo día la 2, y así hasta volver a empezar.

> **La regla que más sorprende**
>
> **La rotación avanza con el calendario, no con lo que cumpliste.** Si hoy tocaba la
> rutina B y no fuiste, mañana toca C igual. La app no te espera. Es deliberado: así
> el ciclo refleja los días que pasaron, no una deuda que se acumula.

Para crear uno:

1. **Nuevo ciclo** → nombre, fecha de arranque, y los días de la semana en que corre.
2. **Guardar**. Hasta ahora no puedes agregar rutinas — hay que guardarlo primero.
3. Ábrelo otra vez con el engrane y usa **Nueva rutina**. Ordénalas con las flechitas ↑↓.

Cada rutina puede tener **pasos** opcionales (ejercicios, secciones, lo que sea). Si
los pones, puedes ir palomeando uno por uno y al completarlos todos la rutina se da por
hecha sola. Si no los pones, un solo toque en la palomita grande la cierra.

**Días de descanso.** Una rutina se puede marcar como **Día de descanso**. Ocupa su
lugar en la rotación y **cuenta como cumplida sola** — descansas sin romper la racha.
Así se modelan los días libres: como una rutina más, no como un hueco.

**Días que el ciclo no corre.** Si apagas el domingo, ese día el ciclo no aparece
(«Hoy no corre este ciclo. Disfruta el día libre») y **la rotación se congela** donde
iba. El lunes retoma justo donde se quedó, no se salta una.

Abajo de cada tarjeta hay una tira con **lo que viene** los próximos días, para que
sepas si mañana entrenas o descansas.

### Rachas y porcentaje

- **Hoy sin marcar nunca rompe la racha**: el día no ha terminado. Empieza a revisar desde ayer.
- Fallar reinicia el contador a 0 y ya. No hay colores de alarma ni mensajes.
- Junto a la racha actual siempre se conserva tu **mejor racha**, y el **% de
  cumplimiento de los últimos 30 días**. Esos dos números no se reinician nunca — son
  la foto honesta.

### El calendario del historial

| Color del día | Qué significa |
| --- | --- |
| **Verde lleno** | Cumpliste todo lo que tocaba. |
| **Azul a medias** | Hiciste algo, pero no todo. |
| **Solo el borde** | Tocaba algo y no marcaste nada. |
| **Gris** | Ese día no tocaba nada. No es un reproche. |

Toca cualquier día para ver el detalle: qué tocaba y qué se marcó, uno por uno.

---

## 7 · Referencia · Pendientes

Una bandeja de cosas de una sola vez. **Aquí no existen las fechas límite y nada vence
nunca.** El único tiempo que se mide es cuánto lleva esperando algo, que es
información, no un reclamo.

### Anotar

La caja de captura vive siempre abierta arriba de la pantalla. Escribe, dale a la
palomita del teclado, listo. La importancia que elegiste **se queda puesta** para lo
siguiente que anotes, así que puedes vaciar la cabeza de golpe sin volver a elegirla
cada vez.

Si necesitas más, **Anotar con nota y fecha** abre la hoja completa: nota larga,
importancia y **Esperando desde**. Ese último campo lo puedes mover hacia atrás — si
algo te lleva dando vueltas desde marzo, ponle marzo y la lista lo tratará como lo que
es. Lo que no puedes es ponerle una fecha futura.

### El orden de la lista

No hay flechas para acomodar ni números de prioridad. El orden se calcula solo con dos
datos, y en este orden:

1. **Importancia** — Alta, Normal, Baja. Las etiquetas de grupo solo aparecen si usas
   más de un nivel.
2. **Antigüedad** — dentro de cada nivel, lo más viejo hasta arriba.

Así lo viejo sube solo y la lista no se vuelve otra tarea que mantener. Cada fila dice
cuánto lleva esperando con frases como «Anotado hoy», «Desde ayer», «Lleva 3 semanas
aquí», «Lleva 2 meses aquí».

### Guardar para después

El icono del **reloj** a la derecha de cada fila. Atajos de mañana, 3 días, una semana
o un mes, o la fecha exacta que quieras.

> **Qué hace y qué no hace posponer**
>
> **Esconde** el pendiente hasta ese día, y entonces vuelve solo al mismo lugar que le
> tocaba. **No** lo marca como hecho, **no** lo borra y **no** reinicia desde cuándo
> espera. Los pospuestos viven en una sección plegada que siempre muestra cuántos son
> — nada desaparece a tus espaldas. El botón **Traer** los regresa antes de tiempo.

### La salida de los 45 días

Cuando algo lleva **45 días** esperando, su fila deja de insistir y ofrece: «Lleva rato
aquí. ¿Todavía lo quieres?» con un botón **Ya no** que lo borra sin ceremonia.

Es a propósito. Si algo lleva mes y medio ahí, lo más probable es que ya no lo quieras
hacer, y eso es una respuesta perfectamente válida. Es una salida, no un regaño.

### Lo que ya cerraste

- La sección **«Ya está»** muestra los últimos 3, con la flecha de **deshacer** siempre
  a un toque por si marcaste la fila equivocada.
- Cuando se acumulan viejos aparece un botón para **borrar los de hace más de un mes**
  de un jalón.
- El número grande de arriba es **«Esta semana cerraste N»**. Lo que falta va en gris y
  sin adjetivos: tener cosas esperando es el estado normal de una bandeja.

---

## 8 · Referencia · Agenda

Todo lo que tiene **hora fija**, se repita o no. La pantalla son dos mitades que no se
estorban: arriba las intenciones (sin hora) y abajo la línea del día.

### Moverte entre días

La tira de arriba se desliza con el pulgar; las flechas van día por día. Un **puntito**
debajo de un número significa que ese día tiene algo. Cuando no estás en hoy aparece un
enlace **Volver a hoy**. La ventana normal va de una semana atrás a un mes adelante, y
se muda sola si te vas más lejos.

### Intenciones

Hasta **tres por día**, sin hora. Cuando llenas las tres, la caja de escribir
simplemente desaparece. El tope no es decoración: una lista de veinte intenciones ya no
es una intención, es una lista de deseos.

Se palomean y se borran con la **×**. Los días pasados quedan en solo lectura: se
pueden ver, no editar.

### Lo que sigue

Solo aparece cuando estás viendo hoy. Muestra **Ahora** (lo que está en curso) y **Lo
que sigue** con cuánto falta («en 40 min», «en 2 h 15 min»). Se actualiza cada 30
segundos. Lo que ya marcaste no aparece: si terminaste temprano, la app no te lo sigue
restregando.

> **No hay notificaciones, y es a propósito**
>
> Una app web guardada en la pantalla de inicio no puede avisarte de forma confiable en
> iOS, y hacerlo bien necesitaría un servidor de push encendido las 24 horas (que
> cuesta dinero). Prometerte una alarma que a veces no suena es peor que no prometer
> nada. La solución: **«Lo que sigue»** cuando abres la app, y el botón de exportar al
> Calendario del iPhone —que sí sabe sonar— para lo que de verdad no se te puede pasar.

### Crear un bloque

El botón **Agregar un bloque** está hasta abajo. Dos interruptores deciden la forma:

| Interruptor | Qué cambia |
| --- | --- |
| **A una hora fija** | **Encendido**: eliges hora de inicio y duración (15, 30, 45 min, 1, 1½, 2 o 3 horas). **Apagado**: pasa ese día pero sin hora — cae en un grupo aparte llamado «Sin hora fija». |
| **Se repite cada semana** | **Encendido**: eliges los días, un «Desde» y un «Hasta» opcional. **Apagado**: eliges un solo día. |

Deja el «Hasta» vacío y la repetición no se acaba nunca. Ponle una fecha para un
semestre o un curso.

> **Por qué esto importa**
>
> Un bloque que se repite se guarda como una **regla**, no como una fila por semana. Un
> semestre entero de clases es **un solo registro**. Por eso nunca se te va a «acabar»
> la repetición sin avisar, y por eso cambiar la regla cambia todos los días de un jalón.

### Marcar, mover, cancelar: la hoja de la ocurrencia

La **palomita** de la izquierda de cada fila marca directo. Tocar el **nombre** abre la
hoja con todo lo demás:

| Opción | Qué hace |
| --- | --- |
| **Marcar como hecho** | Lo mismo que la palomita. Se puede marcar un día que ya pasó, sin límite de tiempo. |
| **Pásalo a otro día** | Atajos de mañana, 2 días, una semana, o la fecha que quieras. |
| **Otra hora, solo este día** | Solo en series. «Esta semana la clase es a las 4». |
| **Este día no va** | Solo en series. Cancela esa ocurrencia; la serie sigue viva. |
| **Devolverlo a como estaba** | Aparece si lo moviste o le cambiaste la hora. Deshace el parche de ese día. |
| **Editar toda la serie** | Abre el editor del bloque completo. Está separado a propósito. |

> **La distinción clave del módulo**
>
> Todo lo de esa hoja toca **solo ese día**. Cambiar la serie entera es otro botón, el
> de **Editar**, y están separados a propósito para que no muevas un semestre completo
> queriendo mover una clase.

### Un día que ya pasó

Un bloque pasado que no marcaste **se apaga**. Eso es todo lo que pasa: no se pone
rojo, no dice «no cumpliste» y no suma a ningún contador de fallas — ese contador no
existe en esta app. Lo único que aparece son dos salidas inline:

- **Sí lo hice** — lo marca tarde, sin penalización ni límite de tiempo.
- **Pásalo a hoy** — si todavía tiene sentido hacerlo.

El único número de la pantalla es **«N marcados»**. No hay porcentaje de cumplimiento
en ninguna parte de la Agenda.

### Etiquetas y avisos

Debajo del nombre de un bloque pueden aparecer marcas: que **se repite**, que fue
**movida** desde otro día, que tiene **otra hora** ese día, o que **se encima** con algo
más. Encimar es un **aviso, no un error**: la app no te lo impide ni pinta nada de
rojo, porque a veces encimar es a propósito.

### Mandarlo al Calendario del iPhone

Abre el bloque → **Editar** → **Agregar al Calendario del iPhone**. Baja un archivo y el
Calendario del teléfono pone la alarma. **Viaja la repetición** (la regla completa),
pero **no viajan los cambios sueltos** de un día concreto. Úsalo para lo que de verdad
necesita sonar.

---

## 9 · Ajustes y respaldo

### Tu dinero al mes

- **Ingreso mensual** — aproximado, pesos enteros.
- **Ahorro mensual** — lo que apartas antes de gastar.
- **Usar mis ingresos reales** — si tu ingreso varía, la app calcula con los ingresos
  que *registres* ese mes en vez del estimado. Mientras no registres ninguno, sigue
  usando el estimado, así que nunca te deja en ceros a principio de mes.

Abajo está el desglose completo, renglón por renglón, de cómo llegó a tu número diario.
Si algo no cuadra, ahí se ve exactamente en qué paso.

### Respaldo

| Botón | Qué hace |
| --- | --- |
| **Exportar** | Baja `betterme-AAAA-MM-DD.json` con **todo**: ajustes, sobres, movimientos, metas, hábitos, ciclos, rutinas, palomitas, pendientes, bloques, excepciones e intenciones. |
| **Importar** | Lee un archivo y **reemplaza todo el contenido actual**. No mezcla. |

> **Importar borra lo que hay**
>
> No es una fusión: la app limpia todas las tablas y pone lo que traiga el archivo. Si
> tienes datos nuevos desde el último respaldo, se pierden. Exporta antes de importar,
> siempre.

Los respaldos viejos sí funcionan: si el archivo es de antes de que existieran los
pendientes o la agenda, esas secciones simplemente quedan vacías y lo demás se restaura
bien.

### Cuando publiques una versión nueva

Al actualizar la app **tus datos nunca se tocan**. Lo que sí pasa es que la primera vez
que la abras verás todavía la versión vieja mientras se descarga la nueva por detrás;
**ciérrala y vuelve a abrirla** y ya aparece actualizada. Es normal y no hay nada que
arreglar.

---

## 10 · Cuando algo se ve raro

| Lo que ves | Qué está pasando |
| --- | --- |
| «Falta decirle a la app cuánto ganas al mes» | No has puesto el ingreso. Ajustes → Ingreso mensual → Guardar. |
| Publiqué un cambio y el teléfono muestra lo viejo | Normal. Cierra la app y ábrela otra vez: la primera apertura descarga la versión nueva, la segunda ya la muestra. |
| Un gasto se comió el día entero | Probablemente lo registraste **Sin sobre** o en un sobre de Gasto libre siendo un gasto comprometido. Tócalo en Movimientos y cámbiale el sobre. |
| Anoté un pendiente y ya no aparece | Puede estar pospuesto. Busca la sección plegada «N guardados para después» y toca **Traer**. |
| El ciclo dice una rutina distinta de la que esperaba | La rotación va por calendario, no por lo que cumpliste. Para recorrerla, cambia la fecha de **Empieza el** del ciclo — el historial ya marcado no se toca. |
| Un hábito no se deja marcar | Hoy no le toca (está en la sección gris «Hoy no tocan»), o está en pausa. Los días que no tocan no se pueden marcar a propósito. |
| Moví una clase al día equivocado | Ábrela y usa **Devolverlo a como estaba**. Mover dos veces no encadena mudanzas: siempre se mide desde el día original. |
| Marqué algo sin querer | Tócalo otra vez. Todas las palomitas de la app se quitan igual que se ponen; en pendientes, con la flecha de deshacer. |
| Cambié de teléfono y no está nada | Los datos de una app web no viajan de forma confiable en el respaldo de iCloud. Instala la app en el teléfono nuevo y usa **Ajustes → Importar** con tu último archivo. |
| Las fechas se ven un día adelantadas | No debería pasar: la app usa la fecha local de tu teléfono, no la universal. Si lo ves, es un error que vale la pena reportar. |

> **La regla general de esta app**
>
> Casi todo se deshace tocándolo otra vez, y nada te castiga por dejarlo pasar. Si algo
> no te deja hacer una acción, casi siempre es porque hacerla falsearía un número
> (marcar un día que no tocaba, inflar una racha). Si algo se ve apagado, es
> información, no una acusación.

---

## 11 · Las reglas exactas, en una tabla

Para cuando quieras verificar un número sin leer nada más.

### Dinero

| Regla | Detalle |
| --- | --- |
| **Gasto diario** | (ingreso − sobres Comprometidos − ahorro) ÷ días del mes, redondeado hacia abajo. |
| **Te queda hoy** | Gasto diario − lo gastado hoy en gastos que no son de sobre Comprometido. |
| **Colchón del mes** | (gasto diario × día del mes) − todo el gasto libre del mes. |
| **Nunca negativo** | El «libre al mes» no baja de 0, aunque comprometido + ahorro superen el ingreso. |
| **Montos** | Solo pesos enteros. No hay centavos en ninguna parte de la app. |
| **Metas** | Ritmo = falta ÷ meses restantes (mínimo 1 mes). Hitos automáticos al 25 / 50 / 75 / 100 %. |

### Hábitos

| Regla | Detalle |
| --- | --- |
| **Rotación de ciclos** | Avanza por calendario, nunca por cumplimiento. Se congela los días que el ciclo no corre. |
| **Descanso** | Cuenta como cumplido automáticamente. |
| **Racha** | Hoy sin marcar no la rompe. Se revisa desde ayer hacia atrás, solo los días que tocaban. |
| **Mejor racha y % 30 días** | Se conservan siempre, pase lo que pase con la racha actual. |
| **Cada N días** | Se cuenta desde la fecha de inicio, no desde la última vez cumplida. |
| **Antes de «Empieza el»** | No cuenta para nada: ni racha, ni porcentaje, ni calendario. |

### Pendientes

| Regla | Detalle |
| --- | --- |
| **Sin fechas límite** | Nada vence nunca. Solo se mide la antigüedad. |
| **Orden** | Importancia primero; dentro de cada nivel, lo más viejo arriba. |
| **Posponer** | Esconde hasta la fecha. No marca, no borra y no reinicia la antigüedad. |
| **Ofrecer soltar** | A los **45 días** esperando. |
| **Limpiar hechos** | Se ofrece borrar los cerrados hace más de **30 días**. |
| **El número grande** | Es lo que cerraste esta semana, no lo que falta. |

### Agenda

| Regla | Detalle |
| --- | --- |
| **Repetición** | Se guarda como regla semanal, no como filas. Un semestre = un registro. |
| **Excepciones** | Mover, cancelar o cambiar la hora afecta solo ese día. La regla no se toca. |
| **Identidad de un día** | Se mide desde la fecha original, así que mover dos veces no encadena mudanzas. |
| **Intenciones** | Máximo 3 por día, sin hora. Los días pasados son solo lectura. |
| **El pasado** | Se apaga y ofrece «Sí lo hice» / «Pásalo a hoy». Sin rojo, sin porcentajes, sin contador de fallas. |
| **Marcar tarde** | Permitido siempre, sin límite de tiempo ni penalización. |
| **Encimados** | Solo un aviso. La app nunca te impide agendar dos cosas a la vez. |
| **Horas** | Se guardan como hora de reloj de pared: si viajas de país, «las 9» siguen siendo las 9. |
| **Notificaciones** | No hay. Usa el .ics para que el Calendario del iPhone ponga la alarma. |

> **Lo que esta app decidió no hacer**
>
> No hay porcentajes de cumplimiento en Agenda, no hay contador de fallas en ningún
> módulo, no hay fechas límite en Pendientes y no hay colores de alarma por no marcar
> algo. Nada de eso es una funcionalidad que falte: son decisiones. La app lleva la
> cuenta de lo que sí hiciste, y del resto guarda silencio.
