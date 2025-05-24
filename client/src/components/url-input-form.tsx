import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Search, Lightbulb, Shield, Brain } from "lucide-react";
import { SiLinkedin } from "react-icons/si";

interface URLInputFormProps {
  onSubmit: (url: string) => void;
  loading: boolean;
}

export default function URLInputForm({ onSubmit, loading }: URLInputFormProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  const handleExample = () => {
    setUrl("https://acmecorp.com");
  };

  return (
    <Card className="shadow-sm border border-gray-200 mb-8 animate-fade-in">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyze Any Website</h2>
          <p className="text-gray-600">
            Enter a website URL to extract and analyze content using AI-powered summarization
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Globe className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-10 py-3 text-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              disabled={loading || !url.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Search className="mr-2 h-4 w-4" />
              {loading ? "Analyzing..." : "Analyze Website"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleExample}
              disabled={loading}
              className="sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 font-medium transition-colors"
            >
              <Lightbulb className="mr-2 h-4 w-4" />
              Try Example
            </Button>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Respects robots.txt</span>
            </div>
            <div className="flex items-center space-x-1">
              <Brain className="h-4 w-4 text-blue-500" />
              <span>AI-powered analysis</span>
            </div>
            <div className="flex items-center space-x-1">
              <SiLinkedin className="h-4 w-4 text-blue-600" />
              <span>LinkedIn integration</span>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
