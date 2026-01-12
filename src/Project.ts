import { ImageModel, MediaCategory } from "./Constants.js";
import { Media } from "./Media.js";
import type { ImageModelType, PromptConfig, RecipeConfig } from "./Types.js";
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

    /**
     * Generate an image from a text prompt
     *
     * @param input Text prompt or PromptConfig object
     * @returns Generated Media object
     */
    async generateImage(input: string | PromptConfig): Promise<Media> {
        if (typeof input === "string") {
            input = {
                seed: 0,
                prompt: input,
                model: "R2I",
                aspectRatio: "IMAGE_ASPECT_RATIO_LANDSCAPE"
            } as PromptConfig;
        }

        if (!input.seed) input.seed = 0;
        if (!input.model) input.model = "R2I";
        if (!input.aspectRatio) input.aspectRatio = "IMAGE_ASPECT_RATIO_LANDSCAPE";
        if (!input.prompt?.trim?.()) throw new Error("prompt is required");

        if (!Object.values(ImageModel).includes(input.model as ImageModelType)) {
            throw new Error(`'${input.model}': invalid image model. Use 'R2I' or 'GEM_PIX'`)
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
     * Run an image recipe combining multiple images (subject, scene, style)
     * Uses the R2I model to blend images based on user instruction
     *
     * @param config Recipe configuration with subject (required), scene, and style images
     * @returns Generated Media object
     */
    async runImageRecipe(config: RecipeConfig): Promise<Media> {
        if (!config.userInstruction?.trim?.()) {
            throw new Error("userInstruction is required");
        }

        if (!config.subject) {
            throw new Error("subject is required");
        }

        const recipeMediaInputs: Array<{
            caption: string;
            mediaInput: {
                mediaCategory: string;
                mediaGenerationId: string;
            };
        }> = [
            {
                caption: config.subject.caption,
                mediaInput: {
                    mediaCategory: MediaCategory.SUBJECT,
                    mediaGenerationId: config.subject.mediaGenerationId
                }
            }
        ];

        if (config.scene) {
            recipeMediaInputs.push({
                caption: config.scene.caption,
                mediaInput: {
                    mediaCategory: MediaCategory.SCENE,
                    mediaGenerationId: config.scene.mediaGenerationId
                }
            });
        }

        if (config.style) {
            recipeMediaInputs.push({
                caption: config.style.caption,
                mediaInput: {
                    mediaCategory: MediaCategory.STYLE,
                    mediaGenerationId: config.style.mediaGenerationId
                }
            });
        }

        const recipeResponse = await request<any>(
            "https://aisandbox-pa.googleapis.com/v1/whisk:runImageRecipe",
            {
                headers: {
                    authorization: `Bearer ${await this.account.getToken()}`
                },
                body: JSON.stringify({
                    clientContext: {
                        workflowId: this.projectId,
                        tool: "BACKBONE",
                        sessionId: `;${Date.now()}`
                    },
                    seed: config.seed ?? Math.floor(Math.random() * 1000000),
                    imageModelSettings: {
                        imageModel: "R2I",
                        aspectRatio: config.aspectRatio ?? "IMAGE_ASPECT_RATIO_LANDSCAPE"
                    },
                    userInstruction: config.userInstruction,
                    recipeMediaInputs
                })
            }
        );

        const img = recipeResponse.imagePanels[0].generatedImages[0];

        return new Media({
            seed: img.seed,
            prompt: img.prompt,
            workflowId: img.workflowId ?? recipeResponse.workflowId,
            encodedMedia: img.encodedImage,
            mediaGenerationId: img.mediaGenerationId,
            aspectRatio: img.aspectRatio,
            mediaType: "IMAGE",
            model: img.imageModel,
            account: this.account
        });
    }

    /**
     * Deletes the project
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
