import { Section, Img, Link } from "@react-email/components";

export const EmailHeader = () => {
  return (
    <Section className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
      <Link
        href="https://arbry.com"
        className="flex items-center text-white no-underline"
      >
        {/* SVG Logo inline for email compatibility */}
        <div className="w-12 h-12 mr-3">
          <svg
            width="48"
            height="48"
            viewBox="0 0 63 63"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke="white"
              d="M30.3848 49.4033V25.1646L40.5494 15L50.714 25.1646L52.2778 26.7284"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              stroke="white"
              d="M10.0557 49.4033V25.1646L20.2203 15L30.3849 25.1646V49.4033"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-2xl font-bold">ARBRY</span>
      </Link>
    </Section>
  );
};