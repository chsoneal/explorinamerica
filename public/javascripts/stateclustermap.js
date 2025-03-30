mapboxgl.accessToken = mapToken;

let currentState = campgrounds.features[0].state
const statesArray = [
    {name: 'South Dakota', coordinates: [-100.000000, 44.500000]},
    {name: 'Texas', coordinates: [-100.000000, 31.0000000]},
    {name: 'Vermont', coordinates: [-72.699997, 44.000000]},
    {name: 'West Virginia', coordinates: [-80.500000,39.000000]},
    {name: 'Wisconsin',	coordinates: [-89.500000,44.500000]},
    {name: 'Rhode Island', coordinates: [-71.500000,41.700001]},
    {name: 'Oregon', coordinates: [-120.500000,44.000000]},
    {name: 'New York', coordinates: [-75.000000,43.000000]},
    {name: 'New Hampshire', coordinates: [-71.500000,44.000000]},
    {name: 'Nebraska', coordinates: [-100.000000,41.500000]},
    {name: 'Kansas', coordinates: [-98.000000,38.500000]},
    {name: 'Mississippi', coordinates: [-90.000000,33.000000]},
    {name: 'Illinois', coordinates: [-89.000000,40.000000]},
    {name: 'Delaware', coordinates: [-75.500000,39.000000]},
    {name: 'Connecticut', coordinates: [-72.699997,41.599998]},
    {name: 'Arkansas', coordinates: [-92.199997,34.799999]},
    {name: 'Indiana', coordinates: [-86.126976,40.273502]},
    {name: 'Missouri', coordinates: [-92.603760,38.573936]},
    {name: 'Florida', coordinates: [-81.760254,27.994402]},
    {name: 'Nevada', coordinates: [-117.224121,39.876019]},
    {name: 'Maine', coordinates: [-68.972168,45.367584]},
    {name: 'Michigan', coordinates: [-84.506836,44.182205]},
    {name: 'Georgia', coordinates: [-83.441162,33.247875]},
    {name: 'Hawaii', coordinates: [-155.844437,19.741755]},
    {name: 'Alaska', coordinates: [-153.369141,66.160507]},
    {name: 'Tennessee', coordinates: [-86.660156,35.860119]},
    {name: 'Virginia', coordinates: [-78.024902,37.926868]},
    {name: 'New Jersey', coordinates:[-74.871826,39.833851]},
    {name: 'Kentucky', coordinates: [-84.27002,37.839333]},
    {name: 'North Dakota', coordinates: [-100.437012,47.650589]},
    {name: 'Minnesota' , coordinates: [-94.636230,46.392410]},
    {name: 'Oklahoma', coordinates: [-96.921387,36.084621]},
    {name: 'Montana', coordinates: [-109.533691,46.965260]},
    {name: 'Washington', coordinates: [-120.740135,47.751076]},
    {name: 'Utah', coordinates: [-111.950684,39.419220]},
    {name: 'Colorado', coordinates: [-105.358887,39.113014]},
    {name: 'Ohio', coordinates: [-82.996216,40.367474]},
    {name: 'Alabama', coordinates: [-86.902298,32.318230]},
    {name: 'Iowa', coordinates: [-93.581543,42.032974]},
    {name: 'New Mexico', coordinates: [-106.018066,34.307144]},
    {name: 'South Carolina', coordinates: [-81.163727,33.836082]},
    {name: 'Pennsylvania', coordinates: [-77.194527,41.203323]},
    {name: 'Arizona', coordinates: [-111.093735,34.048927]},
    {name: 'Maryland', coordinates: [-76.641273,39.045753]},
    {name: 'Massachusetts', coordinates: [-71.382439,42.407211]},
    {name: 'California', coordinates: [-119.417931,36.778259]},
    {name: 'Idaho', coordinates: [-114.742043,44.068203]},
    {name: 'Wyoming', coordinates: [-107.290283,43.075970]},
    {name: 'North Carolina', coordinates: [-80.793457,35.782169]},
    {name: 'Louisiana', coordinates: [-92.329102,30.391830]}
    ]
let currentStateCenter = statesArray.find(o => o.name === currentState);

console.log(currentStateCenter.coordinates);


let currentCenter = campgrounds.features[0].geometry.coordinates
const map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/mapbox/streets-v10',
center: currentStateCenter.coordinates,
zoom: 4.7
});
 
map.on('load', () => {
// Add a new source from our GeoJSON data and
// set the 'cluster' option to true. GL-JS will
// add the point_count property to your source data.
map.addSource('campgrounds', {
type: 'geojson',
// Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
// from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
data: campgrounds,
cluster: true,
clusterMaxZoom: 14, // Max zoom to cluster points on
clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)

});

map.addLayer({
id: 'clusters',
type: 'circle',
source: 'campgrounds',
filter: ['has', 'point_count'],
paint: {
// Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
// with three steps to implement three types of circles:
//   * Blue, 20px circles when point count is less than 100
//   * Yellow, 30px circles when point count is between 100 and 750
//   * Pink, 40px circles when point count is greater than or equal to 750
'circle-color': [
'step',
['get', 'point_count'],
'#51bbd6',
10,
'#f1f075',
20,
'#f28cb1'
],
'circle-radius': [
'step',
['get', 'point_count'],
20,
10,
30,
20,
40
]
}
});
 
map.addLayer({
id: 'cluster-count',
type: 'symbol',
source: 'campgrounds',
filter: ['has', 'point_count'],
layout: {
'text-field': '{point_count_abbreviated}',
'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
'text-size': 12
}
});
 
map.addLayer({
id: 'unclustered-point',
type: 'circle',
source: 'campgrounds',
filter: ['!', ['has', 'point_count']],
paint: {
'circle-color': '#A901DB',
'circle-radius': 4,
'circle-stroke-width': 1,
'circle-stroke-color': '#D358F7'
}
});
 
// inspect a cluster on click
map.on('click', 'clusters', (e) => {

const features = map.queryRenderedFeatures(e.point, {
layers: ['clusters']
});
const clusterId = features[0].properties.cluster_id;
map.getSource('campgrounds').getClusterExpansionZoom(
clusterId,
(err, zoom) => {
if (err) return;
 
map.easeTo({
center: features[0].geometry.coordinates,
zoom: zoom
});
}
);
});
 
// When a click event occurs on a feature in
// the unclustered-point layer, open a popup at
// the location of the feature, with
// description HTML from its properties.
map.on('click', 'unclustered-point', (e) => {

const coordinates = e.features[0].geometry.coordinates.slice();
console.log(coordinates)
const {popupMarkup} = e.features[0].properties;
const free =
e.features[0].properties.price === 0 ? 'yes' : 'no';
// Ensure that if the map is zoomed out such that
// multiple copies of the feature are visible, the
// popup appears over the copy being pointed to.
while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
}

 
new mapboxgl.Popup()
.setLngLat(coordinates)
.setHTML(popupMarkup)
.addTo(map);
});

map.on('mouseenter', 'clusters', () => {
map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'clusters', () => {
map.getCanvas().style.cursor = '';
});

});