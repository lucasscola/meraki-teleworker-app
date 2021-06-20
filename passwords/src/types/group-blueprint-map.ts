// Config data fetched from infra
const data = require('/etc/config/blueprints.json');

const GroupBlueprintMap: Map<string, string> = new Map(data);

export { GroupBlueprintMap };