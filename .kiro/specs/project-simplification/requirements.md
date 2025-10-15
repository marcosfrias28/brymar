# Requirements Document

## Introduction

Il progetto è diventato eccessivamente complesso con troppi file, layer di astrazione e inconsistenze tra schemi Drizzle e modelli di dominio. L'obiettivo è semplificare drasticamente l'architettura, eliminare file non essenziali e creare una codebase più mantenibile che segue il principio KISS (Keep It Simple, Stupid).

## Requirements

### Requirement 1

**User Story:** Come sviluppatore, voglio una codebase semplificata con meno file e complessità, così posso mantenere e sviluppare il progetto più facilmente.

#### Acceptance Criteria

1. WHEN si analizza la struttura del progetto THEN si devono identificare tutti i file duplicati, non utilizzati o eccessivamente complessi
2. WHEN si eliminano i file THEN si deve mantenere solo il minimo indispensabile per il funzionamento completo
3. WHEN si riorganizza il codice THEN si devono eliminare layer di astrazione non necessari
4. WHEN si completa la semplificazione THEN il progetto deve avere almeno il 50% in meno di file

### Requirement 2

**User Story:** Come sviluppatore, voglio che gli schemi Drizzle e i modelli siano identici e congruenti, così non devo gestire mapping complessi tra layer.

#### Acceptance Criteria

1. WHEN si definiscono i modelli di dati THEN gli schemi Drizzle devono essere l'unica fonte di verità
2. WHEN si accede ai dati THEN si deve usare direttamente gli schemi Drizzle senza layer di astrazione aggiuntivi
3. WHEN si validano i dati THEN si deve usare Zod schema derivati direttamente dagli schemi Drizzle
4. WHEN si manipolano i dati THEN non ci devono essere mapping tra domain entities e database schemas

### Requirement 3

**User Story:** Come sviluppatore, voglio un'architettura semplice e diretta, così posso capire rapidamente come funziona il codice senza navigare tra troppi layer.

#### Acceptance Criteria

1. WHEN si organizza il codice THEN si deve usare una struttura piatta con massimo 2-3 layer
2. WHEN si implementano le funzionalità THEN si deve evitare il pattern Repository se non strettamente necessario
3. WHEN si scrivono le Server Actions THEN devono contenere direttamente la logica di business senza delegare a use cases
4. WHEN si gestiscono gli errori THEN si deve usare un sistema di error handling semplice e diretto

### Requirement 4

**User Story:** Come sviluppatore, voglio eliminare tutti i file di test, mock e configurazioni non essenziali, così posso concentrarmi solo sul codice che serve.

#### Acceptance Criteria

1. WHEN si pulisce il progetto THEN si devono eliminare tutti i file di test non critici
2. WHEN si rimuovono le configurazioni THEN si devono mantenere solo quelle strettamente necessarie per il funzionamento
3. WHEN si eliminano i mock THEN si deve semplificare l'approccio ai test mantenendo solo quelli essenziali
4. WHEN si completa la pulizia THEN non devono rimanere file orfani o non referenziati

### Requirement 5

**User Story:** Come sviluppatore, voglio una struttura di componenti semplificata senza troppa granularità, così posso trovare e modificare rapidamente quello che serve.

#### Acceptance Criteria

1. WHEN si riorganizzano i componenti THEN si devono accorpare componenti troppo granulari
2. WHEN si eliminano i componenti THEN si devono rimuovere quelli duplicati o non utilizzati
3. WHEN si strutturano le cartelle THEN si deve usare una gerarchia massima di 2-3 livelli
4. WHEN si completano le modifiche THEN ogni componente deve avere uno scopo chiaro e non sovrapporsi con altri

### Requirement 6

**User Story:** Come sviluppatore, voglio che il progetto funzioni completamente dopo la semplificazione, così non perdo funzionalità esistenti.

#### Acceptance Criteria

1. WHEN si eliminano i file THEN tutte le funzionalità core devono continuare a funzionare
2. WHEN si semplifica l'architettura THEN l'autenticazione deve rimanere funzionante
3. WHEN si riorganizza il codice THEN il CRUD di proprietà, terreni e blog deve funzionare
4. WHEN si completa la migrazione THEN il sistema di wizard deve rimanere operativo
