export interface Venue {
  id: string;
  name: string;
  address: string;
  capacity: number;
  status: string;
  startTime: Date;
  conflicts: Array<{
    id: string;
    type: string;
    description: string;
  }>;
  assigned: boolean;
}