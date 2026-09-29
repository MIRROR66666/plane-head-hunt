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
    cells: [[0, 0], [1, -1], [1, 0], [1, 1], [2, -3], [2, -2], [2, -1], [2, 0], [3, 0], [4, 0]]
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
    autoDirection: false,
    rule: "选择机头朝向，再点击棋盘放置。飞机之间不能重叠。"
  },
  normal: {
    name: "一般",
    size: 12,
    fleet: 4,
    models: ["classic", "delta", "swift", "arrow"],
    overlap: "body",
    rule: "机身可以互相覆盖；机头不能与任何飞机部位重叠。"
  },
  hard: {
    name: "困难",
    size: 14,
    fleet: 5,
    models: ["classic", "delta", "swift", "arrow", "scout", "bomber"],
    overlap: "hard",
    rule: "机身可以重叠，机头不能压住机身；每局最多一组双机头重叠。"
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
  aiQueue: [],
  aiPendingTarget: null,
  history: []
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
  shotIndex: 0,
  shots: new Map(),
  planes: []
};

const TUTORIAL_DEPLOYMENTS = [
  { row: 2, col: 2, direction: "N" },
  { row: 1, col: 4, direction: "E" }
];

const TUTORIAL_GUIDED_SHOTS = [
  { row: 1, col: 1, result: "miss", phase: "first" },
  { row: 2, col: 2, result: "hit", phase: "first" },
  { row: 2, col: 3, result: "hit", phase: "first" },
  { row: 3, col: 3, result: "hit", phase: "first" },
  { row: 2, col: 1, result: "miss", phase: "first" },
  { row: 1, col: 3, result: "head", phase: "first" },
  { row: 5, col: 1, result: "hit", phase: "second" },
  { row: 5, col: 2, result: "hit", phase: "second" }
];

const TUTORIAL_REASONING = [
  {
    title: "先验证 B2",
    text: "点击 B2。击空可以排除所有经过 B2 的摆法。"
  },
  {
    title: "B2 击空，缩小搜索范围",
    text: "B2 没有飞机。接着点击 C3，寻找第一格机身。"
  },
  {
    title: "C3 命中机身，对照机型",
    text: "C3 是机身。点击相邻的 D3，判断机翼是否横向展开。"
  },
  {
    title: "C3、D3 都是机身",
    text: "两格连续命中，可能落在同一侧机翼。点击 D4 检查机身延伸方向。"
  },
  {
    title: "只剩 D2 和 E3 两个候选机头",
    text: "D4 仍是机身。点击 B3，验证机身是否向左继续延伸。"
  },
  {
    title: "B3 击空，排除 E3",
    text: "如果机头在 E3，B3 应该是机身。现在只剩 D2，点击它。"
  },
  {
    title: "第一架飞机已击落",
    text: "开始寻找第二架。点击 B6，先取得一条新的机身线索。"
  },
  {
    title: "B6 命中机身",
    text: "再点击相邻的 C6，判断机身延伸方向。"
  },
  {
    title: "轮到你独立推断第二架飞机",
    text: "候选机头会用问号标出。自由点击坐标，用新的击空或机身结果继续排除。"
  }
];

const replayState = {
  view: "player",
  step: 0,
  timer: null
};

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
  difficultyView: document.querySelector("#difficultyView"),
  difficultyContinueButton: document.querySelector("#difficultyContinueButton"),
  difficultyContinueLabel: document.querySelector("#difficultyContinueLabel"),
  backToDifficultyButton: document.querySelector("#backToDifficultyButton"),
  setupModeName: document.querySelector("#setupModeName"),
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
  postGameActions: document.querySelector("#postGameActions"),
  openReplayButton: document.querySelector("#openReplayButton"),
  openResultButton: document.querySelector("#openResultButton"),
  resultOverlay: document.querySelector("#resultOverlay"),
  resultCloseButton: document.querySelector("#resultCloseButton"),
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
  reviewButton: document.querySelector("#reviewButton"),
  restartButton: document.querySelector("#restartButton"),
  nextMissionLabel: document.querySelector(".next-mission-label"),
  nextModeActions: document.querySelector("#nextModeActions"),
  replayOverlay: document.querySelector("#replayOverlay"),
  replayCloseButton: document.querySelector("#replayCloseButton"),
  replayBoard: document.querySelector("#replayBoard"),
  replayStepCount: document.querySelector("#replayStepCount"),
  replayMessage: document.querySelector("#replayMessage"),
  replayPreviousButton: document.querySelector("#replayPreviousButton"),
  replayPlayButton: document.querySelector("#replayPlayButton"),
  replayNextButton: document.querySelector("#replayNextButton"),
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

