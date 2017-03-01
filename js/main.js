function initMap() {

	navigator.geolocation.getCurrentPosition(function(position){
		var userLocation = {
			lat: position.coords.latitude,
			lng: position.coords.longitude
        };

        var map = new google.maps.Map(document.getElementById('map'),{
			center: userLocation,
	        zoom: 10,
	       	scrollwheel: false
		});

		infowindow = new google.maps.InfoWindow();
        var service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
          location: userLocation,
          radius: 10000,
          type: ['car_dealer']
        }, callback);

        function callback(results, status) {
			if (status === google.maps.places.PlacesServiceStatus.OK) {
				for (var i = 0; i < results.length; i++) {
					createMarker(results[i]);
				}
			}
		}

		function createMarker(place) {
			var placeLoc = place.geometry.location;
			var marker = new google.maps.Marker({
				map: map,
				position: place.geometry.location
			});

			google.maps.event.addListener(marker, 'click', function() {
				infowindow.setContent(place.name);
				infowindow.open(map, this);
			});
		}
	});	
}

// Initialize Firebase
var config = {
		apiKey: "AIzaSyCCMAVln0hXtsGCl7LHIOskjUsK27WRVo0",
		authDomain: "jsc-final.firebaseapp.com",
		databaseURL: "https://jsc-final.firebaseio.com",
		storageBucket: "jsc-final.appspot.com",
		messagingSenderId: "56709765726"
};
firebase.initializeApp(config);

var database = firebase.database();

var vehicleOptions = [
	{choice: 'cadenza', price: 35000},
	{choice: 'forte', price: 20000},
	{choice: 'optima', price: 29050},
	{choice: 'sedona', price: 38650},
	{choice: 'soul', price: 42200}
];

var colorOptions = [
	{choice: 'black', price: 50},
	{choice: 'white', price: 100},
	{choice: 'silver', price: 250}
];

var packageOptions = [
	{choice: 'Rear Camera', price: 150},
	{choice: 'LED Positioning Light', price: 150},
	{choice: 'Rear Camera and LED Positioning Light', price: 200}
];

var carSelection = {
	vehicle: {choice: 'Not Selected', price: 0},
	color: {choice: 'Not Selected', price: 0},
	package: {choice: 'Not Selected', price: 0}
};

var saveOrBuild;
var vehicleReference;
var vehicleDisplay;
var costDisplay;

function createTemplate(carOptions, hbTemplate) {
	for(var q=0; q<carOptions.length; q++)
	{
		var source = $(hbTemplate).html();
		var template = Handlebars.compile(source);
		var context = {choice: carOptions[q].choice, price: carOptions[q].price};
		var newItemHTML = template(context);
		$('#options-display').append(newItemHTML);
	}
}

