const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-switch', function (config) {
        RED.nodes.createNode(this, config);
        this.server = RED.nodes.getNode(config.server);
        if (this.server) {
            this.server.register(this)
            const ha = new HomeAssistant(this, config)
            const node = this
            node.on('input', function (msg) {
                const { payload, attributes } = msg
                try {
                    // update state
                    if (payload) {
                        ha.publish_state(payload)
                    }
                    // update attributes
                    if (attributes) {
                        ha.publish_attributes(attributes)
                    }
                } catch (ex) {
                    node.status({ fill: "red", shape: "ring", text: ex });
                }
            })
            // Subscribe to topics
            ha.subscribe(ha.config.command_topic, (payload) => {
                node.send({ payload })
                // update statue
                ha.publish_state(payload)
            })

            ha.discovery({
                command_topic: ha.config.command_topic,
                payload_on: "ON",
                payload_off: "OFF",
                state_on: "ON",
                state_off: "OFF"
            })
        } else {
            this.status({ fill: "red", shape: "ring", text: "MQTT is not configured" });
        }
    })
}
