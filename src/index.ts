import { event, finish, result } from './common';
import { deleteSkin } from './delete';
import { uploadSkin } from './upload';

// Main
(async function () {
    try {
        // Process Issue Body
        if (event.issue.body === null) {
            // Empty Body
            await finish('Empty issue body!');
        } else {
            // Pick Mode
            const deleteMode = event.issue.body.trim() === 'DELETE-SKIN';
            // Log
            console.log(`MODE: ${deleteMode ? 'Delete Skin' : 'Uplaod Skin'}`);

            // Run
            if (deleteMode) {
                // Delete Skin
                await deleteSkin();
            } else {
                // Upload Skin
                await uploadSkin();
            }
        }
    } catch (e) {
        // Log
        console.log(`ERROR: ${e instanceof Error ? e.stack : e}`);

        // Error
        await finish('An unexpected error has occurred!');
    }

    // Exit
    process.exit(result.success ? 0 : 1);
})();