async function copyFeedbackEmail(button) {
  const email = "565516020@qq.com";
  try {
    await navigator.clipboard.writeText(email);
  } catch (_) {
    const fallback = document.createElement("textarea");
    fallback.value = email;
    fallback.setAttribute("readonly", "");
    fallback.style.position = "fixed";
    fallback.style.opacity = "0";
    document.body.appendChild(fallback);
    fallback.select();
    document.execCommand("copy");
    fallback.remove();
  }
  button.textContent = "已复制";
  window.setTimeout(() => { button.textContent = "复制邮箱"; }, 1800);
}

function sendRoomMessage(message) {
  if (!multiplayer.connection?.open) return false;
  multiplayer.connection.send(message);
  return true;
}

function serializePlanes(planes) {
  return planes.map(plane => ({
    row: plane.head.row,
    col: plane.head.col,
    direction: plane.direction,
    modelId: plane.modelId
  }));
}

function deserializePlanes(serialized) {
  if (!Array.isArray(serialized) || serialized.length !== config().fleet) return [];
  const planes = [];
  for (const plane of serialized) {
    if (!Number.isInteger(plane?.row) || !Number.isInteger(plane?.col)) return [];
    if (!DIRECTIONS.includes(plane.direction) || !config().models.includes(plane.modelId)) return [];
    const cells = planeCells(plane.row, plane.col, plane.direction, plane.modelId);
    if (!isValidPlane(cells, planes)) return [];
    planes.push({ head: { row: plane.row, col: plane.col }, direction: plane.direction, modelId: plane.modelId, cells, sunk: false });
  }
  return planes;
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
  if (message.type === "reveal") {
    const revealed = deserializePlanes(message.planes);
    if (revealed.length === config().fleet) {
      state.enemyPlanes = revealed;
      if (state.phase === "battle") renderBattle();
      if (!els.replayOverlay.hidden) renderReplay();
    }
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

  const occupied = new Set(planes.flatMap(plane => plane.cells.map(cell => key(cell.row, cell.col))));
  if (overlap === "none") return cells.every(cell => !occupied.has(key(cell.row, cell.col)));

  const headCounts = new Map();
  planes.forEach(plane => {
    const headKey = key(plane.head.row, plane.head.col);
    headCounts.set(headKey, (headCounts.get(headKey) || 0) + 1);
  });
  const existingHeads = new Set(headCounts.keys());
  const hasDoubleHead = [...headCounts.values()].some(count => count >= 2);

  if (overlap === "hard") {
    return cells.every(cell => {
      const cellKey = key(cell.row, cell.col);
      if (!cell.head) return !existingHeads.has(cellKey);
      const existingHeadCount = headCounts.get(cellKey) || 0;
      const overlapsBody = planes.some(plane => plane.cells.some(part => !part.head && key(part.row, part.col) === cellKey));
      if (overlapsBody || existingHeadCount >= 2) return false;
      if (existingHeadCount === 1 && hasDoubleHead) return false;
      return true;
    });
  }

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
  if (state.phase === "setup") showDifficultySelection();
  if (!isMultiplayer() && state.phase === "battle" && state.turn === "enemy" && !state.gameOver && !enemyFireTimer) scheduleEnemyFire();
  playTone(360, 0.08);
}

function showDifficultySelection() {
  document.body.classList.remove("battle-active");
  document.body.classList.add("difficulty-active");
  els.difficultyView.hidden = false;
  els.setupView.hidden = true;
  els.battleView.hidden = true;
  setMode(state.mode, { broadcast: false, announce: false });
  els.missionLabel.textContent = "选择难度";
  els.statusTitle.textContent = "选择本局空域";
  els.statusText.textContent = "确认难度与重叠规则后，再进入布阵。";
  updateOnlineControls();
}

function showSetupStage() {
  document.body.classList.remove("difficulty-active");
  els.difficultyView.hidden = true;
  els.setupView.hidden = false;
  els.battleView.hidden = true;
  els.missionLabel.textContent = "布阵阶段";
  els.statusTitle.textContent = "把飞机藏进空域";
  renderSetup();
  window.scrollTo({ top: 0, behavior: "auto" });
}

function showWelcome() {
  clearEnemyTimers();
  stopReplayPlayback();
  document.body.classList.remove("difficulty-active");
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
  tutorialState.shots = new Map();
  tutorialState.planes = [
    { head: { row: 1, col: 3 }, direction: "N", modelId: "starter", cells: planeCells(1, 3, "N", "starter"), sunk: false },
    { head: { row: 5, col: 3 }, direction: "E", modelId: "starter", cells: planeCells(5, 3, "E", "starter"), sunk: false }
  ];
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
  els.tutorialModeFeedback.textContent = "简单：9×9 空域，2 架入门型飞机，可以调整朝向。";
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

function tutorialShotResult(row, col) {
  const planesAtCell = tutorialState.planes.filter(plane => plane.cells.some(cell => cell.row === row && cell.col === col));
  const heads = planesAtCell.filter(plane => !plane.sunk && plane.head.row === row && plane.head.col === col);
  heads.forEach(plane => { plane.sunk = true; });
  return { result: heads.length ? "head" : planesAtCell.length ? "hit" : "miss", headCount: heads.length };
}

function tutorialCandidateHeads(phase) {
  const size = 7;
  const observations = [...tutorialState.shots.entries()]
    .filter(([, shot]) => shot.phase === phase)
    .map(([shotKey, shot]) => {
      const [row, col] = shotKey.split(",").map(Number);
      return { row, col, result: shot.result };
    });
  if (observations.filter(shot => shot.result === "hit").length < 2) return [];
  const candidates = new Set();
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      DIRECTIONS.forEach(direction => {
        const cells = planeCells(row, col, direction, "starter");
        if (!cells.every(cell => cell.row >= 0 && cell.row < size && cell.col >= 0 && cell.col < size)) return;
        const matches = observations.every(shot => {
          const part = cells.find(cell => cell.row === shot.row && cell.col === shot.col);
          if (shot.result === "miss") return !part;
          if (shot.result === "hit") return Boolean(part && !part.head);
          return Boolean(part?.head);
        });
        if (matches) candidates.add(key(row, col));
      });
    }
  }
  return [...candidates];
}

