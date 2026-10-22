import os
import requests
import json
from langchain.tools import tool

AQI_DESCRIPTIONS = {
    1: ("Good", "🟢 Air quality is satisfactory, poses little or no health risk."),
    2: ("Fair", "🟡 Air quality is acceptable; very sensitive people should monitor outdoor exertion."),
    3: ("Moderate", "🟠 Members of sensitive groups may experience health effects."),
    4: ("Poor", "🔴 Everyone may begin to experience health effects; wear mask outdoors."),
    5: ("Very Poor", "🟣 Health alert: serious risk of respiratory symptoms for all residents.")
}

@tool
def get_air_quality(city: str) -> str:
    """Retrieve real-time Air Quality Index (AQI), PM2.5, PM10, and atmospheric pollution levels for a city.
    Args:
        city: City name (e.g. 'Tokyo', 'London', 'Delhi', 'New York')
    """
    api_key = os.getenv("OPENWEATHER_API_KEY", "").strip()
    if not api_key:
        return "Air Quality Error: OPENWEATHER_API_KEY not configured."

    try:
        # Step 1: Geocode city coordinates
        geo_url = f"https://api.openweathermap.org/geo/1.0/direct?q={city.strip()}&limit=1&appid={api_key}"
        geo_res = requests.get(geo_url, timeout=10).json()
        
        if not geo_res or not isinstance(geo_res, list):
            return f"Unable to locate coordinates for '{city}' to fetch air quality."

        lat = geo_res[0]["lat"]
        lon = geo_res[0]["lon"]
        found_name = geo_res[0].get("name", city)
        country = geo_res[0].get("country", "")

        # Step 2: Query Air Pollution API
        aqi_url = f"https://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={api_key}"
        aqi_res = requests.get(aqi_url, timeout=10).json()

        item = aqi_res.get("list", [{}])[0]
        aqi_index = item.get("main", {}).get("aqi", 2)
        components = item.get("components", {})

        pm2_5 = components.get("pm2_5", "N/A")
        pm10 = components.get("pm10", "N/A")
        no2 = components.get("no2", "N/A")
        o3 = components.get("o3", "N/A")

        aqi_label, advisory = AQI_DESCRIPTIONS.get(aqi_index, ("Moderate", "Normal precautions advised."))

        payload = {
            "type": "aqi_card",
            "city": f"{found_name}, {country}",
            "aqi": aqi_index,
            "label": aqi_label,
            "advisory": advisory,
            "pm2_5": pm2_5,
            "pm10": pm10,
            "no2": no2,
            "o3": o3
        }

        return (
            f"### 🍃 Air Quality Index for {found_name}, {country}\n"
            f"- **AQI Rating:** Level {aqi_index} / 5 ({aqi_label})\n"
            f"- **Health Advisory:** {advisory}\n"
            f"- **Fine Particulates (PM2.5):** {pm2_5} µg/m³\n"
            f"- **Coarse Particulates (PM10):** {pm10} µg/m³\n"
            f"- **Nitrogen Dioxide (NO2):** {no2} µg/m³\n\n"
            f"<!-- JSON_CARD_DATA:{json.dumps(payload)} -->"
        )
    except Exception as e:
        return f"Air quality lookup error for '{city}': {str(e)}"
