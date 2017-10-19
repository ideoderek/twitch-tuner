import Storage from "./Storage.js"
import Browser from "./Browser.js"
import Notifier from "./Notifier.js"
import ChannelContainer from "./ChannelContainer.js"
import {FollowsUpdater, StreamsUpdater} from "./Updaters.js"
import DEFAULT_SETTINGS from "./default-settings.js"
import App from "./TwitchTuner.js"

export {TwitchTuner as default}

let store = new Storage()
let browser = new Browser()
let notifier = new Notifier(store, browser)
let channels = new ChannelContainer(store)

let TwitchTuner = new App({store, browser, notifier, channels, FollowsUpdater, StreamsUpdater})

TwitchTuner.configure(DEFAULT_SETTINGS)

TwitchTuner.initialize()
