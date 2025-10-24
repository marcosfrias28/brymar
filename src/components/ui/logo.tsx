"use client";

import Link from "next/link";

const Logo = () => (
	<Link href="/" className="flex items-center px-7 py-2 text-white">
		<svg
			width="62"
			height="63"
			viewBox="0 0 63 63"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className="w-16 h-16"
		>
			<path
				className="stroke-primary"
				d="M30.3848 49.4033V25.1646L40.5494 15L50.714 25.1646L52.2778 26.7284"
				strokeWidth="11.1111"
			/>
			<path
				className="stroke-primary"
				d="M10.0557 49.4033V25.1646L20.2203 15L30.3849 25.1646V49.4033"
				strokeWidth="11.1111"
			/>
		</svg>
		<span className="font-encode-sans text-3xl font-bold -ml-4 mt-4">
			ARBRY
		</span>
	</Link>
);

export default Logo;
