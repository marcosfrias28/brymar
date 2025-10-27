"use server";

// TEMPORARILY DISABLED - wizard tables were removed from schema
// TODO: Re-implement wizard functionality with new architecture

/*
All wizard functionality has been temporarily disabled because the wizard tables
were removed from the database schema. This needs to be re-implemented with a
new architecture that doesn't rely on separate wizard tables.

The following functions were available:
- saveWizardDraft
- createWizardDraft  
- getWizardDraft
- deleteWizardDraft
- publishWizard
- generateAIContent

These should be re-implemented using the existing properties, lands, and blog tables
directly, or a new simplified wizard approach.
*/

// Placeholder exports to prevent import errors
export async function saveWizardDraft(): Promise<any> {
	throw new Error("Wizard functionality temporarily disabled");
}

export async function createWizardDraft(): Promise<any> {
	throw new Error("Wizard functionality temporarily disabled");
}

export async function getWizardDraft(): Promise<any> {
	throw new Error("Wizard functionality temporarily disabled");
}

export async function deleteWizardDraft(): Promise<any> {
	throw new Error("Wizard functionality temporarily disabled");
}

export async function publishWizard(): Promise<any> {
	throw new Error("Wizard functionality temporarily disabled");
}

export async function generateAIContent(): Promise<any> {
	throw new Error("Wizard functionality temporarily disabled");
}

export async function getWizardDrafts(): Promise<any> {
	throw new Error("Wizard functionality temporarily disabled");
}

export async function loadWizardDraft(): Promise<any> {
	throw new Error("Wizard functionality temporarily disabled");
}