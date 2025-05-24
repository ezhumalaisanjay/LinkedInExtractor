import { Card, CardContent } from "@/components/ui/card";
import { Brain } from "lucide-react";

interface LoadingStateProps {
  show: boolean;
}

export default function LoadingState({ show }: LoadingStateProps) {
  if (!show) return null;

  return (
    <Card className="shadow-sm border border-gray-200 mb-8 animate-slide-up">
      <CardContent className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Website</h3>
        <p className="text-gray-600 mb-6">Please wait while we extract and process the content...</p>

        <div className="space-y-3 max-w-md mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Fetching homepage content</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-700">Discovering internal pages</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
            <span className="text-sm text-gray-600">Analyzing with AI</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
            <span className="text-sm text-gray-600">Processing LinkedIn data</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
