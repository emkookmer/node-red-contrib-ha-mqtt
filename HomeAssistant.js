const fs = require('fs')
const pinyin = require("node-pinyin")

const pk = JSON.parse(fs.readFileSync(__dirname + '/package.json', 'utf-8'))

var camalize = function  camalize ( str )  {
    return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, function(match, chr) {
        return chr.toUpperCase();
    });
}

const DiscoveryDevice = {}

module.exports = class {
    constructor(node, cfg) {
        node.config = cfg.config
        this.node = node
        const { name } = cfg
        const entity_id = camalize(name)
        const type = node.type.replace('ha-mqtt-', '')
        const topic = `ha-mqtt/${type}/${entity_id}/`
        const device = Object.assign(
            {
                name: 'Home Assistant',
                identifiers: ['ha-mqtt-default-device'],
                model: 'HA-MQTT',
                sw_version: pk.version
            }, 
            (({ name, identifiers }) => ({ name, identifiers }))(cfg.device)
        )
        this.config = {
            name,
            device,
            unique_id: topic.replace(/\//g, '_'),
            discovery_topic: `homeassistant/${type}/${entity_id}/config`,
            state_topic: `${topic}state`,
            json_attr_t: `${topic}attr`,
            command_topic: `${topic}set`,
            // Location
            position_topic: `${topic}position/state`,
            // Available
            availability_topic: `${topic}availability/state`,
            power_command_topic: `${topic}power/set`,
            // Effect
            effect_state_topic: `${topic}effect/state`,
            effect_command_topic: `${topic}effect/set`,
            // Brightness
            brightness_state_topic: `${topic}brightness/state`,
            brightness_command_topic: `${topic}brightness/set`,
            // Current Temperature
            current_temperature_topic: `${topic}current_temperature`,
            // Target humidity
            target_humidity_state_topic: `${topic}target_humidity/state`,
            target_humidity_command_topic: `${topic}target_humidity/set`,
            // Temperature
            temperature_state_topic: `${topic}temperature/state`,
            temperature_command_topic: `${topic}temperature/set`,
            // Model
            mode_state_topic: `${topic}mode/state`,
            mode_command_topic: `${topic}mode/set`,
            // Fan mode
            fan_mode_state_topic: `${topic}fan_mode/state`,
            fan_mode_command_topic: `${topic}fan_mode/set`,
            // Swing mode
            swing_mode_state_topic: `${topic}swing_mode/state`,
            swing_mode_command_topic: `${topic}swing_mode/set`,
            // Swing/Oscillation
            oscillation_state_topic: `${topic}oscillation/state`,
            oscillation_command_topic: `${topic}oscillation/set`,
            // Percentage            
            percentage_state_topic: `${topic}percentage/state`,
            percentage_command_topic: `${topic}percentage/set`,
            // Preset mode
            preset_mode_state_topic: `${topic}preset_mode/state`,
            preset_mode_command_topic: `${topic}preset_mode/set`,
            // Tilt
            tilt_state_topic: `${topic}tilt/state`,
            tilt_command_topic: `${topic}tilt/set`,
            // Battery level
            battery_level_topic: `${topic}battery_level/state`,
            // Charging
            charging_topic: `${topic}charging/state`,
            // Cleaning
            cleaning_topic: `${topic}cleaning/state`,
            // Docked
            docked_topic: `${topic}docked/state`,
            // Error
            error_topic: `${topic}error/state`,
            // Wind speed
            fan_speed_topic: `${topic}fan_speed/state`,
            set_fan_speed_topic: `${topic}set_fan_speed/set`,
            send_command_topic: `${topic}send_command/set`,
        }
    }

    // Configure automatic discover
    discovery(config) {
        DiscoveryDevice[this.config.unique_id] = () => {
            try {
                if (this.node.config) {
                    config = Object.assign(config, JSON.parse(this.node.config))
                }
                // console.log(config)
                this.publish_config(config)
            } catch (ex) {
                this.node.status({ fill: "red", shape: "ring", text: `Auto configuration failed：${ex}` });
            }
        }
        this.subscribe('homeassistant/status', (payload) => {
            if (payload === 'online') {
                for (const key in DiscoveryDevice) {
                    DiscoveryDevice[key]()
                }
            }
        })
    }

    // Send entity configuration to home assistant
    publish_config(data) {
        const { name, device, unique_id, discovery_topic, state_topic, json_attr_t } = this.config
        // Merge configurations
        const mergeConfig = Object.assign({
            name,
            unique_id,
            state_topic,
            json_attr_t,
            device
        }, data)
        // Remove empty/null  configuration properties
        Object.keys(mergeConfig).forEach(key => {
            if (mergeConfig[key] === null) {
                delete mergeConfig[key]
            }
        })
        
        // todo make retain configurable
        this.publish(discovery_topic, mergeConfig,"",{retain: true})
        this.node.status({ fill: "green", shape: "ring", text: `Update configuration：${name}` });
    }

    publish_state(data) {
        this.publish(this.config.state_topic, data, "Update state")
    }

    publish_attributes(data) {
        this.publish(this.config.json_attr_t, data, "Update attribute")
    }

    publish_current_temperature(data) {
        this.publish(this.config.current_temperature_topic, data, "Update current temperature")
    }

    publish_temperature(data) {
        this.publish(this.config.temperature_state_topic, data, "Update temperature")
    }

    publish_target_humidity(data) {
        this.publish(this.config.target_humidity_state_topic, data, "Update humidity")
    }

    publish_effect(data) {
        this.publish(this.config.effect_state_topic, data, "Update effect")
    }

    publish_oscillation(data) {
        this.publish(this.config.oscillation_state_topic, data, "Update oscillation")
    }

    publish_percentage(data) {
        this.publish(this.config.percentage_state_topic, data, "Update percentage")
    }

    publish_mode(data) {
        this.publish(this.config.mode_state_topic, data, "Update mode")
    }

    publish_preset_mode(data) {
        this.publish(this.config.preset_mode_state_topic, data, "Update preset mode")
    }

    publish_swing_mode(data) {
        this.publish(this.config.swing_mode_state_topic, data, "Update Swing")
    }

    publish_fan_mode(data) {
        this.publish(this.config.fan_mode_state_topic, data, "Update fan mode")
    }

    publish_brightness(data) {
        this.publish(this.config.brightness_state_topic, data, "Update brightness")
    }

    publish_battery_level(data) {
        this.publish(this.config.battery_level_topic, data, "Update battery level")
    }

    publish_charging(data) {
        this.publish(this.config.charging_topic, data, "Update charging")
    }

    publish_cleaning(data) {
        this.publish(this.config.cleaning_topic, data, "Update cleaning")
    }

    publish_docked(data) {
        this.publish(this.config.docked_topic, data, "Update docked")
    }

    publish_error(data) {
        this.publish(this.config.error_topic, data, "Update Error")
    }

    publish_fan_speed(data) {
        this.publish(this.config.fan_speed_topic, data, "Update fan speed")
    }

    // Subscribe to topic
    subscribe(topic, callback) {
        this.node.server.subscribe(topic, { qos: 0 }, function (mtopic, mpayload, mpacket) {
            callback(mpayload.toString())
        })
    }

    // Send content
    send_payload(payload, i, len = 4) {
        let arr = []
        arr.length = len
        arr[i - 1] = { payload }
        this.node.send(arr)
    }

    // Publish data
    publish(topic, payload, msg = "", options) {
        const type = Object.prototype.toString.call(payload)
        switch (type) {
            case '[object Uint8Array]':
                this.node.server.client.publish(topic, payload, { retain: false })
                return;
            case '[object Object]':
                payload = JSON.stringify(payload)
                break;
            case '[object Number]':
                payload = String(payload)
                break;
        }
        this.node.server.client.publish(topic, payload, options)
        if (msg) {
            this.node.status({ fill: "green", shape: "ring", text: `${msg}：${payload}` });
        }
    }
}
