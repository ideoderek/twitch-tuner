function removeFromSet(arr, element) {
	var index = arr.indexOf(element);

	if (index === -1) {
		return;
	}

	arr.splice(index, 1);
}

function addToSet(arr, element) {
	var index = arr.indexOf(element);

	if (index !== -1) {
		return;
	}

	arr.push(element);
}

function hasElement(arr, element) {
	if (arr.indexOf(element) === -1) {
		return false;
	}

	return true;
}

function toggleInSet(arr, element, add) {
	if (add) {
		addToSet(arr, element);
	}
	else {
		removeFromSet(arr, element);
	}
}
