const COLUMNS = "ABCDEFGHIJKLMNO";
const DIRECTIONS = ["N", "E", "S", "W"];

const MODELS = {
  classic: {
    name: "经典型",
    cells: [[0, 0], [1, -2], [1, -1], [1, 0], [1, 1], [1, 2], [2, 0], [3, -1], [3, 0], [3, 1]]
  },
  delta: {
    name: "三角翼",
    cells: [[0, 0], [1, -1], [1, 0], [1, 1], [2, -2], [2, -1], [2, 0], [2, 1], [2, 2]]
  },
  swift: {
    name: "雨燕型",
    cells: [[0, 0], [1, -2], [1, -1], [1, 0], [1, 1], [1, 2], [2, 0], [3, 0]]
  },
  arrow: {
    name: "箭翼型",
    cells: [[0, 0], [1, -1], [1, 0], [1, 1], [2, -2], [2, 0], [2, 2], [3, -1], [3, 0], [3, 1]]
  },
  scout: {
    name: "侦察型",
    cells: [[0, 0], [1, -1], [1, 0], [1, 1], [2, 0], [3, 0]]
  },
  bomber: {
    name: "轰炸型",
    cells: [[0, 0], [1, -2], [1, -1], [1, 0], [1, 1], [1, 2], [2, -1], [2, 0], [2, 1], [3, -1], [3, 0], [3, 1]]
  }
};

const MODES = {
  easy: {
    name: "简单",
    size: 9,
    fleet: 3,
    models: ["classic", "arrow"],
    overlap: "none",
    summary: "2 种 10 格战机可选，任何部位都不能重叠。",
    rule: "机头是唯一致命点。飞机之间不能重叠，但可以相邻。"
  },
  normal: {
    name: "一般",
    size: 12,
    fleet: 4,
    models: ["classic", "delta", "swift", "arrow"],
    overlap: "body",
    summary: "4 种机型均不超过 10 格，仅机身之间可以重叠。",
    rule: "机身可以互相覆盖；机头不能与任何飞机部位重叠。"
  },
  hard: {
    name: "困难",
    size: 15,
    fleet: 5,
    models: ["classic", "delta", "swift", "arrow", "scout", "bomber"],
    overlap: "all",
    summary: "6–12 格多种机型，机头与机身均可任意重叠。",
    rule: "所有部位都可以重叠；命中重合机头会一次击落多架飞机。"
  }
};

const state = {
  phase: "setup",
  mode: "easy",
  direction: "N",
  selectedModel: "classic",
  playerPlanes: [],
  enemyPlanes: [],
  playerShots: new Map(),
  enemyShots: new Map(),
  turn: "player",
  round: 1,
  sound: true,
  gameOver: false,
  aiQueue: []
};

const tutorialState = {
  step: 0,
  direction: "N",
  deployed: false,
  shotIndex: 0
};

const TUTORIAL_SHOTS = [
  { row: 1, col: 1, result: "miss", text: "击空。灰点说明这里没有飞机，继续缩小范围。" },
  { row: 2, col: 2, result: "hit", text: "命中机身。浅绿色提示机头就在附近。" },
  { row: 3, col: 3, result: "head", text: "命中机头！爆炸标记表示这架飞机已被击落。" }
];

