import { PropertyCard } from "../../property/property-card";
import Marquee from "../../ui/marquee";

const SELLING_PROPERTIES = [
  {
    id: "sadlkjnfha",
    imgSrc: "/villa/1.jpg",
    baths: 3,
    beds: 3,
    area: 100,
    price: 1000,
    location: "Dominicus, Bayahibe, La Altagracia, DO",
    name: "Villa 1",
  },
  {
    id: "4414safasd",
    imgSrc: "/villa/2.jpg",
    baths: 3,
    beds: 3,
    area: 100,
    price: 1000,
    location: "Dominicus, Bayahibe, La Altagracia, DO",
    name: "Villa 2",
  },
  {
    id: "asffqwwer",
    imgSrc: "/villa/3.jpg",
    baths: 3,
    beds: 3,
    area: 100,
    price: 1000,
    location: "Dominicus, Bayahibe, La Altagracia, DO",
    name: "Villa 3",
  },
  {
    id: "asdfas124qwer",
    imgSrc: "/villa/4.jpg",
    baths: 3,
    beds: 3,
    area: 100,
    price: 1000,
    location: "Dominicus, Bayahibe, La Altagracia, DO",
    name: "Villa 4",
  },
  {
    id: "asdfqwer",
    imgSrc: "/villa2/1.jpg",
    baths: 3,
    beds: 3,
    area: 100,
    price: 1000,
    location: "Dominicus, Bayahibe, La Altagracia, DO",
    name: "Villa 5",
  },
  {
    id: "asdfqwer413rr",
    imgSrc: "/villa2/2.jpg",
    baths: 3,
    beds: 3,
    area: 100,
    price: 1000,
    location: "Dominicus, Bayahibe, La Altagracia, DO",
    name: "Villa 6",
  },
  {
    id: "fqwer413rr",
    imgSrc: "/villa2/3.jpg",
    baths: 3,
    beds: 3,
    area: 100,
    price: 1000,
    location: "Dominicus, Bayahibe, La Altagracia, DO",
    name: "Villa 7",
  },
  {
    id: "asd2313rr",
    imgSrc: "/villa2/4.jpg",
    baths: 3,
    beds: 3,
    area: 100,
    price: 1000,
    location: "Dominicus, Bayahibe, La Altagracia, DO",
    name: "Villa 8",
  },
  {
    id: "as23411134wer",
    imgSrc: "/villa3/1.jpg",
    baths: 3,
    beds: 3,
    area: 100,
    price: 1000,
    location: "Dominicus, Bayahibe, La Altagracia, DO",
    name: "Villa 8",
  },
  {
    id: "a534gfasdf2313rr",
    imgSrc: "/villa3/2.jpg",
    baths: 3,
    beds: 3,
    area: 100,
    price: 1000,
    location: "Dominicus, Bayahibe, La Altagracia, DO",
    name: "Villa 8",
  },
  {
    id: "sadfasdavc",
    imgSrc: "/villa3/3.jpg",
    baths: 3,
    beds: 3,
    area: 100,
    price: 1000,
    location: "Dominicus, Bayahibe, La Altagracia, DO",
    name: "Villa 8",
  },
  {
    id: "sdfaskku822",
    imgSrc: "/villa3/4.jpg",
    baths: 3,
    beds: 3,
    area: 100,
    price: 1000,
    location: "Dominicus, Bayahibe, La Altagracia, DO",
    name: "Villa 8",
  },
];

export const IntroPropertiesMarquee = () => {
  return (
    <div className="flex flex-col items-center justify-center w-screen mt-20">
      <div className="h-1/3">
        <Marquee reverse>
          {SELLING_PROPERTIES.slice(
            0,
            Math.ceil(SELLING_PROPERTIES.length / 2)
          ).map(({ id, imgSrc, name, location, beds, baths, price, area }) => (
            <PropertyCard
              key={id}
              id={id}
              sqm={area}
              imageUrl={imgSrc}
              title={name}
              location={location}
              bedrooms={beds}
              bathrooms={baths}
              price={price}
            />
          ))}
        </Marquee>
      </div>
      <div className="h-1/3">
        <Marquee>
          {SELLING_PROPERTIES.slice(SELLING_PROPERTIES.length / 2).map(
            (
              { id, imgSrc, name, location, beds, baths, price, area },
              index
            ) => (
              <PropertyCard
                key={id}
                id={id}
                sqm={area}
                imageUrl={imgSrc}
                title={name}
                location={location}
                bedrooms={beds}
                bathrooms={baths}
                price={price}
              />
            )
          )}
        </Marquee>
      </div>
    </div>
  );
};
