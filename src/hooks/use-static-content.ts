"use client";

import { useEffect, useState } from "react";
import {
	type ContactInfo,
	getContactInfo,
	getPageSection,
	getPageSections,
	type PageSection,
} from "@/lib/config/static-content";

// Hook for contact information
export function useContactInfo() {
	const [contactInfo, setContactInfo] = useState<ContactInfo[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Simulate async loading for consistency
		const loadData = async () => {
			await new Promise((resolve) => setTimeout(resolve, 50));
			setContactInfo(getContactInfo());
			setLoading(false);
		};

		loadData();
	}, []);

	return {
		data: contactInfo,
		contactInfo, // Alias for backward compatibility
		loading,
		error: null,
	};
}

// Hook for contact info by type
export function useContactInfoByType(type: ContactInfo["type"]) {
	const { data: allContactInfo, loading } = useContactInfo();

	const contactInfo = allContactInfo.filter((info) => info.type === type);

	return {
		data: contactInfo,
		contactInfo, // Alias for backward compatibility
		loading,
		error: null,
	};
}

// Hook for contact info value by type
export function useContactInfoValue(type: ContactInfo["type"], fallback = "") {
	const { data: contactInfo } = useContactInfoByType(type);

	const info = contactInfo[0]; // Get first item of this type
	return info?.value || fallback;
}

// Hook for multiple contact info values
export function useContactInfoValues(types: ContactInfo["type"][]) {
	const { data: allContactInfo, loading } = useContactInfo();

	const values = types.reduce(
		(acc, type) => {
			const info = allContactInfo.find((item) => item.type === type);
			acc[type] = info?.value || "";
			return acc;
		},
		{} as Record<string, string>
	);

	return {
		data: values,
		loading,
		error: null,
	};
}

// Hook for page sections
export function useSections(page: string) {
	const [sections, setSections] = useState<PageSection[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadData = async () => {
			await new Promise((resolve) => setTimeout(resolve, 50));
			setSections(getPageSections(page));
			setLoading(false);
		};

		loadData();
	}, [page]);

	return {
		data: sections,
		sections, // Alias for backward compatibility
		loading,
		error: null,
	};
}

// Hook for a specific page section
export function useSection(page: string, section: string) {
	const [sectionData, setSectionData] = useState<PageSection | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadData = async () => {
			await new Promise((resolve) => setTimeout(resolve, 50));
			setSectionData(getPageSection(page, section));
			setLoading(false);
		};

		loadData();
	}, [page, section]);

	return {
		data: sectionData,
		section: sectionData, // Alias for backward compatibility
		loading,
		error: null,
	};
}

// Backward compatibility exports
export { useSections as usePageSections };
export { useSection as usePageSection };

// Helper functions (maintaining backward compatibility)
export function getContactInfoByTypeHelper(
	contactInfo: ContactInfo[],
	type: ContactInfo["type"]
): ContactInfo[] {
	return contactInfo.filter((info) => info.type === type);
}

export function getContactInfoValueHelper(
	contactInfo: ContactInfo[],
	type: ContactInfo["type"],
	fallback = ""
): string {
	const info = contactInfo.find((info) => info.type === type);
	return info?.value || fallback;
}
