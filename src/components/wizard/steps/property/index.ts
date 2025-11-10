// Property wizard steps
export { PropertyInfoStep } from "./info-step";
export { PropertyLocationStep } from "./location-step";
export { PropertyMediaStep } from "./media-step";

// Types and schema
export type { PropertyWizardData, PropertyStepProps } from "./types";
export { PropertyWizardSchema } from "./types";

// Validation constants
export {
	MIN_TITLE_LENGTH,
	MAX_TITLE_LENGTH,
	MIN_DESCRIPTION_LENGTH,
	MAX_DESCRIPTION_LENGTH,
	MAX_PRICE,
	MAX_SURFACE,
	MAX_BEDROOMS,
	MAX_BATHROOMS,
	MAX_CHARACTERISTICS,
	MAX_IMAGES,
	MAX_VIDEOS,
	MIN_STREET_LENGTH,
	MIN_CITY_LENGTH,
	MIN_STATE_LENGTH,
	MIN_COUNTRY_LENGTH,
	MIN_LAT,
	MAX_LAT,
	MIN_LNG,
	MAX_LNG,
} from "./types";