const els = {
  welcomeView: document.querySelector("#welcomeView"),
  tutorialView: document.querySelector("#tutorialView"),
  welcomePlaneLogo: document.querySelector("#welcomePlaneLogo"),
  tutorialPlaneOverview: document.querySelector("#tutorialPlaneOverview"),
  welcomeStartButton: document.querySelector("#welcomeStartButton"),
  welcomeTutorialButton: document.querySelector("#welcomeTutorialButton"),
  tutorialSkipButton: document.querySelector("#tutorialSkipButton"),
  tutorialExitButton: document.querySelector("#tutorialExitButton"),
  tutorialStepCount: document.querySelector("#tutorialStepCount"),
  tutorialDeployBoard: document.querySelector("#tutorialDeployBoard"),
  tutorialAttackBoard: document.querySelector("#tutorialAttackBoard"),
  tutorialDeployFeedback: document.querySelector("#tutorialDeployFeedback"),
  tutorialAttackFeedback: document.querySelector("#tutorialAttackFeedback"),
  tutorialBackButton: document.querySelector("#tutorialBackButton"),
  tutorialNextButton: document.querySelector("#tutorialNextButton"),
  tutorialNavHint: document.querySelector("#tutorialNavHint"),
  gameHomeLink: document.querySelector("#gameHomeLink"),
  setupView: document.querySelector("#setupView"),
  battleView: document.querySelector("#battleView"),
  setupBoard: document.querySelector("#setupBoard"),
  enemyBoard: document.querySelector("#enemyBoard"),
  playerBoard: document.querySelector("#playerBoard"),
  fleetSlots: document.querySelector("#fleetSlots"),
  modelSection: document.querySelector("#modelSection"),
  modelSectionLabel: document.querySelector("#modelSectionLabel"),
  modelPicker: document.querySelector("#modelPicker"),
  modelCount: document.querySelector("#modelCount"),
  modelPreview: document.querySelector("#modelPreview"),
  modeSummary: document.querySelector("#modeSummary"),
  placementRule: document.querySelector("#placementRule"),
  airspaceLabel: document.querySelector("#airspaceLabel"),
  coordinatesNote: document.querySelector(".coordinates-note"),
  startButton: document.querySelector("#startButton"),
  randomButton: document.querySelector("#randomButton"),
  directionName: document.querySelector("#directionName"),
  statusTitle: document.querySelector("#statusTitle"),
  statusText: document.querySelector("#statusText"),
  missionLabel: document.querySelector("#missionLabel"),
  turnText: document.querySelector("#turnText"),
  turnLamp: document.querySelector("#turnLamp"),
  roundCount: document.querySelector("#roundCount"),
  accuracy: document.querySelector("#accuracy"),
  enemyRemaining: document.querySelector("#enemyRemaining"),
  playerRemaining: document.querySelector("#playerRemaining"),
  combatMark: document.querySelector("#combatMark"),
  combatMessage: document.querySelector("#combatMessage"),
  resultOverlay: document.querySelector("#resultOverlay"),
  rulesDialog: document.querySelector("#rulesDialog"),
  battleMenuDialog: document.querySelector("#battleMenuDialog"),
  battleMenuButton: document.querySelector("#battleMenuButton"),
  continueBattleButton: document.querySelector("#continueBattleButton"),
  redeployButton: document.querySelector("#redeployButton"),
  restartBattleButton: document.querySelector("#restartBattleButton"),
  resultSeal: document.querySelector("#resultSeal"),
  resultTitle: document.querySelector("#resultTitle"),
  resultText: document.querySelector("#resultText"),
  resultStats: document.querySelector("#resultStats"),
  restartButton: document.querySelector("#restartButton"),
  nextModeActions: document.querySelector("#nextModeActions"),
  rulesButton: document.querySelector("#rulesButton"),
  soundButton: document.querySelector("#soundButton"),
  toast: document.querySelector("#toast")
};

function config() {
  return MODES[state.mode];
}

function key(row, col) {
  return `${row},${col}`;
}

function label(row, col) {
  return `${COLUMNS[col]}${row + 1}`;
}

function rotatePoint([row, col], direction) {
  if (direction === "E") return [col, -row];
  if (direction === "S") return [-row, -col];
  if (direction === "W") return [-col, row];
  return [row, col];
}

function planeCells(row, col, direction, modelId) {
  return MODELS[modelId].cells.map((point, index) => {
    const [dr, dc] = rotatePoint(point, direction);
    return { row: row + dr, col: col + dc, head: index === 0 };
  });
}

function isValidPlane(cells, planes) {
  const { size, overlap } = config();
  if (!cells.every(cell => cell.row >= 0 && cell.row < size && cell.col >= 0 && cell.col < size)) return false;
  if (overlap === "all") return true;

  const occupied = new Set(planes.flatMap(plane => plane.cells.map(cell => key(cell.row, cell.col))));
  if (overlap === "none") return cells.every(cell => !occupied.has(key(cell.row, cell.col)));

  const existingHeads = new Set(planes.map(plane => key(plane.head.row, plane.head.col)));
  return cells.every(cell => {
    const cellKey = key(cell.row, cell.col);
    return cell.head ? !occupied.has(cellKey) : !existingHeads.has(cellKey);
  });
}

function createBoard(element, clickHandler, hoverHandler) {
  const { size } = config();
  element.innerHTML = "";
  element.dataset.size = String(size);
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.dataset.row = String(row + 1);
      cell.dataset.column = COLUMNS[col];
      cell.dataset.r = String(row);
      cell.dataset.c = String(col);
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", label(row, col));
      cell.innerHTML = "<span></span>";
      if (clickHandler) cell.addEventListener("click", () => clickHandler(row, col));
      if (hoverHandler) {
        cell.addEventListener("mouseenter", () => hoverHandler(row, col));
        cell.addEventListener("mouseleave", clearPreview);
      }
      element.appendChild(cell);
    }
  }
}

function buildBoards() {
  createBoard(els.setupBoard, placePlayerPlane, previewPlane);
  createBoard(els.enemyBoard, playerFire);
  createBoard(els.playerBoard);
}

function getCell(board, row, col) {
  return board.querySelector(`[data-r="${row}"][data-c="${col}"]`);
}

function resetBoardCells(board) {
  board.querySelectorAll(".cell").forEach(cell => {
    cell.className = "cell";
    cell.disabled = false;
    cell.innerHTML = "<span></span>";
    cell.removeAttribute("data-plane");
    cell.removeAttribute("data-destroyed");
  });
}

