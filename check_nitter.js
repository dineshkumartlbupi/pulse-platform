
const axios = require('axios');

const instances = [
    'https://nitter.poast.org',
    'https://nitter.privacydev.net',
    'https://nitter.lucabased.xyz',
    'https://nitter.net',
    'https://nitter.cz',
    'https://nitter.projectsegfau.lt'
];

async function check() {
    console.log('Checking Nitter instances...');
    for (const instance of instances) {
        try {
            console.log(`Testing ${instance}...`);
            const res = await axios.get(`${instance}/elonmusk/rss`, { timeout: 5000 });
            if (res.status === 200) {
                console.log(`SUCCESS: ${instance} is working!`);
                console.log('Sample data length:', res.data.length);
            }
        } catch (e) {
            console.log(`FAILED: ${instance} - ${e.message}`);
        }
    }
}

check();
