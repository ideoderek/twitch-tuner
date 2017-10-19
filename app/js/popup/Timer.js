const DISPLAY_ID = 'time_display'
const BUTTON_ID = 'reload_button'
const UPDATING_CLASS = 'updating'
const UPDATING_TEXT = 'Updating . . .'
const REFRESH_DELAY = 10000

export default class Timer {
	constructor(reload) {
		this.reload = reload

		this.display = document.getElementById(DISPLAY_ID)
		this.button = document.getElementById(BUTTON_ID)

		this.button.addEventListener('click', this.click.bind(this), false)
	}

	click() {
		this.reload()
	}

	time() {
		let elapsed = Math.floor((new Date() - this.updatedAt) / 60000)

		if (elapsed === 0) {
			return '< 1 minute ago'
		}
		if (elapsed === 1) {
			return '1 minute ago'
		}

		return elapsed + ' minutes ago'
	}

	setLabel(label) {
		this.display.innerHTML = label
	}

	showTime() {
		if (this.updatedAt === null) {
			this.setLabel('Never')
		}
		else {
			this.setLabel(this.time())

			this.scheduleRefresh()
		}
	}

	toggleUpdateIndicator(updating) {
		this.button.classList.toggle(UPDATING_CLASS, updating)

		if (updating) {
			this.setLabel(UPDATING_TEXT)
		}
	}

	scheduleRefresh() {
		this.timeout = setTimeout(this.showTime.bind(this), REFRESH_DELAY)
	}

	cancelRefresh() {
		clearTimeout(this.timeout)
	}

	update(data) {
		this.cancelRefresh()

		this.toggleUpdateIndicator(data.updating)

		this.updatedAt = data.updatedAt

		if (data.updating) {
			return
		}

		this.showTime()
	}
}
