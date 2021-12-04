const HomeAssistant = require('../HomeAssistant')

module.exports = function (RED) {
    RED.nodes.registerType('ha-mqtt-lock', function (cfg) {
        RED.nodes.createNode(this, cfg);
        this.server = RED.nodes.getNode(cfg.server);
        if (this.server) {
            this.server.register(this)
            const ha = new HomeAssistant(this, cfg)
            const node = this
            node.on('input', function (msg) {
                const { payload, attributes } = msg
                try {
                    // update statue
                    if (payload) {
                        ha.publish_state(payload)
                    }
                    // update attributes
                    if (attributes) {
                        ha.publish_attributes(attributes)
                    }
                } catch (ex) {
                    node.status({ fill: "red", shape: "ring", text: JSON.stringify(ex) });
                }
            })
            // Subscribe to topics
            ha.subscribe(ha.config.command_topic, (payload) => {
                node.send({ payload })
                // change state
                ha.publish_state(payload)
            })
            ha.discovery({
                command_topic: ha.config.command_topic,
                payload_lock: "LOCK",
                payload_unlock: "UNLOCK",
                state_locked: "LOCK",
                state_unlocked: "UNLOCK",
            })
        } else {
            this.status({ fill: "red", shape: "ring", text: "MQTT is not configured" });
        }
    })
}
