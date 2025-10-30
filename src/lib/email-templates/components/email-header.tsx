import { Link, Section } from "@react-email/components";

export const EmailHeader = () => {
	return (
		<Section className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
			<Link
				className="flex items-center text-white no-underline"
				href="https://arbry.com"
			>
				{/* SVG Logo inline for email compatibility */}
				<div className="mr-3 h-12 w-12">
					<svg
						fill="none"
						height="48"
						viewBox="0 0 63 63"
						width="48"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M30.3848 49.4033V25.1646L40.5494 15L50.714 25.1646L52.2778 26.7284"
							stroke="white"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="4"
						/>
						<path
							d="M10.0557 49.4033V25.1646L20.2203 15L30.3849 25.1646V49.4033"
							stroke="white"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="4"
						/>
					</svg>
				</div>
				<span className="font-bold text-2xl">ARBRY</span>
			</Link>
		</Section>
	);
};
