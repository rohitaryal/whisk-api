# Whisk API Usage Guide

Unofficial API wrapper for Google's Whisk - generate AI images, edit them, and turn them into videos.

## What is Whisk?

Whisk is Google's AI image generation tool. This library lets you use it programmatically in Node.js/Bun instead of through the web interface.

## Installation

```bash
npm i @rohitaryal/whisk-api
```

For command-line usage:
```bash
npm i -g @rohitaryal/whisk-api
```

## Getting Your Cookie (Required)

You need a Google account cookie to authenticate. Here's how:

1. Go to [labs.google/fx/tools/whisk](https://labs.google/fx/tools/whisk/project) and log in
2. Open DevTools (press F12)
3. Go to the Network tab
4. Refresh the page (Ctrl+R or Cmd+R)
5. Find a request called `image-fx` in the list
6. Click it, scroll to "Request Headers"
7. Copy the entire `Cookie` value

Store it safely:
```bash
# .env file
COOKIE="your_cookie_here"
```

```typescript
import { Whisk } from "@rohitaryal/whisk-api";

const whisk = new Whisk(process.env.COOKIE);
```

## Basic Workflow

### 1. Create a Project

Think of a project as a workspace. All your generations happen inside a project.

```typescript
const project = await whisk.newProject("My Project");
```

### 2. Generate an Image

The simplest way - just provide a text prompt:

```typescript
const img = await project.generateImage("A cyberpunk cat in neon city");
img.save("./output"); // Saves as PNG
```

With more control (aspect ratio, seed for reproducibility):

```typescript
import { ImageAspectRatio } from "@rohitaryal/whisk-api";

const img = await project.generateImage({
    prompt: "A cyberpunk cat in neon city",
    aspectRatio: ImageAspectRatio.PORTRAIT, // SQUARE, PORTRAIT, or LANDSCAPE
    seed: 12345 // Same seed = similar results
});

img.save("./output");
```

### 3. Refine (Edit) an Image

Already generated an image and want to change something? Use refine to edit it:

```typescript
// First, generate an image
const img = await project.generateImage("A forest in summer");
img.save("./output");

// Then refine/edit it
const edited = await img.refine("Make it winter with heavy snow");
edited.save("./output");
```

You can chain multiple edits:
```typescript
const img = await project.generateImage("A cat");
const img1 = await img.refine("Add a red hat");
const img2 = await img1.refine("Make background darker");
```

Note: You must have an existing image (either generated or fetched) to use refine.

### 4. Animate (Turn Image into Video)

Convert a static image into a short video with camera movement:

```typescript
import { VideoGenerationModel } from "@rohitaryal/whisk-api";

// Important: Only LANDSCAPE images can be animated!
const video = await img.animate(
    "Slow camera pan to the right, cinematic",
    VideoGenerationModel.VEO_FAST_3_1
);

video.save("./output"); // Saves as MP4
```

Note: Video generation takes 20-40 seconds.

## Advanced: Reference Images (Consistent Characters)

Want to generate multiple images with the same character, location, or art style? Use references.

### What are References?

- **Subject**: Characters, people, objects you want to keep consistent
- **Scene**: Locations, backgrounds, environments
- **Style**: Art styles, visual aesthetics

### Upload Your Own Images as References

```typescript
import { imageToBase64 } from "@rohitaryal/whisk-api/utils";

const project = await whisk.newProject("My Story");

// Upload a character image
const hero = await project.addSubject(await imageToBase64("./hero.png"));
console.log(hero.mediaGenerationId); // Save this ID!

// Upload a location
const castle = await project.addScene(await imageToBase64("./castle.jpg"));

// Upload an art style reference
const anime = await project.addStyle(await imageToBase64("./anime-style.jpg"));
```

### Generate Images Using Your References

Now when you generate, it will use your uploaded images as reference:

```typescript
const img = await project.generateImageWithReferences("hero standing at castle entrance");
img.save("./output");
```

The generated image will have:
- Your hero character (from subject)
- The castle location (from scene)
- The anime art style (from style)

### Reuse References Without Re-uploading

Save the IDs and reuse them later (even in different projects):

```typescript
// Store these IDs in your database
const heroId = hero.mediaGenerationId;
const heroCap = hero.caption;

// Later, in a new project...
const project2 = await whisk.newProject("Story Part 2");

// Add by ID - no need to upload again!
project2.addSubjectById(heroId, heroCap);

const img = await project2.generateImageWithReferences("hero in battle");
```

### Managing References

```typescript
// Remove a specific character
project.removeSubject(heroId);

// Clear all subjects (keeps scenes and styles)
project.clearSubjects();

// Clear everything
project.clearAllReferences();

// Check what's attached
console.log(`${project.subjects.length} characters attached`);
console.log(`${project.scenes.length} locations attached`);
console.log(`${project.styles.length} styles attached`);
```

## Other Useful Features

### Generate Captions from Images

Get AI-generated descriptions of any image:

```typescript
import { imageToBase64 } from "@rohitaryal/whisk-api/utils";

// From a local file
const captions = await Whisk.generateCaption(
    await imageToBase64("./photo.png"),
    whisk.account,
    3 // Generate 3 different captions
);

console.log(captions); // ["A cat sitting...", "Feline resting...", ...]

// From an already generated image
const img = await project.generateImage("A sunset");
const descriptions = await img.caption(3);
```

### Download Previously Generated Media

If you have a media ID from a previous generation:

```typescript
const media = await Whisk.getMedia("7k4r91g4t0000", whisk.account);
media.save("./downloads");
```

### Delete Media from Cloud

Clean up your generated content:

```typescript
// Delete a specific media
await media.deleteMedia();

// Or delete by ID
await Whisk.deleteMedia("mediaId", whisk.account);

// Delete entire project
await project.delete();
```

## Constants

```typescript
import { 
    ImageAspectRatio,
    VideoGenerationModel,
    ImageGenerationModel 
} from "@rohitaryal/whisk-api";

// Aspect Ratios
ImageAspectRatio.SQUARE
ImageAspectRatio.PORTRAIT
ImageAspectRatio.LANDSCAPE

// Video Models
VideoGenerationModel.VEO_3_1
VideoGenerationModel.VEO_FAST_3_1

// Image Models
ImageGenerationModel.IMAGEN_3_5
```

## CLI Usage

```bash
# Generate image
whisk generate --prompt "A cat" --aspect PORTRAIT --cookie "$COOKIE"

# Animate image
whisk animate <mediaId> --script "Camera pans" --cookie "$COOKIE"

# Refine image
whisk refine <mediaId> --prompt "Add snow" --cookie "$COOKIE"

# Caption image
whisk caption --file ./image.png --count 3 --cookie "$COOKIE"

# Fetch media
whisk fetch <mediaId> --dir ./output --cookie "$COOKIE"

# Delete media
whisk delete <mediaId> --cookie "$COOKIE"
```

## Complete Example: Story Generation

full workflow - generate, edit, and animate with consistent characters:

```typescript
import { Whisk, ImageAspectRatio, VideoGenerationModel } from "@rohitaryal/whisk-api";
import { imageToBase64 } from "@rohitaryal/whisk-api/utils";

const whisk = new Whisk(process.env.COOKIE);

async function createStory() {
    // 1. Create a project
    const project = await whisk.newProject("Epic Story");

    // 2. Upload your character image as reference
    const hero = await project.addSubject(await imageToBase64("./hero.png"));
    console.log("Hero uploaded:", hero.mediaGenerationId);

    // 3. Generate first scene with your character
    const scene1 = await project.generateImageWithReferences({
        prompt: "hero standing in ancient ruins",
        aspectRatio: ImageAspectRatio.LANDSCAPE
    });
    scene1.save("./story/scene1");

    // 4. Edit the image
    const scene2 = await scene1.refine("Add dramatic storm clouds and lightning");
    scene2.save("./story/scene2");

    // 5. Turn it into a video
    const video = await scene2.animate(
        "Slow camera zoom in, lightning flashes",
        VideoGenerationModel.VEO_FAST_3_1
    );
    video.save("./story/final");

    console.log("Story complete!");

    // 6. Cleanup
    await video.deleteMedia();
}

createStory();
```

## Error Handling

```typescript
try {
    const img = await project.generateImage("prompt");
} catch (error) {
    console.error("Generation failed:", error);
}
```

## Important Things to Know

- **Video animation**: Only works with LANDSCAPE aspect ratio images
- **Seeds**: Use the same seed number to get similar results across generations
- **Caption limits**: You can generate 1-8 captions per request
- **Video timing**: Video generation takes 20-40 seconds to complete
- **References**: You can mix any combination - just subject, just scene, all three, etc.
- **Storage**: Save reference IDs in your database to reuse characters without re-uploading
- **Cookie expiry**: If you get auth errors, get a fresh cookie from Google

## Troubleshooting

**"Authentication failed"**
- Your cookie expired. Get a new one from labs.google

**"Only landscape images can be animated"**
- Generate your image with `aspectRatio: ImageAspectRatio.LANDSCAPE`

**"Failed to generate"**
- Check your internet connection
- Verify your cookie is valid
- Try a different prompt (some content may be filtered)

## More Resources

- [GitHub Repository](https://github.com/rohitaryal/whisk-api)
- [Code Examples](../examples/)
- [Report Issues](https://github.com/rohitaryal/whisk-api/issues)
