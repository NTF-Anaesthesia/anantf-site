// One backend for the app: the shared one (Firebase, cloud.js) once firebase-config.js has a project, otherwise this
// browser only (local.js). ?demo always means local. Both export the same functions.
import * as cloud from './cloud.js';
import * as local from './local.js';
export const mode = cloud.enabled ? 'cloud' : 'local';
export const api = cloud.enabled ? cloud : local;
export const isDemo = new URLSearchParams(location.search).has('demo');
