import * as webllm from "https://esm.run/@mlc-ai/web-llm";



class StoryGame {
    constructor() {
        this.messages = [
            {
                content: `
You are an expert Warhammer 40,000 Ork RPG game master. 
The entire story, setting, and characters—including the player—must be set in the grimdark Warhammer 40k universe, focusing on Ork culture. 
Write in second person perspective ("you") as if the player is an Ork Boy in a warband. 
Include vivid descriptions of brutal Ork life, rough Ork speech patterns, improvised weapons, and constant threats of violence. 
After each short narrative segment (2-3 sentences), provide exactly 4 possible actions (choices) that fit the Ork theme. 
Keep descriptions concise but intense, and reflect the brutal, chaotic nature of the Orks.
`,
                role: "system",
            }
        ];
        this.engine = new webllm.MLCEngine();
        this.selectedModel = "Llama-3-8B-Instruct-q4f32_1-MLC-1k"; // Base model
        this.initializeElements();
        this.setupEventListeners();
        this.setupModelSelection();
    }

    initializeElements() {
        this.downloadBtn = document.getElementById("download");
        this.modelSelect = document.getElementById("model-selection");
        this.downloadStatus = document.getElementById("download-status");
        // On peut enlever les références au genre
        this.genreContainer = document.querySelector(".genre-container");
        this.genreSelect = document.getElementById("genre-selection");
        this.startStoryBtn = document.getElementById("start-story");
        this.storyContainer = document.querySelector(".story-container");
        this.storyBox = document.getElementById("story-box");
        this.choiceButtons = [
            document.getElementById("choice1"),
            document.getElementById("choice2"),
            document.getElementById("choice3"),
            document.getElementById("choice4")
        ];
    }

    setupEventListeners() {
        this.downloadBtn.addEventListener("click", () => {
            this.playButtonSound();
            this.initializeModel();
        });
    
        this.startStoryBtn.addEventListener("click", () => {
            this.playButtonSound();
            this.startStory();
        });
    
        this.choiceButtons.forEach((button, index) => {
            button.addEventListener("click", () => {
                this.playButtonSound();
                this.handleChoice(index);
            });
        });
    }
    
    // Ajout d'une fonction pour jouer le son
    playButtonSound() {
        const audio = document.getElementById('button-sound');
        if (audio) {
            // Remettre à zéro si nécessaire pour rejouer le son depuis le début
            audio.currentTime = 0;
            audio.play();
        }
    }
    
    setupModelSelection() {
        const availableModels = webllm.prebuiltAppConfig.model_list.map(m => m.model_id);
        availableModels.forEach((modelId) => {
            const option = document.createElement("option");
            option.value = modelId;
            option.textContent = modelId;
            this.modelSelect.appendChild(option);
        });
        this.modelSelect.value = this.selectedModel;
    }

    async initializeModel() {
        try {
            this.downloadBtn.disabled = true;
            this.downloadStatus.classList.remove("hidden");

            this.engine.setInitProgressCallback((report) => {
                console.log("initialize", report.progress);
                this.downloadStatus.textContent = report.text;
            });

            this.selectedModel = this.modelSelect.value;
            await this.engine.reload(this.selectedModel, {
                temperature: 0.7,
                top_p: 0.95,
            });

            this.downloadStatus.textContent = "Model ready!";
            // On peut masquer le genreContainer ou directement afficher la storyContainer
            // Ici, on laisse apparaitre juste le bouton start-story
            this.genreContainer.classList.remove("hidden");

        } catch (error) {
            this.downloadStatus.textContent = "Error loading model: " + error.message;
            this.downloadBtn.disabled = false;
        }
    }

    async startStory() {
        this.storyContainer.classList.remove("hidden");
        
        // Prompt initial spécifique à l'univers Ork de Warhammer 40k
        const prompt = `
STORY:
You stand amidst a broken battlefield littered with scrap metal, spored mushrooms, and the groaning remains of defeated foes. 
As a fresh Ork Boy, your Choppa gripped tight, you snarl at the distant flashes of gunfire where humies and other gitz might be found. 
The air reeks of fungus and burnt promethium, and your Warboss barks orders somewhere behind you.

CHOICES:
1) Charge headlong at the nearest sound of gunfire.
2) Smash a pile of scrap to see if you can find something choppy.
3) Yell at a nearby Grot to fetch you something useful.
4) Try to sneak closer and listen for your Warboss’s orders.
`;

        await this.generateStorySegment(prompt);
    }

