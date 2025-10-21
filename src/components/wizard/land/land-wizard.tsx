"use client";

import { useState } from "react";
import { Land } from "@/lib/types/lands";

interface LandWizardProps {
  onComplete?: (land: Partial<Land>) => void;
  initialData?: Partial<Land>;
}

export function LandWizard({ onComplete, initialData }: LandWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<Land>>(initialData || {});

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Land Wizard</h2>
        <p className="text-gray-600">Step {currentStep + 1} of 3</p>
      </div>

      <div className="space-y-6">
        {currentStep === 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Land Name"
                className="w-full p-3 border rounded-lg"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <textarea
                placeholder="Land Description"
                className="w-full p-3 border rounded-lg h-32"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Land Details</h3>
            <div className="space-y-4">
              <input
                type="number"
                placeholder="Area (sq ft)"
                className="w-full p-3 border rounded-lg"
                value={formData.area || ""}
                onChange={(e) =>
                  setFormData({ ...formData, area: Number(e.target.value) })
                }
              />
              <input
                type="number"
                placeholder="Price"
                className="w-full p-3 border rounded-lg"
                value={formData.price || ""}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
              />
              <select
                className="w-full p-3 border rounded-lg"
                value={formData.type || ""}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as any })
                }
              >
                <option value="">Select Land Type</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="agricultural">Agricultural</option>
              </select>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Review & Submit</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>
                <strong>Name:</strong> {formData.name}
              </p>
              <p>
                <strong>Area:</strong> {formData.area} sq ft
              </p>
              <p>
                <strong>Price:</strong> ${formData.price}
              </p>
              <p>
                <strong>Type:</strong> {formData.type}
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-6">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            {currentStep === 2 ? "Complete" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
