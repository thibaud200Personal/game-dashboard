import { Alert, AlertTitle, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  darkMode?: boolean;
}

export const ErrorFallback = ({ error, resetErrorBoundary, darkMode = true }: ErrorFallbackProps) => {
  return (
    <div className={darkMode ? "min-h-screen bg-slate-900 text-white flex items-center justify-center p-4" : "min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center p-4"}>
      <div className="w-full max-w-md">
        <Alert variant="destructive" className={darkMode ? "mb-6" : "mb-6 bg-red-50 border-red-200 text-red-700"}>
          <AlertTitle>Runtime Error</AlertTitle>
          <AlertDescription>
            Something unexpected happened while running the application.
          </AlertDescription>
        </Alert>
        
        <div className={darkMode ? "bg-slate-800 border border-red-500 rounded-lg p-4 mb-6" : "bg-white border border-red-200 rounded-lg p-4 mb-6"}>
          <h3 className={darkMode ? "font-semibold text-sm text-red-400 mb-2" : "font-semibold text-sm text-red-700 mb-2"}>Error Details:</h3>
          <pre className={darkMode ? "text-xs text-red-300 bg-slate-900 p-3 rounded border overflow-auto max-h-32" : "text-xs text-red-700 bg-red-50 p-3 rounded border overflow-auto max-h-32"}>
            {error.message}
          </pre>
        </div>
        
        <Button 
          onClick={resetErrorBoundary} 
          className={darkMode ? "w-full bg-slate-700 hover:bg-slate-600" : "w-full bg-red-100 hover:bg-red-200 text-red-700"}
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
};
