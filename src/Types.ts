import type { Account } from "./Whisk.js";
import { ImageAspectRatio, VideoAspectRatio, ImageExtension, ImageModel, VideoGenerationModel, MediaCategory } from "./Constants.js";

export interface MediaConfig {
    seed: number;
    prompt: string;
    refined?: boolean;
    workflowId: string;
    encodedMedia: string;
    mediaGenerationId: string;
    mediaType: "VIDEO" | "IMAGE";
    aspectRatio: ImageAspectRatioType | VideoAspectRatioType;
    model: ImageModelType | VideoGenerationModelType;
    account: Account;
}

export interface PromptConfig {
    seed?: number;
    prompt: string;
    aspectRatio?: ImageAspectRatioType;
    model?: ImageModelType;
}

export interface RecipeMediaInput {
    caption: string;
    mediaGenerationId: string;
    category: MediaCategoryType;
}

export interface RecipeConfig {
    seed?: number;
    userInstruction: string;
    aspectRatio?: ImageAspectRatioType;
    subject: RecipeMediaInput;
    scene?: RecipeMediaInput;
    style?: RecipeMediaInput;
}

export type ImageAspectRatioType = typeof ImageAspectRatio[keyof typeof ImageAspectRatio];
export type VideoAspectRatioType = typeof VideoAspectRatio[keyof typeof VideoAspectRatio];
export type ImageExtensionTypes = typeof ImageExtension[keyof typeof ImageExtension];
export type ImageModelType = typeof ImageModel[keyof typeof ImageModel];
export type VideoGenerationModelType = typeof VideoGenerationModel[keyof typeof VideoGenerationModel];
export type MediaCategoryType = typeof MediaCategory[keyof typeof MediaCategory];
