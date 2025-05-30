import { event } from './common.js';

// Map GitHub Usernames To MC Ones
//
// Used for players with established MC usernames.
// Or players whose GitHub usernames are invalid.
//
// Request an entry in this map on Discord.
export const GITHUB_USERNAME_TO_MC = new Map<string, string>([
    ['Red-exe-Engineer', 'Wallee']
]);

// Reserved Usernames
export const RESERVED_USERNAMES = [
    'Steve',
    'StevePi',
    'Alex',
    'AlexPi',
    ...GITHUB_USERNAME_TO_MC.values()
];

// Get Usernames
export const githubUsername = event.issue.user.login;
const replacementUsername = GITHUB_USERNAME_TO_MC.get(githubUsername);
export const minecraftUsername = replacementUsername ?? githubUsername;

// Get File Name
function getFilename() {
    return Buffer.from(minecraftUsername).toString('base64url');
}
export function getPath() {
    return `${getFilename()}.png`;
}