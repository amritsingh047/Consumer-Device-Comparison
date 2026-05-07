import { mockDevices } from './src/data/mockDevices';

const query = 'iphone';
const results = mockDevices.filter(d => {
    try {
        return (
            (d.name?.toLowerCase().includes(query)) ||
            (d.brand?.toLowerCase().includes(query)) ||
            (d.category?.toLowerCase().includes(query)) ||
            (d.tags?.some(t => t.toLowerCase().includes(query)))
        );
    } catch (e) {
        console.error(`Error filtering device ${d.id}:`, e);
        return false;
    }
});

console.log("Results count:", results.length);
console.log("Results:", results.map(r => r.name));
