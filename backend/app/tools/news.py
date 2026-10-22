import os
import json
from urllib.parse import urlparse
from typing import Dict, Any, List
from langchain.tools import tool
from tavily import TavilyClient

@tool
def get_news(query_or_city: str, max_results: int = 4) -> str:
    """Retrieve verified real-time news headlines, events, breaking updates, and web articles.
    Args:
        query_or_city: City name or specific query (e.g. 'Tokyo tech events', 'Paris transport updates', 'New York economy')
        max_results: Number of articles to retrieve (1 to 5, default 4)
    """
    api_key = os.getenv("TAVILY_API_KEY", "").strip()
    if not api_key:
        return "News Search Error: TAVILY_API_KEY is not configured in the environment."

    try:
        client = TavilyClient(api_key=api_key)
        clean_query = query_or_city.strip()
        if not any(k in clean_query.lower() for k in ["news", "update", "latest", "breaking", "event"]):
            search_query = f"latest news events updates in {clean_query}"
        else:
            search_query = clean_query

        response = client.search(
            query=search_query,
            search_depth="basic",
            max_results=min(max(max_results, 1), 6),
            include_domains=[]
        )

        results: List[Dict[str, Any]] = response.get("results", [])
        if not results:
            return f"No recent news articles found for '{query_or_city}'."

        articles = []
        structured_articles = []
        
        for idx, r in enumerate(results, 1):
            title = r.get("title", "Untitled News")
            url = r.get("url", "#")
            snippet = r.get("content", "").strip()
            score = r.get("score", 0.0)
            
            # Domain parsing
            domain = ""
            try:
                domain = urlparse(url).netloc.replace("www.", "")
            except Exception:
                domain = "web"

            articles.append(
                f"{idx}. **[{title}]({url})**  \n"
                f"   *Source: {domain}*  \n"
                f"   > {snippet[:220]}..."
            )
            
            structured_articles.append({
                "title": title,
                "url": url,
                "domain": domain,
                "snippet": snippet[:250],
                "score": score
            })

        structured_payload = {
            "type": "news_card",
            "query": query_or_city,
            "count": len(structured_articles),
            "articles": structured_articles
        }

        output_text = (
            f"### 📰 Real-Time News & Intelligence for: {query_or_city}\n\n"
            + "\n\n".join(articles) + "\n\n"
            + f"<!-- JSON_CARD_DATA:{json.dumps(structured_payload)} -->"
        )
        return output_text

    except Exception as e:
        return f"Error querying news for '{query_or_city}': {str(e)}"
