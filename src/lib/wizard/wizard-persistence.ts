// TEMPORARILY DISABLED - wizard tables were removed from schema
// TODO: Re-implement wizard persistence with new architecture

/*
Wizard persistence functionality has been temporarily disabled because the wizard tables
were removed from the database schema.
*/

// Placeholder exports to prevent import errors
export function createWizardPersistence(): any {
	throw new Error("Wizard persistence functionality temporarily disabled");
}

export function saveWizardState(): any {
	throw new Error("Wizard persistence functionality temporarily disabled");
}

export function loadWizardState(): any {
	throw new Error("Wizard persistence functionality temporarily disabled");
}

export function deleteWizardState(): any {
	throw new Error("Wizard persistence functionality temporarily disabled");
}

export class WizardPersistence {
	constructor() {
		throw new Error("Wizard persistence functionality temporarily disabled");
	}
}