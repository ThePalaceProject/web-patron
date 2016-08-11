export interface PathFor {
  (collectionUrl: string, bookUrl: string): string;
}

export interface ComplaintData {
  type: string;
  detail?: string;
}