import * as webllm from "https://esm.run/@mlc-ai/web-llm";

class StoryGame {
    constructor() {
        // Message système : impose l'univers Warhammer 40k Ork
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
        // Choisissez ici un modèle existant dans webllm
        this.selectedModel = "Llama-2-7b-chat-hf-q4f16_0"; 

        // Nombre de tours restants
        this.turnsRemaining = 0;

        this.initializeElements();
        this.setupEventListeners();
        this.setupModelSelection();
    }

    initializeElements() {
        // Bouton téléchargement
        this.downloadBtn = document.getElementById("download");
        // Sélecteur de modèles
        this.modelSelect = document.getElementById("model-selection");
        // Indicateur de statut
        this.downloadStatus = document.getElementById("download-status");

        // Conteneur de genre
        this.genreContainer = document.querySelector(".genre-container");
        // Sélecteur de genre
        this.genreSelect = document.getElementById("genre-selection");

        // Input pour le nombre de tours
        this.turnsInput = document.getElementById("turns-input");

        // Bouton de démarrage de l'histoire
        this.startStoryBtn = document.getElementById("start-story");

        // Conteneur d'histoire
        this.storyContainer = document.querySelector(".story-container");
        this.storyBox = document.getElementById("story-box");

        // Boutons de choix
        this.choiceButtons = [
            document.getElementById("choice1"),
            document.getElementById("choice2"),
            document.getElementById("choice3"),
            document.getElementById("choice4")
        ];

        // Son de clic
        this.buttonSound = document.getElementById("button-sound");
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

    playButtonSound() {
        if (this.buttonSound) {
            this.buttonSound.currentTime = 0;
            this.buttonSound.play();
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
            this.downloadStatus.textContent = "";
            
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

        } catch (error) {
            this.downloadStatus.textContent = "Error loading model: " + error.message;
            this.downloadBtn.disabled = false;
        }
    }

    async startStory() {
        const chosenGenre = this.genreSelect.value;
        const chosenTurns = parseInt(this.turnsInput.value, 10) || 5;
        this.turnsRemaining = chosenTurns;

        const genreFlavorText = {
            horror: "It’s a horror-themed Orky saga: grotesque, gory, and unnerving.",
            funny: "It’s a funny Orky saga, filled with comedic violence and silly Grot mishaps.",
            adventure: "It’s a grand Orky adventure: a quest for loot, krumpin’, and big WAAAGH! excitement.",
            epic: "It’s an epic Orky saga, full of grand battles, huge explosions, and massive war machines."
        };
        const chosenFlavor = genreFlavorText[chosenGenre] || "It’s an Orky story.";

        const prompt = `
STORY:
Da Orky tale youz about to hear is set in Warhammer 40k. ${chosenFlavor}
You stand amidst a broken battlefield littered with scrap metal, spored mushrooms, and the remains of defeated foes. 
As a fresh Ork Boy, your Choppa gripped tight, you snarl at the distant flashes of gunfire where humies and other gitz might be found. 
Da Warboss is bellowing orders behind you, and you smell the stink of fungus, sweat, and smoke.

CHOICES:
1) Charge headlong at the nearest sound of gunfire.
2) Scavenge the scrap for something mean ‘n’ choppy.
3) Threaten a nearby Grot to bring you loot.
4) Attempt to sneak forward to see what Da Warboss is yelling about.
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
            return [
                "An error occurred while generating the story.",
                ["Try again", "Restart", "Continue anyway", "Start over"]
            ];
        }
    }

    async handleChoice(choiceIndex) {
        // Décrémente le nombre de tours restants
        this.turnsRemaining--;

        // Si plus de tours, on termine l'histoire
        if (this.turnsRemaining <= 0) {
            this.endStory();
            return;
        }

        // Sinon on continue l'histoire
        const choiceText = this.choiceButtons[choiceIndex].textContent;

        // On vide temporairement le texte des boutons
        this.choiceButtons.forEach(button => {
            button.textContent = '';
        });

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

    async generateStorySegment(prompt) {
        try {
            // Désactivation des boutons pendant la génération
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
            // Réactivation des boutons
            this.choiceButtons.forEach(btn => btn.disabled = false);

        } catch (error) {
            console.error("Error generating story:", error);
            this.storyBox.innerHTML += `<p>An error occurred while generating the story.</p>`;
            this.updateChoices(["Try again", "Restart", "Continue anyway", "Start over"]);
        }
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

    updateChoices(choices) {
        this.choiceButtons.forEach((button, index) => {
            button.textContent = choices[index] || `Choice ${index + 1}`;
        });
    }

    endStory() {
        this.choiceButtons.forEach(button => {
            button.disabled = true;
            button.textContent = "No more Orky rounds!";
        });

        this.storyBox.innerHTML += `
          <p style="margin-top:20px; color: #9f0000; font-weight: bold;">
            You'z outta Rounds! Da Orky story ends ‘ere. WAAAGH Over!
          </p>
        `;
    }
}

window.addEventListener("load", () => {
    const game = new StoryGame();
});
