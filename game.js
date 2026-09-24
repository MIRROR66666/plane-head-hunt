const COLUMNS = "ABCDEFGHIJKLMNO";
const DIRECTIONS = ["N", "E", "S", "W"];

const MODELS = {
  starter: {
    name: "入门型",
    cells: [[0, 0], [1, -1], [1, 0], [1, 1], [2, 0], [3, 0]]
  },
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
    fleet: 2,
    models: ["starter"],
    overlap: "none",
    autoDirection: true,
    summary: "2 架 6 格入门小飞机，点击机头位置后自动安排朝向。",
    rule: "只需选择机头位置。系统会自动寻找可放置方向，飞机之间不能重叠。"
  },
  normal: {
    name: "一般",
    size: 12,
    fleet: 4,
    models: ["classic", "delta", "swift", "arrow"],
    overlap: "body",
    summary: "4 种机型均不超过 10 格，仅机身之间可以重叠。",
    tips: ["四架飞机", "四种机型可随机排列", "机身之间可以重叠"],
    rule: "机身可以互相覆盖；机头不能与任何飞机部位重叠。"
  },
  hard: {
    name: "困难",
    size: 15,
    fleet: 5,
    models: ["classic", "delta", "swift", "arrow", "scout", "bomber"],
    overlap: "all",
    summary: "6-12 格多种机型，机头与机身均可任意重叠。",
    tips: ["五架飞机", "六种机型可随机排列", "机头与机身可以任意重叠"],
    rule: "所有部位都可以重叠；命中重合机头会一次击落多架飞机。"
  }
};

const state = {
  phase: "setup",
  playMode: "solo",
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
  enemyHeadsRemaining: null,
  aiQueue: []
};

const multiplayer = {
  peer: null,
  connection: null,
  role: null,
  roomCode: "",
  roomLink: "",
  connected: false,
  ready: false,
  opponentReady: false,
  pendingShot: null,
  intentionalClose: false
};

const tutorialState = {
  step: 0,
  mode: "easy",
  direction: "N",
  deployedCount: 0,
  searchStarted: false,
  shotIndex: 0
};

const TUTORIAL_DEPLOYMENTS = [
  { row: 2, col: 2, direction: "N" },
  { row: 1, col: 4, direction: "E" }
];

const TUTORIAL_SHOTS = [
  { row: 1, col: 1, result: "miss" },
  { row: 2, col: 2, result: "hit" },
  { row: 3, col: 3, result: "head" }
];

const TUTORIAL_REASONING = [
  {
    title: "第一步：检查 B2",
    text: "点击 B2，判断这个坐标有没有飞机。"
  },
  {
    title: "B2 击空：排除不可能位置",
    text: "灰点表示 B2 没有飞机。排除所有覆盖 B2 的摆法，再点击 C3。"
  },
  {
    title: "C3 命中机身：对照机型",
    text: "绿点表示 C3 是机身。旋转右侧入门型，保留机身能覆盖 C3 的摆法，再验证候选机头 D4。"
  },
  {
    title: "D4 找到机头：这架飞机已被击落",
    text: "爆炸表示 D4 是机头。继续用灰点排除、绿点定位、机型比对，找到剩余机头。"
  }
];

const els = {
  welcomeView: document.querySelector("#welcomeView"),
  tutorialView: document.querySelector("#tutorialView"),
  welcomePlaneLogo: document.querySelector("#welcomePlaneLogo"),
  tutorialBrandLogo: document.querySelector("#tutorialBrandLogo"),
  gameBrandLogo: document.querySelector("#gameBrandLogo"),
  tutorialPlaneOverview: document.querySelector("#tutorialPlaneOverview"),
  tutorialStarterPreview: document.querySelector("#tutorialStarterPreview"),
  tutorialPlaneDirection: document.querySelector("#tutorialPlaneDirection"),
  tutorialDirectionFeedback: document.querySelector("#tutorialDirectionFeedback"),
  tutorialModeFeedback: document.querySelector("#tutorialModeFeedback"),
  tutorialBattleEnemy: document.querySelector("#tutorialBattleEnemy"),
  tutorialBattlePlayer: document.querySelector("#tutorialBattlePlayer"),
  welcomeStartButton: document.querySelector("#welcomeStartButton"),
  welcomeTutorialButton: document.querySelector("#welcomeTutorialButton"),
  playModeDialog: document.querySelector("#playModeDialog"),
  soloModeButton: document.querySelector("#soloModeButton"),
  onlineModeButton: document.querySelector("#onlineModeButton"),
  roomDialog: document.querySelector("#roomDialog"),
  roomDialogEyebrow: document.querySelector("#roomDialogEyebrow"),
  roomDialogTitle: document.querySelector("#roomDialogTitle"),
  roomDialogText: document.querySelector("#roomDialogText"),
  roomSharePanel: document.querySelector("#roomSharePanel"),
  roomDialogCode: document.querySelector("#roomDialogCode"),
  roomLinkInput: document.querySelector("#roomLinkInput"),
  roomCopyButton: document.querySelector("#roomCopyButton"),
  roomEnterButton: document.querySelector("#roomEnterButton"),
  roomCancelButton: document.querySelector("#roomCancelButton"),
  closeRoomDialogButton: document.querySelector("#closeRoomDialogButton"),
  roomStrip: document.querySelector("#roomStrip"),
  roomStatusTitle: document.querySelector("#roomStatusTitle"),
  roomStatusText: document.querySelector("#roomStatusText"),
  roomCodeLabel: document.querySelector("#roomCodeLabel"),
  copyRoomLinkButton: document.querySelector("#copyRoomLinkButton"),
  leaveRoomButton: document.querySelector("#leaveRoomButton"),
  tutorialSkipButton: document.querySelector("#tutorialSkipButton"),
  tutorialExitButton: document.querySelector("#tutorialExitButton"),
  tutorialStepCount: document.querySelector("#tutorialStepCount"),
  tutorialDeployBoard: document.querySelector("#tutorialDeployBoard"),
  tutorialAttackBoard: document.querySelector("#tutorialAttackBoard"),
  tutorialAttackModel: document.querySelector("#tutorialAttackModel"),
  tutorialReasoning: document.querySelector("#tutorialReasoning"),
  tutorialReasoningTitle: document.querySelector("#tutorialReasoningTitle"),
  tutorialDeployFeedback: document.querySelector("#tutorialDeployFeedback"),
  tutorialRandomDeployButton: document.querySelector("#tutorialRandomDeployButton"),
  tutorialStartSearchButton: document.querySelector("#tutorialStartSearchButton"),
  tutorialModelsButton: document.querySelector("#tutorialModelsButton"),
  tutorialSettingsButton: document.querySelector("#tutorialSettingsButton"),
  tutorialModelsPopover: document.querySelector("#tutorialModelsPopover"),
  tutorialSettingsPopover: document.querySelector("#tutorialSettingsPopover"),
  tutorialBattleModelShape: document.querySelector("#tutorialBattleModelShape"),
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
  directionSection: document.querySelector("#directionSection"),
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
  battleModelsControl: document.querySelector("#battleModelsControl"),
  battleModelsPopover: document.querySelector("#battleModelsPopover"),
  battleModelsButton: document.querySelector("#battleModelsButton"),
  battleModelList: document.querySelector("#battleModelList"),
  continueBattleButton: document.querySelector("#continueBattleButton"),
  redeployButton: document.querySelector("#redeployButton"),
  restartBattleButton: document.querySelector("#restartBattleButton"),
  resultSeal: document.querySelector("#resultSeal"),
  resultTitle: document.querySelector("#resultTitle"),
  resultText: document.querySelector("#resultText"),
  resultStats: document.querySelector("#resultStats"),
  restartButton: document.querySelector("#restartButton"),
  nextMissionLabel: document.querySelector(".next-mission-label"),
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

function isMultiplayer() {
  return state.playMode === "online";
}

function roomPeerId(roomCode) {
  return `plane-head-hunt-${roomCode}`;
}

function createRoomCode() {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, value => alphabet[value % alphabet.length]).join("");
}

