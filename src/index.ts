import { Octokit } from '@octokit/rest';
import { IssuesOpenedEvent } from '@octokit/webhooks-types';
import { createActionAuth } from '@octokit/auth-action';
import Jimp from 'jimp';

// Contants
const REPO_OWNER = 'MCPI-Revival';
const REPO_NAME = 'Skins';
const REPO_BRANCH = 'hdata';
const SKIN_WIDTH = 64;
const SKIN_HEIGHT = 32;

// Parse Arguments
const event: IssuesOpenedEvent = JSON.parse(process.env['GITHUB_EVENT']!);

// Connect
const octokit = new Octokit({
    authStrategy: createActionAuth
});

// Error
async function error(message: string) {
    // Post Comment
    await octokit.rest.issues.createComment({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        issue_number: event.issue.number,
        body: message
    });

    // Close Issue
    await octokit.rest.issues.update({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        issue_number: event.issue.number,
        state: 'closed',
        state_reason: 'completed'
    });

    // Lock Issue
    await octokit.rest.issues.lock({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        issue_number: event.issue.number
    });
}

// Uplaod Image
async function uploadImage(data: string) {
    // Get File Name
    const path = Buffer.from(event.issue.user.name!).toString('base64') + '.png';

    // Get Existing File (If It Exists)
    let sha: string | undefined = undefined;
    try {
        const existing = await octokit.rest.repos.getContent({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: path,
            ref: REPO_BRANCH
        });
        if (!Array.isArray(existing.data)) {
            // File Exists
            sha = existing.data.sha;
        }
    } catch (e) {
        // Ignore Error
    }

    // Create File
    await octokit.rest.repos.createOrUpdateFileContents({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: path,
        message: 'Upload Skin',
        content: data,
        ...(sha !== undefined && {sha: sha}),
        branch: REPO_BRANCH,
        committer: {
            name: event.issue.user.name!,
            email: event.issue.user.email!
        }
    });

    // Success
    await error('Skin successfully uploaded!');
}

// Handle Image
async function handleImage(imageUrl: string) {
    // Download Image
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Check Image Size
    const image = await Jimp.read(buffer);
    if (image.getWidth() != SKIN_WIDTH || image.getHeight() != SKIN_HEIGHT) {
        // Incorrect Size
        error(`Skins must be ${SKIN_WIDTH}x${SKIN_HEIGHT} pixels!`);
        return;
    }

    // Save
    image.rgba(true);
    const data = (await image.getBufferAsync(Jimp.MIME_PNG)).toString('base64');

    // Upload
    await uploadImage(data);
}

// Main
(async function () {
    try {
        // Find Image
        if (event.issue.body !== null) {
            let imageUrl: string | null = null;
            for (let line of event.issue.body.split('\n')) {
                line = line.trim();
                if (line.startsWith('![') && line.endsWith(']')) {
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
                if (line.startsWith('http')) {
                    // Found Image
                    imageUrl = line;
                    break;
                }
            }
            if (imageUrl === null) {
                // Could Not Find Image
                await error('Unable to find skin in issue body!');
            } else {
                // Image Found
                await handleImage(imageUrl);
            }
        }
    } catch (e) {
        // Error
        error('An unexpected error has occurred!');
    }
})();