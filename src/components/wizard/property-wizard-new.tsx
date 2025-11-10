"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PropertyInfoStep } from "./steps/property/info-step";
import { PropertyLocationStep } from "./steps/property/location-step";
import { PropertyMediaStep } from "./steps/property/media-step";
import { AIGenerationPanel } from "./ai-generation-panel";
import { WizardNavigation } from "./wizard-navigation";
import { WizardProgress } from "./wizard-progress";
import type { PropertyWizardData } from "./steps/property/types";
import { useUser } from "@/hooks/use-user";

export type { PropertyWizardData } from "./steps/property/types";

type PropertyWizardNewProps = {
	initialData?: Partial<PropertyWizardData>;
	onComplete?: () => void;
	onSaveDraft?: (data: PropertyWizardData) => Promise<void>;
	showDraftOption?: boolean;
};

const STEPS = [
	{
		id: "info",
		title: "Información Básica",
		component: PropertyInfoStep,
	},
	{
		id: "location",
		title: "Ubicación",
		component: PropertyLocationStep,
	},
	{
		id: "media",
		title: "Fotos y Videos",
		component: PropertyMediaStep,
	},
];

// Custom hook for wizard state management
function useWizardState(initialData: Partial<PropertyWizardData>) {
	const [data, setData] = useState<PropertyWizardData>({
		title: "",
		description: "",
		price: 0,
		surface: 0,
		propertyType: "apartment",
		bedrooms: undefined,
		bathrooms: undefined,
		coordinates: undefined,
		address: {
			street: "",
			city: "",
			state: "",
			country: "",
			postalCode: "",
		},
		characteristics: [],
		images: [],
		videos: [],
		language: "es",
		aiGenerated: {
			title: false,
			description: false,
			tags: false,
		},
		...initialData,
	});

	const handleDataChange = (newData: PropertyWizardData) => {
		setData(newData);
	};

	const handleDataUpdate = (updates: Partial<PropertyWizardData>) => {
		setData(prev => ({ ...prev, ...updates }));
	};

	return { data, setData, handleDataChange, handleDataUpdate };
}

// Custom hook for wizard navigation
function useWizardNavigation(totalSteps: number, onComplete: () => void, router: ReturnType<typeof useRouter>) {
	const [currentStep, setCurrentStep] = useState(0);

	const handleNext = () => {
		if (currentStep < totalSteps - 1) {
			setCurrentStep(currentStep + 1);
		} else {
			handleComplete();
		}
	};

	const handlePrevious = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleComplete = () => {
		toast.success("¡Propiedad creada exitosamente!");
		onComplete();
		router.push("/dashboard/properties");
	};

	return { currentStep, setCurrentStep, handleNext, handlePrevious, handleComplete };
}

// Custom hook for draft saving
function useDraftSaving(onSaveDraft?: (data: PropertyWizardData) => Promise<void>, userId?: string) {
	const [isSaving, setIsSaving] = useState(false);

	const handleSaveDraft = useCallback(async (data: PropertyWizardData) => {
		if (!onSaveDraft || !userId) {
			return;
		}
		
		setIsSaving(true);
		try {
			await onSaveDraft(data);
			toast.success("Borrador guardado exitosamente");
		} catch {
			toast.error("Error al guardar borrador");
		} finally {
			setIsSaving(false);
		}
	}, [onSaveDraft, userId]);

	return { isSaving, handleSaveDraft };
}

export function PropertyWizardNew({
	initialData = {},
	onComplete,
	onSaveDraft,
	showDraftOption = true,
}: PropertyWizardNewProps) {
	const router = useRouter();
	const { user } = useUser();
	const [isGenerating, setIsGenerating] = useState(false);

	const { data, handleDataChange, handleDataUpdate } = useWizardState(initialData);
	const { currentStep, handleNext, handlePrevious } = useWizardNavigation(STEPS.length, onComplete ?? (() => Promise.resolve()), router);
	const { isSaving, handleSaveDraft } = useDraftSaving(onSaveDraft, user?.id);

	const CurrentStepComponent = STEPS[currentStep].component;
	const showAIButtons = currentStep === 0;

	const handleSaveDraftClick = async () => {
		await handleSaveDraft(data);
	};

	return (
		<div className="space-y-6">
			{/* Progress indicator */}
			<WizardProgress
				currentStep={currentStep}
				totalSteps={STEPS.length}
				title={STEPS[currentStep].title}
			/>

			{/* AI Generation Buttons - Only show on info step */}
			{showAIButtons && (
				<AIGenerationPanel
					data={data}
					onDataUpdate={handleDataUpdate}
					userId={user?.id}
					isGenerating={isGenerating}
					onGeneratingChange={setIsGenerating}
				/>
			)}

			{/* Current step */}
			<CurrentStepComponent
				data={data}
				onChange={handleDataChange}
			/>

			{/* Navigation */}
			<WizardNavigation
				currentStep={currentStep}
				totalSteps={STEPS.length}
				onPrevious={handlePrevious}
				onNext={handleNext}
				onSaveDraft={handleSaveDraftClick}
				showDraftOption={showDraftOption}
				isSaving={isSaving}
			/>
		</div>
	);
}
