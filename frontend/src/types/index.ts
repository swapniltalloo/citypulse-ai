export interface ToolCall {
  id: string;
  tool_name: string;
  args: Record<string, any>;
  status: 'pending' | 'executing' | 'completed' | 'rejected' | 'failed';
  result?: string;
  execution_time_ms?: number;
}

export interface WeatherCardData {
  type: 'weather_card';
  city: string;
  country: string;
  temp: number | string;
  feels_like: number | string;
  temp_min: number | string;
  temp_max: number | string;
  unit: string;
  description: string;
  condition: string;
  humidity: number | string;
  pressure: number | string;
  wind_speed: string;
  icon_emoji: string;
  icon_code: string;
}

export interface NewsArticle {
  title: string;
  url: string;
  domain: string;
  snippet: string;
  score?: number;
}

export interface NewsCardData {
  type: 'news_card';
  query: string;
  count: number;
  articles: NewsArticle[];
}

export interface PlaceItem {
  name: string;
  category: string;
  vibe: string;
}

export interface PlacesCardData {
  type: 'places_card';
  city: string;
  places: PlaceItem[];
}

export interface TimeCardData {
  type: 'time_card';
  city: string;
  local_time: string;
  utc_offset: string;
  is_day: boolean;
  business_status: string;
}

export interface AQICardData {
  type: 'aqi_card';
  city: string;
  aqi: number;
  label: string;
  advisory: string;
  pm2_5: number | string;
  pm10: number | string;
  no2: number | string;
}

export type DynamicCard = WeatherCardData | NewsCardData | PlacesCardData | TimeCardData | AQICardData;

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tool_calls?: ToolCall[];
  cards?: DynamicCard[];
  timestamp: number;
  isStreaming?: boolean;
}

export interface Session {
  session_id: string;
  title: string;
  created_at: number;
  updated_at: number;
  message_count: number;
}

export interface PendingApproval {
  tool_call_id: string;
  tool_name: string;
  args: Record<string, any>;
  message: string;
}
