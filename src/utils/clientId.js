export function getClientId(){
  let id = localStorage.getItem("weather_client_id");
  if (!id){
    id = cryptoRandomId();
    localStorage.setItem("weather_client_id", id);
  }
  return id;
}
function cryptoRandomId(len=24){
  const arr = new Uint8Array(len);
  if (typeof crypto !== "undefined" && crypto.getRandomValues){
    crypto.getRandomValues(arr);
  } else {
    for (let i=0;i<len;i++) arr[i] = Math.floor(Math.random()*256);
  }
  return Array.from(arr).map(b=>b.toString(16).padStart(2,"0")).join("");
}
