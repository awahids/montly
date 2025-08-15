export type CategoryPoint = {
  category_id: string;
  category_name: string;
  planned: number;
  actual: number;
  diff: number;
};

export type ChartResponse = {
  month: string;
  type: 'expense' | 'income';
  data: CategoryPoint[];
};