function buildRoomLink(roomCode) {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("room", roomCode);
  return url.toString();
}

function setRoomUrl(roomCode = "") {
  const url = new URL(window.location.href);
  if (roomCode) url.searchParams.set("room", roomCode);
  else url.searchParams.delete("room");
  window.history.replaceState({}, "", url);
}

function setRoomDialog({ title, text, eyebrow = "双人对战", share = false, enter = false }) {
  els.roomDialogEyebrow.textContent = eyebrow;
  els.roomDialogTitle.textContent = title;
  els.roomDialogText.textContent = text;
  els.roomSharePanel.hidden = !share;
  els.roomEnterButton.hidden = !enter;
  if (!els.roomDialog.open) els.roomDialog.showModal();
}

function setRoomStrip(status, title, text) {
  els.roomStrip.hidden = false;
  els.roomStrip.classList.toggle("is-connected", status === "connected");
  els.roomStrip.classList.toggle("is-error", status === "error");
  els.roomStatusTitle.textContent = title;
  els.roomStatusText.textContent = text;
  els.roomCodeLabel.textContent = `房间 ${multiplayer.roomCode || "----"}`;
  els.copyRoomLinkButton.hidden = multiplayer.role !== "host";
}

function updateRoomStrip() {
  if (!isMultiplayer()) {
    els.roomStrip.hidden = true;
    return;
  }
  if (!multiplayer.connected) {
    setRoomStrip("waiting", multiplayer.role === "host" ? "等待朋友加入" : "正在加入房间", multiplayer.role === "host" ? "复制邀请链接发给朋友" : "正在连接房主");
    return;
  }
  if (state.phase === "battle") {
    setRoomStrip("connected", "双人对战进行中", state.turn === "player" ? "轮到你侦查" : "等待朋友行动");
    return;
  }
  const readyText = multiplayer.ready ? "你已准备" : "你尚未准备";
  const opponentText = multiplayer.opponentReady ? "朋友已准备" : "朋友正在布阵";
  setRoomStrip("connected", "朋友已加入", `${readyText} · ${opponentText}`);
}

async function copyRoomLink() {
  if (!multiplayer.roomLink) return;
  try {
    await navigator.clipboard.writeText(multiplayer.roomLink);
  } catch (_) {
    els.roomLinkInput.hidden = false;
    els.roomLinkInput.select();
    document.execCommand("copy");
  }
  showToast("邀请链接已复制");
}

function sendRoomMessage(message) {
  if (!multiplayer.connection?.open) return false;
  multiplayer.connection.send(message);
  return true;
}

function resetMultiplayerRound() {
  multiplayer.ready = false;
  multiplayer.opponentReady = false;
  multiplayer.pendingShot = null;
  state.enemyHeadsRemaining = config().fleet;
  updateRoomStrip();
}

function invalidateOnlineReady() {
  if (!isMultiplayer() || !multiplayer.ready) return;
  multiplayer.ready = false;
  sendRoomMessage({ type: "ready", ready: false });
  updateRoomStrip();
}

function updateOnlineControls() {
  const guestLocked = isMultiplayer() && multiplayer.role === "guest";
  document.querySelectorAll("[data-mode]").forEach(button => {
    button.disabled = guestLocked;
    button.title = guestLocked ? "难度由房主选择" : "";
  });
}

function closeRoomDialog() {
  if (els.roomDialog.open) els.roomDialog.close();
}

function prepareMultiplayer(role, roomCode) {
  state.playMode = "online";
  multiplayer.role = role;
  multiplayer.roomCode = roomCode;
  multiplayer.roomLink = buildRoomLink(roomCode);
  multiplayer.connected = false;
  multiplayer.intentionalClose = false;
  multiplayer.ready = false;
  multiplayer.opponentReady = false;
  multiplayer.pendingShot = null;
  state.enemyHeadsRemaining = config().fleet;
  els.roomDialogCode.textContent = roomCode.toUpperCase();
  els.roomLinkInput.value = multiplayer.roomLink;
  setRoomUrl(roomCode);
  returnToSetup(false, state.mode, { broadcast: false });
  updateOnlineControls();
  updateRoomStrip();
}

function createMultiplayerRoom() {
  if (typeof Peer === "undefined") {
    setRoomDialog({ title: "联机组件加载失败", text: "请检查网络后刷新页面重试。" });
    return;
  }
  const roomCode = createRoomCode();
  prepareMultiplayer("host", roomCode);
  if (els.playModeDialog.open) els.playModeDialog.close();
  setRoomDialog({ title: "正在创建房间", text: "正在生成邀请链接，请稍候。" });
  const peer = new Peer(roomPeerId(roomCode));
  multiplayer.peer = peer;
  peer.on("open", () => {
    setRoomDialog({ title: "房间已经建好", text: "把链接发给朋友。等待期间，你可以先进入布阵。", share: true, enter: true });
    updateRoomStrip();
  });
  peer.on("connection", connection => {
    if (multiplayer.connection?.open) {
      connection.on("open", () => {
        connection.send({ type: "room-full" });
        connection.close();
      });
      return;
    }
    bindRoomConnection(connection);
  });
  bindPeerEvents(peer);
}

