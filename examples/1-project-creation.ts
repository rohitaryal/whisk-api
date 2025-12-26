import { Whisk } from "../src/Whisk";

const cookie = process.env.COOKIE;
if (!cookie) throw new Error("Cookie is required");

const whisk = new Whisk(cookie);

async function main() {
    // Create a project with a custom name
    console.log("Creating a new project...");
    const project = await whisk.newProject("Demo Project - Cleanup");

    console.log(`Project created with ID: ${project.projectId}`);

    // Delete the project
    console.log("Deleting project...");
    await project.delete();
    console.log("Project deleted successfully.");
}

main();