    parseResponse(response) {
        if (!response) return ["", []];

        try {
            const storyPart = response.split('CHOICES:')[0]
                .replace(/^STORY:\s*/i, '')
                .trim();

            const choicesPart = response.split('CHOICES:')[1] || '';

            let choices = choicesPart
                .split(/\d\)/)
                .filter(choice => choice.trim())
                .map(choice => choice.trim())
                .slice(0, 4);

            while (choices.length < 4) {
                choices.push(`Choice ${choices.length + 1}`);
            }

            return [storyPart, choices];
        } catch (error) {
            console.error("Error parsing response:", error);
            return ["An error occurred while generating the story.", 
                ["Try again", "Restart", "Continue anyway", "Start over"]];
        }
    }

    async handleChoice(choiceIndex) {
        const choiceText = this.choiceButtons[choiceIndex].textContent;

        this.choiceButtons.forEach(button => {
            button.textContent = '';
        });

        // Prompt suivant, toujours dans le thème Ork
        const prompt = `
Continue the Warhammer 40k Ork RPG story, focusing on brutal, Ork-centered action. 
You have chosen: "${choiceText}"

STORY:
[Describe in 2-3 sentences what immediately happens due to that choice, 
keeping the grim, Orky tone and second-person perspective. 
Show the consequences, maybe finding loot, crushing an enemy, or preparing for bigger fights.]

CHOICES:
1) [Another violent or cunning Ork action]
2) [Something reckless but possibly rewarding]
3) [Something more strategic or manipulative]
4) [A bizarre Orky idea, risky but fun]
`;

        await this.generateStorySegment(prompt);
    }

    updateStoryText(text) {
        const [story] = this.parseResponse(text);
        if (story && story.trim()) {
            const cleanStory = story
                .replace(/^STORY:\s*/i, '')
                .split('CHOICES:')[0]
                .trim();

            if (!this.storyBox.querySelector('.current-segment')) {
                this.storyBox.innerHTML += `<p class="current-segment">${cleanStory}</p>`;
            } else {
                const currentSegment = this.storyBox.querySelector('.current-segment');
                currentSegment.textContent = cleanStory;
            }
        }
    }

    async generateStorySegment(prompt) {
        try {
            this.choiceButtons.forEach(btn => btn.disabled = true);

            const message = {
                content: prompt,
                role: "user"
            };
            this.messages.push(message);

            let curMessage = "";
            const completion = await this.engine.chat.completions.create({
                stream: true,
                messages: this.messages,
            });

            const previousSegment = this.storyBox.querySelector('.current-segment');
            if (previousSegment) {
                previousSegment.classList.remove('current-segment');
            }

            for await (const chunk of completion) {
                const curDelta = chunk.choices[0].delta.content;
                if (curDelta) {
                    curMessage += curDelta;

                    if (!curMessage.includes("CHOICES:")) {
                        this.updateStoryText(curMessage);
                    }
                }
            }

            const finalMessage = await this.engine.getMessage();
            this.messages.push({
                content: finalMessage,
                role: "assistant"
            });

            const [story, choices] = this.parseResponse(finalMessage);

            const currentSegment = this.storyBox.querySelector('.current-segment');
            if (currentSegment) {
                currentSegment.textContent = story.replace(/^STORY:\s*/i, '');
                currentSegment.classList.remove('current-segment');
            }

            this.updateChoices(choices);
            this.choiceButtons.forEach(btn => btn.disabled = false);
        } catch (error) {
            console.error("Error generating story:", error);
            this.storyBox.innerHTML += `<p>An error occurred while generating the story.</p>`;
            this.updateChoices(["Try again", "Restart", "Continue anyway", "Start over"]);
        }
    }

    updateChoices(choices) {
        this.choiceButtons.forEach((button, index) => {
            button.textContent = choices[index] || `Choice ${index + 1}`;
        });
    }
}

window.addEventListener("load", () => {
    const game = new StoryGame();
});

