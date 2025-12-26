import type { Account } from "./Whisk.js";
import { ImageAspectRatio, VideoAspectRatio, ImageExtension, ImageGenerationModel, VideoGenerationModel, ImageRefinementModel } from "./Constants.js";

export interface MediaConfig {
    seed: number;
    prompt: string;
    refined?: boolean;
    workflowId: string;
    encodedMedia: string;
    mediaGenerationId: string;
    mediaType: "VIDEO" | "IMAGE";
    aspectRatio: ImageAspectRatioType | VideoAspectRatioType;
    model: ImageGenerationModelType | VideoGenerationModelType;
    account: Account;
}

export interface PromptConfig {
    seed?: number;
    prompt: string;
    aspectRatio?: ImageAspectRatioType | VideoAspectRatioType;
    model?: ImageGenerationModelType | VideoGenerationModelType;
}

export type ImageAspectRatioType = typeof ImageAspectRatio[keyof typeof ImageAspectRatio];
export type VideoAspectRatioType = typeof VideoAspectRatio[keyof typeof VideoAspectRatio];
export type ImageExtensionTypes = typeof ImageExtension[keyof typeof ImageExtension];
export type ImageGenerationModelType = typeof ImageGenerationModel[keyof typeof ImageGenerationModel];
export type VideoGenerationModelType = typeof VideoGenerationModel[keyof typeof VideoGenerationModel];
export type ImageRefinementModelType = typeof ImageRefinementModel[keyof typeof ImageRefinementModel];
