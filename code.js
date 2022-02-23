// 1. get user coordinates via geolocation api
async function getCoords() {
  const pos = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
  return [pos.coords.latitude, pos.coords.longitude];
}

// 2. get school data
async function getSchoolsData(querySchoolName) {
  let urlPath = "https://api.data.gov/ed/collegescorecard/v1";
  let name = querySchoolName.replace(" ", "%");
  let apiKey = "b5LgbbLogx9cQTekEa8M5ZQ0lpd52c4DdPS8BOca";
  let response = await fetch(`${urlPath}/schools?school.name=${name}&api_key=${apiKey}`);
  let schoolsData = await response.json();
  return schoolsData;
}

// 3. process school data
function processSchoolsData(dataObject) {
  let dataArray = dataObject.results;
  // *** temporary fix ---> removes schools whose latitude is null ***
  let filteredDataArray = dataArray.filter((school) => school.location.lat != null);
  // *** end temporary fix ***
  let schools = filteredDataArray.map((school) => {
    let schoolData = {
      name: school.school.name,
      lat: school.location.lat,
      long: school.location.lon,
    };

    return schoolData;
  });
  return schools;
}

// 4. map object
const myMap = {
  coordinates: [],
  map: {},
  schools: [],
  markers: {},
};

// 5. build map
function buildMap() {
  myMap.map = L.map("map", {
    center: myMap.coordinates,
    zoom: 11,
  });
  // add openstreetmap tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    // minZoom: "15",
  }).addTo(myMap.map);
  // create and add geolocation marker
  const marker = L.marker(myMap.coordinates);
  marker.addTo(myMap.map).bindPopup("<p1><b>You are here</b><br></p1>").openPopup();
}

// 6. add markers
function addMarkers() {
  for (let i = 0; i < myMap.schools.length; i++) {
    myMap.markers = L.marker([myMap.schools[i].lat, myMap.schools[i].long])
      .bindPopup(`<p1>${myMap.schools[i].name}</p1>`)
      .addTo(myMap.map);
  }
}

// 7. update map
async function updateMap() {
  // TO-DO:  reset/remove schools data & markers
  let collegees = document.getElementById("colleges").value;
  let data = await getSchoolsData(collegees);
  myMap.schools = processSchoolsData(data);
  addMarkers();
}

// 8. update costs
function updateCosts() {}

// event - window load
window.onload = async () => {
  const coords = await getCoords();
  myMap.coordinates = coords;
  buildMap();
};

// event - submit button
document.getElementById("submit").addEventListener("click", async (event) => {
  event.preventDefault();
  updateMap();

  console.log(myMap.schools);
});
