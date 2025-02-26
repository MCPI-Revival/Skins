import { RESERVED_USERNAMES, event, finish } from './common.js';
import { deleteSkin } from './delete.js';
import { uploadSkin } from './upload.js';

// Capitalize First Letter Of String
function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Main
/* eslint @typescript-eslint/no-floating-promises: 'off' */
(async function () {
    try {
        // Reserved Usernames
        if (RESERVED_USERNAMES.includes(event.issue.user.login)) {
            // Block
            await finish('That username is reserved!');
        } else {
            // Process Issue Body
            if (!event.issue.body) {
                // Empty Body
                await finish('Empty issue body!');
            } else {
                // Pick Mode
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
        }
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