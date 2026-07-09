import "./css/subtitle.css";
import videojs from "video.js";
import { registerSubtitlePlus } from "./plugin/register";

registerSubtitlePlus(videojs);

export * from "./plugin";
export * from "./types";