function joinMultiplayerRoom(roomCode) {
  if (typeof Peer === "undefined") {
    setRoomDialog({ title: "联机组件加载失败", text: "请检查网络后刷新页面重试。" });
    return;
  }
  prepareMultiplayer("guest", roomCode);
  setRoomDialog({ title: "正在加入房间", text: `正在连接房间 ${roomCode.toUpperCase()}。`, eyebrow: "收到朋友的邀请" });
  const peer = new Peer();
  multiplayer.peer = peer;
  peer.on("open", () => bindRoomConnection(peer.connect(roomPeerId(roomCode), { reliable: true, serialization: "json" })));
  bindPeerEvents(peer);
}

function bindPeerEvents(peer) {
  peer.on("error", error => {
    console.warn("[multiplayer] peer error", error.type, error.message);
    if (multiplayer.intentionalClose) return;
    const unavailable = error.type === "unavailable-id";
    const missing = error.type === "peer-unavailable";
    const title = unavailable ? "房间码发生冲突" : missing ? "没有找到这个房间" : "房间连接失败";
    const text = unavailable ? "请重新创建一个房间。" : missing ? "请让房主保持页面打开，再重新进入邀请链接。" : "请检查网络后重试。";
    setRoomDialog({ title, text });
    setRoomStrip("error", title, text);
  });
}

function bindRoomConnection(connection) {
  multiplayer.connection = connection;
  connection.on("open", () => {
    multiplayer.connected = true;
    updateRoomStrip();
    sendRoomMessage({ type: "hello", mode: state.mode, role: multiplayer.role, ready: multiplayer.ready });
    if (multiplayer.role === "guest") {
      closeRoomDialog();
      enterGame();
      showToast("已加入朋友的房间");
    } else {
      setRoomDialog({ title: "朋友已经加入", text: "双方布置好飞机并准备后，房主先行动。", share: true, enter: true });
      showToast("朋友已加入房间");
    }
  });
  connection.on("data", handleRoomMessage);
  connection.on("close", () => {
    if (multiplayer.intentionalClose) return;
    multiplayer.connected = false;
    state.turn = "none";
    updateRoomStrip();
    setRoomStrip("error", "朋友已离开房间", "本局已暂停，可以退出后重新建房");
    showToast("与朋友的连接已断开");
    if (state.phase === "battle") renderBattle();
  });
  connection.on("error", () => {
    console.warn("[multiplayer] data connection error");
    if (!multiplayer.intentionalClose) setRoomStrip("error", "连接出现问题", "请检查双方网络");
  });
}

function handleRoomMessage(message) {
  if (!message || typeof message.type !== "string") return;
  if (message.type === "room-full") {
    setRoomDialog({ title: "房间已经满员", text: "这个房间已有两位玩家，请让朋友重新创建房间。" });
    return;
  }
  if (message.type === "hello") {
    multiplayer.opponentReady = Boolean(message.ready);
    if (multiplayer.role === "guest" && MODES[message.mode]) setMode(message.mode, { broadcast: false, announce: false });
    if (multiplayer.role === "host") sendRoomMessage({ type: "sync", mode: state.mode, ready: multiplayer.ready });
    updateRoomStrip();
    maybeStartOnlineBattle();
    return;
  }
  if (message.type === "sync") {
    multiplayer.opponentReady = Boolean(message.ready);
    if (multiplayer.role === "guest" && MODES[message.mode]) setMode(message.mode, { broadcast: false, announce: false });
    updateRoomStrip();
    return;
  }
  if (message.type === "mode" && multiplayer.role === "guest" && MODES[message.mode]) {
    multiplayer.ready = false;
    multiplayer.opponentReady = false;
    returnToSetup(false, message.mode, { broadcast: false });
    showToast(`房主选择了${MODES[message.mode].name}模式`);
    updateRoomStrip();
    return;
  }
  if (message.type === "ready") {
    multiplayer.opponentReady = Boolean(message.ready);
    updateRoomStrip();
    maybeStartOnlineBattle();
    return;
  }
  if (message.type === "start") {
    beginOnlineBattle(message.firstRole || "host");
    return;
  }
  if (message.type === "shot") {
    receiveOnlineShot(message);
    return;
  }
  if (message.type === "shot-result") {
    receiveOnlineShotResult(message);
    return;
  }
  if (message.type === "reset") {
    resetMultiplayerRound();
    returnToSetup(Boolean(message.preserveFleet), MODES[message.mode] ? message.mode : state.mode, { broadcast: false });
    showToast("朋友发起了新一局");
    return;
  }
  if (message.type === "leave") {
    multiplayer.connected = false;
    setRoomStrip("error", "朋友已离开房间", "本局已暂停，可以退出后重新建房");
  }
}

function maybeStartOnlineBattle() {
  if (multiplayer.role !== "host" || !multiplayer.connected || !multiplayer.ready || !multiplayer.opponentReady || state.phase === "battle") return;
  sendRoomMessage({ type: "start", firstRole: "host" });
  beginOnlineBattle("host");
}

