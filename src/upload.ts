import { event, REPO_OWNER, REPO_NAME, REPO_BRANCH, getSha, octokit, finish, SKIN_WIDTH, SKIN_HEIGHT, SIZE_LIMIT } from './common.js';
import { Jimp, JimpMime, PNGColorType } from 'jimp';
import { getPath, githubUsername } from './usernames.js';

// Upload Skin
async function uploadSkinFile(data: string) {
    // Get Existing File (If It Exists)
    const sha = await getSha(getPath());

    // Create File
    await octokit.rest.repos.createOrUpdateFileContents({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: getPath(),
        message: `Upload Skin: @${githubUsername}`,
        content: data,
        ...(sha !== undefined && {sha}),
        branch: REPO_BRANCH
    });

    // Success
    await finish('Skin successfully uploaded!');
}

// Handle Skin
async function processSkin(imageUrl: string) {
    // Log
    console.log(`IMAGE: ${imageUrl}`);

    // Download Image
    const response = await fetch(imageUrl);
    if (response.status !== 200) {
        // Failed To Download Image
        await finish('Unable to download skin!');
        return;
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Check Image Size
    const image = await Jimp.read(buffer);
    if (image.width !== SKIN_WIDTH || image.height !== SKIN_HEIGHT) {
        // Incorrect Size
        await finish(`Skins must be ${SKIN_WIDTH.toString()}x${SKIN_HEIGHT.toString()} pixels!`);
        return;
    }

    // Save
    image.opaque();
    const buffer2 = await image.getBuffer(JimpMime.png, {colorType: PNGColorType.COLOR_ALPHA});
    const data = buffer2.toString('base64');

    // Size Limit
    if (buffer2.length > SIZE_LIMIT) {
        await finish(`Skins must be less than or equal to ${(SIZE_LIMIT / 1000).toString()} KB!`);
        return;
    }

    // Upload
    await uploadSkinFile(data);
}

// Upload Skin
export async function uploadSkin() {
    // Find Skin
    let imageUrl: string | null = null;
    for (let line of (event.issue.body ?? '').split('\n')) {
        line = line.trim();
        // Find URL
        for (let protocol of ['http', 'https']) {
            // Find Start Of URL
            protocol += '://';
            const start = line.indexOf(protocol);
            if (start === -1) {
                continue;
            }
            // Find End Of URL
            let end = line.length;
            for (const possibleEnding of [')', '"']) {
                const index = line.indexOf(possibleEnding, start);
                if (index === -1) {
                    continue;
                }
                end = Math.min(end, index);
            }
            // Get Substring
            imageUrl = line.substring(start, end);
            break;
        }
        // Check If URL Was Found
        if (imageUrl) {
            break;
        }
    }

    // Process URL
    if (imageUrl === null) {
        // Could Not Find Image
        await finish('Unable to find skin in issue body!');
    } else {
        // Image Found
        await processSkin(imageUrl);
    }
}