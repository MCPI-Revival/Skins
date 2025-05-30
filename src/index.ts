import { event, finish } from './common.js';
import { deleteSkin } from './delete.js';
import { uploadSkin } from './upload.js';
import { githubUsername, RESERVED_USERNAMES, minecraftUsername } from './usernames.js';

// Capitalize First Letter Of String
function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Handle Event
async function handle() {
    // Log
    console.log(`GITHUB USERNAME: ${githubUsername}`);
    console.log(`MINECRAFT USERNAME: ${minecraftUsername}`);

    // Check GitHub Username
    if (RESERVED_USERNAMES.includes(githubUsername)) {
        // Block Reserved Usernames
        await finish('That username is reserved!');
        return;
    }
    for (let i = 0; i < minecraftUsername.length; i++) {
        const c = minecraftUsername.charCodeAt(i);
        if (c < 32 || c > 126) {
            await finish('Invalid character in username!');
            return;
        }
    }

    // Check Issue Body
    if (!event.issue.body) {
        // Block Empty Body
        await finish('Empty issue body!');
        return;
    }

    // Pick Mode From Issue Label
    let mode: string | null = null;
    if (event.issue.labels) {
        for (const label of event.issue.labels) {
            mode = label.name.toLowerCase();
            break;
        }
    }
    // Log
    const modeStr = mode ? `${capitalizeFirstLetter(mode)} Skin` : 'None';
    console.log(`MODE: ${modeStr}`);

    // Run
    if (mode === 'delete') {
        // Delete Skin
        await deleteSkin();
    } else if (mode === 'upload') {
        // Upload Skin
        await uploadSkin();
    } else {
        // Invalid Mode
        await finish('Invalid mode!');
    }
}

// Main
/* eslint @typescript-eslint/no-floating-promises: 'off' */
(async function () {
    try {
        // Handle
        await handle();
    } catch (e) {
        // Log
        let message = 'Unknown';
        if (e instanceof Error && e.stack) {
            message = e.stack;
        }
        console.log(`ERROR: ${message}`);

        // Error
        await finish('An unexpected error has occurred!');

        // Exit
        process.exit(1);
    }
})();