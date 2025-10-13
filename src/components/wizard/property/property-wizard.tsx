// New Property Wizard using the centralized framework

"use client";

import React from "react";
import { WizardProps } from '@/types/wizard-core';
import { PropertyWizardData } from '@/types/property-wizard';
import { Wizard } from '@/components/wizard/core/wizard';
import { propertyWizardConfig } from '@/lib/wizard/property-wizard-config';

// Property Wizard Component
export function PropertyWizard(
  props: Omit<WizardProps<PropertyWizardData>, "config">
) {
  return <Wizard config={propertyWizardConfig} {...props} />;
}

export default PropertyWizard;
