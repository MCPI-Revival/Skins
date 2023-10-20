import { RESERVED_USERNAMES, event, finish } from './common';
import { deleteSkin } from './delete';
import { uploadSkin } from './upload';

// Capitalize First Letter Of String
function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Main
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
        console.log(`ERROR: ${e instanceof Error ? e.stack : e}`);

        // Error
        await finish('An unexpected error has occurred!');

        // Exit
        process.exit(1);
    }
})();