function renderTutorialAttackBoard() {
  const size = 7;
  const currentShot = TUTORIAL_GUIDED_SHOTS[tutorialState.shotIndex];
  const independent = tutorialState.shotIndex >= TUTORIAL_GUIDED_SHOTS.length;
  const tutorialComplete = tutorialState.planes.length > 0 && tutorialState.planes.every(plane => plane.sunk);
  const phase = independent ? "second" : currentShot?.phase || "second";
  const candidateHeads = new Set(tutorialComplete ? [] : tutorialCandidateHeads(phase));
  const revealedCells = new Map();
  tutorialState.planes.filter(plane => plane.sunk).forEach(plane => {
    plane.cells.forEach(cell => revealedCells.set(key(cell.row, cell.col), cell));
  });
  const cells = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const cellKey = key(row, col);
      const shot = tutorialState.shots.get(cellKey);
      const revealed = revealedCells.get(cellKey);
      const isTarget = currentShot?.row === row && currentShot?.col === col;
      const classes = ["tutorial-cell"];
      if (isTarget) classes.push("is-target");
      if (shot) classes.push("has-result", `shot-${shot.result}`);
      if (!shot && revealed) classes.push("is-revealed-plane", revealed.head ? "plane-head" : "plane-body");
      if (!shot && !revealed && candidateHeads.has(cellKey) && candidateHeads.size <= 6) classes.push("is-candidate-head");
      const symbols = { miss: "·", hit: "·", head: "✹" };
      const cellLabel = label(row, col);
      const disabled = tutorialComplete || Boolean(shot) || Boolean(revealed);
      cells.push(`<button class="${classes.join(" ")}" type="button" role="gridcell" data-r="${row}" data-c="${col}" data-label="${cellLabel}" aria-label="${cellLabel}${isTarget ? "，当前目标" : candidateHeads.has(cellKey) ? "，候选机头" : ""}" ${disabled ? "disabled" : ""}>${shot ? symbols[shot.result] : candidateHeads.has(cellKey) && candidateHeads.size <= 6 ? "?" : ""}</button>`);
    }
  }
  els.tutorialAttackBoard.dataset.size = String(size);
  els.tutorialAttackBoard.innerHTML = cells.join("");
  renderTutorialReasoning();
  if (tutorialComplete) return;
  els.tutorialAttackBoard.querySelectorAll(".tutorial-cell").forEach(cell => {
    cell.addEventListener("click", () => {
      const row = Number(cell.dataset.r);
      const col = Number(cell.dataset.c);
      if (currentShot && (row !== currentShot.row || col !== currentShot.col)) {
        els.tutorialAttackFeedback.textContent = `先按指令点击 ${label(currentShot.row, currentShot.col)}。`;
        return;
      }
      const shot = tutorialShotResult(row, col);
      const shotPhase = currentShot?.phase || "second";
      tutorialState.shots.set(key(row, col), { ...shot, phase: shotPhase });
      if (currentShot) tutorialState.shotIndex += 1;
      renderTutorialAttackBoard();
      updateTutorialUI();
      playShotSound(shot.result);
    });
  });
}

