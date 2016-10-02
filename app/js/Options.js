void function() {
	var Storage = chrome.extension.getBackgroundPage().Storage,
		options = document.getElementsByClassName('option'),
		length = options.length;

	for (var i = 0; i < length; i++) {
		var option = options[i],
			value = Storage.get(option.id);

		if (option.type === 'checkbox') {
			option.checked = value;
		}
		else if (option.type === 'text') {
			option.value = value;
		}
		else if (option.tagName.toLowerCase() === 'select') {
			option.value = value;
		}
	}

	document.body.addEventListener('change', function(e) {
		var element = e.target;

		if (element.tagName.toLowerCase() === 'select') {
			Storage.set(element.id, element.value);
		}
		else if (element.type === 'checkbox') {
			Storage.set(element.id, element.checked);
		}
	}, false);
}();