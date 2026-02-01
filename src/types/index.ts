export interface Doctor {
    id: number;
    name: string;
    specialty: string;
    experience: string;
    rating: number;
    reviews: number;
    languages: string[];
    distance: string;
    clinic: string;
    availability: string;
    cost: string;
    acceptingNew: boolean;
    videoVisit: boolean;
  }
  
  export interface UrgencyResult {
    urgency: 'Emergency' | 'Doctor Visit' | 'Home Care';
    recommendation: string;
    providerType: string;
    symptoms: string;
  }