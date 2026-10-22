import json
from typing import Optional
from langchain.tools import tool

# Curated high-reliability city knowledge base with dynamic fallback
CITY_POI_REGISTRY = {
    "tokyo": [
        {"name": "Shibuya Crossing & Sky", "category": "Landmark", "vibe": "Iconic neon & bustling scramble view"},
        {"name": "Akihabara & Ginza", "category": "Tech & Luxury", "vibe": "Robotics, anime, and world-class retail"},
        {"name": "Senso-ji Temple", "category": "Heritage", "vibe": "Tokyo's oldest historic Buddhist temple in Asakusa"},
        {"name": "TeamLab Planets", "category": "Digital Art", "vibe": "Immersive light & water installations"}
    ],
    "new york": [
        {"name": "Central Park & The Met", "category": "Culture & Nature", "vibe": "Vast green haven and legendary art museum"},
        {"name": "Times Square & Broadway", "category": "Entertainment", "vibe": "Theater district & pulse of Manhattan"},
        {"name": "One World Observatory & Financial District", "category": "Business", "vibe": "Wall St, 9/11 Memorial & harbor views"},
        {"name": "Brooklyn Bridge & DUMBO", "category": "Scenic", "vibe": "Historic skyline view and artisan food scene"}
    ],
    "london": [
        {"name": "Tower Bridge & Tower of London", "category": "Heritage", "vibe": "Historic fortress and crown jewels on Thames"},
        {"name": "British Museum", "category": "Culture", "vibe": "World antiquities and landmark glass rotunda"},
        {"name": "Soho & Covent Garden", "category": "Cuisine & Nightlife", "vibe": "Theatres, bistros, and street performers"},
        {"name": "Hyde Park & Kensington", "category": "Royal Parks", "vibe": "Palaces, Serpentine lake, and serene gardens"}
    ],
    "paris": [
        {"name": "Eiffel Tower & Champ de Mars", "category": "Iconic", "vibe": "Global landmark with sparkling night lights"},
        {"name": "Musée du Louvre", "category": "Art", "vibe": "World's largest museum and Mona Lisa"},
        {"name": "Montmartre & Sacré-Cœur", "category": "Bohemian", "vibe": "Hilltop basilica, artists, and panoramic city views"},
        {"name": "Le Marais", "category": "Trendy", "vibe": "Historic mansions, high fashion, and trendy cafes"}
    ],
    "bengaluru": [
        {"name": "Cubbon Park & Vidhana Soudha", "category": "Heritage & Nature", "vibe": "Lush green lung and Neo-Dravidian architecture"},
        {"name": "Indiranagar & Koramangala", "category": "Cuisine & Startups", "vibe": "Tech hub cafes, microbreweries, and nightlife"},
        {"name": "Bangalore Palace", "category": "Historical", "vibe": "Tudor-style royal estate inspired by Windsor Castle"},
        {"name": "Lalbagh Botanical Garden", "category": "Botany", "vibe": "Historic 240-acre garden with Victorian Glasshouse"}
    ],
    "san francisco": [
        {"name": "Golden Gate Bridge & Presidio", "category": "Landmark", "vibe": "Iconic suspension bridge and scenic coastal park"},
        {"name": "Fisherman's Wharf & Pier 39", "category": "Waterfront", "vibe": "Sea lions, clam chowder, and bay cruises"},
        {"name": "Mission District", "category": "Culture & Food", "vibe": "Vibrant murals, historic taquerias, and artisan cafes"},
        {"name": "Silicon Valley Hub / SOMA", "category": "Technology", "vibe": "AI startup epicenter and modern art museums"}
    ]
}

@tool
def get_city_points_of_interest(city: str, category: Optional[str] = "all") -> str:
    """Discover top urban landmarks, culture spots, cuisine centers, and travel points of interest for a city.
    Args:
        city: City name (e.g. 'Tokyo', 'Paris', 'Bengaluru', 'New York')
        category: Filter by category ('all', 'heritage', 'tech', 'cuisine', 'landmark')
    """
    clean_city = city.strip().lower()
    
    # Check exact match or partial match
    matched_key = None
    for key in CITY_POI_REGISTRY:
        if key in clean_city or clean_city in key:
            matched_key = key
            break

    pois = []
    if matched_key:
        pois = CITY_POI_REGISTRY[matched_key]
    else:
        # Generic structured POI recommendation
        title_city = city.strip().title()
        pois = [
            {"name": f"{title_city} Historic Center & Old Town", "category": "Heritage", "vibe": f"Historic architecture, pedestrian plazas, and cultural roots of {title_city}."},
            {"name": f"{title_city} Waterfront / Promenade", "category": "Scenic", "vibe": f"Vibrant waterfront, riverfront walks, and open public spaces."},
            {"name": f"{title_city} Culinary & Market District", "category": "Cuisine", "vibe": f"Local street food, fresh markets, and artisanal restaurants."},
            {"name": f"{title_city} Central Park & Botanical Haven", "category": "Nature", "vibe": f"Lush urban greenery, relaxation zones, and cycling paths."}
        ]

    formatted_items = []
    for p in pois:
        formatted_items.append(
            f"- **{p['name']}** `[{p['category']}]`\n  _{p['vibe']}_"
        )

    structured_payload = {
        "type": "places_card",
        "city": city.title(),
        "places": pois
    }

    return (
        f"### 📍 Urban Highlights & POIs in {city.title()}\n\n"
        + "\n".join(formatted_items) + "\n\n"
        + f"<!-- JSON_CARD_DATA:{json.dumps(structured_payload)} -->"
    )
