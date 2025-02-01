export type OpeningHours = {
  isOpen: boolean
  morning: {
    start: string
    end: string
  }
  afternoon: {
    start: string
    end: string
  }
}

export type SocialLink = {
  platform: string
  url: string
}

export interface Category {
  id: string;
  title: string;
  services: Service[];
}

export interface Service {
  id: string;
  title: string;
  description?: string;
  duration: string;
  price: string;
}

export interface OpeningHoursRecord {
  isOpen: boolean;
  morning: {
    start: string;
    end: string;
  };
  afternoon: {
    start: string;
    end: string;
  };
}

export interface Salon {
  id: number  // Changer de string à number
  professionnel_id: string
  nom_salon: string
  adresse: string
  code_postal: string
  ville: string
  description: string | null
  created_at: string
  ouverture: Record<string, OpeningHoursRecord> | null
  note: number
  nombre_votes: number
  pricing?: PricingData | null
  types: string[] | null
  social_links: Record<string, SocialLink> | null
  hours: Record<string, string>;
  is_verified: boolean;
}

export interface RawService {
  price: number;
  duration: string;
  description?: string;
}

export interface RawPricing {
  [category: string]: {
    [serviceName: string]: RawService;
  };
}

export interface ServiceDetails {
  price: number;
  duration: string;
  description?: string;
}

export interface PricingData {
  [category: string]: {
    [service: string]: ServiceDetails;
  };
}

export type ServiceTypesValue = string[];

export type UpdateFormDataFunction = <T extends keyof Salon>(
  field: T,
  value: T extends 'service_types' ? ServiceTypesValue : Salon[T]
) => void;

