import fs from "fs";
import path from "path";
import Account from "./Account";
import { type AttachmentSectionType, type CaptionConfig, type ImageFormatType, type MediaInfo, ImageFormat } from "./Types";

export default class Project {
    account: Account;
    projectId: string;
    private attachments: {
        mediaId: string;
        caption: string;
        category: AttachmentSectionType;
    }[] | null;

    constructor(projectId: string, account: Account) {
        if (!(projectId?.trim?.())) {
            throw new Error("project id is required")
        }

        if (!account || !(account instanceof Account)) {
            throw new Error("invalid account")
        }

        this.account = account;
        this.attachments = null;
        this.projectId = projectId;
    }

    async rename(newName: string) {
        if (!(newName?.trim?.())) {
            throw new Error("project name requried")
        }

        const response = await fetch(
            "https://labs.google/fx/api/trpc/media.createOrUpdateWorkflow", {
            method: "POST",
            headers: { cookie: this.account.cookie },
            body: JSON.stringify({
                "json": {
                    "workflowId": this.projectId,
                    "clientContext": {
                        "sessionId": ";" + Date.now(), // IDK this
                        "tool": "BACKBONE",
                        "workflowId": this.projectId,
                    },
                    "workflowMetadata": { "workflowName": newName }
                }
            })
        });

        if (response.status != 200) {
            console.error(await response.text())
            throw new Error("failed to rename project")
        }
    }

    async delete() {
        const response = await fetch(
            "https://labs.google/fx/api/trpc/media.deleteMedia",
            {
                method: "POST",
                headers: { cookie: this.account.cookie },
                body: JSON.stringify({
                    "json": {
                        "parent": "userProject/",
                        "names": [this.projectId],
                    }
                }),
            }
        );

        if (response.status != 200) {
            console.error(await response.text())
            throw new Error("failed to delete project");
        }
    }

    // This method is project agnoistic
    // So find a way of putting it into Whisk
    // But the problem is: we use it in captionImage()
    // TODO: Move this to Whisk while still being usable in captionImage()
    async deleteMedia(mediaId: string | string[]) {
        // We can delete multiple medias at once (ig)
        if (typeof mediaId == 'string') {
            mediaId = [mediaId];
        }

        const response = await fetch(
            "https://labs.google/fx/api/trpc/media.deleteMedia",
            {
                method: "POST",
                headers: { cookie: this.account.cookie },
                body: JSON.stringify({
                    "json": { "names": mediaId }
                })
            }
        );

        if (response.status != 200) {
            console.error(await response.text())
            throw new Error("failed to delete media")
        }
    }

    // This can be project agnoistic too
    // TODO: Same as above one
    async captionImage(config: CaptionConfig): Promise<string[]> {
        if (config.type == "MEDIA_ID") {

        }
        if (!fs.existsSync(imagePath)) {
            throw new Error("image file not found: " + imagePath)
        }

        // Get image type from its path
        if (!(imageType?.trim?.())) {
            // Offset 1 because it returns extension like: ".png", ".jpeg"
            imageType = path.extname(imagePath).slice(1) as ImageFormatType;
        }

        if (typeof count != 'number' || count <= 0) {
            throw new Error("number of caption count must be >= 1")
        }

        if (!Object.values(ImageFormat).includes(imageType)) {
            throw new Error("invalid image format: " + imageType)
        }

        // Read image and convert it to proper base64
        let base64Image = fs.readFileSync(imagePath, "base64");
        base64Image = `data:image/${imageType};base64,${base64Image}`;

        const response = await fetch(
            "https://labs.google/fx/api/trpc/backbone.captionImage",
            {
                method: "POST",
                body: JSON.stringify({
                    "json": {
                        "clientContext": {
                            "sessionId": ";" + Date.now(),
                            "workflowId": this.projectId
                        },
                        "captionInput": {
                            "candidatesCount": count,
                            "mediaInput": {
                                "rawBytes": base64Image,
                                "mediaCategory": "MEDIA_CATEGORY_SUBJECT"
                            }
                        }
                    }
                })
            }
        );

        if (response.status != 200) {
            console.error(await response.text())
            throw new Error("failed to generate caption")
        }

        const imageCaption = await response.json();

        // Sorry people ik it looks ugly
        const caption = imageCaption?.result?.data?.json?.result?.candidates as {
            output: string,
            mediaGenerationId: string
        }[];

        if (!caption) {
            console.error(imageCaption);
            throw new Error("server response has no captions")
        }

        // This whole method is a workaround on generating caption by
        // attaching image to "SUBJECTS". So once attached, it remains there
        // and will be used as "SUBJECTS" in further media generation in this
        // project, which is not what user wanted. They simply wanted a caption.
        // So in that case make sure to remove the generated media from "SUBJECTS"
        if (deleteMediaAfterGeneration) {
            caption.forEach(async (item) => await this.deleteMedia(item.mediaGenerationId));
        }

        return caption.map(item => item.output);
    }

    async attachItem(subject: {
        content: string,
        section: AttachmentSectionType,
        type: "MEDIA_ID" | "B64_IMAGE" | "IMAGE_PATH",
    }) {
        if (!subject.type || !subject.content) {
            throw new Error("subject is missing information");
        }

        if (this.account.isExpired()) {
            await this.account.refresh()
        }

        let mediaId = "";
        let caption = "";

        if (subject.type == "MEDIA_ID") {
            // Fetch the caption from mediaId
            const response = await fetch(
                // This key seems to be hardcoded in original code too
                `https://aisandbox-pa.googleapis.com/v1/media/${subject.content}?key=AIzaSyBtrm0o5ab1c-Ec8ZuLcGt3oJAA5VWt3pY`,
                {
                    headers: {
                        "Referer": "https://labs.google/",
                        "Authorization": `Bearer ${this.account.session?.access_token}`
                    }
                }
            );

            if (response.status != 200) {
                throw new Error("failed to get caption for corresponding media id")
            }

            const mediaInfo = await response.json();

            if (mediaInfo?.userUploadedImage) {
                caption = mediaInfo.userUploadedImage.caption;
            } else if (mediaInfo?.image) {
                caption = mediaInfo.image.caption;
            }
        } else if (subject.type == "IMAGE_PATH" || subject.type == "B64_IMAGE") {
            if (subject.type == "IMAGE_PATH") {
                if (!fs.existsSync(subject.content)) {
                    throw new Error("image not found: " + subject.content)
                }

                subject.content = fs.readFileSync(subject.content, "base64");
            }
        }


        if (!this.attachments) {
            this.attachments = [];
        }

        this.attachments.push({ caption, mediaId, category: subject.section });
    }

    async getMediaInfo(mediaId: string): Promise<MediaInfo> {
        if (!(mediaId?.trim?.())) {
            throw new Error("media id is required")
        }

        if (this.account.isExpired()) {
            await this.account.refresh()
        }

        const response = await fetch(
            // This key seems to be hardcoded in original code too
            `https://aisandbox-pa.googleapis.com/v1/media/${mediaId}?key=AIzaSyBtrm0o5ab1c-Ec8ZuLcGt3oJAA5VWt3pY`,
            {
                headers: {
                    "Referer": "https://labs.google/",
                    "Authorization": `Bearer ${this.account.session?.access_token}`
                }
            }
        );
    }
}
