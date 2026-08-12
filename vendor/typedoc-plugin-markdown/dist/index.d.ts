import { Application } from 'typedoc';
/**
 * The function that is called by TypeDoc to bootstrap the plugin.
 *
 * @remarks
 *
 * The load function exposes additional TypeDoc options and make some adjustments.
 *
 * This method is not intended to be consumed in any other context that via the `plugin` option.
 *
 * The module also exports anything that is available publicly.
 *
 */
export declare function load(app: Application): void;
/**
 * Export anything that is available publicly.
 */
export * from './public-api.js';
