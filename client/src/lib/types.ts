import type { AnalysisResult, WebsiteData, LinkedinData } from "@shared/schema";

export interface AnalysisResponse extends AnalysisResult {}

export interface AnalysisState {
  isAnalyzing: boolean;
  activeTab: 'website' | 'linkedin';
  analysisData: AnalysisResult | null;
  error: string | null;
}

export interface SectionState {
  [sectionId: string]: boolean;
}
