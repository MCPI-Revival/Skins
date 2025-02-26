import { getSha, getPath, octokit, REPO_OWNER, REPO_NAME, REPO_BRANCH, finish, event } from './common.js';

// Delete Skin
export async function deleteSkin() {
    // Get Existing File (If It Exists)
    const sha = await getSha(getPath());

    // Check If File Exists
    if (sha !== undefined) {
        // Actually Delete Skin
        await octokit.rest.repos.deleteFile({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: getPath(),
            message: `Delete Skin: @${event.issue.user.login}`,
            sha: sha,
            branch: REPO_BRANCH
        });

        // Success
        await finish('Skin successfully deleted!');
    } else {
        // Doesn't Exist
        await finish('Skin does not exist!');
    }
}