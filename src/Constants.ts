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

export const ImageGenerationModel = Object.freeze({
    IMAGEN_3_5: "IMAGEN_3_5",
} as const);

export const ImageRefinementModel = Object.freeze({
    GEM_PIX: "GEM_PIX",
});

export const VideoGenerationModel = Object.freeze({
    VEO_3_1: "VEO_3_1_I2V_12STEP",
    VEO_FAST_3_1: "veo_3_1_i2v_s_fast",
} as const);