function drawPlanes(board, planes, revealAll = true) {
  const visibleCounts = new Map();
  planes.forEach((plane, planeIndex) => {
    if (!revealAll && !plane.sunk) return;
    plane.cells.forEach(cell => {
      const cellKey = key(cell.row, cell.col);
      const el = getCell(board, cell.row, cell.col);
      if (!el) return;
      visibleCounts.set(cellKey, (visibleCounts.get(cellKey) || 0) + 1);
      el.classList.add(cell.head ? "plane-head" : "plane-body");
      if (plane.sunk && !cell.head) el.classList.add("sunken-body");
      el.dataset.plane = String(planeIndex);
    });
  });
  visibleCounts.forEach((count, cellKey) => {
    if (count < 2) return;
    const [row, col] = cellKey.split(",").map(Number);
    getCell(board, row, col)?.classList.add("plane-overlap");
  });
}

function modelShape(modelId) {
  const points = MODELS[modelId].cells;
  const rows = points.map(([row]) => row);
  const cols = points.map(([, col]) => col);
  const minRow = Math.min(...rows);
  const maxRow = Math.max(...rows);
  const minCol = Math.min(...cols);
  const maxCol = Math.max(...cols);
  return { points, minRow, minCol, rowCount: maxRow - minRow + 1, colCount: maxCol - minCol + 1 };
}

function modelShapeMarkup(modelId, className) {
  const shape = modelShape(modelId);
  const cells = shape.points.map(([row, col], index) =>
    `<i class="${index === 0 ? "is-head" : ""}" style="grid-row:${row - shape.minRow + 1};grid-column:${col - shape.minCol + 1}"></i>`
  ).join("");
  return `<span class="model-shape ${className}" style="--shape-rows:${shape.rowCount};--shape-cols:${shape.colCount}">${cells}</span>`;
}

function renderIntroVisuals() {
  els.welcomePlaneLogo.innerHTML = modelShapeMarkup("classic", "welcome-plane-shape");
  els.tutorialPlaneOverview.innerHTML = modelShapeMarkup("classic", "tutorial-plane-shape");
}

function enterGame() {
  document.body.classList.remove("intro-active");
  els.welcomeView.hidden = true;
  els.tutorialView.hidden = true;
  window.scrollTo({ top: 0, behavior: "auto" });
  if (state.phase === "battle" && state.turn === "enemy" && !state.gameOver && !enemyFireTimer) scheduleEnemyFire(300);
  playTone(360, 0.08);
}

function showWelcome() {
  window.clearTimeout(enemyFireTimer);
  enemyFireTimer = null;
  document.body.classList.add("intro-active");
  els.tutorialView.hidden = true;
  els.welcomeView.hidden = false;
  els.welcomeView.scrollTop = 0;
}

function exitTutorial() {
  els.tutorialView.hidden = true;
  els.welcomeView.hidden = false;
  els.welcomeView.scrollTop = 0;
}

function openTutorial() {
  tutorialState.step = 0;
  tutorialState.direction = "N";
  tutorialState.deployed = false;
  tutorialState.shotIndex = 0;
  els.welcomeView.hidden = true;
  els.tutorialView.hidden = false;
  els.tutorialView.scrollTop = 0;
  els.tutorialDeployFeedback.textContent = "当前机头向北，请点击 D4 完成部署。";
  els.tutorialAttackFeedback.textContent = "第一发：点击 B2。";
  setTutorialDirection("N");
  renderTutorialAttackBoard();
  updateTutorialUI();
}

function setTutorialDirection(direction) {
  tutorialState.direction = direction;
  document.querySelectorAll("[data-tutorial-direction]").forEach(button => {
    const active = button.dataset.tutorialDirection === direction;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  const directionName = { N: "向北", E: "向东", S: "向南", W: "向西" }[direction];
  els.tutorialDeployFeedback.textContent = tutorialState.deployed
    ? `部署成功，当前机头${directionName}。你仍可切换方向观察形状。`
    : `当前机头${directionName}，请点击 D4 完成部署。`;
  renderTutorialDeployBoard();
}

function renderTutorialDeployBoard() {
  const size = 7;
  const target = { row: 3, col: 3 };
  const deployedCells = tutorialState.deployed
    ? new Map(planeCells(target.row, target.col, tutorialState.direction, "classic").map(cell => [key(cell.row, cell.col), cell]))
    : new Map();
  const cells = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const planeCell = deployedCells.get(key(row, col));
      const isTarget = !tutorialState.deployed && row === target.row && col === target.col;
      const classes = ["tutorial-cell"];
      if (isTarget) classes.push("is-target");
      if (planeCell) classes.push(planeCell.head ? "plane-head" : "plane-body");
      const cellLabel = label(row, col);
      cells.push(`<button class="${classes.join(" ")}" type="button" role="gridcell" data-r="${row}" data-c="${col}" data-label="${cellLabel}" aria-label="${cellLabel}${isTarget ? "，推荐机头位置" : ""}" ${tutorialState.deployed ? "disabled" : ""}></button>`);
    }
  }
  els.tutorialDeployBoard.dataset.size = String(size);
  els.tutorialDeployBoard.innerHTML = cells.join("");
  if (tutorialState.deployed) return;
  els.tutorialDeployBoard.querySelectorAll(".tutorial-cell").forEach(cell => {
    cell.addEventListener("click", () => {
      const row = Number(cell.dataset.r);
      const col = Number(cell.dataset.c);
      if (row !== target.row || col !== target.col) {
        els.tutorialDeployFeedback.textContent = "这里不是指令坐标，请点击红框标出的 D4。";
        return;
      }
      tutorialState.deployed = true;
      els.tutorialDeployFeedback.textContent = "部署成功！深绿色是机头，浅绿色是机身。";
      renderTutorialDeployBoard();
      updateTutorialUI();
      playTone(420, 0.06);
    });
  });
}

