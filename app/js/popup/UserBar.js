const CONTAINER_ID = 'user_bar'
const DISPLAY_ID = 'username_display'
const FIELD_ID = 'username_field'
const USERNAME_ID = 'username'
const CONFIRM_ID = 'username_confirm'
const CANCEL_ID = 'username_cancel'

export default class UserBar {
	constructor(setUsername) {
		this.setUsername = setUsername

		this.bindElements()
		this.attachListeners()
	}

	bindElements() {
		this.container = document.getElementById(CONTAINER_ID)
		this.ticker = document.getElementById(USERNAME_ID)
		this.field = document.getElementById(FIELD_ID)
	}

	attachListeners() {
		this.container.addEventListener('click', this.click.bind(this))

		this.field.addEventListener('keyup', this.keyup.bind(this))
	}

	confirm() {
		this.set()

		this.normalMode()
	}

	set() {
		let username = this.field.value

		this.setUsername(username)
	}

	warn(label) {
		this.container.classList.add('warning')

		this.display(label)
	}

	display(label) {
		this.ticker.innerHTML = label
	}

	normalMode() {
		this.container.classList.remove('editing')
	}

	editMode() {
		this.container.classList.add('editing')

		this.field.value = this.username
		this.field.select()
	}

	keyup(event) {
		if (event.keyCode === 13) {
			this.confirm()
		}
	}

	click(event) {
		let element = event.target
		let id = element.id

		if (id === CANCEL_ID) {
			this.normalMode()
		}
		else if (id === CONFIRM_ID) {
			this.confirm()
		}
		else if (! event.currentTarget.classList.contains('editing')) {
			this.editMode()
		}
	}

	update(data) {
		this.username = data.username || ''

		if (data.username === null) {
			this.warn('Enter Twitch username')
		}
		else if (data.validUsername === false) {
			this.warn('Invalid Twitch username')
		}
		else {
			this.container.classList.remove('warning')

			this.display(data.username)
		}
	}
}
