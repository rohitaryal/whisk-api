import { ImageGenerationModel, MediaCategory } from "./Constants.js";
import { Media } from "./Media.js";
import type { ImageGenerationModelType, MediaCategoryType, MediaReference, PromptConfig } from "./Types.js";
import { request } from "./Utils.js";
import { Account, Whisk } from "./Whisk.js";

export class Project {
    readonly account: Account;
    readonly projectId: string;
    readonly subjects: MediaReference[];
    readonly scenes: MediaReference[];
    readonly styles: MediaReference[];

    constructor(projectId: string, account: Account) {
        if (typeof projectId !== "string" || !projectId.trim()) {
            throw new Error("project id is either invalid or missing")
        }

        if (!(account instanceof Account)) {
            throw new Error("account is invalid or missing")
        }

        this.projectId = projectId;
        this.account = account;
        this.subjects = [];
        this.scenes = [];
        this.styles = [];
    }

    async addSubject(rawBytes: string): Promise<MediaReference> {
        return await this.uploadAndAdd(rawBytes, MediaCategory.SUBJECT, this.subjects);
    }

    async addScene(rawBytes: string): Promise<MediaReference> {
        return await this.uploadAndAdd(rawBytes, MediaCategory.SCENE, this.scenes);
    }

    async addStyle(rawBytes: string): Promise<MediaReference> {
        return await this.uploadAndAdd(rawBytes, MediaCategory.STYLE, this.styles);
    }

    addSubjectById(mediaGenerationId: string, prompt: string): void {
        this.addById(mediaGenerationId, prompt, this.subjects);
    }

    addSceneById(mediaGenerationId: string, prompt: string): void {
        this.addById(mediaGenerationId, prompt, this.scenes);
    }

    addStyleById(mediaGenerationId: string, prompt: string): void {
        this.addById(mediaGenerationId, prompt, this.styles);
    }

    removeSubject(mediaGenerationId: string): boolean {
        return this.removeById(mediaGenerationId, this.subjects);
    }

    removeScene(mediaGenerationId: string): boolean {
        return this.removeById(mediaGenerationId, this.scenes);
    }

    removeStyle(mediaGenerationId: string): boolean {
        return this.removeById(mediaGenerationId, this.styles);
    }

    clearSubjects(): void {
        this.subjects.length = 0;
    }

    clearScenes(): void {
        this.scenes.length = 0;
    }

    clearStyles(): void {
        this.styles.length = 0;
    }

    clearAllReferences(): void {
        this.clearSubjects();
        this.clearScenes();
        this.clearStyles();
    }

    private async uploadAndAdd(rawBytes: string, category: MediaCategoryType, target: MediaReference[]): Promise<MediaReference> {
        if (!(rawBytes?.trim?.())) {
            throw new Error("image data is required")
        }

        const captions = await request<{ candidates: { output: string }[] }>(
            "https://labs.google/fx/api/trpc/backbone.captionImage",
            {
                headers: { cookie: this.account.getCookie() },
                body: JSON.stringify({
                    "json": {
                        "clientContext": {
                            "workflowId": this.projectId
                        },
                        "captionInput": {
                            "candidatesCount": 1,
                            "mediaInput": {
                                "mediaCategory": category,
                                "rawBytes": rawBytes
                            }
                        }
                    }
                })
            }
        );

        const caption = captions.candidates[0].output;

        const uploadMediaGenerationId = await Whisk.uploadImage(
            rawBytes, caption, category, this.projectId, this.account
        );

        const reference: MediaReference = { caption, mediaGenerationId: uploadMediaGenerationId };
        target.push(reference);
        return reference;
    }

    private addById(mediaGenerationId: string, caption: string, target: MediaReference[]): void {
        if (!(mediaGenerationId?.trim?.())) {
            throw new Error("mediaGenerationId is required")
        }

        if (!(caption?.trim?.())) {
            throw new Error("caption is required")
        }

        target.push({ caption, mediaGenerationId });
    }

    private removeById(mediaGenerationId: string, target: MediaReference[]): boolean {
        if (!(mediaGenerationId?.trim?.())) {
            throw new Error("mediaGenerationId is required")
        }

        const index = target.findIndex(ref => ref.mediaGenerationId === mediaGenerationId);
        if (index === -1) return false;

        target.splice(index, 1);
        return true;
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
     * Generate image but with subject, scene, style attached
     */
    async generateImageWithReferences(input: string | PromptConfig): Promise<Media> {
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

        // Check if the model selected is for image generation
        if (!Object.values(ImageGenerationModel).includes(input.model as ImageGenerationModelType)) {
            throw new Error(`'${input.model}': invalid image generation model provided`)
        }

        const generationResponse = await request<any>(
            "https://aisandbox-pa.googleapis.com/v1/whisk:runImageRecipe",
            {
                headers: { authorization: `Bearer ${await this.account.getToken()}` },
                body: JSON.stringify({
                    "clientContext": {
                        "workflowId": this.projectId,
                        "tool": "BACKBONE",
                    },
                    "seed": input.seed,
                    "imageModelSettings": {
                        "imageModel": "GEM_PIX", // TODO: Lets experiment with this for now
                        "aspectRatio": input.aspectRatio
                    },
                    "userInstruction": input.prompt,

                    // Attach during image generation
                    "recipeMediaInputs": [
                        ...this.subjects.map(item => {
                            return {
                                "caption": item.caption,
                                "mediaInput": {
                                    "mediaCategory": "MEDIA_CATEGORY_SUBJECT",
                                    "mediaGenerationId": item.mediaGenerationId
                                }
                            }
                        }),
                        ...this.scenes.map(item => {
                            return {
                                "caption": item.caption,
                                "mediaInput": {
                                    "mediaCategory": "MEDIA_CATEGORY_SCENE",
                                    "mediaGenerationId": item.mediaGenerationId
                                }
                            }
                        }),
                        ...this.styles.map(item => {
                            return {
                                "caption": item.caption,
                                "mediaInput": {
                                    "mediaCategory": "MEDIA_CATEGORY_STYLE",
                                    "mediaGenerationId": item.mediaGenerationId
                                }
                            }
                        })
                    ]
                })
            }
        );

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
