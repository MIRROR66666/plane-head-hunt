# Plane Head Hunt / 寻机头

A bilingual browser puzzle game about hiding aircraft and finding every enemy plane head through logical deduction.

一款支持中英双语的网页逻辑推理游戏。玩家需要隐藏自己的飞机，并通过每次侦查的结果找到对手的全部机头。

## Play

- Official website: <https://planeheadhunt.xyz/>
- GitHub Pages: <https://mirror66666.github.io/plane-head-hunt/>
- Repository: <https://github.com/MIRROR66666/plane-head-hunt>

## Features

- Chinese and English interface
- Solo matches against the computer
- Shareable two-player rooms
- Easy, Normal, and Hard difficulty modes
- Guided tutorial and match replay
- Responsive desktop and mobile layouts

## Run locally

The game is a static website and does not require a build step.

```bash
python3 -m http.server 4173
```

Then open <http://127.0.0.1:4173/>.

## Project structure

```text
index.html        Main page and game interface
styles.css       Visual design and responsive layout
game.js          Game rules, interaction, and multiplayer flow
i18n.js          Chinese and English localization
airport-scene.js Animated airport scene
assets/vendor/   Browser dependencies
```

## Version workflow

1. Keep `main` as the deployable production branch.
2. Create a short-lived branch for each feature or fix.
3. Test desktop and mobile flows before merging.
4. Merge reviewed changes into `main` to trigger deployment.
5. Create a version tag for each public release.
