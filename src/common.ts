import { Octokit } from '@octokit/rest';
import { IssuesOpenedEvent } from '@octokit/webhooks-types';
import { createActionAuth } from '@octokit/auth-action';

// Constants
export const REPO_OWNER = 'MCPI-Revival';
export const REPO_NAME = 'Skins';
export const REPO_BRANCH = 'data';
export const SKIN_WIDTH = 64;
export const SKIN_HEIGHT = 32;
export const SIZE_LIMIT = 8000;

// Parse Arguments
export const event = JSON.parse(process.env['GITHUB_EVENT'] ?? '') as IssuesOpenedEvent;

// Connect
export const octokit = new Octokit({
    authStrategy: createActionAuth
});

// Add Comment & Close Issue
export async function finish(message: string) {
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

    // Log
    console.log(`FINISHED: ${message}`);
}

// Get File SHA
export async function getSha(path: string) {
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
        void e;
    }
    // Log
    console.log(`EXISTING FILE SHA: ${sha ?? 'N/A'}`);

    // Return
    return sha;
}