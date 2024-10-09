export interface DecarbonizationAreaData {
  name: string;
  description?: string;
  geom: string; // Geometry as a string
  parkId: number; // Add parkId field
}

export interface DecarbonizationAreaResponse {
  id: string;
  name: string;
  description?: string;
  geom: string;
  parkId: number; // Add parkId field
}