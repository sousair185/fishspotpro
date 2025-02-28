
export interface FishingSpot {
  id: string;
  name: string;
  description: string;
  coordinates: [number, number];
  type: 'river' | 'lake' | 'sea' | 'dam' | 'establishment';
  species: string[];
  createdBy: string;
  createdAt: string;
  images?: string[];
  reactions?: any[];
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
}

// Dados iniciais para teste
export const initialSpots: FishingSpot[] = [
  {
    id: '1',
    name: 'Lago Paranoá',
    description: 'Ótimo local para pesca de tucunaré e tilápia',
    coordinates: [-47.8739, -15.8305],
    type: 'lake',
    species: ['Tucunaré', 'Tilápia'],
    createdBy: 'sistema',
    createdAt: new Date().toISOString(),
    status: 'approved'
  },
  {
    id: '2',
    name: 'Represa de Três Marias',
    description: 'Local perfeito para pesca de dourado',
    coordinates: [-45.2597, -18.2128],
    type: 'dam',
    species: ['Dourado', 'Piranha'],
    createdBy: 'sistema',
    createdAt: new Date().toISOString(),
    status: 'approved'
  }
];
