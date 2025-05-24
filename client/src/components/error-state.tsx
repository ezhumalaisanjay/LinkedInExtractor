import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <Card className="shadow-sm border border-red-200 mb-8">
      <CardContent className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Analysis Failed</h3>
        <p className="text-gray-600 mb-6">
          {error || "We encountered an issue while analyzing the website. Please check the URL and try again."}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={onRetry}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 font-medium"
          >
            Try Again
          </Button>
          <Button
            variant="outline"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-6 font-medium"
          >
            Contact Support
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
