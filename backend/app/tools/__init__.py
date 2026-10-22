from backend.app.tools.weather import get_weather
from backend.app.tools.news import get_news
from backend.app.tools.places import get_city_points_of_interest
from backend.app.tools.time_tool import get_city_time
from backend.app.tools.air_quality import get_air_quality

ALL_TOOLS = [
    get_weather,
    get_news,
    get_city_points_of_interest,
    get_city_time,
    get_air_quality
]

TOOL_REGISTRY = {t.name: t for t in ALL_TOOLS}