function renderTutorialAttackBoard() {
  const size = 5;
  const completedShots = new Map(TUTORIAL_SHOTS.slice(0, tutorialState.shotIndex).map(shot => [key(shot.row, shot.col), shot]));
  const currentShot = TUTORIAL_SHOTS[tutorialState.shotIndex];
  const cells = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const shot = completedShots.get(key(row, col));
      const isTarget = currentShot?.row === row && currentShot?.col === col;
      const classes = ["tutorial-cell"];
      if (isTarget) classes.push("is-target");
      if (shot) classes.push("has-result", `shot-${shot.result}`);
      const symbols = { miss: "·", hit: "·", head: "✹" };
      const cellLabel = label(row, col);
      cells.push(`<button class="${classes.join(" ")}" type="button" role="gridcell" data-r="${row}" data-c="${col}" data-label="${cellLabel}" aria-label="${cellLabel}${isTarget ? "，当前目标" : ""}" ${currentShot ? "" : "disabled"}>${shot ? symbols[shot.result] : ""}</button>`);
    }
  }
  els.tutorialAttackBoard.dataset.size = String(size);
  els.tutorialAttackBoard.innerHTML = cells.join("");
  document.querySelectorAll("[data-shot-order]").forEach((item, index) => {
    item.classList.toggle("is-active", index === tutorialState.shotIndex);
    item.classList.toggle("is-complete", index < tutorialState.shotIndex);
  });
  if (!currentShot) return;
  els.tutorialAttackBoard.querySelectorAll(".tutorial-cell").forEach(cell => {
    cell.addEventListener("click", () => {
      const row = Number(cell.dataset.r);
      const col = Number(cell.dataset.c);
      if (row !== currentShot.row || col !== currentShot.col) {
        els.tutorialAttackFeedback.textContent = `先按指令点击 ${label(currentShot.row, currentShot.col)}。`;
        return;
      }
      tutorialState.shotIndex += 1;
      const nextShot = TUTORIAL_SHOTS[tutorialState.shotIndex];
      els.tutorialAttackFeedback.textContent = nextShot
        ? `${currentShot.text} 下一发点击 ${label(nextShot.row, nextShot.col)}。`
        : `${currentShot.text} 侦查演练完成。`;
      renderTutorialAttackBoard();
      updateTutorialUI();
      playShotSound(currentShot.result);
    });
  });
}

function updateTutorialUI() {
  const hints = [
    "认识机头、机身与战果标记",
    "选择朝向并完成一次部署",
    "依次体验击空、机身与机头",
    "了解三种难度的重叠规则"
  ];
  document.querySelectorAll("[data-tutorial-step]").forEach((step, index) => { step.hidden = index !== tutorialState.step; });
  document.querySelectorAll("[data-tutorial-progress]").forEach((item, index) => {
    item.classList.toggle("is-active", index === tutorialState.step);
    item.classList.toggle("is-complete", index < tutorialState.step);
  });
  els.tutorialStepCount.textContent = `第 ${tutorialState.step + 1} 步 / 共 4 步`;
  els.tutorialNavHint.textContent = hints[tutorialState.step];
  els.tutorialBackButton.disabled = tutorialState.step === 0;
  els.tutorialNextButton.disabled = (tutorialState.step === 1 && !tutorialState.deployed)
    || (tutorialState.step === 2 && tutorialState.shotIndex < TUTORIAL_SHOTS.length);
  els.tutorialNextButton.textContent = ["开始学习 →", "下一步 →", "下一步 →", "进入游戏 →"][tutorialState.step];
}

function renderModelPicker() {
  const available = config().models;
  if (!available.includes(state.selectedModel)) state.selectedModel = available[0];
  const isSingleModel = available.length === 1;
  els.modelSectionLabel.textContent = isSingleModel ? "本关机型" : "选择机型";
  els.modelPicker.classList.toggle("is-single", isSingleModel);
  els.modelPicker.innerHTML = available.map(modelId => {
    const model = MODELS[modelId];
    return `
    <button class="model-button ${modelId === state.selectedModel ? "is-active" : ""}" data-model="${modelId}" type="button" role="radio" aria-checked="${modelId === state.selectedModel}" aria-label="${model.name}，${model.cells.length} 格">
      ${modelShapeMarkup(modelId, "model-thumb")}
      <span class="model-button-name">${model.name}</span>
      <span class="model-hover-card" aria-hidden="true">
        <strong>${model.name}<em>${model.cells.length} 格</em></strong>
        ${modelShapeMarkup(modelId, "model-hover-shape")}
      </span>
    </button>
  `;
  }).join("");
  els.modelCount.textContent = `${MODELS[state.selectedModel].cells.length} 格`;
  renderModelPreview();
}

