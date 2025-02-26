import { event, REPO_OWNER, REPO_NAME, REPO_BRANCH, getSha, getPath, octokit, finish, SKIN_WIDTH, SKIN_HEIGHT, SIZE_LIMIT } from './common.js';
import { Jimp, JimpMime, PNGColorType } from 'jimp';

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
}

// Handle Skin
async function processSkin(imageUrl: string) {
    // Log
    console.log(`IMAGE: ${imageUrl}`);

    // Download Image
    const response = await fetch(imageUrl);
    if (response.status !== 200) {
        // Failed To Download Image
        await finish('Unable to downlaod skin!');
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

// Uplaod Skin
export async function uploadSkin() {
    // Find Skin
    let imageUrl: string | null = null;
    for (let line of (event.issue.body ?? '').split('\n')) {
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