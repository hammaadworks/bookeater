import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
});

export const Mermaid: React.FC<{ chart: string }> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && chart) {
      const renderChart = async () => {
        try {
          // Clear previous render to prevent duplication issues
          containerRef.current!.innerHTML = '';
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, chart);
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
        } catch (err) {
          console.error("Mermaid parsing error", err);
          if (containerRef.current) {
            containerRef.current.innerHTML = '<div class="text-red-500 text-xs bg-red-50 p-2 rounded">Failed to render diagram</div>';
          }
        }
      };
      renderChart();
    }
  }, [chart]);

  return <div ref={containerRef} className="flex justify-center my-4 overflow-x-auto" />;
};
