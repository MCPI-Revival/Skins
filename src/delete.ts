import { getSha, path, octokit, REPO_OWNER, REPO_NAME, filename, REPO_BRANCH, event, finish, result } from './common';

// Delete Skin
export async function deleteSkin() {
    // Get Existing File (If It Exists)
    const sha = await getSha(path);

    // Check If File Exists
    if (sha !== undefined) {
        // Actually Delete Skin
        await octokit.rest.repos.deleteFile({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: path,
            message: `Delete Skin: ${filename}`,
            sha: sha,
            branch: REPO_BRANCH,
            committer: {
                name: event.issue.user.name!,
                email: event.issue.user.email!
            }
        });

        // Success
        await finish('Skin successfully deleted!');
        result.success = true;
    } else {
        // Doesn't Exist
        finish('Skin does not exist!');
    }
}