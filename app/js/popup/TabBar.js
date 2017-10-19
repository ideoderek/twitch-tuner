const ELEMENT_ID = 'tab_bar'

const CHANNELS_TAB_ID = 'channels_tab'
const CHANNELS_PANE_ID = 'channels_pane'

const STREAMS_TAB_ID = 'streams_tab'
const STREAMS_PANE_ID = 'streams_pane'

class Tab {
	constructor(name, tabId, paneId, getCount, updater) {
		this.name = name

		this.tab = document.getElementById(tabId)
		this.pane = document.getElementById(paneId)

		this.updater = updater
		this.count = getCount

		this.active = false
		this.updated = false

		this.setTitle()
	}

	setTitle() {
		let count = this.count()

		this.tab.innerHTML = `${count} ${this.name}`
	}

	updateContent() {
		this.updater()
	}

	update() {
		this.setTitle()

		if (this.active) {
			this.updateContent()

			this.updated = true
		}
		else {
			this.updated = false
		}
	}

	select() {
		this.active = true

		if (! this.updated) {
			this.update()
		}

		this.display()
	}

	display() {
		this.tab.classList.add('active')
		this.pane.classList.add('active')
	}

	hide() {
		this.active = false

		this.tab.classList.remove('active')
		this.pane.classList.remove('active')
	}
}

export default class TabBar {
	constructor(callbacks) {
		this.element = document.getElementById(ELEMENT_ID)

		this.tabs = {
			channels: new Tab('Channels', CHANNELS_TAB_ID, CHANNELS_PANE_ID, callbacks.channels[0], callbacks.channels[1]),
			streams: new Tab('Streams', STREAMS_TAB_ID, STREAMS_PANE_ID, callbacks.streams[0], callbacks.streams[1])
		}

		this.element.addEventListener('click', this.click.bind(this), false)
	}

	update(type) {
		this.tabs[type].update()
	}

	select(type) {
		for (let key in this.tabs) {
			if (key === type) {
				this.tabs[key].select()
			}
			else {
				this.tabs[key].hide()
			}
		}
	}

	click(event) {
		let element = event.target

		if (! element.classList.contains('tab')) {
			return
		}

		let type = element.getAttribute('data-tab')

		this.select(type)
	}
}
