export interface Dish {
  originalName: string;
  translatedName: string;
  description: string;
  // ingredients removed for performance
  price?: string;
  estimatedYen?: number;
}

export interface MenuAnalysisResult {
  dishes: Dish[];
  cuisineType: string;
}

export enum AppState {
  IDLE = 'IDLE',
  PROCESSING_MENU = 'PROCESSING_MENU',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}
