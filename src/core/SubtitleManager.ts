import {
    ActiveCue,
    SubtitleCue,
    SubtitleStyle,
    SubtitleTrack
} from "../types";

import { SubtitleStore } from "./SubtitleStore";

import { EventEmitter } from "./EventEmitter";

import { SubtitleEvents } from "../constants/events";

import { binarySearchCue } from "./BinarySearch";

export class SubtitleManager {

    readonly store = new SubtitleStore();

    readonly events = new EventEmitter();

    constructor() { }

    /**
     * Add subtitle track
     */
    addTrack(track: SubtitleTrack): void {

        if (this.store.tracks.has(track.id)) {

            throw new Error(
                `Track "${track.id}" already exists`
            );

        }

        this.store.tracks.set(
            track.id,
            track
        );

        this.events.emit(
            SubtitleEvents.TRACK_ADDED,
            track
        );

    }

    /**
     * Remove track
     */
    removeTrack(id: string): void {

        if (
            !this.store.tracks.has(id)
        ) {

            return;

        }

        this.store.tracks.delete(id);

        this.store.enabledTracks.delete(id);

        this.store.activeCues.delete(id);

        this.store.trackCaches.delete(id);

        this.events.emit(

            SubtitleEvents.TRACK_REMOVED,

            id

        );

    }

    /**
     * Get track
     */
    getTrack(
        id: string
    ): SubtitleTrack | undefined {

        return this.store
            .tracks
            .get(id);

    }

    /**
 * Check track exists
 */
    hasTrack(
        id: string
    ): boolean {

        return this.store.tracks.has(id);

    }

    /**
     * Get all tracks
     */
    getTracks(): SubtitleTrack[] {

        return Array.from(

            this.store.tracks.values()

        );

    }

    /**
     * Enable subtitle
     */
    enableTrack(id: string): boolean {

        if (
            !this.store.tracks.has(id)
        ) {

            return false;

        }

        this.store.enabledTracks.add(id);

        this.events.emit(

            SubtitleEvents.TRACK_ENABLED,

            this.store.tracks.get(id)

        );

        return true;

    }

    /**
     * Disable subtitle
     */
    disableTrack(id: string): void {

        if (
            !this.store.enabledTracks.has(id)
        ) {

            return;

        }

        this.store.enabledTracks.delete(id);

        this.store.activeCues.delete(id);

        this.store.trackCaches.delete(id);
        
        this.events.emit(

            SubtitleEvents.TRACK_DISABLED,

            id

        );

    }

    /**
     * Enable one track only
     */
    switchTrack(id: string): boolean {

        if (
            !this.store.tracks.has(id)
        ) {

            return false;

        }

        this.store.enabledTracks.clear();

        this.store.activeCues.clear();

        this.store.enabledTracks.add(id);

        this.events.emit(

            SubtitleEvents.TRACK_SWITCHED,

            this.store.tracks.get(id)

        );

        return true;

    }

    /**
     * Clear enabled tracks
     */
    clearTracks(): void {

        this.store.enabledTracks.clear();

        this.store.activeCues.clear();

    }

    /**
     * Enabled ids
     */
    getEnabledTrackIds(): string[] {

        return Array.from(

            this.store.enabledTracks

        );

    }

    /**
 * Check track enabled
 */
    isTrackEnabled(
        id: string
    ): boolean {

        return this.store.enabledTracks.has(id);

    }

    /**
     * Enabled tracks
     */
    getEnabledTracks(): SubtitleTrack[] {

        return this.getEnabledTrackIds()

            .map(id => this.store.tracks.get(id))

            .filter(Boolean) as SubtitleTrack[];

    }

    private resolveCue(

        track: SubtitleTrack,

        currentTime: number

    ): SubtitleCue | null {

        const cache =

            this.store.trackCaches.get(

                track.id

            );

        /**
         * First search
         */
        if (!cache) {

            const result =

                binarySearchCue(

                    track.cues,

                    currentTime

                );

            this.store.trackCaches.set(

                track.id,

                {

                    cue: result.cue ?? undefined,

                    index: result.index

                }

            );

            return result.cue;

        }

        /**
         * Cache hit
         */

        if (

            cache.cue &&

            currentTime >= cache.cue.start &&

            currentTime <= cache.cue.end

        ) {

            return cache.cue;

        }

        /**
         * next cue
         */

        const next =

            track.cues[

            cache.index + 1

            ];

        if (

            next &&

            currentTime >= next.start &&

            currentTime <= next.end

        ) {

            cache.index++;

            cache.cue = next;

            return next;

        }

        /**
         * previous cue
         */

        const prev =

            track.cues[

            cache.index - 1

            ];

        if (

            prev &&

            currentTime >= prev.start &&

            currentTime <= prev.end

        ) {

            cache.index--;

            cache.cue = prev;

            return prev;

        }

        /**
         * seek
    
         * binary search
    
         */

        const result =

            binarySearchCue(

                track.cues,

                currentTime

            );

        cache.index =

            result.index;

        cache.cue =

            result.cue ?? undefined;

        return result.cue;

    }

    /**
 * Get current cue of one track
 */
    getCurrentCue(
        trackId: string,
        currentTime: number
    ): SubtitleCue | null {

        const track =
            this.store.tracks.get(trackId);

        if (!track) {

            return null;

        }

        const cue =
            this.resolveCue(
                track,
                currentTime
            );

        if (cue) {

            this.store.activeCues.set(
                track.id,
                {
                    trackId: track.id,
                    cue
                }
            );

        } else {

            this.store.activeCues.delete(
                track.id
            );

        }

        return cue;

    }

    /**
 * Get cues of all enabled tracks
 */
    getCurrentCues(
        currentTime: number
    ): ActiveCue[] {

        const result: ActiveCue[] = [];

        for (const track of this.getEnabledTracks()) {

            const cue =
                this.getCurrentCue(
                    track.id,
                    currentTime
                );

            if (cue) {

                result.push({

                    trackId: track.id,

                    cue

                });

            }

        }

        return result;

    }

    /**
 * Update current time
 */
    update(
        currentTime: number
    ): ActiveCue[] {

        if (
            this.store.currentTime === currentTime
        ) {

            return Array.from(
                this.store.activeCues.values()
            );

        }

        this.store.currentTime =
            currentTime;

        const cues =
            this.getCurrentCues(
                currentTime
            );

        this.events.emit(
            SubtitleEvents.CUE_CHANGED,
            cues
        );

        return cues;

    }

    setStyle(
        style: Partial<SubtitleStyle>
    ): void {

        this.store.style = {

            ...this.store.style,

            ...style

        };

        this.events.emit(

            SubtitleEvents.STYLE_CHANGED,

            this.store.style

        );

    }

    mergeStyle(
        style: Partial<SubtitleStyle>
    ): SubtitleStyle {

        return {

            ...this.store.style,

            ...style

        };

    }

    getStyle(): SubtitleStyle {

        return {

            ...this.store.style

        };

    }

    resetStyle(): void {

        this.store.style = {

            color: "#fff",

            fontSize: 26,

            fontFamily: "Arial",

            fontWeight: "600",

            background: "transparent",

            position: "bottom",

            lineHeight: 1.4

        };

        this.events.emit(

            SubtitleEvents.STYLE_CHANGED,

            this.store.style

        );

    }

    clear(): void {

        this.store.tracks.clear();

        this.store.enabledTracks.clear();

        this.store.activeCues.clear();

        this.store.trackCaches.clear();

        this.store.currentTime = 0;

    }

    destroy(): void {

        this.clear();

        this.events.clear();

    }
}