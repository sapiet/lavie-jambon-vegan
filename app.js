var map;

var icon = L.icon({
  iconUrl: 'https://www.laviefoods.com/wp-content/uploads/2021/11/wpsl-marker-category-magasins.png',
  shadowUrl: '',
  iconSize:     [20, 36], // size of the icon
  shadowSize:   [0, 0], // size of the shadow
  iconAnchor:   [20, 36], // point of the icon which will correspond to marker's location
  shadowAnchor: [4, 62],  // the same for the shadow
  popupAnchor:  [-8, -40] // point from which the popup should open relative to the iconAnchor
});

const getItemMarkerPopup = (item) => {
  return `${item.name} - ${item.city}`
}

const display = (items) => {
  items.map(item => {
  	if (item.location) {
  		L
  			.marker([item.location[1], item.location[0]], { icon })
  			.addTo(map)
  			.bindPopup(getItemMarkerPopup(item))
  	}
  })
}

const getLocations = () => {
  return fetch('locations.json').then(response => response.json());
}

const initMap = () => {
  map = L.map('map').setView([47.31885924516227, 2.5406655176953463], 6);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
}

const { createApp, ref } = Vue

createApp({
  data() {
    return {
    	start: true,
    	loading: true,
    	geolocationActivated: false,
      locations: []
    }
  },

  mounted() {
    initMap();
    this.initAddressAutocomplete();

    getLocations().then(locations => {
      this.locations = locations;
      this.sortDefault();
      display(locations);
      this.loading = false;
      this.start = false;
    });

		this.geolocationActivated = "geolocation" in navigator;
  },

  methods: {
  	geolocate() {
  		this.loading = true;

			navigator.geolocation.getCurrentPosition(position => {
		  	this.zoomOnLocation(position.coords.latitude, position.coords.longitude)
		  	this.reorderLocations(position.coords.latitude, position.coords.longitude);
		  	this.loading = false;
			}, error => {
				this.loading = false;
			});
  	},

  	sortDefault() {
  		const sorted = {firsts: [], others: []};

  		for (const location of this.locations) {
  			if (location.link) {
  				sorted.firsts.push(location);
  			} else {
  				sorted.others.push(location);
  			}
  		}

			sorted.others.sort((a, b) => a.departmentNumber > b.departmentNumber ? 1 : -1);

			this.locations = [...sorted.firsts, ...sorted.others];
  	},

  	reorderLocations(lat, lng) {
  		this.locations.map(location => {
  			if (location.location) {
  				location.distance = distance(lat, lng, location.location[1], location.location[0])
  			}

  			return location;
  		});

  		this.locations.sort((a, b) => {
  			if (!a.distance) {
  				return 1;
  			}

  			return a.distance > b.distance ? 1 : -1;
  		});
  	},

  	zoomOnLocation(lat, lng) {
  		map.setView([lat, lng], 10);
  	},

  	locationSelected(event, location) {
  		event.preventDefault();

  		if (location.location) {
  			map.setView([location.location[1], location.location[0]], 16);
  		} else if (location.link) {
  			window.open(location.link);
  		}
  	},

  	initAddressAutocomplete() {
			new Autocomplete("search", {
	  		selectFirst: true,
	  		howManyCharacters: 2,

	  		onSearch: ({ currentValue }) => {
	    		const api = `https://nominatim.openstreetmap.org/search?format=geojson&limit=5&city=${encodeURI(currentValue)}`;

	    		return new Promise((resolve) => {
	      			fetch(api)
	        			.then((response) => response.json())
	        			.then((data) => {
	          				resolve(data.features);
	        			})
	        			.catch((error) => {
	          				console.error(error);
	        			});
	    		});
	  		},

		  	onResults: ({ currentValue, matches, template }) => {
		    	const regex = new RegExp(currentValue, "gi");

		    	return matches === 0
		      		? template
		      		: matches.map((element) => {
		            	return `
		          			<li>
		            			<p>
		              				${element.properties.display_name.replace(regex, (str) => `<b>${str}</b>`)}
		            			</p>
		          			</li> `;
		          	})
		          	.join("");
		  	},

				onSubmit: ({ object }) => {
					const [lng, lat] = object.geometry.coordinates;
					this.zoomOnLocation(lat, lng);
					this.reorderLocations(lat, lng);
				},

	  		noResults: ({ currentValue, template }) => template(`<li>Aucun résultat pour : "${currentValue}"</li>`),

	  		onReset: () => {
	  			this.locations.map(location => {
	  				location.distance = undefined;

	  				return location;
	  			});

	  			this.sortDefault();
	  		},
			});
		}
  }
}).mount('#main-container')

const distance = (lat1, lon1, lat2, lon2) => {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km

  return d;
}

const deg2rad = (deg) => {
  return deg * (Math.PI / 180)
}
