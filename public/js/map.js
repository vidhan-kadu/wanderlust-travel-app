console.log(listing.geometry);
var map = L.map("map").setView(
  [listing.geometry.coordinates[1], listing.geometry.coordinates[0]],
  13
);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 20,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

console.log(listing.geometry.coordinates);

//latitude and longitude
L.marker([listing.geometry.coordinates[1], listing.geometry.coordinates[0]])
  .addTo(map)
  .bindPopup(
    `<h4>${listing.location}</h4><p>Exact Location will be provided after booking</p>`
  )
  .openPopup();
