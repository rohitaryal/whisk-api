export const Model = Object.freeze({
    NANO_BANANA: "GEM_PIX",
} as const);

export const AspectRatio = Object.freeze({
    SQUARE: "IMAGE_ASPECT_RATIO_SQUARE",
    PORTRAIT: "IMAGE_ASPECT_RATIO_PORTRAIT",
    LANDSCAPE: "IMAGE_ASPECT_RATIO_LANDSCAPE",
    UNSPECIFIED: "IMAGE_ASPECT_RATIO_UNSPECIFIED",
} as const);

export const ImageFormat = Object.freeze({
    JPEG: "jpeg",
    JPG: "jpg",
    JPE: "jpe",
    PNG: "png",
    GIF: "gif",
    WEBP: "webp",
    SVG: "svg",
    BMP: "bmp",
    TIFF: "tiff",
    APNG: "apng",
    AVIF: "avif",
} as const);

export const AttachmentSection = Object.freeze({
    SCENE: "MEDIA_CATEGORY_SCENE",
    STYLE: "MEDIA_CATEGORY_STYLE",
    SUBJECT: "MEDIA_CATEGORY_SUBJECT",
    BOARD: "MEDIA_CATEGORY_BOARD",
} as const)

export interface Session {
    user: {
        name: string;
        email: string;
        image: string;
    };
    expires: string;
    access_token: string;
};

export interface SearchedImage {
    name: string;
    media: {
        name: string;
        image: {
            seed: number;
            prompt: string;
            modelNameType: string;
            previousMediaGenerationId: string;
            workflowId: string;
            aspectRatio: string;
        };
        mediaGenerationId: MediaID;
    };
    createTime: string;
};

export interface SearchedProject {
    name: string;
    media: {
        name: string;
        image: {
            seed: number;
            prompt: string;
            modelNameType: string;
            previousMediaGenerationId: string;
            workflowId: string;
            fingerprintLogRecordId: string;
            aspectRatio: string;
        };
        mediaGenerationId: MediaID;
    };
    displayName: string;
    createTime: string;
    workflowDescription: string;
};

export interface SearchedVideo {
    name: string;
    media: {
        name: string;
        video: {
            seed: number;
            mediaGenerationId: string;
            prompt: string;
            model: string;
            baseImageMediaGenerationId: string;
            isLooped: boolean;
            aspectRatio: string;
        };
        mediaGenerationId: MediaID;
    };
    createTime: string;
};

export interface MediaID {
    mediaType: string;
    workflowId: string;
    workflowStepId: string;
    mediaKey: string;
};

export interface GeneratedImage {
    seed: number;
    prompt: string;
    imageModel: string;
    workflowId: string;
    aspectRatio: string;
    encodedImage: string;
    mediaVisibility: string;
    mediaGenerationId: string;
    fingerprintLogRecordId: string;
};

export interface SearchQuery {
    searchTerm?: string;
    searchResultLimit?: number;
    section: "IMAGE" | "VIDEO" | "PROJECT";
};

export interface CaptionConfig {
    content: string;
    count?: number;
    imageType?: ImageFormatType;
    deleteMediaAfterGeneration: boolean;
    type: "IAMGE_PATH" | "B64_IMAGE" | "MEDIA_ID";
};

export interface MediaInfo {
    name: string;
    image: GeneratedImage;
    createTime: string;
    backboneMetadata: {
        mediaCategory: AttachmentSectionType;
        recipeInput: {
            userInput: {
                userInstructions: string;
            };
            mediaInputs: {
                mediaGenerationId: string;
                mediaCategory: string;
            }[];
        };
    };
    mediaGenerationId: MediaID;
}

export interface UserUploadedMediaInfo {
    name: string;
    createTime: string;
    backboneMetadata: {
        mediaCategory: AttachmentSectionType;
        recipeInput: Record<string, unknown>;
    };
    userUploadedImage: {
        image: string;
        aspectRatio: AspectRatioType;
        mediaVisibility: string;
    };
    mediaGenerationId: MediaID;
}

export interface VideoInfo {
    name: string;
    video: {
        encodedVideo: string;
        seed: number;
        mediaGenerationId: string;
        prompt: string;
        mediaVisibility: string;
        servingBaseUri: string;
        model: string;
        baseImageMediaGenerationId: string;
        isLooped: boolean;
        aspectRatio: string;
        modelDisplayName: string;
        shareCardModelDisplayName: string;
    };
    createTime: string;
    backboneMetadata: {
        mediaCategory: string;
        recipeInput: {
            userInput: {
                userInstructions: string;
            };
            mediaInputs: Array<{
                mediaGenerationId: string;
                mediaCategory: string;
            }>;
        };
    };
    mediaGenerationId: {
        mediaType: string;
        workflowId: string;
        workflowStepId: string;
        mediaKey: string;
    };
}


export type ModelType = typeof Model[keyof typeof Model];
export type ImageFormatType = typeof ImageFormat[keyof typeof ImageFormat];
export type AspectRatioType = typeof AspectRatio[keyof typeof AspectRatio];
export type AttachmentSectionType = typeof AttachmentSection[keyof typeof AttachmentSection];
