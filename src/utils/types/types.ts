import { ReactNode } from "react";

export type Field = {
  id: string;
  name: string;
  type: string;
  placeholder?: string;
  label: string;
  children: string;
  required?: boolean;
};

export type SignFormTranslationsType = {
  signin: {
    en: SignInForm;
    es: SignInForm;
    it: SignInForm;
  };
  signup: {
    en: SignUpForm;
    es: SignUpForm;
    it: SignUpForm;
  };
};

export type SignInForm = {
  title: string;
  subtitle: string;
  fields: Field[];
  signIn: string;
  forgotPassword: string;
  noAccount: string;
  createAccount: string;
  loading: string;
};

export type SignUpForm = {
  title: string;
  subtitle: string;
  fields: Field[];
  signUp: string;
  alreadyHaveAccount: string;
  signIn: string;
  loading: string;
};

export interface BetterCallAPIError {
  status: string;
  headers: {
    cookies: null | string;
    [key: string]: any;
  };
  body: {
    message: string;
    code: string;
  };
  cause: {
    message: string;
    code: string;
  };
}

export interface Street {
  name: string;
  sector: string;
  city: string;
}

export interface City {
  name: string;
  sectors: string[];
  streets?: Street[];
}

export interface Province {
  name: string;
  cities: City[];
}

export type LocationData = {
  provinces: Province[];
};

export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  sqm: number;
  bedrooms: number;
  bathrooms: number;
  imageUrl: string;
  type: "residential" | "commercial" | "land";
  description: string;
}