function renderModelPreview() {
  const shape = modelShape(state.selectedModel);
  els.modelPreview.style.gridTemplateColumns = `repeat(${shape.colCount}, 18px)`;
  els.modelPreview.style.gridTemplateRows = `repeat(${shape.rowCount}, 18px)`;
  els.modelPreview.innerHTML = shape.points.map(([row, col], index) =>
    `<i class="${index === 0 ? "is-head" : ""}" style="grid-row:${row - shape.minRow + 1};grid-column:${col - shape.minCol + 1}"></i>`
  ).join("");
}

function renderSetup() {
  resetBoardCells(els.setupBoard);
  drawPlanes(els.setupBoard, state.playerPlanes);
  const { fleet } = config();
  els.fleetSlots.innerHTML = Array.from({ length: fleet }, (_, index) => {
    const plane = state.playerPlanes[index];
    if (!plane) return `<div class="fleet-slot"><span>战机 ${String(index + 1).padStart(2, "0")}</span><b>待命</b></div>`;
    return `<button class="fleet-slot is-deployed" data-remove-plane="${index}" type="button" aria-label="撤回战机 ${index + 1}">
      <span>${String(index + 1).padStart(2, "0")} · ${MODELS[plane.modelId].name}</span><b>撤回 ×</b>
    </button>`;
  }).join("");
  els.startButton.disabled = state.playerPlanes.length !== fleet;
  els.statusText.textContent = state.playerPlanes.length === fleet
    ? "编队部署完毕，可以开始侦察。"
    : `选择机型与方向，再点击棋盘确定机头。还需部署 ${fleet - state.playerPlanes.length} 架。`;
}

function previewPlane(row, col) {
  if (state.playerPlanes.length >= config().fleet) return;
  clearPreview();
  const cells = planeCells(row, col, state.direction, state.selectedModel);
  const valid = isValidPlane(cells, state.playerPlanes);
  cells.forEach(cell => getCell(els.setupBoard, cell.row, cell.col)?.classList.add(valid ? "preview-valid" : "preview-invalid"));
}

function clearPreview() {
  els.setupBoard.querySelectorAll(".preview-valid, .preview-invalid").forEach(cell => cell.classList.remove("preview-valid", "preview-invalid"));
}

function placePlayerPlane(row, col) {
  if (state.playerPlanes.length >= config().fleet) {
    showToast("编队已满，请从编队列表撤回战机");
    return;
  }
  const cells = planeCells(row, col, state.direction, state.selectedModel);
  if (!isValidPlane(cells, state.playerPlanes)) {
    showToast(state.mode === "normal" ? "机头不能与其他飞机重叠" : "此处空间不足或发生了重叠");
    return;
  }
  state.playerPlanes.push({
    head: { row, col },
    direction: state.direction,
    modelId: state.selectedModel,
    cells,
    sunk: false
  });
  renderSetup();
  playTone(420, 0.06);
}

function randomFleet() {
  const planes = [];
  const { size, fleet, models, overlap } = config();
  let attempts = 0;
  while (planes.length < fleet && attempts < 12000) {
    attempts += 1;
    let row = Math.floor(Math.random() * size);
    let col = Math.floor(Math.random() * size);
    if (overlap === "all" && planes.length && Math.random() < 0.34) {
      const anchor = planes[Math.floor(Math.random() * planes.length)].head;
      row = anchor.row;
      col = anchor.col;
    }
    const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    const modelId = models[Math.floor(Math.random() * models.length)];
    const cells = planeCells(row, col, direction, modelId);
    if (isValidPlane(cells, planes)) planes.push({ head: { row, col }, direction, modelId, cells, sunk: false });
  }
  return planes;
}

function setMode(mode) {
  state.mode = mode;
  state.playerPlanes = [];
  state.enemyPlanes = [];
  state.playerShots.clear();
  state.enemyShots.clear();
  state.selectedModel = config().models[0];
  document.querySelectorAll(".mode-button").forEach(button => {
    const active = button.dataset.mode === mode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-checked", String(active));
  });
  const { size, summary, rule } = config();
  els.modeSummary.textContent = summary;
  els.placementRule.textContent = rule;
  els.airspaceLabel.textContent = `${size} × ${size} 空域`;
  els.coordinatesNote.textContent = `横 A–${COLUMNS[size - 1]} · 纵 1–${size}`;
  renderModelPicker();
  buildBoards();
  renderSetup();
  showToast(`已切换为${config().name}模式`);
}

