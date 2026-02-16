import fs from "fs";
import type { ImageExtensionTypes, ImageInput } from "./Types.js";
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
 * Fetches an image from a URL and returns base64 encoded string
 *
 * @param url URL of the image to fetch
 */
export async function imageFromUrl(url: string): Promise<string> {
    if (!(url?.trim?.())) {
        throw new Error("url is required");
    }

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch image (${response.status}): ${url}`);
    }

    const contentType = response.headers.get("content-type") || "";
    const imageType = contentType.split("/")[1]?.split(";")[0] as ImageExtensionTypes;

    if (!Object.values(ImageExtension).includes(imageType)) {
        throw new Error(`'${url}': unsupported image type '${contentType}'`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    return `data:image/${imageType};base64,${buffer.toString("base64")}`;
}

export async function resolveImageInput(input: ImageInput): Promise<string> {
    if ("file" in input) return await imageToBase64(input.file);
    if ("url" in input) return await imageFromUrl(input.url);
    return input.base64;
}

export async function imageToBase64(imagePath: string): Promise<string> {
    if (!(imagePath?.trim?.()) || !fs.existsSync(imagePath)) {
        throw new Error(`'${imagePath}': image not found`);
    }

    const imageType = path.extname(imagePath).slice(1) as ImageExtensionTypes;

    if (!Object.values(ImageExtension).includes(imageType)) {
        throw new Error(`'${imagePath}': unsupported image type '${imageType}'`)
    }

    const base64Header = `data:image/${imageType};base64,`

    return new Promise((resolve, reject) => {
        fs.readFile(imagePath, (err, data) => {
            if (err) return reject(err);
            resolve(base64Header + data.toString("base64"));
        });
    });
}
