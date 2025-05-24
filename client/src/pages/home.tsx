import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import URLInputForm from "@/components/url-input-form";
import LoadingState from "@/components/loading-state";
import AnalysisResults from "@/components/analysis-results";
import ErrorState from "@/components/error-state";
import type { AnalysisResponse, AnalysisState } from "@/lib/types";

export default function Home() {
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isAnalyzing: false,
    activeTab: 'website',
    analysisData: null,
    error: null,
  });
  const [currentAnalysisId, setCurrentAnalysisId] = useState<number | null>(null);

  // Poll for analysis result
  const { data: analysisResult, isLoading: isPolling } = useQuery({
    queryKey: ['/api/analysis', currentAnalysisId],
    enabled: !!currentAnalysisId && analysisState.isAnalyzing,
    refetchInterval: (data) => {
      // Stop polling if analysis is complete or failed
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
  });

  // Analysis mutation
  const analysisMutation = useMutation({
    mutationFn: async (url: string): Promise<AnalysisResponse> => {
      // Use Netlify function endpoint in production
      const endpoint = import.meta.env.PROD ? '/.netlify/functions/analyze' : '/api/analyze';
      const response = await apiRequest('POST', endpoint, { url });
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentAnalysisId(data.id);
      setAnalysisState(prev => ({
        ...prev,
        isAnalyzing: true,
        error: null,
      }));
    },
    onError: (error) => {
      setAnalysisState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: error instanceof Error ? error.message : 'Analysis failed',
      }));
    },
  });

  // Update analysis state when result changes
  useEffect(() => {
    if (analysisResult) {
      if (analysisResult.status === 'completed') {
        setAnalysisState(prev => ({
          ...prev,
          isAnalyzing: false,
          analysisData: analysisResult,
          error: null,
        }));
      } else if (analysisResult.status === 'failed') {
        setAnalysisState(prev => ({
          ...prev,
          isAnalyzing: false,
          error: analysisResult.error_message || 'Analysis failed',
        }));
      }
    }
  }, [analysisResult]);

  const handleAnalyze = (url: string) => {
    analysisMutation.mutate(url);
  };

  const handleRetry = () => {
    if (analysisResult?.url) {
      handleAnalyze(analysisResult.url);
    }
  };

  const handleTabChange = (tab: 'website' | 'linkedin') => {
    setAnalysisState(prev => ({
      ...prev,
      activeTab: tab,
    }));
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-globe text-white text-sm"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">WebScraper AI</h1>
                <p className="text-xs text-gray-600">Intelligent Website & LinkedIn Analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900 transition-colors">
                <i className="fas fa-question-circle"></i>
              </button>
              <button className="text-gray-600 hover:text-gray-900 transition-colors">
                <i className="fas fa-cog"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <URLInputForm 
          onSubmit={handleAnalyze} 
          loading={analysisState.isAnalyzing} 
        />

        <LoadingState show={analysisState.isAnalyzing} />

        {analysisState.error && !analysisState.isAnalyzing && (
          <ErrorState 
            error={analysisState.error} 
            onRetry={handleRetry} 
          />
        )}

        {analysisState.analysisData && !analysisState.isAnalyzing && !analysisState.error && (
          <AnalysisResults
            data={analysisState.analysisData}
            activeTab={analysisState.activeTab}
            onTabChange={handleTabChange}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-globe text-white text-sm"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900">WebScraper AI</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Intelligent website analysis powered by AI. Extract, analyze, and summarize web content with ease.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                  <i className="fab fa-github"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                  <i className="fab fa-linkedin"></i>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900 transition-colors">Website Analysis</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">LinkedIn Integration</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">AI Summarization</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Bulk Processing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Status Page</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-6 text-center">
            <p className="text-sm text-gray-600">
              © 2024 WebScraper AI. All rights reserved. | 
              <a href="#" className="hover:text-gray-900 transition-colors"> Privacy Policy</a> | 
              <a href="#" className="hover:text-gray-900 transition-colors"> Terms of Service</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
