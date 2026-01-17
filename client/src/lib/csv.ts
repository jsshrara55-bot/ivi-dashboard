import Papa from 'papaparse';

export async function fetchCsvData<T>(url: string): Promise<T[]> {
  const response = await fetch(url);
  const csvText = await response.text();
  
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as T[]);
      },
      error: (error: Error) => {
        reject(error);
      }
    });
  });
}

export interface IVIScore {
  CONT_NO: string;
  Company_Name?: string;
  Sector?: string;
  Region?: string;
  H_score: number;
  E_score: number;
  U_score: number;
  IVI_Score: number;
  Risk_Category: string;
}

export interface FuturePrediction {
  CONT_NO: string;
  IVI_Score: number;
  Risk_Category: string;
  Retained: number;
  Improvement_Factor: number;
  Future_IVI_Score: number;
  Future_Retention_Probability: number;
}

export interface Recommendation {
  CONT_NO: string;
  Risk_Category: string;
  IVI_Score: number;
  Recommendations: string;
}

export interface FeatureImportance {
  Feature: string;
  Importance: number;
}
