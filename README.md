# Expenses Tracker para Android

La aplicación está preparada para compilarse como APK mediante GitHub Actions.

## Publicar y generar el APK

1. Crea un repositorio nuevo en GitHub.
2. Sube todos los archivos de esta carpeta, incluido `package-lock.json`.
3. En GitHub abre la pestaña **Actions** y selecciona **Build Android APK**.
4. Pulsa **Run workflow** y espera a que termine.
5. En la ejecución completada, descarga el artefacto `expenses-tracker-debug-apk`.
6. Descomprime el artefacto e instala `app-debug.apk` en Android.

La acción también se ejecuta automáticamente al hacer push a `main` o `master`.
La APK generada es una build debug y no requiere una clave de firma para instalarla manualmente.

## Desarrollo local

```bash
npm install
npm run dev
```

Para generar el proyecto Android en un equipo con Android Studio y SDK configurados:

```bash
npm run android:add
npm run android:sync
npm run android:open
```