function startBattle() {
  if (state.playerPlanes.length !== config().fleet) return;
  state.enemyPlanes = randomFleet();
  if (state.enemyPlanes.length !== config().fleet) {
    showToast("布阵生成失败，请重试");
    return;
  }
  state.phase = "battle";
  state.turn = "player";
  state.gameOver = false;
  window.clearTimeout(enemyFireTimer);
  enemyFireTimer = null;
  els.setupView.hidden = true;
  els.battleView.hidden = false;
  els.missionLabel.textContent = `${config().name} · 交战阶段`;
  els.statusTitle.textContent = "搜索敌方机头";
  els.statusText.textContent = "点击敌方棋盘中的未知坐标发动攻击。";
  els.combatMark.hidden = true;
  els.combatMark.textContent = "";
  els.combatMessage.textContent = "无线电静默。选择敌方空域中的一个坐标。";
  renderBattle();
  playTone(300, 0.08);
}

function resolveShot(planes, row, col) {
  const planesAtCell = planes.filter(plane => plane.cells.some(cell => cell.row === row && cell.col === col));
  const heads = planesAtCell.filter(plane => !plane.sunk && plane.head.row === row && plane.head.col === col);
  heads.forEach(plane => { plane.sunk = true; });
  return {
    result: heads.length ? "head" : planesAtCell.length ? "hit" : "miss",
    headCount: heads.length
  };
}

function playerFire(row, col) {
  if (state.phase !== "battle" || state.turn !== "player" || state.gameOver) return;
  const shotKey = key(row, col);
  if (state.playerShots.has(shotKey)) {
    showToast("这个坐标已经侦察过了");
    return;
  }
  const shot = resolveShot(state.enemyPlanes, row, col);
  state.playerShots.set(shotKey, shot);
  const resultText = shot.result === "miss" ? "击空" : shot.result === "hit" ? "击中机身" : `锁定 ${shot.headCount} 个机头`;
  const destroyed = shot.result === "head" ? `，击落敌机 ${shot.headCount} 架。` : "。";
  showCombatMark(shot.result);
  els.combatMessage.textContent = `${label(row, col)}：${resultText}${destroyed}`;
  playShotSound(shot.result);
  state.turn = "enemy";
  renderBattle();
  if (checkWinner()) return;
  scheduleEnemyFire();
}

function neighbors(row, col) {
  const cross = [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]];
  const diagonal = [[row - 1, col - 1], [row - 1, col + 1], [row + 1, col - 1], [row + 1, col + 1]];
  const offsets = state.mode === "hard" ? [...cross, ...diagonal] : cross;
  return offsets.filter(([r, c]) => r >= 0 && r < config().size && c >= 0 && c < config().size);
}