function disconnectMultiplayer({ keepView = false } = {}) {
  multiplayer.intentionalClose = true;
  if (multiplayer.connection?.open) multiplayer.connection.send({ type: "leave" });
  multiplayer.connection?.close();
  multiplayer.peer?.destroy();
  multiplayer.peer = null;
  multiplayer.connection = null;
  multiplayer.role = null;
  multiplayer.roomCode = "";
  multiplayer.roomLink = "";
  multiplayer.connected = false;
  multiplayer.ready = false;
  multiplayer.opponentReady = false;
  multiplayer.pendingShot = null;
  state.playMode = "solo";
  state.enemyHeadsRemaining = null;
  returnToSetup(false, state.mode, { broadcast: false });
  els.roomStrip.hidden = true;
  updateOnlineControls();
  setRoomUrl();
  closeRoomDialog();
  if (!keepView) showWelcome();
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

function shapeFromPoints(points) {
  const rows = points.map(([row]) => row);
  const cols = points.map(([, col]) => col);
  const minRow = Math.min(...rows);
  const maxRow = Math.max(...rows);
  const minCol = Math.min(...cols);
  const maxCol = Math.max(...cols);
  return { points, minRow, minCol, rowCount: maxRow - minRow + 1, colCount: maxCol - minCol + 1 };
}

function modelShape(modelId, direction = "N") {
  return shapeFromPoints(MODELS[modelId].cells.map(point => rotatePoint(point, direction)));
}

function modelShapeMarkup(modelId, className) {
  const shape = modelShape(modelId);
  const cells = shape.points.map(([row, col], index) =>
    `<i class="${index === 0 ? "is-head" : ""}" style="grid-row:${row - shape.minRow + 1};grid-column:${col - shape.minCol + 1}"></i>`
  ).join("");
  return `<span class="model-shape ${className}" style="--shape-rows:${shape.rowCount};--shape-cols:${shape.colCount}">${cells}</span>`;
}

function directionalModelMarkup(modelId, direction, className) {
  const shape = modelShape(modelId, direction);
  const cells = shape.points.map(([row, col], index) =>
    `<i class="${index === 0 ? "is-head" : ""}" style="grid-row:${row - shape.minRow + 1};grid-column:${col - shape.minCol + 1}"></i>`
  ).join("");
  return `<span class="model-shape ${className}" style="--shape-rows:${shape.rowCount};--shape-cols:${shape.colCount}">${cells}</span>`;
}

function battleModelBoardMarkup(modelId) {
  const shape = modelShape(modelId);
  const padding = 1;
  const rows = shape.rowCount + padding * 2;
  const cols = shape.colCount + padding * 2;
  const occupied = new Map(shape.points.map(([row, col], index) => [
    `${row - shape.minRow + padding},${col - shape.minCol + padding}`,
    index === 0 ? "is-plane is-head" : "is-plane"
  ]));
  const cells = Array.from({ length: rows * cols }, (_, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    return `<i class="${occupied.get(`${row},${col}`) || ""}"></i>`;
  }).join("");
  return `<span class="battle-model-board" style="--preview-rows:${rows};--preview-cols:${cols}" aria-hidden="true">${cells}</span>`;
}

function renderTutorialMiniBoard(element, variant) {
  element.innerHTML = Array.from({ length: 25 }, (_, index) => {
    const result = variant === "enemy" && index === 12 ? " hit" : variant === "player" && [7, 8, 12, 17].includes(index) ? " plane" : "";
    return `<i class="${result.trim()}">${result.includes("hit") ? "·" : ""}</i>`;
  }).join("");
}

function renderIntroVisuals() {
  els.welcomePlaneLogo.innerHTML = modelShapeMarkup("classic", "welcome-plane-shape");
  els.tutorialBrandLogo.innerHTML = modelShapeMarkup("starter", "brand-plane-shape");
  els.gameBrandLogo.innerHTML = modelShapeMarkup("starter", "brand-plane-shape");
  els.tutorialPlaneOverview.innerHTML = modelShapeMarkup("starter", "tutorial-plane-shape");
  els.tutorialStarterPreview.innerHTML = modelShapeMarkup("starter", "tutorial-starter-shape");
  els.tutorialPlaneDirection.innerHTML = directionalModelMarkup("classic", tutorialState.direction, "tutorial-direction-shape");
  els.tutorialAttackModel.innerHTML = directionalModelMarkup("starter", "S", "tutorial-attack-shape");
  els.tutorialBattleModelShape.innerHTML = modelShapeMarkup("starter", "tutorial-battle-model-preview");
  renderTutorialMiniBoard(els.tutorialBattleEnemy, "enemy");
  renderTutorialMiniBoard(els.tutorialBattlePlayer, "player");
}

function enterGame() {
  document.body.classList.remove("intro-active");
  els.welcomeView.hidden = true;
  els.tutorialView.hidden = true;
  window.scrollTo({ top: 0, behavior: "auto" });
  if (!isMultiplayer() && state.phase === "battle" && state.turn === "enemy" && !state.gameOver && !enemyFireTimer) scheduleEnemyFire(300);
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

function finishTutorial() {
  setMode("easy", { announce: false });
  exitTutorial();
  if (!els.playModeDialog.open) els.playModeDialog.showModal();
}

function openTutorial() {
  tutorialState.step = 0;
  tutorialState.mode = "easy";
  tutorialState.direction = "N";
  tutorialState.deployedCount = 0;
  tutorialState.searchStarted = false;
  tutorialState.shotIndex = 0;
  els.welcomeView.hidden = true;
  els.tutorialView.hidden = false;
  els.tutorialView.scrollTop = 0;
  els.tutorialDeployFeedback.textContent = "请在棋盘上点击 C3。";
  els.tutorialAttackFeedback.textContent = TUTORIAL_REASONING[0].text;
  closeTutorialToolbarPopovers();
  document.querySelectorAll("[data-tutorial-mode]").forEach(button => {
    const active = button.dataset.tutorialMode === "easy";
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-checked", String(active));
  });
  els.tutorialModeFeedback.textContent = "简单：9×9 空域，2 架入门型飞机，系统自动安排朝向。";
  setTutorialDirection("N");
  renderTutorialDeployBoard();
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
  els.tutorialDirectionFeedback.textContent = `当前机头${directionName}。`;
  els.tutorialPlaneDirection.innerHTML = directionalModelMarkup("classic", direction, "tutorial-direction-shape");
}

function renderTutorialDeployBoard() {
  const size = 7;
  const target = TUTORIAL_DEPLOYMENTS[tutorialState.deployedCount];
  const deployedCells = new Map();
  TUTORIAL_DEPLOYMENTS.slice(0, tutorialState.deployedCount).forEach(placement => {
    planeCells(placement.row, placement.col, placement.direction, "starter").forEach(cell => {
      deployedCells.set(key(cell.row, cell.col), cell);
    });
  });
  const cells = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const planeCell = deployedCells.get(key(row, col));
      const isTarget = target && row === target.row && col === target.col;
      const classes = ["tutorial-cell"];
      if (isTarget) classes.push("is-target");
      if (planeCell) classes.push(planeCell.head ? "plane-head" : "plane-body");
      const cellLabel = label(row, col);
      cells.push(`<button class="${classes.join(" ")}" type="button" role="gridcell" data-r="${row}" data-c="${col}" data-label="${cellLabel}" aria-label="${cellLabel}${isTarget ? "，当前机头位置" : ""}" ${target ? "" : "disabled"}></button>`);
    }
  }
  els.tutorialDeployBoard.dataset.size = String(size);
  els.tutorialDeployBoard.innerHTML = cells.join("");
  const fleetSlots = document.querySelectorAll(".tutorial-mini-fleet span");
  const screenStatus = document.querySelector(".tutorial-screen-bar span");
  fleetSlots.forEach((slot, index) => {
    const ready = index < tutorialState.deployedCount;
    slot.classList.toggle("is-ready", ready);
    slot.textContent = `战机 ${index + 1} · ${ready ? "已部署" : "待命"}`;
  });
  const remaining = TUTORIAL_DEPLOYMENTS.length - tutorialState.deployedCount;
  screenStatus.textContent = remaining ? `简单 · 还需部署 ${remaining} 架` : "简单 · 布阵完成";
  els.tutorialStartSearchButton.disabled = remaining > 0 || tutorialState.searchStarted;
  els.tutorialStartSearchButton.classList.toggle("is-ready", remaining === 0 && !tutorialState.searchStarted);
  els.tutorialStartSearchButton.textContent = tutorialState.searchStarted ? "已开始侦查" : "开始侦查";
  els.tutorialRandomDeployButton.classList.toggle("is-complete", tutorialState.deployedCount === TUTORIAL_DEPLOYMENTS.length);
  document.querySelectorAll("[data-deploy-task]").forEach((task, index) => {
    const complete = index < tutorialState.deployedCount || (index === 2 && tutorialState.searchStarted);
    task.classList.toggle("is-complete", complete);
    task.classList.toggle("is-current", !complete && index === Math.min(tutorialState.deployedCount, 2));
  });
  if (!target) return;
  els.tutorialDeployBoard.querySelectorAll(".tutorial-cell").forEach(cell => {
    cell.addEventListener("click", () => {
      const row = Number(cell.dataset.r);
      const col = Number(cell.dataset.c);
      if (row !== target.row || col !== target.col) {
        els.tutorialDeployFeedback.textContent = `请点击 ${label(target.row, target.col)}。高亮格是当前机头位置。`;
        return;
      }
      tutorialState.deployedCount += 1;
      els.tutorialDeployFeedback.textContent = tutorialState.deployedCount < TUTORIAL_DEPLOYMENTS.length
        ? "第一架已部署。现在点击 E2，部署第二架。"
        : "两架飞机都已部署。点击右侧“开始侦查”完成这一步。";
      renderTutorialDeployBoard();
      updateTutorialUI();
      playTone(420, 0.06);
    });
  });
}

