import axios from "axios";
import { getClientId } from "./utils/clientId";

let API_BASE;

if (window.location.hostname.includes("localhost")) {
  API_BASE = "http://localhost:8080/api";
} else {
  API_BASE = "https://weatherbackend-livid.vercel.app/api";
}

const clientId = getClientId();

const api = axios.create({ baseURL: API_BASE, headers: { "X-Client-Id": clientId } });

export async function geocode(q){
  return api.get(`/weather/geocode`, { params: { city: q }});
}
export async function getCurrent(cityOrLatLon, units="metric"){
  if (cityOrLatLon.city) return api.get(`/weather/current`, { params: { city: cityOrLatLon.city, units }});
  return api.get(`/weather/current`, { params: { lat: cityOrLatLon.lat, lon: cityOrLatLon.lon, units }});
}
export async function getForecast(cityOrLatLon, units="metric"){
  if (cityOrLatLon.city) return api.get(`/weather/forecast`, { params: { city: cityOrLatLon.city, units }});
  return api.get(`/weather/forecast`, { params: { lat: cityOrLatLon.lat, lon: cityOrLatLon.lon, units }});
}

export async function getFavorites(){
  return api.get("/favorites");
}
export async function addFavorite(city){
  return api.post("/favorites", { city });
}
export async function removeFavorite(city){
  return api.delete(`/favorites/${encodeURIComponent(city)}`);
}
