function removeElement(arr, element) {
	var index = arr.indexOf(element);

	if (index === -1) {
		return;
	}

	arr.splice(index, 1);
}
