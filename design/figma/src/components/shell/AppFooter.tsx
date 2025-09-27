import { Button } from '../ui/button';
import { ExternalLink } from 'lucide-react';

const BUILD_VERSION = 'v1.2.3-alpha';
const BUILD_DATE = '2024-01-15';

export function AppFooter() {
  const handleEvidenceLink = () => {
    // Mock evidence retention link
    window.open('/evidence', '_blank');
  };

  return (
    <footer className="border-t bg-muted/30 px-6 py-3" role="contentinfo">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span>Build {BUILD_VERSION}</span>
          <span>•</span>
          <span>{BUILD_DATE}</span>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleEvidenceLink}
          className="text-muted-foreground hover:text-foreground"
        >
          Evidence Retention
          <ExternalLink className="ml-1 h-3 w-3" />
        </Button>
      </div>
    </footer>
  );
}