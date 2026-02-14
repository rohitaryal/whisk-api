import { describe, expect, test } from "bun:test";
import { Whisk } from "../src/Whisk";

const cookie = process.env.COOKIE;

if (!cookie) {
    console.warn("Skipping reference management tests: COOKIE environment variable is missing.");
    test.skip("Reference management tests (Skipped due to missing COOKIE)", () => { });
} else {
    const whisk = new Whisk(cookie);

    test("addSubjectById should add reference correctly", async () => {
        const project = await whisk.newProject("Add By ID Test");

        project.addSubjectById("test-id-123", "Test subject");

        expect(project.subjects.length).toBe(1);
        expect(project.subjects[0].mediaGenerationId).toBe("test-id-123");
        expect(project.subjects[0].caption).toBe("Test subject");

        await project.delete();
    });

    test("removeSubject should remove specific reference", async () => {
        const project = await whisk.newProject("Remove Test");

        project.addSubjectById("id-1", "Subject 1");
        project.addSubjectById("id-2", "Subject 2");
        project.addSubjectById("id-3", "Subject 3");

        expect(project.subjects.length).toBe(3);

        const removed = project.removeSubject("id-2");
        expect(removed).toBe(true);
        expect(project.subjects.length).toBe(2);

        expect(project.subjects.find(s => s.mediaGenerationId === "id-2")).toBeUndefined();
        expect(project.subjects.find(s => s.mediaGenerationId === "id-1")).toBeDefined();
        expect(project.subjects.find(s => s.mediaGenerationId === "id-3")).toBeDefined();

        await project.delete();
    });

    test("removeSubject should return false for non-existent ID", async () => {
        const project = await whisk.newProject("Remove Non-Existent Test");

        project.addSubjectById("id-1", "Subject 1");

        const removed = project.removeSubject("non-existent-id");
        expect(removed).toBe(false);
        expect(project.subjects.length).toBe(1);

        await project.delete();
    });

    test("clearSubjects should remove all subjects", async () => {
        const project = await whisk.newProject("Clear Subjects Test");

        project.addSubjectById("id-1", "Subject 1");
        project.addSubjectById("id-2", "Subject 2");
        project.addSceneById("scene-1", "Scene 1");
        project.addStyleById("style-1", "Style 1");

        expect(project.subjects.length).toBe(2);
        expect(project.scenes.length).toBe(1);
        expect(project.styles.length).toBe(1);

        project.clearSubjects();

        expect(project.subjects.length).toBe(0);
        expect(project.scenes.length).toBe(1);
        expect(project.styles.length).toBe(1);

        await project.delete();
    });

    test("clearAllReferences should remove all references", async () => {
        const project = await whisk.newProject("Clear All Test");

        project.addSubjectById("id-1", "Subject 1");
        project.addSceneById("scene-1", "Scene 1");
        project.addStyleById("style-1", "Style 1");

        expect(project.subjects.length).toBe(1);
        expect(project.scenes.length).toBe(1);
        expect(project.styles.length).toBe(1);

        project.clearAllReferences();

        expect(project.subjects.length).toBe(0);
        expect(project.scenes.length).toBe(0);
        expect(project.styles.length).toBe(0);

        await project.delete();
    });

    test("readonly arrays prevent reassignment", async () => {
        const project = await whisk.newProject("Readonly Test");

        project.addSubjectById("id-1", "Subject 1");

        // This should work (mutation)
        expect(project.subjects.length).toBe(1);

        // This would fail at compile time (reassignment)
        // project.subjects = [];

        await project.delete();
    });

    test("addSubjectById should validate inputs", async () => {
        const project = await whisk.newProject("Validation Test");

        expect(() => project.addSubjectById("", "Test")).toThrow("mediaGenerationId is required");
        expect(() => project.addSubjectById("id-1", "")).toThrow("caption is required");

        await project.delete();
    });

    test("removeSubject should validate input", async () => {
        const project = await whisk.newProject("Remove Validation Test");

        expect(() => project.removeSubject("")).toThrow("mediaGenerationId is required");

        await project.delete();
    });
}
