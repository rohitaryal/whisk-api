import { ImageGenerationModel, MediaCategory } from "./Constants.js";
import { Media } from "./Media.js";
import type { ImageGenerationModelType, MediaCategoryType, PromptConfig, ReferenceImageResult } from "./Types.js";
import { request } from "./Utils.js";
import { Account } from "./Whisk.js";

export class Project {
    readonly account: Account;
    readonly projectId: string;

    constructor(projectId: string, account: Account) {
        if (typeof projectId !== "string" || !projectId.trim()) {
            throw new Error("project id is either invalid or missing")
        }

        if (!(account instanceof Account)) {
            throw new Error("account is invalid or missing")
        }

        this.projectId = projectId;
        this.account = account;
    }

    async generateImage(input: string | PromptConfig): Promise<Media> {
        if (typeof input === "string") {
            input = {
                seed: 0,
                prompt: input,
                model: "IMAGEN_3_5",
                aspectRatio: "IMAGE_ASPECT_RATIO_LANDSCAPE"
            } as PromptConfig;
        }

        if (!input.seed) input.seed = 0;
        if (!input.model) input.model = "IMAGEN_3_5";
        if (!input.aspectRatio) input.aspectRatio = "IMAGE_ASPECT_RATIO_LANDSCAPE";
        if (!input.prompt?.trim?.()) throw new Error("prompt is required");

        if (!Object.values(ImageGenerationModel).includes(input.model as ImageGenerationModelType)) {
            throw new Error(`'${input.model}': invalid image generation model provided`)
        }

        const generationResponse = await request<any>(
            "https://aisandbox-pa.googleapis.com/v1/whisk:generateImage", {
            headers: { authorization: `Bearer ${await this.account.getToken()}` },
            body: JSON.stringify({
                "clientContext": {
                    "workflowId": this.projectId
                },
                "imageModelSettings": {
                    "imageModel": input.model,
                    "aspectRatio": input.aspectRatio
                },
                "seed": input.seed,
                "prompt": input.prompt,
                "mediaCategory": "MEDIA_CATEGORY_BOARD"
            })
        });

        const img = generationResponse.imagePanels[0].generatedImages[0];

        return new Media({
            seed: img.seed,
            prompt: img.prompt,
            workflowId: img.workflowId ?? generationResponse.workflowId,
            encodedMedia: img.encodedImage,
            mediaGenerationId: img.mediaGenerationId,
            aspectRatio: img.aspectRatio,
            mediaType: "IMAGE",
            model: img.imageModel,
            account: this.account
        });
    }

    /**
     * Upload a reference image to the project.
     * Captions the image automatically and uploads it with the given category.
     *
     * @param input Base64 encoded image (e.g. "data:image/jpeg;base64,...")
     * @param category Media category: MEDIA_CATEGORY_SUBJECT, MEDIA_CATEGORY_SCENE, or MEDIA_CATEGORY_STYLE
     * @returns Upload result with the media generation id, caption, and category
     */
    async uploadReferenceImage(input: string, category: MediaCategoryType): Promise<ReferenceImageResult> {
        if (!(input?.trim?.())) {
            throw new Error("input image is required");
        }

        if (!Object.values(MediaCategory).includes(category)) {
            throw new Error(`'${category}': invalid media category`);
        }

        const sessionId = `;${Date.now()}`;

        // Step 1: Caption the image
        const captionResult = await request<{ candidates: { output: string; mediaGenerationId: string }[] }>(
            "https://labs.google/fx/api/trpc/backbone.captionImage",
            {
                headers: { cookie: this.account.getCookie() },
                body: JSON.stringify({
                    "json": {
                        "clientContext": {
                            "sessionId": sessionId,
                            "workflowId": this.projectId
                        },
                        "captionInput": {
                            "candidatesCount": 1,
                            "mediaInput": {
                                "mediaCategory": category,
                                "rawBytes": input
                            }
                        }
                    }
                })
            }
        );

        const caption = captionResult.candidates[0].output;

        // Step 2: Upload the image with caption
        const uploadResult = await request<{ uploadMediaGenerationId: string }>(
            "https://labs.google/fx/api/trpc/backbone.uploadImage",
            {
                headers: { cookie: this.account.getCookie() },
                body: JSON.stringify({
                    "json": {
                        "clientContext": {
                            "workflowId": this.projectId,
                            "sessionId": sessionId
                        },
                        "uploadMediaInput": {
                            "mediaCategory": category,
                            "rawBytes": input,
                            "caption": caption
                        }
                    }
                })
            }
        );

        return {
            uploadMediaGenerationId: uploadResult.uploadMediaGenerationId,
            caption,
            category,
        };
    }

    /**
    * Deletes the project, clearance of your slop from the existance
    */
    async delete() {
        await request(
            "https://labs.google/fx/api/trpc/media.deleteMedia",
            {
                headers: { cookie: this.account.getCookie() },
                body: JSON.stringify({
                    "json": {
                        "parent": "userProject/", "names": [this.projectId]
                    }
                }),
            }
        )
    }
}
