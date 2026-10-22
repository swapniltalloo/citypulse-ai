import os
import requests
import json
from typing import Dict, Any, Optional
from langchain.tools import tool

WEATHER_ICON_MAP = {
    "clear sky": "☀️",
    "few clouds": "🌤️",
    "scattered clouds": "⛅",
    "broken clouds": "☁️",
    "shower rain": "🌧️",
    "rain": "🌦️",
    "thunderstorm": "⛈️",
    "snow": "❄️",
    "mist": "🌫️",
    "fog": "🌁",
    "haze": "🌫️"
}

def _fetch_weather_raw(city: str, api_key: str, units: str = "metric") -> Dict[str, Any]:
    # Try direct city query first
    clean_city = city.strip()
    url = f"https://api.openweathermap.org/data/2.5/weather?q={clean_city}&appid={api_key}&units={units}"
    resp = requests.get(url, timeout=10)
    data = resp.json()
    
    if str(data.get("cod")) == "200":
        return data
        
    # If not found directly, try geocoding API
    geo_url = f"https://api.openweathermap.org/geo/1.0/direct?q={clean_city}&limit=1&appid={api_key}"
    geo_resp = requests.get(geo_url, timeout=10)
    geo_data = geo_resp.json()
    
    if isinstance(geo_data, list) and len(geo_data) > 0:
        lat = geo_data[0]["lat"]
        lon = geo_data[0]["lon"]
        coord_url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units={units}"
        coord_resp = requests.get(coord_url, timeout=10)
        return coord_resp.json()
        
    return data

@tool
def get_weather(city: str, units: str = "metric") -> str:
    """Get accurate real-time weather, temperature, humidity, and atmospheric conditions for any city globally.
    Args:
        city: City name (e.g. 'Tokyo', 'London', 'San Francisco', 'Bengaluru')
        units: 'metric' for Celsius (°C) or 'imperial' for Fahrenheit (°F). Defaults to 'metric'.
    """
    api_key = os.getenv("OPENWEATHER_API_KEY", "").strip()
    unit_symbol = "°C" if units == "metric" else "°F"
    speed_unit = "m/s" if units == "metric" else "mph"

    if not api_key:
        return f"Weather Error: OPENWEATHER_API_KEY is not configured in the environment."

    try:
        data = _fetch_weather_raw(city, api_key, units)
        
        if str(data.get("cod")) != "200":
            return f"Weather Error for '{city}': {data.get('message', 'City not found or API error')}"

        name = data.get("name", city)
        country = data.get("sys", {}).get("country", "")
        main = data.get("main", {})
        temp = main.get("temp", "N/A")
        feels_like = main.get("feels_like", "N/A")
        temp_min = main.get("temp_min", "N/A")
        temp_max = main.get("temp_max", "N/A")
        humidity = main.get("humidity", "N/A")
        pressure = main.get("pressure", "N/A")
        
        weather_list = data.get("weather", [{}])
        desc = weather_list[0].get("description", "Unknown").title()
        condition_main = weather_list[0].get("main", "Clear")
        icon_code = weather_list[0].get("icon", "01d")
        icon_emoji = WEATHER_ICON_MAP.get(desc.lower(), "🌤️")
        
        wind = data.get("wind", {})
        wind_speed = wind.get("speed", "N/A")
        
        coords = data.get("coord", {})
        
        structured_payload = {
            "type": "weather_card",
            "city": name,
            "country": country,
            "temp": temp,
            "feels_like": feels_like,
            "temp_min": temp_min,
            "temp_max": temp_max,
            "unit": unit_symbol,
            "description": desc,
            "condition": condition_main,
            "humidity": humidity,
            "pressure": pressure,
            "wind_speed": f"{wind_speed} {speed_unit}",
            "icon_emoji": icon_emoji,
            "icon_code": icon_code,
            "coordinates": coords
        }

        result_text = (
            f"### {icon_emoji} Real-Time Weather in {name}, {country}\n"
            f"- **Condition:** {desc}\n"
            f"- **Temperature:** {temp}{unit_symbol} (Feels like: {feels_like}{unit_symbol})\n"
            f"- **Day High / Low:** {temp_max}{unit_symbol} / {temp_min}{unit_symbol}\n"
            f"- **Humidity:** {humidity}%\n"
            f"- **Wind Speed:** {wind_speed} {speed_unit}\n"
            f"- **Atmospheric Pressure:** {pressure} hPa\n\n"
            f"<!-- JSON_CARD_DATA:{json.dumps(structured_payload)} -->"
        )
        return result_text

    except Exception as e:
        return f"Error retrieving weather for '{city}': {str(e)}"