function createSummary() {
	
		var source = $('#summary-options-template').html();
		var template = Handlebars.compile(source);
		var newItemHTML = template(carSelection);
		$('#options-display').append(newItemHTML);
	
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function setCarSelection(carOption, optionChoice, optionPrice) {
	carSelection[carOption]["choice"] = optionChoice;
	carSelection[carOption]["price"] = optionPrice;
}

function setVehicleDisplay(){
	if((carSelection["vehicle"]["choice"] !== 'Not Selected') && (carSelection["color"]["choice"] !== 'Not Selected')){
		vehicleDisplay = 'assets/' + carSelection["vehicle"]["choice"] + '-' + carSelection["color"]["choice"] + '.jpg';
	}
	else if((carSelection["vehicle"]["choice"] !== 'Not Selected') && (carSelection["color"]["choice"] === 'Not Selected')){
		vehicleDisplay = 'assets/' + carSelection["vehicle"]["choice"] + '.jpg';
	}


}

createTemplate(vehicleOptions, '#vehicle-options-template');

$('.navigation li').on('click', function() {
	$('.navigation').children().removeClass('active');
	$(this).addClass('active');

	$('#options-display').empty();
	var option = $(this).data('tab');

	switch(option){
		case 'vehicle':
			createTemplate(vehicleOptions, '#vehicle-options-template');
			break;
		case 'color':
			createTemplate(colorOptions, '#color-options-template');
			break;
		case 'package':
			createTemplate(packageOptions, '#package-options-template');
			break;
		case 'summary':
			createSummary();
			break;
	}
});

$('#options-display').on('click', 'div', function(e) {
	e.preventDefault();

	$('#save-message').text('');

	switch($(this).data("panel")){
		case 'vehicle':
			setCarSelection("vehicle", $(this).data("option"), $(this).data("price"));
			setVehicleDisplay();
			costDisplay = numberWithCommas($(this).data("price"));
			$('.vehicle-display').attr('src', vehicleDisplay);
			$('.cost-display').text(costDisplay);
			break;
		case 'color':
			setCarSelection("color", $(this).data("option"), $(this).data("price"));
			setVehicleDisplay();
			costDisplay = numberWithCommas(carSelection["vehicle"]["price"] + $(this).data("price"));
			$('.vehicle-display').attr('src', vehicleDisplay);
			$('.cost-display').text(costDisplay);
			break;
		case 'package':
			setCarSelection("package", $(this).data("option"), $(this).data("price"));
			costDisplay = numberWithCommas(carSelection["vehicle"]["price"] + carSelection["color"]["price"] + $(this).data("price"));
			$('.cost-display').text(costDisplay);
			break;
	}

});

$('#save-vehicle').find('input[type=submit]').on("click", function(e) {
	console.log("saveOrBuild action to be fired!");
	saveOrBuild = $(this).attr('name');
	console.log(saveOrBuild);
});

$('#save-vehicle').on('submit', function(e){
	e.preventDefault();

	var userName = $('#customer').val();

	if(saveOrBuild === 'save'){
		console.log("this is what should be firing " + userName);

		vehicleReference = database.ref('vehicles');

		vehicleReference.push({
			buyer: userName,
			vehicle: carSelection["vehicle"]["choice"],
			vehiclePrice: carSelection["vehicle"]["price"],
			color: carSelection["color"]["choice"],
			colorPrice: carSelection["color"]["price"],
			package: carSelection["package"]["choice"],
			packagePrice: carSelection["package"]["price"]
		});

		setCarSelection("vehicle", 'Not Selected', 0);
		setCarSelection("color", 'Not Selected', 0);
		setCarSelection("package", 'Not Selected', 0);

		console.log("we still make it to this part of the save conditional");
		$('#customer').val('');
		$('.vehicle-display').attr('src', '');
		$('#save-message').text('Vehicle saved successfully!');
		
	}
	else if(saveOrBuild === 'rebuild'){
		console.log("you will know if this is correct or wrong!");
		var buyerExists = false;
		
		vehicleReference = database.ref('vehicles');
		vehicleReference.on('value', function(snapshot){
			var allVehicles = snapshot.val();

			for(var car in allVehicles){
				if(allVehicles[car].buyer === userName){
					
					setCarSelection("vehicle", allVehicles[car].vehicle, allVehicles[car].vehiclePrice);
					setCarSelection("color", allVehicles[car].color, allVehicles[car].colorPrice);
					setCarSelection("package", allVehicles[car].package, allVehicles[car].packagePrice);
					setVehicleDisplay();
					costDisplay = numberWithCommas(carSelection["vehicle"]["price"] + carSelection["color"]["price"] + carSelection["package"]["price"]);
					$('.vehicle-display').attr('src', vehicleDisplay);
					$('.cost-display').text(costDisplay);
					$('#save-message').text("Saved Vehicle for " + allVehicles[car].buyer);
					buyerExists = true;
				}
			}
		});
		
		if(buyerExists === false){
			$('#save-message').text('Saved Vehicle does not exist for this buyer!');
		}
	}
});