function renderTutorialReasoning() {
  const tutorialComplete = tutorialState.planes.length > 0 && tutorialState.planes.every(plane => plane.sunk);
  if (tutorialComplete) {
    els.tutorialReasoning.dataset.reasoningStage = "complete";
    els.tutorialReasoningTitle.textContent = "你独立找到了第二个机头";
    els.tutorialAttackFeedback.textContent = "两架飞机都已击落。你已经完成了从机身线索到机头位置的完整推断。";
    return;
  }
  if (tutorialState.shotIndex >= TUTORIAL_GUIDED_SHOTS.length) {
    const candidates = tutorialCandidateHeads("second");
    const candidateLabels = candidates.map(candidate => {
      const [row, col] = candidate.split(",").map(Number);
      return label(row, col);
    });
    els.tutorialReasoning.dataset.reasoningStage = "independent";
    els.tutorialReasoningTitle.textContent = candidateLabels.length === 1
      ? `只剩 ${candidateLabels[0]} 一个候选机头`
      : candidateLabels.length === 2
        ? `只剩 ${candidateLabels.join("、")} 两个候选机头`
        : `当前还有 ${candidateLabels.length} 个候选机头`;
    els.tutorialAttackFeedback.textContent = candidateLabels.length === 1
      ? "已有线索只符合这一种摆法。点击这个坐标，完成最后一次判断。"
      : candidateLabels.length === 2
        ? "比较两个候选摆法，选择一个能解释全部机身与击空结果的机头。"
        : "问号是候选机头。自由点击其它坐标，继续用击空或机身结果排除。";
    return;
  }
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
    easy: "简单：9×9 空域，2 架入门型飞机，可以调整朝向。",
    normal: "一般：12×12 空域，4 架飞机。机身可以重叠，机头不能重叠。",
    hard: "困难：14×14 空域，5 架飞机。机身可重叠，每局最多一组双机头重叠。"
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
  els.tutorialNextButton.disabled = false;
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
  els.setupModeName.textContent = `${config().name} · ${config().size}×${config().size}`;
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
    const message = state.mode === "normal"
      ? "机头不能与其他飞机重叠"
      : state.mode === "hard"
        ? "机头不能压住机身，每局最多一组双机头重叠"
        : "此处空间不足或发生了重叠";
    showToast(message);
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
  const shouldCreateDoubleHead = overlap === "hard" && Math.random() < 0.4;
  let attempts = 0;
  while (planes.length < fleet && attempts < 12000) {
    attempts += 1;
    let row = Math.floor(Math.random() * size);
    let col = Math.floor(Math.random() * size);
    const hasDoubleHead = new Set(planes.map(plane => key(plane.head.row, plane.head.col))).size < planes.length;
    if (shouldCreateDoubleHead && !hasDoubleHead && planes.length && Math.random() < 0.3) {
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
  const modeChanged = state.mode !== mode;
  state.mode = mode;
  if (modeChanged) {
    state.playerPlanes = [];
    state.enemyPlanes = [];
    state.playerShots.clear();
    state.enemyShots.clear();
    state.history = [];
  }
  state.enemyHeadsRemaining = config().fleet;
  if (modeChanged || !config().models.includes(state.selectedModel)) state.selectedModel = config().models[0];
  if (isMultiplayer()) {
    multiplayer.ready = false;
    multiplayer.opponentReady = false;
    if (broadcast) sendRoomMessage({ type: "mode", mode });
  }
  document.querySelectorAll("[data-mode]").forEach(button => {
    const active = button.dataset.mode === mode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-checked", String(active));
    const stateLabel = button.querySelector(".difficulty-select-state b");
    if (stateLabel) stateLabel.textContent = active ? "当前选择" : "选择此难度";
  });
  if (els.difficultyContinueLabel) {
    const modeName = { easy: "简单", normal: "一般", hard: "困难" }[mode];
    els.difficultyContinueLabel.textContent = `进入${modeName}布阵`;
  }
  const { size, rule } = config();
  els.placementRule.textContent = rule;
  els.directionSection.hidden = false;
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
  state.history = [];
  showBattleView();
}

function showBattleView() {
  clearEnemyTimers();
  document.body.classList.remove("difficulty-active");
  els.battleView.classList.remove("is-post-game");
  els.difficultyView.hidden = true;
  els.setupView.hidden = true;
  els.battleView.hidden = false;
  els.missionLabel.textContent = `${config().name} · 侦查阶段`;
  els.statusTitle.textContent = "侦查敌方空域";
  els.statusText.textContent = "点击敌方空域中的未知坐标。";
  els.combatMark.hidden = true;
  els.combatMark.textContent = "";
  els.combatMessage.textContent = "请选择敌方空域中的一个未知坐标。";
  els.postGameActions.hidden = true;
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
  state.history = [];
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

function recordHistory(actor, row, col, shot) {
  state.history.push({
    actor,
    row,
    col,
    result: shot.result,
    headCount: shot.headCount,
    order: state.history.length + 1
  });
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
  recordHistory("player", row, col, shot);
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
  recordHistory("enemy", row, col, shot);
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
  recordHistory("player", row, col, shot);
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
  sendRoomMessage({ type: "reveal", planes: serializePlanes(state.playerPlanes) });
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
let enemyRevealTimer;
let enemyReturnTimer;

function clearEnemyTimers() {
  window.clearTimeout(enemyFireTimer);
  window.clearTimeout(enemyRevealTimer);
  window.clearTimeout(enemyReturnTimer);
  enemyFireTimer = null;
  enemyRevealTimer = null;
  enemyReturnTimer = null;
  state.aiPendingTarget = null;
}

function scheduleEnemyFire(delay = 150) {
  clearEnemyTimers();
  enemyFireTimer = window.setTimeout(enemyFire, delay);
}

function enemyFire() {
  enemyFireTimer = null;
  if (state.phase !== "battle" || state.gameOver) return;
  const [row, col] = chooseEnemyTarget();
  state.aiPendingTarget = { row, col };
  els.combatMark.hidden = true;
  els.combatMessage.textContent = `敌方锁定 ${label(row, col)}，正在确认落点…`;
  renderBattle();
  enemyRevealTimer = window.setTimeout(revealEnemyFire, 300);
}

function revealEnemyFire() {
  enemyRevealTimer = null;
  if (state.phase !== "battle" || state.gameOver || !state.aiPendingTarget) return;
  const { row, col } = state.aiPendingTarget;
  state.aiPendingTarget = null;
  const shot = resolveShot(state.playerPlanes, row, col);
  state.enemyShots.set(key(row, col), shot);
  recordHistory("enemy", row, col, shot);
  if (shot.result === "hit" && state.mode !== "easy") state.aiQueue.push(...neighbors(row, col));
  if (shot.result === "head") state.aiQueue = [];
  const resultText = shot.result === "miss" ? "击空" : shot.result === "hit" ? "命中我方机身" : `锁定我方 ${shot.headCount} 个机头`;
  showCombatMark(shot.result);
  els.combatMessage.textContent = `敌方攻击 ${label(row, col)}：${resultText}。`;
  playShotSound(shot.result);
  state.round += 1;
  renderBattle();
  if (checkWinner()) return;
  enemyReturnTimer = window.setTimeout(() => {
    enemyReturnTimer = null;
    if (state.phase !== "battle" || state.gameOver) return;
    state.turn = "player";
    renderBattle();
  }, 200);
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
  drawPlanes(els.enemyBoard, state.enemyPlanes, state.gameOver);
  drawPlanes(els.playerBoard, state.playerPlanes, true);
  applyShots(els.enemyBoard, state.playerShots);
  applyShots(els.playerBoard, state.enemyShots);
  if (state.aiPendingTarget) getCell(els.playerBoard, state.aiPendingTarget.row, state.aiPendingTarget.col)?.classList.add("is-ai-target");
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
        : state.aiPendingTarget ? "敌方正在确认落点…" : "敌方正在定位…";
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
  els.battleView.classList.remove("is-post-game");
  els.postGameActions.hidden = true;
  els.resultOverlay.hidden = false;
  els.restartButton.focus();
}

function closeResultOverlay() {
  els.resultOverlay.hidden = true;
  els.battleView.classList.add("is-post-game");
  els.postGameActions.hidden = false;
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

function replayEvents() {
  return state.history.filter(event => event.actor === replayState.view);
}

function stopReplayPlayback() {
  window.clearInterval(replayState.timer);
  replayState.timer = null;
  els.replayPlayButton.textContent = "播放";
}

function renderReplay() {
  const events = replayEvents();
  if (els.replayBoard.dataset.size !== String(config().size)) createBoard(els.replayBoard);
  resetBoardCells(els.replayBoard);
  const targetPlanes = replayState.view === "player" ? state.enemyPlanes : state.playerPlanes;
  const atEnd = replayState.step >= events.length;
  if (replayState.view === "enemy" || atEnd) drawPlanes(els.replayBoard, targetPlanes, true);
  const visibleShots = new Map(events.slice(0, replayState.step).map(event => [key(event.row, event.col), event]));
  applyShots(els.replayBoard, visibleShots);
  els.replayBoard.querySelectorAll(".cell").forEach(cell => { cell.disabled = true; });

  els.replayStepCount.textContent = events.length ? `第 ${Math.min(replayState.step, events.length)} / ${events.length} 步` : "暂无落点";
  if (!events.length) {
    els.replayMessage.textContent = replayState.view === "player" ? "本局没有进攻记录。" : "本局没有对方进攻记录。";
  } else if (replayState.step === 0) {
    els.replayMessage.textContent = replayState.view === "player" ? "从你的第一次侦查开始。" : "从对方的第一次攻击开始。";
  } else {
    const event = events[replayState.step - 1];
    const actor = replayState.view === "player" ? "你侦查" : "对方攻击";
    const resultText = event.result === "miss" ? "击空" : event.result === "hit" ? "命中机身" : `找到 ${event.headCount} 个机头`;
    els.replayMessage.textContent = `${actor} ${label(event.row, event.col)}：${resultText}。${atEnd ? "完整飞机布局已经显示。" : ""}`;
  }
  els.replayPreviousButton.disabled = replayState.step === 0;
  els.replayNextButton.disabled = replayState.step >= events.length;
}

function startReplayPlayback() {
  const events = replayEvents();
  if (!events.length) return;
  if (replayState.step >= events.length) replayState.step = 0;
  stopReplayPlayback();
  els.replayPlayButton.textContent = "暂停";
  replayState.timer = window.setInterval(() => {
    const currentEvents = replayEvents();
    replayState.step += 1;
    renderReplay();
    if (replayState.step >= currentEvents.length) stopReplayPlayback();
  }, 760);
}

function openReplay() {
  els.resultOverlay.hidden = true;
  els.postGameActions.hidden = true;
  els.replayOverlay.hidden = false;
  replayState.view = "player";
  replayState.step = 0;
  document.querySelectorAll("[data-replay-view]").forEach(button => {
    const active = button.dataset.replayView === replayState.view;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
  renderReplay();
  window.setTimeout(startReplayPlayback, 350);
}

function closeReplay() {
  stopReplayPlayback();
  els.replayOverlay.hidden = true;
  els.battleView.classList.add("is-post-game");
  els.postGameActions.hidden = false;
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
  clearEnemyTimers();
  stopReplayPlayback();
  state.phase = "setup";
  document.body.classList.remove("battle-active", "difficulty-active");
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
  state.aiPendingTarget = null;
  state.history = [];
  els.resultOverlay.hidden = true;
  els.replayOverlay.hidden = true;
  els.battleView.classList.remove("is-post-game");
  els.postGameActions.hidden = true;
  if (els.battleMenuDialog.open) els.battleMenuDialog.close();
  els.difficultyView.hidden = true;
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

document.querySelectorAll("[data-mode]").forEach(button => button.addEventListener("click", () => setMode(button.dataset.mode)));
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
document.querySelectorAll("[data-copy-feedback-email]").forEach(button => {
  button.addEventListener("click", () => copyFeedbackEmail(button));
});
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
  els.tutorialDeployFeedback.textContent = "布阵完成，进入方向调整。";
  renderTutorialDeployBoard();
  tutorialState.step = Math.min(tutorialState.step + 1, document.querySelectorAll("[data-tutorial-step]").length - 1);
  updateTutorialUI();
  els.tutorialView.scrollTop = 0;
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
els.difficultyContinueButton.addEventListener("click", showSetupStage);
els.backToDifficultyButton.addEventListener("click", showDifficultySelection);
els.startButton.addEventListener("click", startBattle);
els.restartButton.addEventListener("click", () => restart());
els.nextModeActions.addEventListener("click", event => {
  const button = event.target.closest("[data-next-mode]");
  if (button) restart(button.dataset.nextMode);
});
els.resultCloseButton.addEventListener("click", closeResultOverlay);
els.reviewButton.addEventListener("click", openReplay);
els.openReplayButton.addEventListener("click", openReplay);
els.openResultButton.addEventListener("click", () => {
  els.postGameActions.hidden = true;
  els.resultOverlay.hidden = false;
  els.restartButton.focus();
});
els.replayCloseButton.addEventListener("click", closeReplay);
document.querySelectorAll("[data-replay-view]").forEach(button => {
  button.addEventListener("click", () => {
    stopReplayPlayback();
    replayState.view = button.dataset.replayView;
    replayState.step = 0;
    document.querySelectorAll("[data-replay-view]").forEach(tab => {
      const active = tab === button;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    renderReplay();
  });
});
els.replayPreviousButton.addEventListener("click", () => {
  stopReplayPlayback();
  replayState.step = Math.max(0, replayState.step - 1);
  renderReplay();
});
els.replayNextButton.addEventListener("click", () => {
  stopReplayPlayback();
  replayState.step = Math.min(replayEvents().length, replayState.step + 1);
  renderReplay();
});
els.replayPlayButton.addEventListener("click", () => {
  if (replayState.timer) stopReplayPlayback();
  else startReplayPlayback();
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
  clearEnemyTimers();
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
  if (!isMultiplayer() && state.phase === "battle" && state.turn === "enemy" && !state.gameOver && !enemyFireTimer) scheduleEnemyFire();
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