function closeTutorialToolbarPopovers() {
  els.tutorialModelsPopover.hidden = true;
  els.tutorialSettingsPopover.hidden = true;
  els.tutorialModelsButton.setAttribute("aria-expanded", "false");
  els.tutorialSettingsButton.setAttribute("aria-expanded", "false");
}

function toggleTutorialToolbarPopover(popover, button) {
  const willOpen = popover.hidden;
  closeTutorialToolbarPopovers();
  popover.hidden = !willOpen;
  button.setAttribute("aria-expanded", String(willOpen));
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
  renderTutorialReasoning();
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
      renderTutorialAttackBoard();
      updateTutorialUI();
      playShotSound(currentShot.result);
    });
  });
}

function renderTutorialReasoning() {
  const reasoning = TUTORIAL_REASONING[tutorialState.shotIndex];
  els.tutorialReasoning.dataset.reasoningStage = String(tutorialState.shotIndex);
  els.tutorialReasoningTitle.textContent = reasoning.title;
  els.tutorialAttackFeedback.textContent = reasoning.text;
}

function setTutorialMode(mode) {
  tutorialState.mode = mode;
  document.querySelectorAll("[data-tutorial-mode]").forEach(button => {
    const active = button.dataset.tutorialMode === mode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-checked", String(active));
  });
  const messages = {
    easy: "简单：9×9 空域，2 架入门型飞机，系统自动安排朝向。",
    normal: "一般：12×12 空域，4 架飞机。机身可以重叠，机头不能重叠。",
    hard: "困难：15×15 空域，5 架飞机。机头和机身都可以重叠。"
  };
  els.tutorialModeFeedback.textContent = messages[mode];
}

