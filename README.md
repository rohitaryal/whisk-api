# whisk-api

Unofficial free reverse engineered API for Google's Whisk from [labs.google](https://labs.google).

![Banner](https://raw.githubusercontent.com/rohitaryal/whisk-api/refs/heads/main/assets/banner.jpeg)

## Installation

```bash
npm i -g @rohitaryal/whisk-api
# or
bun i -g @rohitaryal/whisk-api
```

## Features

1. Text to Image using `R2I` or `GEM_PIX` models
2. Image Recipe - Combine multiple images (subject, scene, style)
3. Image Refinement (Edit images with AI)
4. Image to Video (Animation) using `VEO_3_1`
5. Image to Text (Caption generation)
6. Project & Media Management
7. Command line support

## Models

| Model | Type | Use Case |
|-------|------|----------|
| `R2I` | Image | Text-to-image, multi-image recipes (default) |
| `GEM_PIX` | Image | Text-to-image, image refinement |
| `VEO_3_1` | Video | Image-to-video animation |

## Usage

`whisk` can be invoked through both command line and as a module.

<details>
<summary style="font-weight: bold;font-size:15px;">Command Line</summary>

Make sure you have:

1. Installed `whisk-api` globally ([How to install?](#installation))
2. Obtained your google account cookies ([How to get cookies?](#help))
3. Set env variable `COOKIE` containing your cookie

    Bash:

    ```bash
    export COOKIE="__YOUR__COOKIE__HERE__"
    ```

    Command Prompt:

    ```bat
    set "COOKIE=__YOUR__COOKIE__HERE__"
    ```

    Powershell:

    ```ps
    $COOKIE = "__YOUR__GOOGLE__COOKIE__HERE__"
    ```

#### Basic Usages

> **NOTE:**
> If you are using environment variables, keep the quotes around cookie to avoid word-splitting and authentication errors.
>
> - Linux/macOS: `"$COOKIE"`
> - PowerShell: `"$env:COOKIE"`
> - Command Prompt: `"%COOKIE%"`

- Generating image with prompt

    ```bash
    # saves generated image at ./output/ by default
    whisk generate --prompt "A futuristic city" --cookie "$COOKIE"
    ```

- Selecting a specific model

    ```bash
    # Available: R2I (default), GEM_PIX
    whisk generate --prompt "A beautiful sunset" --model "GEM_PIX" --cookie "$COOKIE"
    ```

- Selecting a specific aspect ratio

    ```bash
    # Available: SQUARE, PORTRAIT, LANDSCAPE (Default: LANDSCAPE)
    whisk generate --prompt "Portrait of a warrior" --aspect "PORTRAIT" --cookie "$COOKIE"
    ```

- Animating an existing image (Image to Video)

    ```bash
    # Requires the Media ID of a LANDSCAPE image
    whisk animate "__MEDIA__ID__HERE__" --script "Camera pans slowly to the left" --cookie "$COOKIE"
    ```

- Refining (Editing) an image

    ```bash
    whisk refine "__MEDIA__ID__HERE__" --prompt "Add a red hat" --cookie "$COOKIE"
    ```

- Generating caption from a local image file

    ```bash
    whisk caption --file /path/to/img.webp --count 3 --cookie "$COOKIE"
    ```

- Deleting media from the cloud

    ```bash
    whisk delete "__MEDIA__ID__HERE__" --cookie "$COOKIE"
    ```

Full generation help:

```text
whisk generate <options>

Options:
      --version     Show version number
  -h, --help        Show help
  -p, --prompt      Description of the image
  -m, --model       Image model (R2I, GEM_PIX) - Default: R2I
  -a, --aspect      Aspect ratio (SQUARE, PORTRAIT, LANDSCAPE)
  -s, --seed        Seed value (0 for random)
  -d, --dir         Output directory
  -c, --cookie      Google account cookie
```

Full animation help:

```text
whisk animate <mediaId>

Positionals:
  mediaId  The ID of the image to animate

Options:
  -s, --script    Prompt/Script for the video animation
  -m, --model     Video generation model (Default: VEO_3_1)
  -d, --dir       Output directory
  -c, --cookie    Google account cookie
```

</details>

<details>
<summary style="font-weight: bold;font-size:15px;">Importing as module</summary>

### Basic Image Generation

```typescript
import { Whisk } from "@rohitaryal/whisk-api";

const whisk = new Whisk(process.env.COOKIE);

// 1. Create a project context
const project = await whisk.newProject("My Project");

// 2. Generate image (uses R2I by default)
const media = await project.generateImage("A futuristic city skyline");

// 3. Save to disk
const savedPath = media.save("./output");
console.log("Image saved at: " + savedPath);
```

### Generate with Model Selection

```typescript
import { Whisk } from "@rohitaryal/whisk-api";

const whisk = new Whisk(process.env.COOKIE);
const project = await whisk.newProject("My Project");

// Generate with specific model
const image = await project.generateImage({
    prompt: "A serene mountain landscape",
    model: "GEM_PIX",  // or "R2I"
    aspectRatio: "IMAGE_ASPECT_RATIO_LANDSCAPE"
});

image.save("./output");
```

### Image Recipe (Multi-Image Composition)

Combine multiple images using subject, scene, and style:

```typescript
import { Whisk, MediaCategory } from "@rohitaryal/whisk-api";

const whisk = new Whisk(process.env.COOKIE);
const project = await whisk.newProject("Recipe Project");

// Generate source images
const subjectImg = await project.generateImage("A golden crown");
const sceneImg = await project.generateImage("A mystical forest");
const styleImg = await project.generateImage("Cyberpunk neon aesthetic");

// Run image recipe to combine them
const result = await project.runImageRecipe({
    userInstruction: "Place the crown in the forest with cyberpunk lighting",
    subject: {
        caption: subjectImg.prompt,
        mediaGenerationId: subjectImg.mediaGenerationId,
        category: MediaCategory.SUBJECT
    },
    scene: {
        caption: sceneImg.prompt,
        mediaGenerationId: sceneImg.mediaGenerationId,
        category: MediaCategory.SCENE
    },
    style: {
        caption: styleImg.prompt,
        mediaGenerationId: styleImg.mediaGenerationId,
        category: MediaCategory.STYLE
    }
});

result.save("./output");
```

### Image Refinement

```typescript
import { Whisk } from "@rohitaryal/whisk-api";

const whisk = new Whisk(process.env.COOKIE);
const project = await whisk.newProject("Refine Project");

// Generate base image
const baseImage = await project.generateImage("A portrait of a warrior");

// Refine with default model (GEM_PIX)
const refined = await baseImage.refine("Add golden armor");

// Or specify model
const refinedR2I = await baseImage.refine("Add a red cape", "R2I");

refined.save("./output");
```

### Advanced Workflow (Generate -> Refine -> Animate)

```typescript
import { Whisk } from "@rohitaryal/whisk-api";

const whisk = new Whisk(process.env.COOKIE);
const project = await whisk.newProject("Video Workflow");

// 1. Generate Base Image (Must be LANDSCAPE for video)
const baseImage = await project.generateImage({
    prompt: "A cybernetic city at night",
    model: "R2I",
    aspectRatio: "IMAGE_ASPECT_RATIO_LANDSCAPE"
});

// 2. Refine (Edit)
const refinedImage = await baseImage.refine("Add neon rain falling");

// 3. Animate (Video)
const video = await refinedImage.animate(
    "Camera slowly flies through the streets, rain falling",
    "VEO_3_1_I2V_12STEP"
);

video.save("./videos");
```

### Caption Generation

```typescript
import { Whisk } from "@rohitaryal/whisk-api";

const whisk = new Whisk(process.env.COOKIE);
const project = await whisk.newProject("Caption Project");

const image = await project.generateImage("A sunset over the ocean");

// Generate captions
const captions = await image.caption(3);
console.log("Captions:", captions);
```

More examples are at: [/examples](https://github.com/rohitaryal/imageFX-api/tree/main/examples)
</details>

## API Reference

### Classes

| Class | Description |
|-------|-------------|
| `Whisk` | Main entry point, manages account and creates projects |
| `Project` | Project context for generating images and running recipes |
| `Media` | Generated media with methods for refine, animate, caption, save |
| `Account` | Session management (internal) |

### Key Methods

| Method | Description |
|--------|-------------|
| `whisk.newProject(name)` | Create a new project |
| `project.generateImage(prompt)` | Generate image from text |
| `project.runImageRecipe(config)` | Combine subject/scene/style images |
| `media.refine(prompt, model?)` | Edit/refine an image |
| `media.animate(script, model?)` | Convert image to video |
| `media.caption(count?)` | Generate captions for image |
| `media.save(directory?)` | Save media to disk |
| `media.deleteMedia()` | Delete from cloud |

### Constants

```typescript
import { ImageModel, VideoGenerationModel, ImageAspectRatio, MediaCategory } from "@rohitaryal/whisk-api";

// Image Models
ImageModel.R2I           // "R2I"
ImageModel.GEM_PIX       // "GEM_PIX"

// Video Models
VideoGenerationModel.VEO_3_1  // "VEO_3_1_I2V_12STEP"

// Aspect Ratios
ImageAspectRatio.SQUARE      // "IMAGE_ASPECT_RATIO_SQUARE"
ImageAspectRatio.PORTRAIT    // "IMAGE_ASPECT_RATIO_PORTRAIT"
ImageAspectRatio.LANDSCAPE   // "IMAGE_ASPECT_RATIO_LANDSCAPE"

// Media Categories (for recipes)
MediaCategory.SUBJECT   // "MEDIA_CATEGORY_SUBJECT"
MediaCategory.SCENE     // "MEDIA_CATEGORY_SCENE"
MediaCategory.STYLE     // "MEDIA_CATEGORY_STYLE"
```

## Help

<details>
<summary style="font-weight: bold;font-size:15px;">How to extract cookies?</summary>

#### Easy way

1. Install [Cookie Editor](https://github.com/Moustachauve/cookie-editor) extension in your browser.
2. Open [labs.google](https://labs.google/fx/tools/whisk/project), make sure you are logged in
3. Click on <kbd>Cookie Editor</kbd> icon from Extensions section.
4. Click on <kbd>Export</kbd> -> <kbd>Header String</kbd>

#### Manual way

1. Open [labs.google](https://labs.google/fx/tools/whisk/project), make sure you are logged in
2. Press <kbd>CTRL</kbd> + <kbd>SHIFT</kbd> + <kbd>I</kbd> to open console
3. Click on <kbd>Network</kbd> tab at top of console
4. Press <kbd>CTRL</kbd> + <kbd>L</kbd> to clear network logs
5. Click <kbd>CTRL</kbd> + <kbd>R</kbd> to refresh page
6. Click on `image-fx` which should be at top
7. Goto <kbd>Request Headers</kbd> section and copy all the content of <kbd>Cookie</kbd>

</details>

<details>
<summary style="font-weight: bold;font-size:15px;">Whisk not available in your country?</summary>

1. Install a free VPN (Windscribe, Proton, etc)
2. Open [labs.google](https://labs.google/fx/tools/whisk/project) and login
3. From here follow the "How to extract cookie?" in [HELP](#help) section (above).
4. Once you have obtained this cookie, you don't need VPN anymore.

</details>

<details>
<summary style="font-weight: bold;font-size:15px;">Not able to generate images?</summary>

Create an issue [here](https://github.com/rohitaryal/imageFX-api/issues). Make sure the pasted logs don't contain cookie or tokens.
</details>

## Contributions

Contributions are welcome but ensure to pass all test cases and follow existing coding standard.

## Disclaimer

This project demonstrates usage of Google's private API but is not affiliated with Google. Use at your own risk.