function chooseEnemyTarget() {
  state.aiQueue = state.aiQueue.filter(([r, c]) => !state.enemyShots.has(key(r, c)));
  if (state.aiQueue.length) return state.aiQueue.shift();
  const candidates = [];
  for (let row = 0; row < config().size; row += 1) {
    for (let col = 0; col < config().size; col += 1) {
      if (!state.enemyShots.has(key(row, col))) candidates.push([row, col]);
    }
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

let enemyFireTimer;
function scheduleEnemyFire(delay = 650) {
  window.clearTimeout(enemyFireTimer);
  enemyFireTimer = window.setTimeout(enemyFire, delay);
}

function enemyFire() {
  enemyFireTimer = null;
  if (state.phase !== "battle" || state.gameOver) return;
  const [row, col] = chooseEnemyTarget();
  const shot = resolveShot(state.playerPlanes, row, col);
  state.enemyShots.set(key(row, col), shot);
  if (shot.result === "hit") state.aiQueue.push(...neighbors(row, col));
  if (shot.result === "head") state.aiQueue = [];
  const resultText = shot.result === "miss" ? "击空" : shot.result === "hit" ? "命中我方机身" : `锁定我方 ${shot.headCount} 个机头`;
  showCombatMark(shot.result);
  els.combatMessage.textContent = `敌方攻击 ${label(row, col)}：${resultText}。`;
  playShotSound(shot.result);
  state.round += 1;
  state.turn = "player";
  renderBattle();
  checkWinner();
}

function applyShots(board, shots) {
  shots.forEach((shot, shotKey) => {
    const [row, col] = shotKey.split(",").map(Number);
    const cell = getCell(board, row, col);
    const symbols = { miss: "·", hit: "·", head: "✹" };
    cell.classList.add("shot", `shot-${shot.result}`);
    cell.querySelector("span").textContent = symbols[shot.result];
    if (shot.headCount > 1) cell.insertAdjacentHTML("beforeend", `<b class="destroyed-count">×${shot.headCount}</b>`);
    cell.disabled = true;
    cell.setAttribute("aria-label", `${label(row, col)} ${shot.result === "miss" ? "击空" : shot.result === "hit" ? "击中机身" : `击落 ${shot.headCount} 架飞机`}`);
  });
}

function showCombatMark(result) {
  const symbols = { miss: "·", hit: "·", head: "✹" };
  els.combatMark.hidden = false;
  els.combatMark.className = `combat-mark ${result}`;
  els.combatMark.textContent = symbols[result];
}

function renderBattle() {
  [els.enemyBoard, els.playerBoard].forEach(resetBoardCells);
  drawPlanes(els.enemyBoard, state.enemyPlanes, false);
  drawPlanes(els.playerBoard, state.playerPlanes, true);
  applyShots(els.enemyBoard, state.playerShots);
  applyShots(els.playerBoard, state.enemyShots);
  els.playerBoard.querySelectorAll(".cell").forEach(cell => { cell.disabled = true; });
  if (state.turn !== "player" || state.gameOver) els.enemyBoard.querySelectorAll(".cell").forEach(cell => { cell.disabled = true; });

  const hits = [...state.playerShots.values()].filter(shot => shot.result !== "miss").length;
  els.accuracy.textContent = state.playerShots.size ? `${Math.round(hits / state.playerShots.size * 100)}%` : "0%";
  els.roundCount.textContent = String(state.round).padStart(2, "0");
  const enemyHeads = state.enemyPlanes.filter(plane => !plane.sunk).length;
  const playerHeads = state.playerPlanes.filter(plane => !plane.sunk).length;
  els.enemyRemaining.textContent = `机头 ${enemyHeads} / ${config().fleet}`;
  els.playerRemaining.textContent = `机头 ${playerHeads} / ${config().fleet}`;
  updateTurnUI();
}

function updateTurnUI() {
  const playerTurn = state.turn === "player";
  els.turnText.textContent = playerTurn ? "轮到你行动" : state.gameOver ? "任务结束" : "敌方正在定位…";
  els.turnLamp.style.background = playerTurn ? "#f0c95f" : "#d05247";
}

function checkWinner() {
  const enemyLost = state.enemyPlanes.every(plane => plane.sunk);
  const playerLost = state.playerPlanes.every(plane => plane.sunk);
  if (!enemyLost && !playerLost) return false;
  state.gameOver = true;
  state.turn = "none";
  renderBattle();
  const won = enemyLost;
  const hits = [...state.playerShots.values()].filter(shot => shot.result !== "miss").length;
  const accuracy = state.playerShots.size ? Math.round(hits / state.playerShots.size * 100) : 0;
  els.resultSeal.textContent = won ? "胜" : "败";
  els.resultTitle.textContent = won ? "空域已肃清" : "编队失去联络";
  els.resultText.textContent = won ? "你率先锁定了全部敌方机头。" : "敌方先一步锁定了我方全部机头。";
  els.resultStats.innerHTML = `
    <span><strong>${state.round}</strong>回合</span>
    <span><strong>${state.playerShots.size}</strong>次攻击</span>
    <span><strong>${accuracy}%</strong>命中率</span>
  `;
  renderNextModeActions();
  els.resultOverlay.hidden = false;
  els.restartButton.focus();
  return true;
}

function renderNextModeActions() {
  const modeOrder = ["easy", "normal", "hard"];
  const currentIndex = modeOrder.indexOf(state.mode);
  els.nextModeActions.innerHTML = modeOrder
    .filter(mode => mode !== state.mode)
    .map(mode => {
      const target = MODES[mode];
      const action = modeOrder.indexOf(mode) > currentIndex ? "挑战" : "返回";
      return `<button class="next-mode-button" data-next-mode="${mode}" type="button">
        <span>${action}${target.name}模式</span>
        <small>${target.size}×${target.size} · ${target.fleet} 架飞机</small>
        <b aria-hidden="true">→</b>
      </button>`;
    }).join("");
}

function restart(nextMode = state.mode) {
  returnToSetup(false, nextMode);
}

function returnToSetup(preserveFleet, nextMode = state.mode) {
  window.clearTimeout(enemyFireTimer);
  enemyFireTimer = null;
  state.phase = "setup";
  state.playerPlanes = preserveFleet
    ? state.playerPlanes.map(plane => ({ ...plane, sunk: false }))
    : [];
  state.enemyPlanes = [];
  state.playerShots.clear();
  state.enemyShots.clear();
  state.round = 1;
  state.gameOver = false;
  state.turn = "player";
  state.aiQueue = [];
  els.resultOverlay.hidden = true;
  if (els.battleMenuDialog.open) els.battleMenuDialog.close();
  els.setupView.hidden = false;
  els.battleView.hidden = true;
  els.missionLabel.textContent = "布阵阶段";
  els.statusTitle.textContent = "部署你的飞行编队";
  if (nextMode !== state.mode) {
    setMode(nextMode);
  } else {
    renderSetup();
  }
}

function setDirection(direction) {
  if (!DIRECTIONS.includes(direction)) return;
  state.direction = direction;
  document.querySelectorAll(".direction-button").forEach(button => {
    const active = button.dataset.direction === direction;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  els.directionName.textContent = { N: "向北", E: "向东", S: "向南", W: "向西" }[direction];
  clearPreview();
}

let toastTimer;
function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => els.toast.classList.remove("is-visible"), 1700);
}

let audioContext;
function playTone(frequency, duration) {
  if (!state.sound) return;
  try {
    audioContext ||= new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.05, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch (_) {
    state.sound = false;
  }
}

function playShotSound(result) {
  playTone(result === "miss" ? 180 : result === "hit" ? 310 : 520, result === "head" ? 0.16 : 0.08);
}

document.querySelectorAll(".mode-button").forEach(button => button.addEventListener("click", () => setMode(button.dataset.mode)));
document.querySelectorAll(".direction-button").forEach(button => {
  button.addEventListener("click", () => setDirection(button.dataset.direction));
});
document.addEventListener("keydown", event => {
  const directionByKey = { ArrowUp: "N", ArrowRight: "E", ArrowDown: "S", ArrowLeft: "W" };
  const direction = directionByKey[event.key];
  if (!els.tutorialView.hidden) {
    if (event.key === "Escape") exitTutorial();
    if (direction && tutorialState.step === 1) {
      event.preventDefault();
      setTutorialDirection(direction);
    }
    return;
  }
  const target = event.target;
  const editing = target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
  if (!direction || document.body.classList.contains("intro-active") || state.phase !== "setup" || editing || document.querySelector("dialog[open]")) return;
  event.preventDefault();
  setDirection(direction);
});
els.welcomeStartButton.addEventListener("click", enterGame);
els.welcomeTutorialButton.addEventListener("click", openTutorial);
els.gameHomeLink.addEventListener("click", event => {
  event.preventDefault();
  showWelcome();
});
els.tutorialSkipButton.addEventListener("click", enterGame);
els.tutorialExitButton.addEventListener("click", exitTutorial);
els.tutorialBackButton.addEventListener("click", () => {
  if (tutorialState.step === 0) return;
  tutorialState.step -= 1;
  updateTutorialUI();
  els.tutorialView.scrollTop = 0;
});
els.tutorialNextButton.addEventListener("click", () => {
  if (tutorialState.step === 3) {
    enterGame();
    return;
  }
  tutorialState.step += 1;
  updateTutorialUI();
  els.tutorialView.scrollTop = 0;
});
document.querySelectorAll("[data-tutorial-direction]").forEach(button => {
  button.addEventListener("click", () => setTutorialDirection(button.dataset.tutorialDirection));
});
els.modelPicker.addEventListener("click", event => {
  const button = event.target.closest("[data-model]");
  if (!button) return;
  state.selectedModel = button.dataset.model;
  renderModelPicker();
});
els.fleetSlots.addEventListener("click", event => {
  const button = event.target.closest("[data-remove-plane]");
  if (!button) return;
  state.playerPlanes.splice(Number(button.dataset.removePlane), 1);
  renderSetup();
  showToast("已撤回该战机");
});
els.randomButton.addEventListener("click", () => {
  state.playerPlanes = randomFleet();
  renderSetup();
  showToast("已生成随机编队");
});
els.startButton.addEventListener("click", startBattle);
els.restartButton.addEventListener("click", () => restart());
els.nextModeActions.addEventListener("click", event => {
  const button = event.target.closest("[data-next-mode]");
  if (button) restart(button.dataset.nextMode);
});
els.rulesButton.addEventListener("click", () => els.rulesDialog.showModal());
els.battleMenuButton.addEventListener("click", () => {
  window.clearTimeout(enemyFireTimer);
  enemyFireTimer = null;
  els.battleMenuDialog.showModal();
});
els.continueBattleButton.addEventListener("click", () => els.battleMenuDialog.close());
els.redeployButton.addEventListener("click", () => {
  returnToSetup(true);
  showToast("已返回布阵，可撤回并调整战机");
});
els.restartBattleButton.addEventListener("click", () => {
  restart();
  showToast("已清空编队，请重新布阵");
});
els.battleMenuDialog.addEventListener("close", () => {
  if (state.phase === "battle" && state.turn === "enemy" && !state.gameOver && !enemyFireTimer) scheduleEnemyFire(300);
});
els.soundButton.addEventListener("click", () => {
  state.sound = !state.sound;
  els.soundButton.innerHTML = `<span aria-hidden="true">${state.sound ? "◖" : "×"}</span>`;
  els.soundButton.setAttribute("aria-label", state.sound ? "关闭音效" : "开启音效");
  showToast(state.sound ? "音效已开启" : "音效已关闭");
});
document.querySelectorAll("[data-close-dialog]").forEach(button => button.addEventListener("click", () => button.closest("dialog").close()));
document.querySelectorAll(".mobile-tab").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".mobile-tab").forEach(tab => tab.classList.toggle("is-active", tab === button));
    document.querySelectorAll("[data-battle-panel]").forEach(panel => panel.classList.toggle("is-mobile-active", panel.dataset.battlePanel === button.dataset.tab));
  });
});

renderIntroVisuals();
renderModelPicker();
buildBoards();
renderSetup();
setDirection(state.direction);
