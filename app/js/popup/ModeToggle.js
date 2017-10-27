const CONTAINER_ID = 'modeToggle'
const CHECKBOX_ID = 'modeToggle_checkbox'
const STORAGE_KEY = 'DarkMode_Enabled'
const CLASS_NAME = '--darkMode'

export default class ModeToggle {
	constructor(storage) {
		this.store = storage

		this.checkbox = document.getElementById(CHECKBOX_ID)
		this.container = document.getElementById(CONTAINER_ID)

		this.container.addEventListener('click', this.click.bind(this))

		this.update(this.enabled())
	}

	enabled() {
		let enabled = this.store.get(STORAGE_KEY)

		return enabled === true
	}

	save(enabled) {
		this.store.set(STORAGE_KEY, enabled)

		this.enabled = enabled
	}

	enable() {
		document.body.classList.add(CLASS_NAME)
		this.checkbox.checked = true

		this.save(true)
	}

	disable() {
		document.body.classList.remove(CLASS_NAME)
		this.checkbox.checked = false

		this.save(false)
	}

	update(enable) {
		if (enable) {
			this.enable()
		}
		else {
			this.disable()
		}
	}

	click(event) {
		event.preventDefault()

		this.update(! this.enabled)
	}
}
