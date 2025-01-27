export type Salon = {
    id: string
    nom_salon: string
    adresse: string
    description: string
    code_postal: string
    ville: string
    image_url?: string
    facebook?: string
    instagram?: string
    twitter?: string
    social_links?: { platform: string; url: string }[]
}

