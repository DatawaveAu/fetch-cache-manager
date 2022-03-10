import { agents } from '../agents';
import removeAgent from '../remove-agent';

export default function removeAllAgents() {
    Object.keys(agents).forEach(removeAgent);
}
