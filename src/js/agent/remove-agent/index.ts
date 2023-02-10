import { agents } from '../agents';

export default function removeAgent(name: string) {
    if (!agents[name]) {
        return;
    }

    clearTimeout(agents[name].garbageCollectorTimeout);

    delete agents[name];
    agents[name].storage?.clear();
}
