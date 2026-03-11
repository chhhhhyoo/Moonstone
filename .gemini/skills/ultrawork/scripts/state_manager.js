const fs = require('fs');
const path = require('path');

// Configuration
const STATE_FILE = path.join(__dirname, '../../../state.json');

// Helper to ensure file exists
function ensureStateFile() {
    if (!fs.existsSync(STATE_FILE)) {
        fs.writeFileSync(STATE_FILE, JSON.stringify({ ultrawork: { status: 'idle' } }, null, 2));
    }
}

// Actions
const actions = {
    read: () => {
        ensureStateFile();
        console.log(fs.readFileSync(STATE_FILE, 'utf8'));
    },
    
    init: (args) => {
        ensureStateFile();
        const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
        state.ultrawork = {
            status: 'planning',
            started_at: new Date().toISOString(),
            feature_name: args[0] || 'unnamed',
            plan_path: null,
            current_step: null
        };
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
        console.log(JSON.stringify(state));
    },

    update: (args) => {
        ensureStateFile();
        const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
        // args format: key=value
        args.forEach(arg => {
            const [key, val] = arg.split('=');
            if (key && val) state.ultrawork[key] = val;
        });
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
        console.log(JSON.stringify(state));
    },

    reset: () => {
        const state = { ultrawork: { status: 'idle' } };
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
        console.log(JSON.stringify(state));
    }
};

// CLI Dispatch
const cmd = process.argv[2];
const args = process.argv.slice(3);

if (actions[cmd]) {
    actions[cmd](args);
} else {
    console.error(`Unknown command: ${cmd}`);
    process.exit(1);
}
