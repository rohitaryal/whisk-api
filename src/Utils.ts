import fs from "fs";
import type { ImageExtensionTypes } from "./Types.js";
import path from "path";
import { ImageExtension } from "./Constants.js";

/**
 * Make a request, thats all
 *
 * @param input URL or Request object
 * @param init Settings for request() method
 */
export async function request<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
    if (init) {
        init.method = init.method ?? (init.body ? "POST" : "GET");
    }
    const request = await fetch(input, init);

    if (!request.ok) {
        const errorText = await request.text();
        throw new Error(`API Error (${request.status}): ${errorText}`);
    }

    const json = await request.json();

    return (json.result?.data?.json?.result || json) as T;
}

/**
 * Returns base64 encoded image
 *
 * @param imagePath Path to image file
 * @param imageType Extension of image (if that matters)
 */
export async function imageToBase64(imagePath: string, imageType?: ImageExtensionTypes): Promise<string> {
    if (!(imagePath?.trim?.()) || !fs.existsSync(imagePath)) {
        throw new Error(`'${imagePath}': image not found`);
    }

    // Try to figure out image type from its extension
    if (!(imageType?.trim?.())) {
        imageType = path.extname(imagePath).slice(1) as ImageExtensionTypes;
    }

    // If extension not in valid extension list throw error
    if (!Object.values(ImageExtension).includes(imageType)) {
        throw new Error(`'${imagePath}': couldn't identify image type, please specify 'imageType'`)
    }

    const base64Header = `data:image/${imageType};base64,`

    return new Promise((resolve, reject) => {
        fs.readFile(imagePath, (err, data) => {
            if (err) return reject(err);
            resolve(base64Header + data.toString("base64"));
        });
    });
}
