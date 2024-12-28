module.exports = {
    async matter_info({homey}: { homey: any }) {
        return homey.app.getMatterInfo();
    },
}