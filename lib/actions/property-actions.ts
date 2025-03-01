"use server"

import { revalidatePath } from "next/cache"
import { put } from '@vercel/blob';
import { ActionState, validatedAction } from "../validations";
import { Property } from "@/utils/types/types";
import { z } from "zod";

const SellingProperties = [
  {
    "listing-img-wrapper href": "https://www.dreamingcaraibi.com/properties/spazioso-appartamento-a-tamarindo/23988183/",
    "img-fluid src": "https://www.dreamingcaraibi.com/media/gally/drc_1387/thumbig/property_1.jpg",
    "listing-name": "SPAZIOSO APPARTAMENTO A TAMARINDO",
    "listing-location": "Dominicus, Bayahibe, La Altagracia, DO",
    "listing-features-info": "1",
    "listing-features-info (2)": "1",
    "listing-features-info (3)": "74",
    "list-pr": "$169,000"
  },
  {
    "listing-img-wrapper href": "https://www.dreamingcaraibi.com/properties/monolocale-moderno-a-cadaques/96089551/",
    "img-fluid src": "https://www.dreamingcaraibi.com/media/gally/drc_1386/thumbig/property.jpg",
    "listing-name": "Monolocale moderno a CADAQUES",
    "listing-location": "Dominicus, Bayahibe, La Altagracia, DO",
    "listing-features-info": "1",
    "listing-features-info (2)": "1",
    "listing-features-info (3)": "50",
    "list-pr": "$220,000"
  },
  {
    "listing-img-wrapper href": "https://www.dreamingcaraibi.com/properties/appartamento-dominicus-centro/92589654/",
    "img-fluid src": "https://www.dreamingcaraibi.com/media/gally/drc_1384/thumbig/property.jpg",
    "listing-name": "APPARTAMENTO DOMINICUS CENTRO",
    "listing-location": "Dominicus, Bayahibe, La Altagracia, DO",
    "listing-features-info": "3",
    "listing-features-info (2)": "4",
    "listing-features-info (3)": "188",
    "list-pr": "$195,000"
  },
  {
    "listing-img-wrapper href": "https://www.dreamingcaraibi.com/properties/nuovo-progetto-corales/32032080/",
    "img-fluid src": "https://www.dreamingcaraibi.com/media/gally/drc_1383/thumbig/property_3.jpg",
    "listing-name": "NUOVO PROGETTO CORALES",
    "listing-location": "Dominicus, Bayahibe, La Altagracia, DO",
    "listing-features-info": "1",
    "listing-features-info (2)": "1",
    "listing-features-info (3)": "76",
    "list-pr": "$165,000"
  },
  {
    "listing-img-wrapper href": "https://www.dreamingcaraibi.com/properties/appartamento-con-vista-piscina-a-bayahibe/15487940/",
    "img-fluid src": "https://www.dreamingcaraibi.com/media/gally/drc_1381/thumbig/property.jpg",
    "listing-name": "APPARTAMENTO CON VISTA PISCINA A BAYAHIBE",
    "listing-location": "Bayahíbe, La Altagracia, DO",
    "listing-features-info": "1",
    "listing-features-info (2)": "1",
    "listing-features-info (3)": "64",
    "list-pr": "$77,000"
  },
  {
    "listing-img-wrapper href": "https://www.dreamingcaraibi.com/properties/appartamento-en-bayahibe/31651384/",
    "img-fluid src": "https://www.dreamingcaraibi.com/media/gally/drc_1380/thumbig/property_2.jpg",
    "listing-name": "Appartamento en bayahíbe",
    "listing-location": "Bayahíbe, La Altagracia, DO",
    "listing-features-info": "1",
    "listing-features-info (2)": "1",
    "listing-features-info (3)": "36",
    "list-pr": "$45,000"
  },
  {
    "listing-img-wrapper href": "https://www.dreamingcaraibi.com/properties/spazioso-ed-elegante-appartamento-nello-residence-estrella-dominicus/26874996/",
    "img-fluid src": "https://www.dreamingcaraibi.com/media/gally/drc_1379/thumbig/property_5.jpg",
    "listing-name": "Spazioso ed elegante appartamento nello residence Estrella Dominicus",
    "listing-location": "Dominicus, Bayahibe, La Altagracia, DO",
    "listing-features-info": "1",
    "listing-features-info (2)": "1",
    "listing-features-info (3)": "75",
    "list-pr": "$179,000"
  },
  {
    "listing-img-wrapper href": "https://www.dreamingcaraibi.com/properties/progetto-marea-beach-condo-dominicus/23478356/",
    "img-fluid src": "https://www.dreamingcaraibi.com/media/gally/drc_1378/thumbig/property.jpg",
    "listing-name": "PROGETTO MAREA BEACH CONDO DOMINICUS .",
    "listing-location": "Dominicus, Bayahibe, La Altagracia, DO",
    "listing-features-info": "1",
    "listing-features-info (2)": "1",
    "listing-features-info (3)": "59",
    "list-pr": "$99,900"
  },
  {
    "listing-img-wrapper href": "https://www.dreamingcaraibi.com/properties/appartamento-tipo-monolocale-a-cadaques/35448876/",
    "img-fluid src": "https://www.dreamingcaraibi.com/media/gally/drc_1377/thumbig/property_7.jpg",
    "listing-name": "Appartamento tipo monolocale a CADAQUES",
    "listing-location": "Dominicus, Bayahibe, La Altagracia, DO",
    "listing-features-info": "1",
    "listing-features-info (2)": "1",
    "listing-features-info (3)": "40",
    "list-pr": "$165,000"
  },
  {
    "listing-img-wrapper href": "https://www.dreamingcaraibi.com/properties/appartamento-in-residence-con-piscina/41291226/",
    "img-fluid src": "https://www.dreamingcaraibi.com/media/gally/drc_1375/thumbig/property_1.jpg",
    "listing-name": "Appartamento in residence con piscina",
    "listing-location": "Dominicus, Bayahibe, La Altagracia, DO",
    "listing-features-info": "2",
    "listing-features-info (2)": "2",
    "listing-features-info (3)": "104",
    "list-pr": "$165,000"
  },
  {
    "listing-img-wrapper href": "https://www.dreamingcaraibi.com/properties/bello-apartamento-a-dominicus/42921613/",
    "img-fluid src": "https://www.dreamingcaraibi.com/media/gally/drc_1373/thumbig/property_6.jpg",
    "listing-name": "Bello apartamento a Dominicus",
    "listing-location": "Dominicus, Bayahibe, La Altagracia, DO",
    "listing-features-info": "2",
    "listing-features-info (2)": "2",
    "listing-features-info (3)": "156",
    "list-pr": "$175,000"
  },
  {
    "listing-img-wrapper href": "https://www.dreamingcaraibi.com/properties/villa-con-piscina-a-dominicus/61560830/",
    "img-fluid src": "https://www.dreamingcaraibi.com/media/gally/drc_1372/thumbig/property_3.jpg",
    "listing-name": "VILLA CON PISCINA A DOMINICUS",
    "listing-location": "Dominicus, Bayahibe, La Altagracia, DO",
    "listing-features-info": "2",
    "listing-features-info (2)": "2",
    "listing-features-info (3)": "156",
    "list-pr": "$295,000"
  },
  {
    "listing-img-wrapper href": "https://www.dreamingcaraibi.com/properties/offerta-apartamento-bayahibe/11063750/",
    "img-fluid src": "https://www.dreamingcaraibi.com/media/gally/drc_1371/thumbig/property.jpg",
    "listing-name": "Offerta apartamento bayahibe",
    "listing-location": "Bayahíbe, La Altagracia, DO",
    "listing-features-info": "1",
    "listing-features-info (2)": "1",
    "listing-features-info (3)": "50",
    "list-pr": "$75,000"
  },
  {
    "listing-img-wrapper href": "https://www.dreamingcaraibi.com/properties/villa-moderna-con-piscina-a-bayahibe/36077536/",
    "img-fluid src": "https://www.dreamingcaraibi.com/media/gally/drc_1370/thumbig/property_2.jpg",
    "listing-name": "VILLA MODERNA CON PISCINA A BAYAHIBE",
    "listing-location": "Bayahíbe, La Altagracia, DO",
    "listing-features-info": "3",
    "listing-features-info (2)": "4",
    "listing-features-info (3)": "152",
    "list-pr": "$245,000"
  },
  {
    "listing-img-wrapper href": "https://www.dreamingcaraibi.com/properties/appartamento-in-residence-con-piscina/34729041/",
    "img-fluid src": "https://www.dreamingcaraibi.com/media/gally/drc_1368/thumbig/property.jpg",
    "listing-name": "Appartamento in residence con piscina",
    "listing-location": "Bayahíbe, La Altagracia, DO",
    "listing-features-info": "2",
    "listing-features-info (2)": "1",
    "listing-features-info (3)": "65",
    "list-pr": "$118,000"
  },
  {
    "listing-img-wrapper href": "https://www.dreamingcaraibi.com/properties/penthouse-a-bayahibe/15932192/",
    "img-fluid src": "https://www.dreamingcaraibi.com/images/placeholder-sv-1.png",
    "listing-name": "PENTHOUSE A BAYAHIBE",
    "listing-location": "Bayahíbe, La Altagracia, DO",
    "listing-features-info": "2",
    "listing-features-info (2)": "2",
    "listing-features-info (3)": "111",
    "list-pr": "$168,000"
  },
  {
    "listing-img-wrapper href": "https://www.dreamingcaraibi.com/properties/grazioso-e-moderno-appartamento-nell-eden-soficu-dominicus/26154139/",
    "img-fluid src": "https://www.dreamingcaraibi.com/images/placeholder-sv-1.png",
    "listing-name": "Grazioso e moderno appartamento nell'Eden Soficu Dominicus",
    "listing-location": "Dominicus, Bayahibe, La Altagracia, DO",
    "listing-features-info": "1",
    "listing-features-info (2)": "1",
    "listing-features-info (3)": "50",
    "list-pr": "$110,000"
  },
  {
    "listing-img-wrapper href": "https://www.dreamingcaraibi.com/properties/attico-lussuoso-e-magico-al-tracadero-beach-resort/31337405/",
    "img-fluid src": "https://www.dreamingcaraibi.com/images/placeholder-sv-1.png",
    "listing-name": "Attico Lussuoso e Magico al Tracadero Beach Resort",
    "listing-location": "Dominicus, Bayahibe, La Altagracia, DO",
    "listing-features-info": "3",
    "listing-features-info (2)": "3",
    "listing-features-info (3)": "153",
    "list-pr": "$1,000,000"
  },
  {
    "listing-img-wrapper href": "https://www.dreamingcaraibi.com/properties/appartamento-moderno-cadaques/38872215/",
    "img-fluid src": "https://www.dreamingcaraibi.com/images/placeholder-sv-1.png",
    "listing-name": "APPARTAMENTO MODERNO CADAQUES",
    "listing-location": "Dominicus, Bayahibe, La Altagracia, DO",
    "listing-features-info": "2",
    "listing-features-info (2)": "2",
    "listing-features-info (3)": "93",
    "list-pr": "$255,000"
  },
  {
    "listing-img-wrapper href": "https://www.dreamingcaraibi.com/properties/ocean-caribbean-prevendita-esclusiva/32270554/",
    "img-fluid src": "https://www.dreamingcaraibi.com/images/placeholder-sv-1.png",
    "listing-name": "OCEAN CARIBBEAN: PREVENDITA ESCLUSIVA",
    "listing-location": "Bayahíbe, La Altagracia, DO",
    "listing-features-info": "1",
    "listing-features-info (2)": "1",
    "listing-features-info (3)": "44",
    "list-pr": "$81,000"
  },
  {
    "listing-img-wrapper href": "https://www.dreamingcaraibi.com/properties/azienda-per-progetti-di-costruzione/28618369/",
    "img-fluid src": "https://www.dreamingcaraibi.com/images/placeholder-sv-1.png",
    "listing-name": "AZIENDA PER PROGETTI DI COSTRUZIONE",
    "listing-location": "La Romana, La Romana, DO",
    "listing-features-info": "1",
    "listing-features-info (2)": "1",
    "listing-features-info (3)": "10,000",
    "list-pr": "$1,125,000"
  }
]

const propertySchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(3).max(100),
  price: z.number().min(30).max(1000000),
  type: z.string().min(3).max(100),
  bedrooms: z.number().min(1).max(10),
  bathrooms: z.number().min(1).max(10),
  city: z.string().min(3).max(100),
  province: z.string().min(3).max(100),
  country: z.string().min(3).max(100),
  position: z.string().min(3).max(100),
  garage: z.boolean(),
  images: z.array(z.string().min(3).max(100)),
})

export const addProperty = validatedAction(propertySchema, async (_: ActionState, formData: FormData) => {

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = parseInt(formData.get("price") as string);
  const type = formData.get("type") as string;
  const bedrooms = parseInt(formData.get("bedrooms") as string);
  const bathrooms = parseInt(formData.get("bathrooms") as string);
  const city = formData.get("city") as string;
  const province = formData.get("province") as string;
  const country = formData.get("country") as string;
  const position = formData.get("position") as string;

  const imageUrls = []
  for (let i = 0; i < 10; i++) {
    const image = formData.get(`image${i}`) as File
    if (image) {
      try {
        const { url } = await put(`properties/${Date.now()}-${image.name}`, image, {
          access: 'public',
        });
        imageUrls.push(url)
      } catch (error) {
        return { error: "Error during image upload" };
      }

    }
  }

  // await db.insert(properties).values({
  //   title,
  //   description,
  //   price,
  //   type,
  //   images: imageUrls,
  // });

  revalidatePath("/dashboard")
  return { message: "Property added successfully!", success: true }
})

const propertySearchSchema = z.object({
  location: z.string().min(3).max(100),
  type: z.string().min(3).max(100),
  minPrice: z.number().min(30).max(1000000),
  maxPrice: z.number().min(30).max(1000000),
})

export const searchProperties = validatedAction(propertySearchSchema, async (_: ActionState, formData: FormData) => {
  try {
    // Mock data - in real app, this would be a database query
    const mockProperties: Property[] = [
      {
        id: "43NG4X",
        title: "Casa de playa en Playa Barra Salada",
        price: 2.46,
        location: "Playa Barra Salada",
        sqm: 1048,
        bedrooms: 3,
        bathrooms: 2,
        imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled-hOC9cQXcoh8eAyqhgbTX1Tvn07BGHd.png",
        type: "residential",
      },
      // Add more mock properties
    ]

    // Filter by type if specified
    // const filteredProperties = type && type !== "all" ? mockProperties.filter((p) => p.type === type) : mockProperties

    return {
      success: true,
    }
  } catch (error) {
    return {
      error: "Failed to search properties",
    }
  }
})



