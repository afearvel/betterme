# Cómo publicar un cambio

Guía rápida para cuando le agregues algo a BetterMe y quieras que llegue al
teléfono. Todo se hace desde PowerShell, parado en la carpeta `betterme`.

```powershell
cd C:\Users\Fernando\Desktop\BetterMe\betterme
```

---

## El ciclo completo: cuatro comandos

```powershell
npm run prueba
git add .
git commit -m "Describe aquí lo que cambiaste"
git push
```

Eso es todo. En 1-2 minutos el sitio se actualiza solo.

---

## Qué hace cada uno y por qué está ahí

### 1. `npm run prueba`

Corre las 132 pruebas en tu máquina, **antes** de subir nada.

No es obligatorio (el workflow las vuelve a correr en GitHub), pero aquí tardan
2 segundos y allá tardan 2 minutos. Es más barato enterarte ahora.

Si algo falla, arréglalo antes de continuar. No subas código roto ni con la
intención de arreglarlo en el siguiente commit: el historial es más útil cuando
cada commit funciona por sí solo.

### 2. `git add .`

Mete en la caja (el *staging area*) todo lo que cambiaste, respetando el
`.gitignore`.

Antes de correrlo vale la pena mirar qué vas a incluir:

```powershell
git status --short
```

Cada línea trae una letra al inicio:

| Símbolo | Significa |
|---------|-----------|
| `??`    | archivo nuevo, git no lo conocía |
| ` M`    | archivo que ya existía y modificaste |
| ` D`    | archivo que borraste |

Si aparece algo que no esperabas, revísalo antes de agregarlo.

### 3. `git commit -m "..."`

Cierra la caja y la archiva en el historial con tu mensaje.

**Escribe mensajes que te sirvan a ti en seis meses.** No a otra persona: a ti,
cuando algo se rompa y estés buscando cuándo se rompió.

    Bien:  "Arregla el cálculo de racha cuando el mes cambia"
    Bien:  "Agrega filtro por sobre en el historial de gastos"
    Mal:   "cambios"
    Mal:   "update"
    Mal:   "asdf"

### 4. `git push`

Manda los commits a GitHub. Tres palabras, sin argumentos: eso quedó
configurado la primera vez con `-u origin main`.

El push despierta el workflow automáticamente. No hay que hacer nada más.

---

## Qué pasa después del push

GitHub te presta una computadora Linux y sigue la receta de
`.github/workflows/deploy.yml`:

    instalar dependencias  →  correr las 132 pruebas  →  compilar  →  publicar

Lo puedes ver en vivo: https://github.com/afearvel/betterme/actions

- 🟡 **Punto amarillo** — está trabajando. Tarda 1-2 minutos.
- 🟢 **Palomita verde** — publicado. Ya está en el aire.
- 🔴 **Tache rojo** — algo falló. Haz clic en el paso rojo para ver el error.

**Si sale rojo, el sitio NO se actualiza.** Tu teléfono se queda con la versión
anterior, la que sí funcionaba. Eso es a propósito: prefieres una app vieja que
sirve a una nueva que truena.

---

## Cómo llega al teléfono

Aquí está el detalle que confunde a todos, así que vale la pena entenderlo.

El service worker está configurado como `autoUpdate`. Eso significa que **no
tienes que reinstalar nada ni borrar la app**. Pero tampoco es instantáneo:

1. Abres BetterMe en el iPhone. Se muestra la versión que ya tenía guardada
   (por eso abre rápido y funciona sin internet).
2. **Mientras la usas**, en segundo plano detecta que hay una versión nueva y
   la descarga.
3. La siguiente vez que la abras, ya estás en la versión nueva.

O sea: **casi siempre necesitas abrir la app dos veces** para ver el cambio. La
primera abre la vieja y descarga la nueva; la segunda muestra la nueva.

### Si no aparece el cambio

1. Cierra BetterMe por completo (deslízala fuera del multitareas).
2. Ábrela otra vez. Espera unos segundos.
3. Ciérrala de nuevo y ábrela.

Si después de eso sigue igual, revisa en Actions que el workflow haya salido
verde de verdad.

**Tus datos nunca se tocan en una actualización.** El service worker reemplaza
los archivos de la app; IndexedDB, donde viven tus gastos y hábitos, es otra
cosa completamente distinta y ni se entera.

---

## Comandos útiles para cuando algo se ve raro

```powershell
git log --oneline
```
El historial, un commit por línea. Para ver qué has hecho y cuándo.

```powershell
git status
```
En qué estado está todo: qué cambiaste, qué está en la caja, si estás al
corriente con GitHub.

```powershell
git diff
```
Las líneas exactas que cambiaste y todavía no agregas. Lo que se quitó sale con
`-` y lo que se puso con `+`. Útil para revisarte a ti mismo antes de commitear.

```powershell
git restore NOMBRE-DEL-ARCHIVO
```
Deshace los cambios de un archivo y lo regresa a como estaba en el último
commit. **Ojo: no se puede deshacer.** Úsalo cuando rompiste algo y prefieres
empezar de nuevo.

---

## Reglas para no meterte en problemas

**El repositorio es PÚBLICO.** Nunca metas dentro de la carpeta `betterme`:

- El JSON de respaldo que exportas desde Ajustes (tiene tus datos reales)
- Contraseñas, tokens o llaves de cualquier servicio
- Cualquier cosa que no quieras que lea un desconocido

Una vez que algo se sube, queda en el historial de git **aunque después lo
borres**. Sacarlo de verdad requiere reescribir la historia, que es un lío.
Es mucho más fácil no meterlo.

**Haz commits pequeños y seguidos.** Un commit por cosa que terminas, no uno
gigante al final del día. Así, cuando algo se rompa, el `git log` te dice
exactamente qué cambio lo rompió.

**Respalda tus datos aparte.** Git respalda tu *código*. Tus *datos* viven solo
en el iPhone — exporta el JSON desde Ajustes una vez al mes y guárdalo en
iCloud Drive.