function updateTutorialUI() {
  const hints = [
    "目标：击中全部敌方机头",
    "选择游戏难度",
    "点击格子确定机头位置",
    "设置机头朝向",
    "根据回报推导机头",
    "按回合侦查敌方空域",
    "击中全部机头即可获胜"
  ];
  const tutorialStepTotal = document.querySelectorAll("[data-tutorial-step]").length;
  document.querySelectorAll("[data-tutorial-step]").forEach((step, index) => { step.hidden = index !== tutorialState.step; });
  document.querySelectorAll("[data-tutorial-progress]").forEach((item, index) => {
    item.classList.toggle("is-active", index === tutorialState.step);
    item.classList.toggle("is-complete", index < tutorialState.step);
  });
  const activeProgress = document.querySelector(`[data-tutorial-progress="${tutorialState.step}"]`);
  const progressTrack = activeProgress?.parentElement;
  if (activeProgress && progressTrack) {
    progressTrack.scrollLeft = activeProgress.offsetLeft - (progressTrack.clientWidth - activeProgress.clientWidth) / 2;
  }
  els.tutorialStepCount.textContent = `第 ${tutorialState.step + 1} 步 / 共 ${tutorialStepTotal} 步`;
  if (tutorialState.step !== 5) closeTutorialToolbarPopovers();
  els.tutorialNavHint.textContent = hints[tutorialState.step];
  els.tutorialBackButton.disabled = tutorialState.step === 0;
  els.tutorialNextButton.disabled = (tutorialState.step === 2 && !tutorialState.searchStarted)
    || (tutorialState.step === 4 && tutorialState.shotIndex < TUTORIAL_SHOTS.length);
  els.tutorialNextButton.textContent = tutorialState.step === tutorialStepTotal - 1 ? "选择游戏方式 →" : tutorialState.step === 0 ? "开始学习 →" : "下一步 →";
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

function renderBattleModelGuide() {
  els.battleModelsPopover.classList.toggle("is-single", config().models.length === 1);
  els.battleModelList.innerHTML = config().models.map(modelId => {
    const model = MODELS[modelId];
    return `<div class="battle-model-item">
      ${battleModelBoardMarkup(modelId)}
      <strong>${model.name}</strong>
    </div>`;
  }).join("");
}

function setBattleModelsPopover(open) {
  els.battleModelsPopover.hidden = !open;
  els.battleModelsButton.setAttribute("aria-expanded", String(open));
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
  const fleetReady = state.playerPlanes.length === fleet;
  if (isMultiplayer()) {
    els.startButton.firstElementChild.textContent = multiplayer.ready ? "等待对方准备" : "准备完成";
    els.startButton.disabled = !fleetReady || !multiplayer.connected || multiplayer.ready;
  } else {
    els.startButton.firstElementChild.textContent = "开始侦查";
    els.startButton.disabled = !fleetReady;
  }
  els.statusText.textContent = fleetReady
    ? isMultiplayer() ? "飞机已经藏好，点击“准备完成”等待朋友。" : "飞机已经藏好，可以开始侦查。"
    : state.mode === "easy"
      ? `点击棋盘选择机头位置，朝向会自动安排。还需部署 ${fleet - state.playerPlanes.length} 架。`
      : `选择机型与方向，再点击棋盘确定机头。还需部署 ${fleet - state.playerPlanes.length} 架。`;
}

function placementAt(row, col) {
  const directions = config().autoDirection ? DIRECTIONS : [state.direction];
  const candidates = directions.map(direction => ({
    direction,
    cells: planeCells(row, col, direction, state.selectedModel)
  }));
  return candidates.find(candidate => isValidPlane(candidate.cells, state.playerPlanes))
    || candidates[0];
}

function previewPlane(row, col) {
  if (state.playerPlanes.length >= config().fleet) return;
  clearPreview();
  const placement = placementAt(row, col);
  const valid = isValidPlane(placement.cells, state.playerPlanes);
  placement.cells.forEach(cell => getCell(els.setupBoard, cell.row, cell.col)?.classList.add(valid ? "preview-valid" : "preview-invalid"));
}

function clearPreview() {
  els.setupBoard.querySelectorAll(".preview-valid, .preview-invalid").forEach(cell => cell.classList.remove("preview-valid", "preview-invalid"));
}

function placePlayerPlane(row, col) {
  if (state.playerPlanes.length >= config().fleet) {
    showToast("编队已满，请从编队列表撤回战机");
    return;
  }
  const placement = placementAt(row, col);
  if (!isValidPlane(placement.cells, state.playerPlanes)) {
    showToast(state.mode === "normal" ? "机头不能与其他飞机重叠" : "此处空间不足或发生了重叠");
    return;
  }
  invalidateOnlineReady();
  state.playerPlanes.push({
    head: { row, col },
    direction: placement.direction,
    modelId: state.selectedModel,
    cells: placement.cells,
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

function setMode(mode, { broadcast = true, announce = true } = {}) {
  if (!MODES[mode]) return;
  if (isMultiplayer() && multiplayer.role === "guest" && broadcast) {
    showToast("联机难度由房主选择");
    return;
  }
  state.mode = mode;
  state.playerPlanes = [];
  state.enemyPlanes = [];
  state.playerShots.clear();
  state.enemyShots.clear();
  state.enemyHeadsRemaining = config().fleet;
  state.selectedModel = config().models[0];
  if (isMultiplayer()) {
    multiplayer.ready = false;
    multiplayer.opponentReady = false;
    if (broadcast) sendRoomMessage({ type: "mode", mode });
  }
  document.querySelectorAll(".mode-button").forEach(button => {
    const active = button.dataset.mode === mode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-checked", String(active));
  });
  const { size, summary, tips, rule } = config();
  els.modeSummary.classList.toggle("is-tip-list", Boolean(tips));
  els.modeSummary.innerHTML = tips
    ? tips.map((tip, index) => `<span><b>Tip ${index + 1}</b>${tip}</span>`).join("")
    : summary;
  els.placementRule.textContent = rule;
  els.directionSection.hidden = Boolean(config().autoDirection);
  els.airspaceLabel.textContent = `${size} × ${size} 空域`;
  els.coordinatesNote.textContent = `横 A-${COLUMNS[size - 1]} · 纵 1-${size}`;
  renderModelPicker();
  renderBattleModelGuide();
  buildBoards();
  renderSetup();
  updateOnlineControls();
  updateRoomStrip();
  if (announce) showToast(`已切换为${config().name}模式`);
}

function startBattle() {
  if (state.playerPlanes.length !== config().fleet) return;
  if (isMultiplayer()) {
    if (!multiplayer.connected) {
      showToast("朋友加入后才能准备");
      return;
    }
    multiplayer.ready = true;
    sendRoomMessage({ type: "ready", ready: true });
    renderSetup();
    updateRoomStrip();
    showToast("已准备，等待朋友完成布阵");
    maybeStartOnlineBattle();
    return;
  }
  state.enemyPlanes = randomFleet();
  if (state.enemyPlanes.length !== config().fleet) {
    showToast("布阵生成失败，请重试");
    return;
  }
  state.phase = "battle";
  document.body.classList.add("battle-active");
  state.turn = "player";
  state.gameOver = false;
  showBattleView();
}

function showBattleView() {
  window.clearTimeout(enemyFireTimer);
  enemyFireTimer = null;
  els.setupView.hidden = true;
  els.battleView.hidden = false;
  els.missionLabel.textContent = `${config().name} · 侦查阶段`;
  els.statusTitle.textContent = "侦查敌方空域";
  els.statusText.textContent = "点击敌方空域中的未知坐标。";
  els.combatMark.hidden = true;
  els.combatMark.textContent = "";
  els.combatMessage.textContent = "请选择敌方空域中的一个未知坐标。";
  renderBattleModelGuide();
  renderBattle();
  playTone(300, 0.08);
}

function beginOnlineBattle(firstRole = "host") {
  if (!isMultiplayer() || state.phase === "battle") return;
  state.enemyPlanes = [];
  state.enemyHeadsRemaining = config().fleet;
  state.playerShots.clear();
  state.enemyShots.clear();
  state.playerPlanes.forEach(plane => { plane.sunk = false; });
  multiplayer.pendingShot = null;
  state.phase = "battle";
  document.body.classList.add("battle-active");
  state.turn = multiplayer.role === firstRole ? "player" : "enemy";
  state.round = 1;
  state.gameOver = false;
  showBattleView();
  if (state.turn !== "player") els.combatMessage.textContent = "等待朋友选择侦查坐标。";
  updateRoomStrip();
  showToast(state.turn === "player" ? "你先行动" : "房主先行动");
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
    showToast("这个坐标已经侦查过了");
    return;
  }
  if (isMultiplayer()) {
    if (!multiplayer.connected || multiplayer.pendingShot) return;
    multiplayer.pendingShot = { row, col };
    state.turn = "enemy";
    els.combatMark.hidden = true;
    els.combatMessage.textContent = `${label(row, col)}：等待朋友回报…`;
    if (!sendRoomMessage({ type: "shot", row, col })) {
      multiplayer.pendingShot = null;
      state.turn = "player";
      showToast("坐标发送失败，请检查连接");
    }
    renderBattle();
    updateRoomStrip();
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

function receiveOnlineShot({ row, col }) {
  if (!isMultiplayer() || state.phase !== "battle" || state.gameOver || state.turn !== "enemy") return;
  if (!Number.isInteger(row) || !Number.isInteger(col) || row < 0 || col < 0 || row >= config().size || col >= config().size) return;
  const shotKey = key(row, col);
  if (state.enemyShots.has(shotKey)) return;
  const shot = resolveShot(state.playerPlanes, row, col);
  state.enemyShots.set(shotKey, shot);
  const remaining = state.playerPlanes.filter(plane => !plane.sunk).length;
  sendRoomMessage({ type: "shot-result", row, col, result: shot.result, headCount: shot.headCount, remaining });
  const resultText = shot.result === "miss" ? "击空" : shot.result === "hit" ? "命中我方机身" : `锁定我方 ${shot.headCount} 个机头`;
  showCombatMark(shot.result);
  els.combatMessage.textContent = `朋友攻击 ${label(row, col)}：${resultText}。`;
  playShotSound(shot.result);
  state.round = Math.floor((state.playerShots.size + state.enemyShots.size) / 2) + 1;
  if (remaining === 0) {
    finishOnlineGame(false);
    return;
  }
  state.turn = "player";
  renderBattle();
  updateRoomStrip();
}

function receiveOnlineShotResult({ row, col, result, headCount, remaining }) {
  const pending = multiplayer.pendingShot;
  if (!isMultiplayer() || !pending || pending.row !== row || pending.col !== col) return;
  if (!["miss", "hit", "head"].includes(result)) return;
  const shot = { result, headCount: Math.max(0, Number(headCount) || 0) };
  state.playerShots.set(key(row, col), shot);
  state.enemyHeadsRemaining = Math.max(0, Number(remaining) || 0);
  multiplayer.pendingShot = null;
  const resultText = result === "miss" ? "击空" : result === "hit" ? "击中机身" : `锁定 ${shot.headCount} 个机头`;
  const destroyed = result === "head" ? `，击落敌机 ${shot.headCount} 架。` : "。";
  showCombatMark(result);
  els.combatMessage.textContent = `${label(row, col)}：${resultText}${destroyed}`;
  playShotSound(result);
  state.round = Math.floor((state.playerShots.size + state.enemyShots.size) / 2) + 1;
  if (state.enemyHeadsRemaining === 0) {
    finishOnlineGame(true);
    return;
  }
  state.turn = "enemy";
  renderBattle();
  updateRoomStrip();
}

function finishOnlineGame(won) {
  state.gameOver = true;
  state.turn = "none";
  multiplayer.pendingShot = null;
  renderBattle();
  showGameResult(won);
  updateRoomStrip();
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
  if (shot.result === "hit" && state.mode !== "easy") state.aiQueue.push(...neighbors(row, col));
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
    const marker = cell.querySelector("span");
    cell.classList.add("shot", `shot-${shot.result}`);
    marker.className = "shot-marker";
    marker.innerHTML = shot.result === "head"
      ? '<i class="shot-burst" aria-hidden="true">✹</i>'
      : `<i class="shot-dot" aria-hidden="true"></i>`;
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
  const enemyHeads = isMultiplayer() ? state.enemyHeadsRemaining : state.enemyPlanes.filter(plane => !plane.sunk).length;
  const playerHeads = state.playerPlanes.filter(plane => !plane.sunk).length;
  els.enemyRemaining.textContent = `机头 ${enemyHeads} / ${config().fleet}`;
  els.playerRemaining.textContent = `机头 ${playerHeads} / ${config().fleet}`;
  updateTurnUI();
}

function updateTurnUI() {
  const playerTurn = state.turn === "player";
  els.turnText.textContent = playerTurn
    ? "轮到你行动"
    : state.gameOver
      ? "任务结束"
      : isMultiplayer()
        ? multiplayer.connected ? "等待朋友行动…" : "连接已断开"
        : "敌方正在定位…";
  els.turnLamp.style.background = playerTurn ? "var(--gold)" : "var(--red)";
}

function checkWinner() {
  const enemyLost = state.enemyPlanes.every(plane => plane.sunk);
  const playerLost = state.playerPlanes.every(plane => plane.sunk);
  if (!enemyLost && !playerLost) return false;
  state.gameOver = true;
  state.turn = "none";
  renderBattle();
  const won = enemyLost;
  showGameResult(won);
  return true;
}

function showGameResult(won) {
  const hits = [...state.playerShots.values()].filter(shot => shot.result !== "miss").length;
  const accuracy = state.playerShots.size ? Math.round(hits / state.playerShots.size * 100) : 0;
  els.resultSeal.textContent = won ? "胜" : "败";
  els.resultTitle.textContent = won ? "找到所有机头" : "对手先找到了机头";
  els.resultText.textContent = won ? "你率先锁定了全部敌方机头。" : "敌方先一步锁定了我方全部机头。";
  els.resultStats.innerHTML = `
    <span><strong>${state.round}</strong>回合</span>
    <span><strong>${state.playerShots.size}</strong>次攻击</span>
    <span><strong>${accuracy}%</strong>命中率</span>
  `;
  renderNextModeActions();
  els.resultOverlay.hidden = false;
  els.restartButton.focus();
}

function renderNextModeActions() {
  if (isMultiplayer() && multiplayer.role === "guest") {
    els.nextMissionLabel.textContent = "下一局由房主选择难度";
    els.nextModeActions.innerHTML = "";
    return;
  }
  els.nextMissionLabel.textContent = "接下来想玩哪一关";
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

function returnToSetup(preserveFleet, nextMode = state.mode, { broadcast = true } = {}) {
  if (isMultiplayer() && multiplayer.role === "guest" && broadcast && nextMode !== state.mode) {
    showToast("联机难度由房主选择");
    return;
  }
  if (isMultiplayer()) {
    multiplayer.ready = false;
    multiplayer.opponentReady = false;
    multiplayer.pendingShot = null;
    state.enemyHeadsRemaining = MODES[nextMode]?.fleet ?? config().fleet;
    if (broadcast) sendRoomMessage({ type: "reset", preserveFleet, mode: nextMode });
  }
  window.clearTimeout(enemyFireTimer);
  enemyFireTimer = null;
  state.phase = "setup";
  document.body.classList.remove("battle-active");
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
  els.statusTitle.textContent = "布置你的飞机";
  if (nextMode !== state.mode) {
    setMode(nextMode, { broadcast: false });
  } else {
    renderSetup();
  }
  updateRoomStrip();
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
    if (direction && tutorialState.step === 3) {
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
els.welcomeStartButton.addEventListener("click", () => els.playModeDialog.showModal());
els.welcomeTutorialButton.addEventListener("click", openTutorial);
els.soloModeButton.addEventListener("click", () => {
  state.playMode = "solo";
  state.enemyHeadsRemaining = null;
  els.playModeDialog.close();
  updateOnlineControls();
  enterGame();
});
els.onlineModeButton.addEventListener("click", createMultiplayerRoom);
els.roomCopyButton.addEventListener("click", copyRoomLink);
els.copyRoomLinkButton.addEventListener("click", copyRoomLink);
els.roomEnterButton.addEventListener("click", () => {
  closeRoomDialog();
  enterGame();
});
els.closeRoomDialogButton.addEventListener("click", closeRoomDialog);
els.roomCancelButton.addEventListener("click", () => disconnectMultiplayer());
els.leaveRoomButton.addEventListener("click", () => disconnectMultiplayer());
els.gameHomeLink.addEventListener("click", event => {
  event.preventDefault();
  if (isMultiplayer()) disconnectMultiplayer();
  else showWelcome();
});
els.tutorialSkipButton.addEventListener("click", finishTutorial);
els.tutorialExitButton.addEventListener("click", exitTutorial);
els.tutorialRandomDeployButton.addEventListener("click", () => {
  tutorialState.deployedCount = TUTORIAL_DEPLOYMENTS.length;
  tutorialState.searchStarted = false;
  els.tutorialDeployFeedback.textContent = "已自动部署两架飞机。点击“开始侦查”完成这一步。";
  renderTutorialDeployBoard();
  updateTutorialUI();
  playTone(420, 0.06);
});
els.tutorialStartSearchButton.addEventListener("click", () => {
  if (tutorialState.deployedCount !== TUTORIAL_DEPLOYMENTS.length) return;
  tutorialState.searchStarted = true;
  els.tutorialDeployFeedback.textContent = "布阵完成，可以进入下一步学习侦查。";
  renderTutorialDeployBoard();
  updateTutorialUI();
  playTone(520, 0.08);
});
els.tutorialBackButton.addEventListener("click", () => {
  if (tutorialState.step === 0) return;
  tutorialState.step -= 1;
  updateTutorialUI();
  els.tutorialView.scrollTop = 0;
});
els.tutorialNextButton.addEventListener("click", () => {
  const tutorialStepTotal = document.querySelectorAll("[data-tutorial-step]").length;
  if (tutorialState.step === tutorialStepTotal - 1) {
    finishTutorial();
    return;
  }
  tutorialState.step += 1;
  updateTutorialUI();
  els.tutorialView.scrollTop = 0;
});
document.querySelectorAll("[data-tutorial-direction]").forEach(button => {
  button.addEventListener("click", () => setTutorialDirection(button.dataset.tutorialDirection));
});
document.querySelectorAll("[data-tutorial-mode]").forEach(button => {
  button.addEventListener("click", () => setTutorialMode(button.dataset.tutorialMode));
});
els.tutorialModelsButton.addEventListener("click", () => toggleTutorialToolbarPopover(els.tutorialModelsPopover, els.tutorialModelsButton));
els.tutorialSettingsButton.addEventListener("click", () => toggleTutorialToolbarPopover(els.tutorialSettingsPopover, els.tutorialSettingsButton));
document.querySelectorAll("[data-tutorial-menu-action]").forEach(button => {
  button.addEventListener("click", closeTutorialToolbarPopovers);
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
  invalidateOnlineReady();
  state.playerPlanes.splice(Number(button.dataset.removePlane), 1);
  renderSetup();
  showToast("已撤回该战机");
});
els.randomButton.addEventListener("click", () => {
  invalidateOnlineReady();
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
els.battleModelsButton.addEventListener("click", event => {
  event.stopPropagation();
  const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 581px)").matches;
  setBattleModelsPopover(supportsHover ? true : els.battleModelsPopover.hidden);
});
els.battleModelsControl.addEventListener("mouseenter", () => {
  if (window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 581px)").matches) setBattleModelsPopover(true);
});
els.battleModelsControl.addEventListener("mouseleave", () => {
  if (window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 581px)").matches) setBattleModelsPopover(false);
});
els.battleModelsPopover.addEventListener("click", event => event.stopPropagation());
document.addEventListener("click", () => setBattleModelsPopover(false));
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
  if (!isMultiplayer() && state.phase === "battle" && state.turn === "enemy" && !state.gameOver && !enemyFireTimer) scheduleEnemyFire(300);
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

window.addEventListener("pagehide", () => {
  if (isMultiplayer() && multiplayer.connection?.open) multiplayer.connection.send({ type: "leave" });
});

renderIntroVisuals();
renderModelPicker();
renderBattleModelGuide();
buildBoards();
renderSetup();
els.directionSection.hidden = Boolean(config().autoDirection);
setDirection(state.direction);

const requestedRoomCode = new URL(window.location.href).searchParams.get("room")?.toLowerCase() || "";
if (/^[a-z0-9]{6,12}$/.test(requestedRoomCode)) {
  window.setTimeout(() => joinMultiplayerRoom(requestedRoomCode), 0);
} else if (requestedRoomCode) {
  setRoomUrl();
  showToast("邀请链接中的房间码无效");
}
