interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

export async function searchDuckDuckGo(query: string): Promise<string> {
  try {
    // Using our server endpoint
    const response = await fetch(`http://localhost:3001/api/search?q=${encodeURIComponent(query)}`);
    const html = await response.text();

    // Parse the HTML response to extract search results
    const results: SearchResult[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const resultElements = doc.querySelectorAll('.result');

    resultElements.forEach((element, index) => {
      if (index < 10) { // Only take top 10 results
        const titleElement = element.querySelector('.result__title');
        const snippetElement = element.querySelector('.result__snippet');
        const linkElement = element.querySelector('.result__url');

        if (titleElement && snippetElement && linkElement) {
          results.push({
            title: titleElement.textContent?.trim() || '',
            snippet: snippetElement.textContent?.trim() || '',
            link: linkElement.getAttribute('href') || '',
          });
        }
      }
    });

    // Format results as context for the LLM
    return formatSearchResults(results);
  } catch (error) {
    console.error('Error searching DuckDuckGo:', error);
    return '';
  }
}

function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) {
    return '';
  }

  return `Web Search Results:
${results.map((result, index) => `
${index + 1}. ${result.title}
   ${result.snippet}
   Source: ${result.link}
`).join('\n')}

Based on these search results, please provide your analysis.`;
} 