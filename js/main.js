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

function setCarSelection(carOption, optionChoice, optionPrice) {
	carSelection[carOption]["choice"] = optionChoice;
	carSelection[carOption]["price"] = optionPrice;
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

			break;
	}
});

$('#options-display').on('click', 'div', function(e) {
	e.preventDefault();
	switch($(this).data("panel")){
		case 'vehicle':
			setCarSelection("vehicle", $(this).data("option"), $(this).data("price"));
			//console.log(carSelection["vehicle"]["choice"] + carSelection["vehicle"]["price"]);
			break;
		case 'color':
			setCarSelection("color", $(this).data("option"), $(this).data("price"));
			//console.log(carSelection["color"]["choice"] + carSelection["color"]["price"]);
			break;
		case 'package':
			setCarSelection("package", $(this).data("option"), $(this).data("price"));
			//console.log(carSelection["package"]["choice"] + carSelection["package"]["price"]);
			break;
	}

});