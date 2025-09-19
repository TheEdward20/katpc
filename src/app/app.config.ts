    // app.config.ts
    import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
    import { provideHttpClient } from '@angular/common/http'; // Importa la función

    export const appConfig: ApplicationConfig = {
      providers: [
        provideZoneChangeDetection({eventCoalescing: true}),
        provideHttpClient() // Usa la función para proporcionar HttpClient
      ]
    };
