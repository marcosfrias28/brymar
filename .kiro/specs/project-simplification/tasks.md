# Implementation Plan

- [-] 1. Backup e analisi iniziale

  - Creare backup completo del progetto con git tag
  - Testare TUTTE le funzionalità esistenti (dashboard, profile, frontend, wizard)
  - Mappare file critici utilizzati da dashboard/profile/frontend
  - _Requirements: 1.1, 6.1, 6.2, 6.3, 6.4_

- [ ] 2. Eliminazione sicura file di test

  - Rimuovere `coverage/` directory
  - Eliminare file `*.test.*` e `__tests__/` SOLO se non referenziati
  - Mantenere test critici per auth e funzionalità core
  - Verificare funzionalità dopo ogni eliminazione
  - _Requirements: 4.1, 1.1_

- [ ] 3. Semplificazione e deduplicazione DDD

  - Identificare classi duplicate con nomi diversi ma stessa funzione
  - Consolidare entities/models duplicati in una singola implementazione
  - Rimuovere repository/service classes che fanno la stessa cosa
  - Mantenere struttura DDD ma eliminare duplicazioni
  - Unificare interfaces simili in una sola per evitare ripetizioni
  - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3_

- [ ] 4. Consolidamento componenti

  - Accorpare componenti duplicati per property/land/blog/wizard
  - Eliminare componenti non utilizzati (SOLO dopo verifica)
  - Mantenere TUTTI i componenti utilizzati in dashboard/profile
  - Semplificare struttura cartelle componenti
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 5. Unificazione dati e validazioni

  - Unificare schemi Drizzle e modelli DDD per evitare duplicazioni
  - Creare validazioni Zod derivate da schemi Drizzle
  - Eliminare tipi duplicati mantenendo coerenza DDD
  - Consolidare error handling in un sistema unificato
  - _Requirements: 2.1, 2.2, 2.3, 3.3_

- [ ] 6. Pulizia configurazioni

  - Rimuovere configurazioni Jest multiple
  - Eliminare script di test non utilizzati
  - Semplificare `package.json` scripts
  - Aggiornare path alias in `tsconfig.json`
  - _Requirements: 4.2, 4.3, 1.1_

- [ ] 7. Test finale e verifica
  - Test completo di TUTTE le funzionalità
  - Verifica performance e build time
  - Documentazione cambiamenti
  - Conferma rollback disponibile
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 1.4_
