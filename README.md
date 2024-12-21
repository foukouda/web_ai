# Waaagh Story Adventure

Un projet interactif utilisant web-llm pour générer des aventures narratives dans l'univers Ork de Warhammer 40k.

## Lancer le projet

### Prérequis
- [VSCode](https://code.visualstudio.com/) (recommandé) ou tout autre éditeur de code.
- Un navigateur compatible avec WebGPU ou WebAssembly (ex. Chrome, Firefox).

### Étapes

1. **Ouvrir le dossier dans votre éditeur** : 
   - Exemple : avec VSCode, ouvrez le projet via `File -> Open Folder`.

2. **Lancer un serveur local** :
   - **Avec VSCode Live Server** : clic droit sur `index.html` → `Open with Live Server`.
   - **Via CLI** :
     ```bash
     python -m http.server 5500
     ```
     Ensuite, ouvrez [http://localhost:5500/](http://localhost:5500/) dans votre navigateur.

3. **Ouvrir la page `index.html` dans le navigateur**.
   - Désactivez les blocages (ex. Brave Shields) si nécessaire.

## Utilisation

### Sélection du modèle
1. Dans la liste déroulante, choisissez un modèle compatible avec `web-llm` (ex. `Llama-2-7b-chat-hf-q4f16_0`).
2. Cliquez sur **Load Da Big Brain** pour télécharger et initialiser le modèle.

### Configuration du jeu
1. **Choix du genre** : Horror, Funny, Adventure, Epic.
2. **Choix du nombre de tours** : Nombre de décisions avant la fin de l'histoire.
3. Cliquez sur **Begin Da WAAAGH!** pour générer le premier segment.

### Jouer
- Lisez l’histoire générée dans la colonne de gauche.
- Choisissez parmi 4 actions proposées pour avancer dans l'aventure.
- La partie se termine lorsque le nombre de tours est épuisé.

## Fonctionnement

### Le système "Double Agent"
Le projet repose sur `web-llm`, qui exécute un Large Language Model (LLM) localement dans votre navigateur. Voici les rôles joués :

1. **Message "system"** : Définit le cadre et les règles (ex. "Vous êtes un Game Master Warhammer 40k Ork").
2. **Message "assistant"** : Génère les réponses narratives.
3. **Message "user"** : Correspond aux prompts de l'utilisateur (choix d'actions, suite de l’histoire).

### Streaming et contexte
- **Streaming** : Le texte est généré et affiché token par token.
- **Mémoire de l’aventure** : L’historique des messages (system + user + assistant) est conservé pour garantir la cohérence narrative.

## Arborescence du projet
```
waaagh-story-adventure/
├─ assets/
│   ├─ ork_background.png   (image de fond orky)
│   └─ button_click.mp3     (fichier sonore pour les clics)
├─ index.html               (structure HTML de la page)
├─ style.css                (styles CSS orky, mise en page 2 colonnes)
├─ script.js                (logique du jeu, web-llm, etc.)
├─ README.md                (ce fichier)
```

## Personnalisation

1. **Univers** : Changez le message "system" dans `script.js` pour adapter le cadre (ex. autre univers).
2. **Modèle** : Modifiez `this.selectedModel = "..."` dans `script.js` pour définir un modèle par défaut.
3. **Styles** : Personnalisez les couleurs et la mise en page dans `style.css`.
4. **Son** : Remplacez `assets/button_click.mp3` par un autre fichier audio.
5. **Image de fond** : Remplacez `ork_background.png` dans `assets/`.

## Résolution des problèmes

1. **Erreur `net::ERR_FAILED 200 (OK)` lors du téléchargement du modèle** :
   - Vérifiez si votre navigateur ou pare-feu bloque les requêtes.
   - Désactivez les protections (ex. Brave Shields).
   - Hébergez le modèle en local si nécessaire.

2. **Service Worker / Cache** :
   - Désactivez les Service Workers via DevTools : `Application → Service Workers → Unregister / Clear Storage`.
   - Effectuez un hard reload.

3. **Performances** :
   - Les modèles LLM peuvent être volumineux. Assurez-vous d'avoir une connexion stable.

## Crédits & Licence
- **web-llm** : [MLC-AI web-llm](https://mlc.ai/web-llm).
- **Warhammer 40,000** : © Games Workshop (usage fanmade, projet non affilié à Games Workshop).
- **Licence** : MIT (modifiable selon vos besoins).

Merci pour votre intérêt, et **WAAAGH!**
