from datetime import datetime, timezone, timedelta
import json
from langchain.tools import tool

CITY_OFFSETS = {
    "london": 0,
    "utc": 0,
    "paris": 1,
    "berlin": 1,
    "rome": 1,
    "madrid": 1,
    "cairo": 2,
    "athens": 2,
    "dubai": 4,
    "mumbai": 5.5,
    "delhi": 5.5,
    "bengaluru": 5.5,
    "bangalore": 5.5,
    "bangkok": 7,
    "singapore": 8,
    "hong kong": 8,
    "beijing": 8,
    "tokyo": 9,
    "seoul": 9,
    "sydney": 10,
    "auckland": 12,
    "new york": -5,
    "toronto": -5,
    "chicago": -6,
    "denver": -7,
    "los angeles": -8,
    "san francisco": -8,
    "seattle": -8,
}

@tool
def get_city_time(city: str) -> str:
    """Get the current local time, timezone offset, day/night status, and standard business status for any major city.
    Args:
        city: City name (e.g. 'Tokyo', 'London', 'New York', 'Bengaluru')
    """
    clean_city = city.strip().lower()
    
    offset_hours = None
    for k, v in CITY_OFFSETS.items():
        if k in clean_city or clean_city in k:
            offset_hours = v
            break

    if offset_hours is None:
        offset_hours = 0.0 # Default UTC fallback

    now_utc = datetime.now(timezone.utc)
    target_time = now_utc + timedelta(hours=offset_hours)

    hour = target_time.hour
    is_day = 6 <= hour < 19
    day_night_symbol = "☀️ Day" if is_day else "🌙 Night"
    is_business_hours = 9 <= hour < 18 and target_time.weekday() < 5
    business_status = "Open / Active Business Hours" if is_business_hours else "After Hours / Weekend"

    sign = "+" if offset_hours >= 0 else "-"
    offset_abs = abs(offset_hours)
    hours_part = int(offset_abs)
    mins_part = int((offset_abs - hours_part) * 60)
    utc_str = f"UTC{sign}{hours_part:02d}:{mins_part:02d}"

    formatted_time = target_time.strftime("%A, %B %d, %Y - %I:%M %p")

    payload = {
        "type": "time_card",
        "city": city.title(),
        "local_time": formatted_time,
        "utc_offset": utc_str,
        "is_day": is_day,
        "business_status": business_status
    }

    return (
        f"### ⏱️ Timezone & Local Clock for {city.title()}\n"
        f"- **Local Time:** {formatted_time}\n"
        f"- **Timezone:** {utc_str}\n"
        f"- **Period:** {day_night_symbol}\n"
        f"- **Business Schedule:** {business_status}\n\n"
        f"<!-- JSON_CARD_DATA:{json.dumps(payload)} -->"
    )
