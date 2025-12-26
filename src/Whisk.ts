import { Media } from "./Media.js";
import { Project } from "./Project.js";
import { request } from "./Utils.js";

export class Account {
    private cookie: string;
    private authToken?: string;
    private expiryDate?: Date;
    private userName?: string;
    private userEmail?: string;

    constructor(cookie: string, authToken?: string) {
        if (typeof cookie !== 'string' || !cookie.trim()) {
            throw new Error(`'${cookie}': is not a valid cookie`)
        }

        // If someone provided token but its not a string
        if (authToken && typeof authToken !== 'string') {
            throw new Error(`${authToken}: is not a valid auth token`)
        }

        this.cookie = cookie;
        this.authToken = authToken?.trim() || undefined;
        //  Assume it expires in 3 hours
        this.expiryDate = new Date(Date.now() + 10800000);
    }

    async refresh() {
        const session = await request<any>(
            "https://labs.google/fx/api/auth/session",
            { headers: { cookie: this.cookie } }
        );

        if (session.error === "ACCESS_TOKEN_REFRESH_NEEDED") {
            throw new Error("new cookie is required")
        }

        this.authToken = session.access_token;
        this.expiryDate = new Date(session.expires);
        this.userName = session.user.name;
        this.userEmail = session.user.email;
    }

    async getToken(): Promise<string> {
        if (this.isExpired()) {
            await this.refresh()
        }

        return this.authToken!;
    }

    getCookie(): string {
        return this.cookie;
    }

    isExpired(): boolean {
        if (!this.authToken || !this.expiryDate || !(this.expiryDate instanceof Date)) {
            return true;
        }

        // 30 second to prevent mid-request token expiry
        return Date.now() + 15 > this.expiryDate.getTime();
    }

    toString() {
        if (this.isExpired()) {
            return "No account found, might need a refresh.";
        }

        return "Username: " + this.userName + "\n" +
            "Email: " + this.userEmail + "\n" +
            "Cookie: " + this.cookie.slice(0, 5) + "*".repeat(10) + "\n" +
            "Auth Token: " + this.authToken!.slice(0, 5) + "*".repeat(10);
    }
}

export class Whisk {
    readonly account: Account;

    constructor(cookie: string, authToken?: string) {
        this.account = new Account(cookie, authToken);
    }

    /**
     * Delete a generated media - image, video
     *
     * @param mediaId Media id or list of ids to delete
     * @param account Account{} object
     */
    static async deleteMedia(mediaId: string | string[], account: Account) {
        if (typeof mediaId === "string") {
            mediaId = [mediaId];
        }

        if (!(account instanceof Account)) {
            throw new Error("invalid or missing account");
        }

        await request(
            "https://labs.google/fx/api/trpc/media.deleteMedia",
            {
                headers: { cookie: account.getCookie() },
                body: JSON.stringify({ "json": { "names": mediaId } })
            }
        );
    }

    /**
     * Generate caption from provided base64 image
     *
     * @param input base64 encoded image
     * @param account Account{} object
     * @param count Number of captions to generate (min: 0, max: 8)
     */
    static async generateCaption(input: string, account: Account, count = 1): Promise<string[]> {
        if (!(input?.trim?.())) {
            throw new Error("input image or media id is required")
        }

        if (count <= 0 || count > 8) {
            throw new Error("count must be in between 0 and 9 (0 < count < 9)")
        }

        if (!(account instanceof Account)) {
            throw new Error("invalid or missing account");
        }

        const captionResults = await request<{ candidates: { output: string; mediaGenerationId: string }[] }>(
            "https://labs.google/fx/api/trpc/backbone.captionImage",
            {
                headers: { cookie: account.getCookie() },
                body: JSON.stringify({
                    "json": {
                        "captionInput": {
                            "candidatesCount": count,
                            "mediaInput": {
                                "rawBytes": input,
                                "mediaCategory": "MEDIA_CATEGORY_SUBJECT"
                            }
                        }
                    }
                })
            }
        );

        return captionResults.candidates.map(item => item.output);
    }

    /**
     * Tries to get media from their unique id
     *
     * @param mediaId Unique identifier for generated media `mediaGenerationId`
     */
    static async getMedia(mediaId: string, account: Account): Promise<Media> {
        if (typeof mediaId !== "string" || !mediaId.trim()) {
            throw new Error("invalid or missing media id")
        }

        if (!(account instanceof Account)) {
            throw new Error("invalid or missing account")
        }

        const mediaInfo = await request<any>(
            // key is hardcoded in the original code too
            `https://aisandbox-pa.googleapis.com/v1/media/${mediaId}?key=AIzaSyBtrm0o5ab1c-Ec8ZuLcGt3oJAA5VWt3pY`,
            {
                headers: {
                    "Referer": "https://labs.google/", // yep this ones required
                    "Authorization": `Bearer ${await account.getToken()}`,
                },
            }
        );
        const media = mediaInfo.image ?? mediaInfo.video;

        return new Media({
            seed: media.seed,
            prompt: media.prompt,
            workflowId: media.workflowId,
            encodedMedia: media.encodedImage ?? media.encodedVideo,
            mediaGenerationId: media.mediaGenerationId,
            aspectRatio: media.aspectRatio,
            mediaType: mediaInfo.mediaGenerationId.mediaType,
            model: media.modelNameType ?? media.model,
            account: account,
        });
    }

    /**
    * Create a new project for your AI slop
    *
    * @param projectName Name of the project
    */
    async newProject(projectName?: string): Promise<Project> {
        if (typeof projectName !== "string" || !projectName.trim()) {
            projectName = "New Project - " + (new Date().toDateString().replace(/\s/g, "-"));
        }

        const projectInfo = await request<{ workflowId: string }>(
            "https://labs.google/fx/api/trpc/media.createOrUpdateWorkflow",
            {
                headers: { cookie: this.account.getCookie() },
                body: JSON.stringify({
                    "json": { "workflowMetadata": { "workflowName": projectName } }
                })
            }
        );

        return new Project(projectInfo.workflowId, this.account);
    }
}

