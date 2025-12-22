import Account from "./Account";
import Project from "./Project";
import type { SearchedImage, SearchedProject, SearchedVideo, SearchQuery } from "./Types";

export default class Whisk {
    account: Account;

    constructor(account: Account) {
        if (!account || !(account instanceof Account)) {
            throw new Error("invalid account")
        }
        this.account = account;
    }

    async searchHistory(query: SearchQuery): Promise<SearchedImage | SearchedProject | SearchedVideo> {
        if (!query || !query.section) {
            throw new Error("search query is empty")
        }

        // Craft an ugly search payload
        const searchPayload = JSON.stringify({
            "json": {
                "rawQuery": query.searchTerm,
                "type": "BACKBONE",
                "subtype": query.section,
                "limit": query.searchResultLimit || 3,
                "cursor": null
            },
            "meta": { "values": { "cursor": ["undefined"] } }
        });

        // Append the ugly url-encoded search payload to url
        const response = await fetch(
            "https://labs.google/fx/api/trpc/media.fetchUserHistory?input=" +
            encodeURIComponent(searchPayload),
            {
                method: "GET",
                headers: {
                    "cookie": this.account.cookie
                }
            }
        );

        if (response.status != 200) {
            console.error(await response.text())
            throw new Error("failed to search history")
        }

        const searchResult = await response.json();

        // Some checking just in case
        if (searchResult?.result?.data?.json?.status != 200 ||
            !searchResult?.result?.data?.json?.result?.userWorkflows
        ) {
            console.error(searchResult)
            throw new Error("failed to search history according to response")
        }

        // Type according to section chosen
        if (query.section == "IMAGE") {
            return searchResult.result.data.json.result.userWorkflows as SearchedImage;
        } else if (query.section == "VIDEO") {
            return searchResult.result.data.json.result.userWorkflows as SearchedVideo;
        }

        // Else just assume its project
        return searchResult.result.data.json.result.userWorkflows as SearchedProject;
    }

    async newProject(projectName?: string): Promise<Project> {
        if (!(projectName?.trim())) {
            projectName = "API Project - " + (new Date()).toLocaleDateString()
        }

        // Send req with required project name
        const response = await fetch(
            "https://labs.google/fx/api/trpc/media.createOrUpdateWorkflow", {
            method: "POST",
            // Requires cookie and not token
            headers: { cookie: this.account.cookie },
            body: JSON.stringify({
                "json": {
                    "clientContext": {
                        "tool": "BACKBONE",
                        "sessionId": ";" + Date.now(), // IDK about this
                    },
                    "mediaGenerationIdsToCopy": [],
                    "workflowMetadata": { "workflowName": projectName, }
                }
            }),
        });

        if (response.status != 200) {
            console.error(await response.text())
            throw new Error("failed to create new project")
        }

        let project = await response.json();
        const workflowId = project?.result?.data?.json?.result?.workflowId;

        if (!workflowId) {
            console.error(project);
            throw new Error("response is missing workflow id")
        }

        return new Project(workflowId, this.account);
    }
}
