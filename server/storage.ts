import { analysisResults, type AnalysisResult, type InsertAnalysisResult } from "@shared/schema";

export interface IStorage {
  getAnalysisResult(id: number): Promise<AnalysisResult | undefined>;
  getAnalysisResultByUrl(url: string): Promise<AnalysisResult | undefined>;
  createAnalysisResult(result: InsertAnalysisResult): Promise<AnalysisResult>;
  updateAnalysisResult(id: number, result: Partial<AnalysisResult>): Promise<AnalysisResult>;
}

export class MemStorage implements IStorage {
  private analysisResults: Map<number, AnalysisResult>;
  currentId: number;

  constructor() {
    this.analysisResults = new Map();
    this.currentId = 1;
  }

  async getAnalysisResult(id: number): Promise<AnalysisResult | undefined> {
    return this.analysisResults.get(id);
  }

  async getAnalysisResultByUrl(url: string): Promise<AnalysisResult | undefined> {
    return Array.from(this.analysisResults.values()).find(
      (result) => result.url === url
    );
  }

  async createAnalysisResult(insertResult: InsertAnalysisResult): Promise<AnalysisResult> {
    const id = this.currentId++;
    const result: AnalysisResult = {
      ...insertResult,
      id,
      created_at: new Date().toISOString(),
    };
    this.analysisResults.set(id, result);
    return result;
  }

  async updateAnalysisResult(id: number, updates: Partial<AnalysisResult>): Promise<AnalysisResult> {
    const existing = this.analysisResults.get(id);
    if (!existing) {
      throw new Error("Analysis result not found");
    }
    
    const updated: AnalysisResult = {
      ...existing,
      ...updates,
    };
    
    this.analysisResults.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
