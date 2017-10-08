let storage = chrome.extension.getBackgroundPage().Storage
let options = document.getElementsByClassName('option')

function isCheckbox(element) {
	return element.type === 'checkbox'
}

function displayOption(option, value) {
	if (isCheckbox(option)) {
		option.checked = value
	}
	else {
		option.value = value
	}
}

function updateOption(e) {
	let el = e.target
	let value = isCheckbox(el) ? el.checked : el.value

	storage.set(el.id, value)
}

for (let i = 0, len = options.length; i < len; i++) {
	let option = options[i]

	displayOption(option, storage.get(option.id))
}

document.body.addEventListener('change', updateOption, false)
