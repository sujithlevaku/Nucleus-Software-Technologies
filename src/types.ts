export interface ServiceNode {
  id: string;
  name: string;
  description: string;
  businessOutcomes: string[];
  techStack: string[];
  x: number; // orbital coordinates helper
  y: number;
}

export interface MissionDossier {
  id: string;
  codeName: string;
  client: string;
  title: string;
  description: string;
  techStack: string[];
  metrics: string;
  status: 'COMPLETED' | 'ACTIVE' | 'DEPLOYED';
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  company: string;
  quote: string;
  avatarUrl?: string;
}

export interface SystemVital {
  id: string;
  label: string;
  value: string;
  status: 'ONLINE' | 'ACTIVE' | 'SECURED' | 'OPTIMAL';
  progress?: number;
}
