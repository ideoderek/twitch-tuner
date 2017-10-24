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
		let confirm = this.confirm.bind(this)

		this.attachListener(DISPLAY_ID, 'click', this.editMode.bind(this))
		this.attachListener(CANCEL_ID, 'click', this.normalMode.bind(this))
		this.attachListener(CONFIRM_ID, 'click', confirm)

		this.field.addEventListener('keyup', (event) => {
			if (event.keyCode === 13) confirm()
		}, false)
	}

	attachListener(id, eventType, callback) {
		document.getElementById(id).addEventListener(eventType, callback, false)
	}

	confirm() {
		set()

		toggleMode(false)
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
