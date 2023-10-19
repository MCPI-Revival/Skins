import { event, REPO_OWNER, REPO_NAME, REPO_BRANCH, getSha, getPath, octokit, finish, result, SKIN_WIDTH, SKIN_HEIGHT } from './common';
import Jimp from 'jimp';

// Uplaod Skin
async function uploadSkinFile(data: string) {
    // Get Existing File (If It Exists)
    const sha = await getSha(getPath());

    // Create File
    await octokit.rest.repos.createOrUpdateFileContents({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: getPath(),
        message: `Upload Skin: @${event.issue.user.login}`,
        content: data,
        ...(sha !== undefined && {sha: sha}),
        branch: REPO_BRANCH
    });

    // Success
    await finish('Skin successfully uploaded!');
    result.success = true;
}

// Handle Skin
async function processSkin(imageUrl: string) {
    // Log
    console.log(`IMAGE: ${imageUrl}`);

    // Download Image
    const response = await fetch(imageUrl);
    console.log(`DEBUG A: ${response}`);
    const arrayBuffer = await response.arrayBuffer();
    console.log(`DEBUG B: ${arrayBuffer}`);
    const buffer = Buffer.from(arrayBuffer);
    console.log(`DEBUG C: ${buffer}`);

    // Check Image Size
    const image = await Jimp.read(buffer);
    if (image.getWidth() != SKIN_WIDTH || image.getHeight() != SKIN_HEIGHT) {
        // Incorrect Size
        finish(`Skins must be ${SKIN_WIDTH}x${SKIN_HEIGHT} pixels!`);
        return;
    }

    // Save
    image.rgba(true);
    const buffer2 = await image.getBufferAsync(Jimp.MIME_PNG);
    const data = buffer2.toString('base64');

    // Upload
    await uploadSkinFile(data);
}

// Uplaod Skin
export async function uploadSkin() {
    // Find Skin
    let imageUrl: string | null = null;
    for (let line of event.issue.body!.split('\n')) {
        line = line.trim();
        if (line.startsWith('![') && line.endsWith(')')) {
            // Markdown Image
            const urlStartIndicator = '](';
            let urlStart = line.indexOf(urlStartIndicator);
            if (urlStart !== -1) {
                urlStart += urlStartIndicator.length;
                const urlEnd = line.length - 1;
                if (urlEnd > urlStart) {
                    line = line.substring(urlStart, urlEnd);
                }
            }
        }
        if (line.startsWith('http://') || line.startsWith('https://')) {
            // Found Image
            imageUrl = line;
            break;
        }
    }
    if (imageUrl === null) {
        // Could Not Find Image
        await finish('Unable to find skin in issue body!');
    } else {
        // Image Found
        await processSkin(imageUrl);
    }
}