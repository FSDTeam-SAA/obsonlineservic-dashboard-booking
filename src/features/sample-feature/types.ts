export interface SampleItem {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface SampleState {
  items: SampleItem[];
  selectedItem: SampleItem | null;
  loading: boolean;
  error: string | null;
}
