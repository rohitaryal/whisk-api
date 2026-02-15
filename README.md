
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

1. Text to Image using `IMAGEN_3_5`
2. Image to Video (Animation) using `VEO_3_1`
3. Image Refinement (Editing/Inpainting)
4. Image to Text (Caption Generation)
5. Project & Media Management
6. Upload & Reference Images
7. Command line support

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

- Creating a new project

    ```bash
    whisk project --name "My Project" --cookie "$COOKIE"
    ```

- Generating image with prompt

    ```bash
    # saves generated image at ./output/ by default
    whisk generate --prompt "A bad friend" --cookie "$COOKIE"
    ```

- Selecting a specific aspect ratio

    ```bash
    # Available: SQUARE, PORTRAIT, LANDSCAPE (Default: LANDSCAPE)
    whisk generate --prompt "Reptillian CEO" --aspect "PORTRAIT" --cookie "$COOKIE"
    ```

- Animating an existing image (Image to Video)

    ```bash
    # Requires the Media ID of a LANDSCAPE image
    whisk animate "__MEDIA__ID__HERE__" --script "Camera pans slowly to the left" --cookie "$COOKIE"
    ```

- Refining (Editing) an image

    ```bash
    whisk refine "__MEDIA__ID__HERE__" --prompt "Add a red hat to the character" --cookie "$COOKIE"
    ```

- Generating caption from a local image file

    ```bash
    whisk caption --file /path/to/img.webp --count 3 --cookie "$COOKIE"
    ```

- Fetching an existing media by ID

    ```bash
    whisk fetch "__MEDIA__ID__HERE__" --cookie "$COOKIE"
    ```

- Uploading an image as reference

    ```bash
    whisk upload /path/to/image.jpg --category SUBJECT --project "__PROJECT__ID__" --cookie "$COOKIE"
    ```

- Deleting media from the cloud

    ```bash
    whisk delete "__MEDIA__ID__HERE__" --cookie "$COOKIE"
    ```

Full CLI commands help:

```text
whisk <cmd> [args]

Commands:
  whisk project             Generate a new project
  whisk generate            Generate new images using a temporary project
  whisk animate <mediaId>   Animate an existing landscape image into a video
  whisk refine <mediaId>    Edit/Refine an existing image
  whisk caption             Generate captions for a local image file
  whisk fetch <mediaId>     Download an existing generated media by ID
  whisk upload <file>       Upload an image to be used as reference later
  whisk delete <mediaId>    Delete a generated media from the cloud

Options:
  -c, --cookie  Google account cookie [required]
  -h, --help    Show help
      --version Show version number
```

<details>
<summary>Project Command</summary>

```text
whisk project

Options:
  --name        Project name [default: "Whisk-CLI project"]
  -c, --cookie  Google account cookie [required]
```
</details>

<details>
<summary>Generate Command</summary>

```text
whisk generate

Options:
  -p, --prompt   Description of the image [required]
  -m, --model    Image generation model [default: "IMAGEN_3_5"]
  -a, --aspect   Aspect ratio (SQUARE, PORTRAIT, LANDSCAPE) [default: "LANDSCAPE"]
  -s, --seed     Seed value (0 for random) [default: 0]
  -d, --dir      Output directory [default: "./output"]
  -c, --cookie   Google account cookie [required]
```
</details>

<details>
<summary>Animate Command</summary>

```text
whisk animate <mediaId>

Positionals:
  mediaId  The ID of the image to animate [required]

Options:
  -s, --script   Prompt/Script for the video animation [required]
  -m, --model    Video generation model [default: "VEO_3_1"]
  -d, --dir      Output directory [default: "./output"]
  -c, --cookie   Google account cookie [required]
```
</details>

<details>
<summary>Refine Command</summary>

```text
whisk refine <mediaId>

Positionals:
  mediaId  The ID of the image to refine [required]

Options:
  -p, --prompt   Instruction for editing (e.g., 'Make it snowy') [required]
  -d, --dir      Output directory [default: "./output"]
  -c, --cookie   Google account cookie [required]
```
</details>

<details>
<summary>Caption Command</summary>

```text
whisk caption

Options:
  -f, --file     Path to local image file [required]
  -n, --count    Number of captions [default: 1]
  -c, --cookie   Google account cookie [required]
```
</details>

<details>
<summary>Fetch Command</summary>

```text
whisk fetch <mediaId>

Positionals:
  mediaId  Unique ID of generated media [required]

Options:
  -d, --dir      Output directory [default: "./output"]
  -c, --cookie   Google account cookie [required]
```
</details>

<details>
<summary>Upload Command</summary>

```text
whisk upload <file>

Positionals:
  file  Path to local image file [required]

Options:
  --category, -ca  Category of reference [required]
                   Choices: SUBJECT, SCENE, STYLE
  --project, -pr   Project/Workflow ID [required]
  -c, --cookie     Google account cookie [required]
```
</details>

<details>
<summary>Delete Command</summary>

```text
whisk delete <mediaId>

Positionals:
  mediaId  Unique ID of generated media to delete [required]

Options:
  -c, --cookie   Google account cookie [required]
```
</details>

</details>

<details>
<summary style="font-weight: bold;font-size:15px;">Importing as module</summary>

- Basic image generation

    ```typescript
    import { Whisk } from "@rohitaryal/whisk-api";

    const whisk = new Whisk(process.env.COOKIE);

    // 1. Create a project context
    const project = await whisk.newProject("My Project");

    // 2. Generate image
    const media = await project.generateImage("A big black cockroach");
    
    // 3. Save to disk
    const savedPath = media.save("./output");
    console.log("[+] Image saved at: " + savedPath);
    ```

- Advanced Workflow (Gen -> Refine -> Animate)

    ```typescript
    import { Whisk, ImageAspectRatio } from "@rohitaryal/whisk-api";

    const whisk = new Whisk(process.env.COOKIE);
    const project = await whisk.newProject("Video Workflow");

    // 1. Generate Base Image (Must be LANDSCAPE for video)
    const baseImage = await project.generateImage({
        prompt: "A cybernetic city",
        aspectRatio: "IMAGE_ASPECT_RATIO_LANDSCAPE"
    });

    // 2. Refine (Edit)
    const refinedImage = await baseImage.refine("Make it raining neon rain");

    // 3. Animate (Video)
    const video = await refinedImage.animate("Camera flies through the streets", "VEO_3_1_I2V_12STEP");

    video.save("./videos");
    ```

More examples are at: [/examples](https://github.com/rohitaryal/whisk-api/tree/main/examples)
</details>

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
<summary style="font-weight: bold;font-size:15px;">ImageFX not available in your country?</summary>

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

Contribution are welcome but ensure to pass all test cases and follow existing coding standard.

## Disclaimer

This project demonstrates usage of Google's private API but is not affiliated with Google. Use at your own risk.
