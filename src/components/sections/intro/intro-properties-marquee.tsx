import type { FC } from "react";
import { PropertyCard } from "../../cards/property-card";
import Marquee from "../../ui/marquee";

interface MarqueePropertyData {
	id: string;
	sqm: number;
	imageUrl: string;
	title: string;
	location: string;
	bedrooms: number;
	bathrooms: number;
	price: number;
}

const SELLING_PROPERTIES = [
	{
		id: "sadlkjnfha",
		imgSrc: "/optimized_villa/1.webp",
		baths: 3,
		beds: 3,
		area: 100,
		price: 1000,
		location: "Dominicus, Bayahibe, La Altagracia, DO",
		name: "Villa 1",
	},
	{
		id: "4414safasd",
		imgSrc: "/optimized_villa/2.webp",
		baths: 3,
		beds: 3,
		area: 100,
		price: 1000,
		location: "Dominicus, Bayahibe, La Altagracia, DO",
		name: "Villa 2",
	},
	{
		id: "asffqwwer",
		imgSrc: "/optimized_villa/3.webp",
		baths: 3,
		beds: 3,
		area: 100,
		price: 1000,
		location: "Dominicus, Bayahibe, La Altagracia, DO",
		name: "Villa 3",
	},
	{
		id: "asdfas124qwer",
		imgSrc: "/optimized_villa/4.webp",
		baths: 3,
		beds: 3,
		area: 100,
		price: 1000,
		location: "Dominicus, Bayahibe, La Altagracia, DO",
		name: "Villa 4",
	},
	{
		id: "asdfqwer",
		imgSrc: "/optimized_villa2/1.webp",
		baths: 3,
		beds: 3,
		area: 100,
		price: 1000,
		location: "Dominicus, Bayahibe, La Altagracia, DO",
		name: "Villa 5",
	},
	{
		id: "asdfqwer413rr",
		imgSrc: "/optimized_villa2/2.webp",
		baths: 3,
		beds: 3,
		area: 100,
		price: 1000,
		location: "Dominicus, Bayahibe, La Altagracia, DO",
		name: "Villa 6",
	},
	{
		id: "fqwer413rr",
		imgSrc: "/optimized_villa2/3.webp",
		baths: 3,
		beds: 3,
		area: 100,
		price: 1000,
		location: "Dominicus, Bayahibe, La Altagracia, DO",
		name: "Villa 7",
	},
	{
		id: "asd2313rr",
		imgSrc: "/optimized_villa2/4.webp",
		baths: 3,
		beds: 3,
		area: 100,
		price: 1000,
		location: "Dominicus, Bayahibe, La Altagracia, DO",
		name: "Villa 8",
	},
	{
		id: "as23411134wer",
		imgSrc: "/optimized_villa3/1.webp",
		baths: 3,
		beds: 3,
		area: 100,
		price: 1000,
		location: "Dominicus, Bayahibe, La Altagracia, DO",
		name: "Villa 8",
	},
	{
		id: "a534gfasdf2313rr",
		imgSrc: "/optimized_villa3/2.webp",
		baths: 3,
		beds: 3,
		area: 100,
		price: 1000,
		location: "Dominicus, Bayahibe, La Altagracia, DO",
		name: "Villa 8",
	},
	{
		id: "sadfasdavc",
		imgSrc: "/optimized_villa3/3.webp",
		baths: 3,
		beds: 3,
		area: 100,
		price: 1000,
		location: "Dominicus, Bayahibe, La Altagracia, DO",
		name: "Villa 8",
	},
	{
		id: "sdfaskku822",
		imgSrc: "/optimized_villa3/4.webp",
		baths: 3,
		beds: 3,
		area: 100,
		price: 1000,
		location: "Dominicus, Bayahibe, La Altagracia, DO",
		name: "Villa 8",
	},
];

export const IntroPropertiesMarquee: FC = () => {
	return (
		<div className="flex flex-col items-center justify-center w-screen mt-20">
			<div className="h-1/3">
				<Marquee reverse>
					{SELLING_PROPERTIES.slice(
						0,
						Math.ceil(SELLING_PROPERTIES.length / 2),
					).map(({ id, imgSrc, name, location, beds, baths, price, area }) => (
						<PropertyCard
							key={id}
							property={{
								id,
								title: name,
								location,
								bedrooms: beds,
								bathrooms: baths,
								price,
								area: area,
								images: [imgSrc],
								type: "residential",
							}}
						/>
					))}
				</Marquee>
			</div>
			<div className="h-1/3">
				<Marquee>
					{SELLING_PROPERTIES.slice(SELLING_PROPERTIES.length / 2).map(
						(
							{ id, imgSrc, name, location, beds, baths, price, area },
							_index,
						) => (
							<PropertyCard
								key={id}
								property={{
									id,
									title: name,
									location,
									bedrooms: beds,
									bathrooms: baths,
									price,
									area: area,
									images: [imgSrc],
									type: "residential",
								}}
							/>
						),
					)}
				</Marquee>
			</div>
		</div>
	);
};
