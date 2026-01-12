export const ImageExtension = Object.freeze({
    JPG: "jpg",
    JPEG: "jpeg",
    PNG: "png",
    GIF: "gif",
    WEBP: "webp",
    AVIF: "avif",
    HEIC: "heic",
    HEIF: "heif",
    BMP: "bmp",
    TIF: "tif",
    TIFF: "tiff",
    SVG: "svg",
    ICO: "ico"
} as const);

export const ImageAspectRatio = Object.freeze({
    SQUARE: "IMAGE_ASPECT_RATIO_SQUARE",
    PORTRAIT: "IMAGE_ASPECT_RATIO_PORTRAIT",
    LANDSCAPE: "IMAGE_ASPECT_RATIO_LANDSCAPE",
    UNSPECIFIED: "IMAGE_ASPECT_RATIO_UNSPECIFIED",
} as const);

export const VideoAspectRatio = Object.freeze({
    SQUARE: "VIDEO_ASPECT_RATIO_SQUARE",
    PORTRAIT: "VIDEO_ASPECT_RATIO_PORTRAIT",
    LANDSCAPE: "VIDEO_ASPECT_RATIO_LANDSCAPE",
    UNSPECIFIED: "VIDEO_ASPECT_RATIO_UNSPECIFIED",
} as const);

export const ImageModel = Object.freeze({
    R2I: "R2I",
    GEM_PIX: "GEM_PIX",
} as const);

export const VideoGenerationModel = Object.freeze({
    VEO_3_1: "VEO_3_1_I2V_12STEP",
} as const);

export const MediaCategory = Object.freeze({
    SUBJECT: "MEDIA_CATEGORY_SUBJECT",
    SCENE: "MEDIA_CATEGORY_SCENE",
    STYLE: "MEDIA_CATEGORY_STYLE",
    BOARD: "MEDIA_CATEGORY_BOARD",
} as const);
