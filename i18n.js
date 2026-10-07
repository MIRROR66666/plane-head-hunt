(() => {
  const STORAGE_KEY = "plane-head-hunt-language";
  const SUPPORTED_LANGUAGES = new Set(["zh-CN", "en"]);
  const TRANSLATABLE_ATTRIBUTES = ["aria-label", "title", "placeholder"];

  const ENGLISH = {
    "寻机头": "Plane Head Hunt",
    "寻机头 Plane Head Hunt｜在线逻辑推理与双人对战游戏": "Plane Head Hunt | Online Logic Puzzle & Two-Player Game",
    "空域推理游戏": "Airspace Deduction Game",
    "01 号航站楼": "Terminal 01",
    "一架飞机正从微缩机场跑道起飞": "A plane taking off from a miniature airport runway",
    "游戏流程": "How to Play",
    "飞行计划": "Flight Plan",
    "藏好飞机": "Hide Your Planes",
    "侦查坐标": "Search Coordinates",
    "找到机头": "Find Every Head",
    "开始游戏": "Start Game",
    "新手教程": "Tutorial",
    "向下滑动，了解更多": "Scroll Down to Explore",
    "玩家反馈联系方式": "Player feedback contact",
    "游戏新手努力闯关中💪，如果有任何的想法欢迎随时联系我～期待带来更加美好的游戏体验": "I am still learning and improving the game 💪. If you have any ideas, please get in touch. I would love to make the experience even better.",
    "复制邮箱": "Copy Email",
    "先来一轮迷你侦查": "Try a Mini Search",
    "点一点，线索就来了": "Tap a Cell. Get a Clue.",
    "侦查次数": "Searches",
    "可点击侦查的迷你敌方空域": "Interactive miniature enemy airspace",
    "侦查回报": "Search Report",
    "待命": "Ready",
    "请选择一个坐标": "Choose a Coordinate",
    "飞机已经藏好了。随便点一格，看看会收到什么回报。": "The plane is hidden. Pick any cell and see what the search reports.",
    "本次机型": "Plane Shape",
    "看懂回报": "Read the Results",
    "灰色是击空，可以排除这个坐标。": "Gray means a miss. Rule out that coordinate.",
    "绿色是机身，对照机型继续推断。": "Green means a body hit. Compare the shape and keep deducing.",
    "红色是机头，找到它就能击落飞机。": "Red means the head. Find it to take the plane down.",
    "重新体验": "Try Again",
    "击空，排除一格": "Miss. One Cell Ruled Out.",
    "这里没有飞机。换一个坐标，继续缩小范围。": "No plane here. Try another coordinate and narrow the search area.",
    "命中机身": "Body Hit",
    "飞机经过这里。对照入门型的形状，继续推断机头方向。": "The plane crosses this cell. Compare the starter shape and deduce the head direction.",
    "找到机头": "Head Found",
    "命中机头，飞机已击落。正式对局中，找到全部机头就能获胜。": "Head hit. The plane is down. In a full match, find every head to win.",
    "B2 击空": "B2 Miss",
    "排除经过这里的摆法": "Eliminate layouts that cross this cell",
    "D4、E4 命中机身": "D4 and E4 Hit the Body",
    "判断机翼横向展开": "The wing may extend sideways",
    "对照机型": "Compare the Plane Shape",
    "继续验证候选机头": "Check the remaining head candidates",
    "找到全部机头，立即获胜": "Find every head to win immediately",
    "三片空域，三种节奏": "Three Airspaces. Three Paces.",
    "从轻松上手，到深度推理": "From a Gentle Start to Deep Deduction",
    "2 架入门型飞机，可以自由调整方向，飞机之间不能重叠。": "Two starter planes. Rotate them freely, but planes cannot overlap.",
    "4 架飞机，四种机型随机排列，仅机身可以重叠。": "Four planes with four possible shapes. Only body cells may overlap.",
    "5 架飞机，六种机型随机排列，最多一组双机头重叠。": "Five planes with six possible shapes. At most one pair of heads may overlap.",
    "4 架飞机，四种机型随机排列，": "Four planes with four possible shapes. ",
    "仅机身可以重叠": "Only body cells may overlap",
    "5 架飞机，六种机型随机排列，": "Five planes with six possible shapes. ",
    "详细介绍": "Details",
    "收起介绍": "Hide Details",
    "适合第一次玩": "Best for Your First Match",
    "只有一种入门机型，两架飞机不能重叠。通过机身很容易判断机头方向。": "One starter shape and two non-overlapping planes. Body hits make the head direction easy to deduce.",
    "机型更多，需要对照推理": "More Shapes to Compare",
    "四种机型会随机出现。机身可以互相覆盖，但机头不能与任何飞机部位重叠。": "Four shapes appear at random. Bodies may overlap, but heads cannot overlap any plane cell.",
    "更大空域，更少偶然": "A Larger, More Deliberate Airspace",
    "六种机型和五架飞机组成更复杂的空域。机身可以重叠，每局最多出现一组双机头重叠。": "Six shapes and five planes create a denser puzzle. Bodies may overlap, with at most one pair of overlapping heads.",
    "一个人练习，也可以叫上朋友": "Practice Solo or Invite a Friend",
    "同一套规则，两种对局方式": "One Rule Set, Two Ways to Play",
    "想立刻开始，就和电脑轮流侦查；想和朋友较量，就创建房间并分享链接。": "Play against the computer right away, or create a room and share the link with a friend.",
    "选择对局方式": "Choose Game Mode",
    "与电脑轮流落点，熟悉机型和推理节奏。": "Take turns with the computer and learn the plane shapes and deduction rhythm.",
    "创建专属房间，把链接发给朋友即可加入。": "Create a private room and send the link to a friend so they can join.",
    "第一次玩也没关系": "New Here? Start With Us.",
    "用一局真实推演学会寻机头": "Learn Through a Real Deduction Match",
    "教程会带你经历击空、命中机身、排除方向和锁定机头，最后把第二架飞机交给你独立判断。": "The tutorial walks through misses, body hits, direction elimination, and finding a head, then lets you deduce the second plane yourself.",
    "进入新手教程": "Open Tutorial",
    "登机前常见问题": "Before You Take Off",
    "关于寻机头": "About Plane Head Hunt",
    "寻机头是什么游戏？": "What is Plane Head Hunt?",
    "这是一款空域逻辑推理游戏。根据每次侦查得到的击空或机身回报，推导并找到所有敌方机头。": "It is an airspace logic puzzle. Use miss and body-hit results from each search to deduce every enemy plane head.",
    "不懂规则也能玩吗？": "Can I play without knowing the rules?",
    "可以。新手教程会从布阵开始，一步一步带你完成第一局推理。": "Yes. The tutorial starts with deployment and guides you through your first deduction match step by step.",
    "可以和朋友一起玩吗？": "Can I play with a friend?",
    "可以。选择双人对战并创建房间，把邀请链接发给朋友，双方进入后即可开始。": "Yes. Choose Two-Player Match, create a room, and send the invite link to your friend.",
    "手机上可以玩吗？": "Can I play on my phone?",
    "可以。网站支持手机、平板和电脑浏览器，不需要下载应用。": "Yes. The game works in mobile, tablet, and desktop browsers with no download required.",
    "游戏需要付费吗？": "Is the game free?",
    "不需要。寻机头目前可以免费游玩。": "Yes. Plane Head Hunt is currently free to play.",
    "寻机头 · 新手教程": "Plane Head Hunt · Tutorial",
    "跳过教程": "Skip Tutorial",
    "退出教程": "Exit tutorial",
    "教程进度": "Tutorial progress",
    "认识目标": "Goal",
    "选择难度": "Difficulty",
    "完成布阵": "Deploy",
    "调整方向": "Direction",
    "发起侦查": "Search",
    "进入对局": "Battle",
    "赢得胜利": "Victory",
    "1️⃣ 游戏目标": "1  Game Goal",
    "2️⃣ 选择难度": "2  Choose Difficulty",
    "3️⃣ 布置飞机": "3  Deploy Planes",
    "4️⃣ 调整朝向": "4  Set Direction",
    "5️⃣ 开始侦查": "5  Start Searching",
    "6️⃣ 正式对局": "6  Play a Match",
    "7️⃣ 胜利条件": "7  Win Condition",
    "这是一个找到所有机头就能赢的游戏": "Find every enemy plane head to win",
    "每架飞机都有一个机头，其余格子是机身。击中机身后，可以根据机型推导机头位置；击中敌方所有机头，就能赢得游戏。": "Each plane has one head; every other cell is its body. Use body hits and the plane shape to deduce the head. Hit every enemy head to win.",
    "入门飞机示意": "Starter plane example",
    "灰点": "Gray Dot",
    "绿点": "Green Dot",
    "爆炸": "Burst",
    "击空": "Miss",
    "机身": "Body",
    "机头": "Head",
    "新手先选简单模式": "Start with Easy mode",
    "简单模式是 9×9 空域，共 2 架入门型飞机。先选择机头朝向，再点击棋盘放置飞机。": "Easy mode uses a 9×9 airspace with 2 starter planes. Choose the head direction, then select a board cell to deploy.",
    "进阶模式": "Advanced Modes",
    "一般和困难模式还可以选择不同机型。": "Normal and Hard modes offer additional plane shapes.",
    "教程难度选择": "Tutorial difficulty selection",
    "简单": "Easy",
    "一般": "Normal",
    "困难": "Hard",
    "简单模式：2 架入门型飞机，可以调整方向，任何部位不能重叠。": "Easy: 2 starter planes. You may rotate them, but no cells may overlap.",
    "按顺序部署两架飞机": "Deploy two planes in order",
    "选择方向并点击机头位置。简单模式的两架飞机不能重叠。": "Choose a direction and select the head cell. The two Easy-mode planes cannot overlap.",
    "点击 C3": "Select C3",
    "点击 E2": "Select E2",
    "点击“开始侦查”": "Select \"Start Search\"",
    "部署第一架飞机": "Deploy the first plane",
    "部署第二架飞机": "Deploy the second plane",
    "完成布阵，进入下一步": "Finish deployment and continue",
    "点击右侧“随机布阵”，可以自动部署全部飞机。": "Select \"Random Deploy\" to place every plane automatically.",
    "请在棋盘上点击 C3。": "Select C3 on the board.",
    "我方空域": "My Airspace",
    "本关机型": "Plane Shapes",
    "战机 1 · 待命": "Aircraft 1 · Ready",
    "战机 2 · 待命": "Aircraft 2 · Ready",
    "开始侦查": "Start Search",
    "随机布阵": "Random Deploy",
    "用方向键调整机头朝向": "Use the arrow keys to set the head direction",
    "教程飞机朝向": "Tutorial plane direction",
    "机头向北": "Head North",
    "机头向东": "Head East",
    "机头向南": "Head South",
    "机头向西": "Head West",
    "当前机头向北。": "The head currently points north.",
    "经典型": "Classic",
    "旋转后的飞机示意": "Rotated plane example",
    "红色格是机头，绿色格是机身。": "The red cell is the head; green cells form the body.",
    "根据回报推导机头": "Deduce the head from each result",
    "先跟着示范排除第一架飞机，再独立找到第二架飞机。": "Follow the first deduction, then find the second plane on your own.",
    "第一架": "First Plane",
    "第二架": "Second Plane",
    "推演提示": "Deduction Hint",
    "先验证 B2": "Check B2 first",
    "点击 B2。击空可以排除所有经过 B2 的摆法。": "Select B2. A miss eliminates every layout that crosses B2.",
    "教程侦查棋盘": "Tutorial search board",
    "本关机型参考": "Plane shape reference",
    "入门型": "Starter",
    "入门型 · 6 格": "Starter · 6 cells",
    "命中越多，候选机头越少。问号会标出当前候选位置。": "More body hits mean fewer possible heads. Question marks show current candidates.",
    "攻击敌方，查看己方": "Search the enemy and monitor your board",
    "点击敌方坐标后查看结果，再等待电脑行动。": "Select an enemy coordinate, read the result, then wait for the computer's move.",
    "轮到你行动": "Your Turn",
    "机型": "Planes",
    "设置": "Settings",
    "继续游戏": "Continue",
    "返回布阵": "Return to Setup",
    "重新开始": "Restart",
    "敌方空域": "Enemy Airspace",
    "C3：击中机身。对照机型，继续推导机头。": "C3: Body hit. Compare the plane shape and keep deducing.",
    "击中全部敌方机头，即可获胜": "Hit every enemy head to win",
    "已找到敌方机头": "Enemy Heads Found",
    "战机 01": "Aircraft 01",
    "战机 02": "Aircraft 02",
    "已击落": "Downed",
    "侦查成功": "Search Complete",
    "敌方全部机头已找到": "Every enemy head has been found",
    "← 上一步": "← Back",
    "开始学习 →": "Start Tutorial →",
    "认识机头、机身与战果标记": "Learn heads, bodies, and result markers",
    "返回寻机头首页": "Return to Plane Head Hunt home",
    "返回首页": "Return Home",
    "当前任务": "Current Mission",
    "布阵阶段": "Setup Phase",
    "关闭音效": "Mute Sound",
    "开启音效": "Enable Sound",
    "音效": "Sound",
    "等待朋友加入": "Waiting for a Friend",
    "房间连接中": "Connecting Room",
    "复制邀请链接": "Copy Invite Link",
    "退出房间": "Leave Room",
    "云上空域": "Cloud Airspace",
    "观察空域，找到机头": "Scan the Airspace. Find the Heads.",
    "当前指令": "Current Objective",
    "把飞机藏进空域": "Hide Your Planes",
    "选择方向，再点击棋盘确定机头位置。": "Choose a direction, then select the head cell on the board.",
    "战果标记": "Result Markers",
    "灰点 = 击空": "Gray Dot = Miss",
    "该坐标没有飞机": "No plane occupies this coordinate",
    "绿点 = 机身": "Green Dot = Body",
    "命中机身，飞机尚未击落": "Body hit; the plane is still active",
    "爆炸 = 机头": "Burst = Head",
    "机头炸毁，该飞机已击落": "Head destroyed; the plane is down",
    "任务准备": "Mission Setup",
    "选择本局难度": "Choose a Difficulty",
    "先确定空域和规则，再进入对应的布阵页面。": "Choose the airspace and overlap rules before deploying your planes.",
    "选择游戏难度": "Choose game difficulty",
    "轻松入门": "Gentle Start",
    "进阶推理": "Advanced Deduction",
    "深度挑战": "Deep Challenge",
    "简单模式": "Easy Mode",
    "一般模式": "Normal Mode",
    "困难模式": "Hard Mode",
    "当前选择": "Selected",
    "选择此难度": "Select",
    "空域尺寸": "Airspace",
    "飞机数量": "Aircraft",
    "架": "planes",
    "一种入门机型": "One starter shape",
    "朝向": "Direction",
    "可以自由调整": "Freely adjustable",
    "重叠": "Overlap",
    "飞机之间不能重叠": "Planes cannot overlap",
    "四种机型随机排列": "Four plane shapes",
    "机身之间可以重叠": "Bodies may overlap",
    "不能与任何部位重叠": "Cannot overlap any plane cell",
    "六种机型随机排列": "Six plane shapes",
    "最多一组双机头重叠": "At most one pair of overlapping heads",
    "布阵": "Setup",
    "我方布阵棋盘": "My setup board",
    "当前难度": "Difficulty",
    "返回选择难度": "Change Difficulty",
    "选择飞机形状": "Choose a plane shape",
    "编队状态": "Fleet Status",
    "机头朝向": "Head Direction",
    "键盘可调整": "Use arrow keys",
    "选择飞机朝向": "Choose plane direction",
    "飞机占用格示意": "Plane cell preview",
    "机头是唯一致命点。飞机之间不能重叠，但可以相邻。": "The head is the only fatal cell. Planes cannot overlap, but they may touch.",
    "回合": "Round",
    "次攻击": "Attacks",
    "命中率": "Accuracy",
    "查看本关机型": "View plane shapes",
    "查看机型": "View Planes",
    "打开游戏设置": "Open game settings",
    "游戏设置": "Game Settings",
    "切换战场视图": "Switch battlefield view",
    "进攻": "Attack",
    "防守": "Defend",
    "敌方空域攻击棋盘": "Enemy search board",
    "我方防御棋盘": "My defense board",
    "回报": "Report",
    "我方": "Me",
    "对手": "Opponent",
    "请选择敌方空域中的一个未知坐标。": "Choose an unknown coordinate in the enemy airspace.",
    "等待对手行动。": "Waiting for the opponent.",
    "本局结束，可复盘、查看结算或再来一局。": "Match over. Review the moves, view results, or play again.",
    "本局复盘": "Match Replay",
    "查看结算": "View Results",
    "再来一局": "Play Again",
    "游戏规则": "Rules",
    "关闭结算，查看最终棋盘": "Close results and view the final boards",
    "胜": "WIN",
    "败": "LOSS",
    "游戏结束": "Game Over",
    "找到所有机头": "All Heads Found",
    "你率先锁定了全部敌方机头。": "You found every enemy head first.",
    "接下来想玩哪一关": "Choose Your Next Mission",
    "对局复盘": "Match Replay",
    "重新查看每一次落点": "Review every move in order",
    "关闭复盘": "Close replay",
    "选择复盘视角": "Choose replay perspective",
    "我的进攻": "My Attacks",
    "对方进攻": "Opponent Attacks",
    "复盘棋盘": "Replay board",
    "准备播放": "Ready",
    "从第一步开始查看本局过程。": "Start from the first move.",
    "上一步": "Previous move",
    "下一步": "Next move",
    "播放": "Play",
    "暂停": "Pause",
    "关闭": "Close",
    "选择飞行方式": "Choose a Game Mode",
    "这次想怎么玩？": "How would you like to play?",
    "单机练习": "Solo Practice",
    "与电脑对战，随时开始": "Play against the computer",
    "双人对战": "Two-Player Match",
    "创建房间，把链接发给朋友": "Create a room and share the link",
    "关闭房间信息": "Close room details",
    "正在创建房间": "Creating Room",
    "正在建立云端连接，请稍候。": "Establishing a peer connection. Please wait.",
    "房间码": "Room Code",
    "邀请链接": "Invite Link",
    "复制": "Copy",
    "进入布阵": "Enter Setup",
    "取消": "Cancel",
    "随时可以回来查看": "Available anytime",
    "秘密布阵": "Secret Setup",
    "简单模式不能重叠；一般模式仅机身可重叠；困难模式最多出现一组双机头重叠。": "Easy allows no overlap. Normal allows body overlap only. Hard allows at most one pair of overlapping heads.",
    "选择机型": "Choose a Plane",
    "简单模式使用入门型；所有模式都可以选择机头朝向。": "Easy uses the starter plane. Every mode lets you choose the head direction.",
    "轮流侦查": "Take Turns",
    "点击一个未知坐标，结果分为击空、击中机身、锁定机头。": "Choose an unknown coordinate. The result will be a miss, body hit, or head hit.",
    "锁定胜利": "Secure Victory",
    "率先命中对方全部机头，即可获胜；困难模式的重合机头会同时被击落。": "Find every opposing head first to win. Overlapping heads in Hard mode are destroyed together.",
    "明白": "Got It",
    "关闭设置": "Close settings",
    "游戏已暂停": "Game Paused",
    "任务设置": "Mission Settings",
    "语言选择": "Language selection",
    "中文": "中文",
    "英文": "English",
    "切换为中文": "Switch to Chinese",
    "切换为英文": "Switch to English",
    "待命": "Ready",
    "撤回": "Remove",
    "向北": "North",
    "向东": "East",
    "向南": "South",
    "向西": "West",
    "侦察型": "Scout",
    "三角翼": "Delta Wing",
    "箭翼型": "Arrow Wing",
    "轰炸型": "Bomber",
    "雨燕型": "Swift",
    "任务结束": "Mission Complete",
    "数据已复位": "Data Reset",
    "选择机头朝向，再点击棋盘放置。飞机之间不能重叠。": "Choose the head direction, then select a board cell. Planes cannot overlap.",
    "机身可以互相覆盖；机头不能与任何飞机部位重叠。": "Plane bodies may overlap, but heads cannot overlap any plane cell.",
    "机身可以重叠，机头不能压住机身；每局最多一组双机头重叠。": "Bodies may overlap, but heads cannot overlap bodies. At most one pair of heads may overlap.",
    "目标：击中全部敌方机头": "Goal: Hit every enemy head",
    "点击格子确定机头位置": "Select a cell for the plane head",
    "设置机头朝向": "Set the head direction",
    "按回合侦查敌方空域": "Take turns searching the enemy airspace",
    "击中全部机头即可获胜": "Hit every enemy head to win",
    "下一步 →": "Next →",
    "选择游戏方式 →": "Choose Game Mode →",
    "敌方飞机状态": "Enemy aircraft status",
    "教程布阵棋盘": "Tutorial setup board",
    "简单：9×9 空域，2 架入门型飞机，可以调整朝向。": "Easy: 9×9 airspace, 2 starter planes, adjustable directions.",
    "一般：12×12 空域，4 架飞机。机身可以重叠，机头不能重叠。": "Normal: 12×12 airspace, 4 planes. Bodies may overlap; heads may not.",
    "困难：14×14 空域，5 架飞机。机身可重叠，每局最多一组双机头重叠。": "Hard: 14×14 airspace, 5 planes. Bodies may overlap, with at most one pair of overlapping heads.",
    "选择本局空域": "Choose This Mission's Airspace",
    "确认难度与重叠规则后，再进入布阵。": "Review the difficulty and overlap rules, then enter setup.",
    "侦查敌方空域": "Search Enemy Airspace",
    "点击敌方空域中的未知坐标。": "Choose an unknown coordinate in the enemy airspace.",
    "飞机已经藏好，可以开始侦查。": "Your planes are hidden. You can start searching.",
    "飞机已经藏好，点击“准备完成”等待朋友。": "Your planes are hidden. Select \"Ready\" and wait for your friend.",
    "撤回 ×": "Remove ×",
    "已生成随机编队": "Random fleet generated",
    "已撤回该战机": "Aircraft removed",
    "已返回布阵，可撤回并调整战机": "Returned to setup. You may remove and reposition aircraft.",
    "已清空编队，请重新布阵": "Fleet cleared. Deploy your planes again.",
    "编队已满，请从编队列表撤回战机": "The fleet is full. Remove an aircraft from the fleet list first.",
    "机头不能与其他飞机重叠": "A head cannot overlap another plane.",
    "机头不能压住机身，每局最多一组双机头重叠": "Heads cannot overlap bodies, and only one pair of heads may overlap.",
    "此处空间不足或发生了重叠": "The plane does not fit here or overlaps another plane.",
    "准备完成": "Ready",
    "等待对方准备": "Waiting for Opponent",
    "朋友加入后才能准备": "Wait for your friend to join before readying up.",
    "已准备，等待朋友完成布阵": "Ready. Waiting for your friend to finish setup.",
    "布阵生成失败，请重试": "Could not generate a fleet. Please try again.",
    "等待朋友选择侦查坐标。": "Waiting for your friend to choose a coordinate.",
    "你先行动": "You Go First",
    "房主先行动": "The Host Goes First",
    "这个坐标已经侦查过了": "You already searched this coordinate.",
    "坐标发送失败，请检查连接": "Could not send the coordinate. Check the connection.",
    "敌方正在定位…": "Enemy is choosing a coordinate…",
    "敌方正在确认落点…": "Enemy is confirming the target…",
    "等待朋友行动…": "Waiting for your friend…",
    "连接已断开": "Connection Lost",
    "对手先找到了机头": "The Opponent Found Every Head First",
    "敌方先一步锁定了我方全部机头。": "The opponent found all of your plane heads first.",
    "下一局由房主选择难度": "The host will choose the next difficulty",
    "返回": "Return",
    "暂无落点": "No moves yet",
    "本局没有进攻记录。": "No attack history in this match.",
    "本局没有对方进攻记录。": "No opponent attack history in this match.",
    "从你的第一次侦查开始。": "Start with your first search.",
    "从对方的第一次攻击开始。": "Start with the opponent's first attack.",
    "你侦查": "You searched",
    "对方攻击": "Opponent attacked",
    "命中机身": "Body hit",
    "完整飞机布局已经显示。": "The full plane layout is now visible.",
    "布置你的飞机": "Deploy Your Planes",
    "已自动部署两架飞机。点击“开始侦查”完成这一步。": "Two planes were deployed automatically. Select \"Start Search\" to continue.",
    "布阵完成，进入方向调整。": "Deployment complete. Continue to direction controls.",
    "第一架已部署。现在点击 E2，部署第二架。": "The first plane is deployed. Select E2 for the second plane.",
    "两架飞机都已部署。点击右侧“开始侦查”完成这一步。": "Both planes are deployed. Select \"Start Search\" to complete this step.",
    "已开始侦查": "Search Started",
    "已部署": "Deployed",
    "简单 · 布阵完成": "Easy · Deployment Complete",
    "你独立找到了第二个机头": "You found the second head on your own",
    "两架飞机都已击落。你已经完成了从机身线索到机头位置的完整推断。": "Both planes are down. You completed the full deduction from body clues to head positions.",
    "已有线索只符合这一种摆法。点击这个坐标，完成最后一次判断。": "Only one layout fits every clue. Select this coordinate to make the final deduction.",
    "比较两个候选摆法，选择一个能解释全部机身与击空结果的机头。": "Compare the two possible layouts and choose the head that explains every body hit and miss.",
    "问号是候选机头。自由点击其它坐标，继续用击空或机身结果排除。": "Question marks are possible heads. Search other coordinates and use each miss or body hit to eliminate layouts.",
    "B2 击空，缩小搜索范围": "B2 misses, narrowing the search",
    "B2 没有飞机。接着点击 C3，寻找第一格机身。": "B2 is empty. Select C3 to look for the first body cell.",
    "C3 命中机身，对照机型": "C3 hits a body; compare the shape",
    "C3 是机身。点击相邻的 D3，判断机翼是否横向展开。": "C3 is a body cell. Select adjacent D3 to test whether the wing extends horizontally.",
    "C3、D3 都是机身": "C3 and D3 are both body cells",
    "两格连续命中，可能落在同一侧机翼。点击 D4 检查机身延伸方向。": "Two adjacent hits may lie on one wing. Select D4 to check the body's direction.",
    "只剩 D2 和 E3 两个候选机头": "Only D2 and E3 remain as possible heads",
    "D4 仍是机身。点击 B3，验证机身是否向左继续延伸。": "D4 is also a body cell. Select B3 to test whether the body continues left.",
    "B3 击空，排除 E3": "B3 misses, eliminating E3",
    "如果机头在 E3，B3 应该是机身。现在只剩 D2，点击它。": "If E3 were the head, B3 would be a body cell. Only D2 remains; select it.",
    "第一架飞机已击落": "First plane down",
    "开始寻找第二架。点击 B6，先取得一条新的机身线索。": "Begin the second plane. Select B6 for a new body clue.",
    "B6 命中机身": "B6 hits a body",
    "再点击相邻的 C6，判断机身延伸方向。": "Select adjacent C6 to determine the body's direction.",
    "轮到你独立推断第二架飞机": "Now deduce the second plane on your own",
    "候选机头会用问号标出。自由点击坐标，用新的击空或机身结果继续排除。": "Question marks show possible heads. Search freely and use new misses or body hits to eliminate layouts.",
    "联机难度由房主选择": "Only the host can change the difficulty.",
    "难度由房主选择": "Difficulty is chosen by the host",
    "邀请链接已复制": "Invite link copied",
    "已复制": "Copied",
    "正在加入房间": "Joining Room",
    "收到朋友的邀请": "Friend Invitation",
    "复制邀请链接发给朋友": "Copy the invite link and send it to your friend",
    "正在连接房主": "Connecting to the host",
    "双人对战进行中": "Two-Player Match",
    "轮到你侦查": "Your turn to search",
    "等待朋友行动": "Waiting for your friend",
    "你已准备": "You are ready",
    "你尚未准备": "You are not ready",
    "朋友已准备": "Friend is ready",
    "朋友正在布阵": "Friend is deploying",
    "朋友已加入": "Friend Joined",
    "联机组件加载失败": "Multiplayer Component Failed to Load",
    "请检查网络后刷新页面重试。": "Check your network, refresh the page, and try again.",
    "正在生成邀请链接，请稍候。": "Generating an invite link. Please wait.",
    "房间已经建好": "Room Ready",
    "把链接发给朋友。等待期间，你可以先进入布阵。": "Send the link to your friend. You can begin setting up while you wait.",
    "房间码发生冲突": "Room Code Conflict",
    "没有找到这个房间": "Room Not Found",
    "房间连接失败": "Room Connection Failed",
    "请重新创建一个房间。": "Create a new room and try again.",
    "请让房主保持页面打开，再重新进入邀请链接。": "Ask the host to keep the page open, then open the invite link again.",
    "请检查网络后重试。": "Check your network and try again.",
    "已加入朋友的房间": "Joined your friend's room",
    "双方布置好飞机并准备后，房主先行动。": "After both players deploy and ready up, the host moves first.",
    "朋友已加入房间": "Friend joined the room",
    "朋友已离开房间": "Friend Left the Room",
    "本局已暂停，可以退出后重新建房": "This match is paused. Leave and create a new room to continue.",
    "与朋友的连接已断开": "Connection to your friend was lost",
    "连接出现问题": "Connection Problem",
    "请检查双方网络": "Check both players' network connections.",
    "房间已经满员": "Room Full",
    "这个房间已有两位玩家，请让朋友重新创建房间。": "This room already has two players. Ask your friend to create a new room.",
    "朋友发起了新一局": "Your friend started a new match",
    "邀请链接中的房间码无效": "The room code in this invite link is invalid",
    "音效已开启": "Sound enabled",
    "音效已关闭": "Sound muted",
    "隐私设置": "Privacy Settings",
    "分析与隐私": "Analytics & Privacy",
    "我们使用 Google Analytics 了解游戏体验。只有在你同意后，分析脚本才会加载。": "We use Google Analytics to understand the game experience. Analytics only loads after you agree.",
    "仅使用必要功能": "Necessary Only",
    "允许数据分析": "Allow Analytics"
  };

  const MODE_NAMES = { "简单": "Easy", "一般": "Normal", "困难": "Hard" };
  const RESULT_NAMES = { "击空": "Miss", "击中机身": "Body hit", "命中机头": "Head hit", "命中我方机身": "Hit my plane body" };

  const PATTERNS = [
    [/^第\s*(\d+)\s*步\s*\/\s*共\s*(\d+)\s*步$/, match => `Step ${match[1]} of ${match[2]}`],
    [/^第\s*(\d+)\s*\/\s*(\d+)\s*步$/, match => `Step ${match[1]} of ${match[2]}`],
    [/^(\d+)\s*格$/, match => `${match[1]} cells`],
    [/^侦查\s+([A-G]\d)$/, match => `Search ${match[1]}`],
    [/^([A-G]\d)\s+(击空|命中机身|命中机头)$/, match => `${match[1]} ${RESULT_NAMES[match[2]]}`],
    [/^(\d+)\s*架飞机$/, match => `${match[1]} aircraft`],
    [/^(\d+)\s*架$/, match => `${match[1]} aircraft`],
    [/^(战机)\s*(\d+)\s*·\s*待命$/, match => `Aircraft ${match[2]} · Ready`],
    [/^战机\s*(\d+)$/, match => `Aircraft ${match[1]}`],
    [/^撤回战机\s*(\d+)$/, match => `Remove aircraft ${match[1]}`],
    [/^房间\s+(.+)$/, match => `Room ${match[1]}`],
    [/^机头\s+(\d+)\s*\/\s*(\d+)$/, match => `Heads ${match[1]} / ${match[2]}`],
    [/^横\s+A-([A-Z])\s*·\s*纵\s+1-(\d+)$/, match => `Cols A-${match[1]} · Rows 1-${match[2]}`],
    [/^(\d+)\s*×\s*(\d+)\s*空域$/, match => `${match[1]} × ${match[2]} Airspace`],
    [/^(\d+)乘(\d+)空域，(\d+)架飞机$/, match => `${match[1]} by ${match[2]} airspace, ${match[3]} aircraft`],
    [/^(\d+)×(\d+)\s*·\s*(\d+)\s*架$/, match => `${match[1]}×${match[2]} · ${match[3]} aircraft`],
    [/^(\d+)×(\d+)\s*·\s*(\d+)\s*架飞机$/, match => `${match[1]}×${match[2]} · ${match[3]} aircraft`],
    [/^(简单|一般|困难)\s*·\s*(\d+)×(\d+)$/, match => `${MODE_NAMES[match[1]]} · ${match[2]}×${match[3]}`],
    [/^(简单|一般|困难)\s*·\s*侦查阶段$/, match => `${MODE_NAMES[match[1]]} · Search Phase`],
    [/^进入(简单|一般|困难)布阵$/, match => `Set Up ${MODE_NAMES[match[1]]}`],
    [/^已切换为(简单|一般|困难)模式$/, match => `Switched to ${MODE_NAMES[match[1]]} mode`],
    [/^(简单|一般|困难)\s*·\s*还需部署\s*(\d+)\s*架$/, match => `${MODE_NAMES[match[1]]} · ${match[2]} left to deploy`],
    [/^选择机型与方向，再点击棋盘确定机头。还需部署\s*(\d+)\s*架。$/, match => `Choose a plane and direction, then select its head cell. ${match[1]} left to deploy.`],
    [/^第\s*(\d+)\s*\/\s*(\d+)\s*步$/, match => `Step ${match[1]} of ${match[2]}`],
    [/^(\d+)\s*回合$/, match => `${match[1]} rounds`],
    [/^(\d+)\s*次攻击$/, match => `${match[1]} attacks`],
    [/^([A-Z]\d+)：击空。$/, match => `${match[1]}: Miss.`],
    [/^([A-Z]\d+)：击中机身。$/, match => `${match[1]}: Body hit.`],
    [/^([A-Z]\d+)：等待朋友回报…$/, match => `${match[1]}: Waiting for your friend's result…`],
    [/^([A-Z]\d+)：锁定\s*(\d+)\s*个机头，击落敌机\s*(\d+)\s*架。$/, match => `${match[1]}: ${match[2]} head${match[2] === "1" ? "" : "s"} found; ${match[3]} aircraft down.`],
    [/^敌方攻击\s*([A-Z]\d+)：(.+)。$/, match => `Enemy attacked ${match[1]}: ${RESULT_NAMES[match[2]] || translateCore(match[2])}.`],
    [/^朋友攻击\s*([A-Z]\d+)：(.+)。$/, match => `Friend attacked ${match[1]}: ${RESULT_NAMES[match[2]] || translateCore(match[2])}.`],
    [/^敌方锁定\s*([A-Z]\d+)，正在确认落点…$/, match => `Enemy targeting ${match[1]}…`],
    [/^锁定\s*(\d+)\s*个机头$/, match => `${match[1]} head${match[1] === "1" ? "" : "s"} found`],
    [/^锁定我方\s*(\d+)\s*个机头$/, match => `Found ${match[1]} of my heads`],
    [/^击落\s*(\d+)\s*架飞机$/, match => `${match[1]} aircraft down`],
    [/^第\s*(\d+)\s*步：(.+)$/, match => `Move ${match[1]}: ${translateCore(match[2])}`],
    [/^挑战(简单|一般|困难)模式$/, match => `Try ${MODE_NAMES[match[1]]}`],
    [/^请点击\s+([A-Z]\d+)。高亮格是当前机头位置。$/, match => `Select ${match[1]}. The highlighted cell is the current head position.`],
    [/^先按指令点击\s+([A-Z]\d+)。$/, match => `Follow the instruction and select ${match[1]} first.`],
    [/^当前还有\s*(\d+)\s*个候选机头$/, match => `${match[1]} possible heads remain`],
    [/^只剩\s+([A-Z]\d+)\s+一个候选机头$/, match => `Only ${match[1]} remains`],
    [/^只剩\s+(.+)\s+两个候选机头$/, match => `Two possible heads remain: ${match[1]}`],
    [/^(.+)，(\d+)\s*格$/, match => `${translateCore(match[1])}, ${match[2]} cells`],
    [/^(\d+)\s*·\s*(.+)$/, match => `${match[1]} · ${translateCore(match[2])}`],
    [/^([A-Z]\d+)，当前机头位置$/, match => `${match[1]}, current head position`],
    [/^([A-Z]\d+)，当前目标$/, match => `${match[1]}, current target`],
    [/^([A-Z]\d+)，候选机头$/, match => `${match[1]}, possible head`],
    [/^([A-Z]\d+)\s+击空$/, match => `${match[1]} Miss`],
    [/^([A-Z]\d+)\s+击中机身$/, match => `${match[1]} Body hit`],
    [/^([A-Z]\d+)\s+击落\s*(\d+)\s*架飞机$/, match => `${match[1]} ${match[2]} aircraft down`],
    [/^当前机头(向北|向东|向南|向西)。$/, match => `The head currently points ${translateCore(match[1]).toLowerCase()}.`],
    [/^房主选择了(简单|一般|困难)模式$/, match => `The host selected ${MODE_NAMES[match[1]]} mode`],
    [/^正在连接房间\s+(.+)。$/, match => `Connecting to room ${match[1]}.`],
    [/^(你已准备|你尚未准备)\s*·\s*(朋友已准备|朋友正在布阵)$/, match => `${translateCore(match[1])} · ${translateCore(match[2])}`],
    [/^(挑战|返回)(简单|一般|困难)模式$/, match => `${match[1] === "挑战" ? "Try" : "Return to"} ${MODE_NAMES[match[2]]}`],
    [/^找到\s*(\d+)\s*个机头$/, match => `${match[1]} head${match[1] === "1" ? "" : "s"} found`],
    [/^(你侦查|对方攻击)\s+([A-Z]\d+)：(.+?)。(.*)$/, match => `${translateCore(match[1])} ${match[2]}: ${translateCore(match[3])}.${match[4] ? ` ${translateCore(match[4])}` : ""}`]
  ];

  function translateCore(value) {
    if (ENGLISH[value]) return ENGLISH[value];
    for (const [pattern, formatter] of PATTERNS) {
      const match = value.match(pattern);
      if (match) return formatter(match);
    }
    return value;
  }

  function translateValue(value) {
    const match = value.match(/^(\s*)([\s\S]*?)(\s*)$/);
    if (!match || !match[2]) return value;
    return `${match[1]}${translateCore(match[2])}${match[3]}`;
  }

  const storedLanguage = localStorage.getItem(STORAGE_KEY);
  const requestedLanguage = storedLanguage || (navigator.language.toLowerCase().startsWith("zh") ? "zh-CN" : "en");
  let currentLanguage = SUPPORTED_LANGUAGES.has(requestedLanguage) ? requestedLanguage : "zh-CN";
  const textSources = new WeakMap();
  const attributeSources = new WeakMap();
  let observer;

  function shouldIgnore(node) {
    const parent = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    return !parent || ["SCRIPT", "STYLE", "NOSCRIPT", "CANVAS"].includes(parent.tagName) || parent.closest("[data-i18n-ignore]");
  }

  function localizeTextNode(node, capture = false) {
    if (shouldIgnore(node)) return;
    if (capture || !textSources.has(node)) textSources.set(node, node.nodeValue);
    const source = textSources.get(node);
    const localized = currentLanguage === "en" ? translateValue(source) : source;
    if (node.nodeValue !== localized) node.nodeValue = localized;
  }

  function localizeElement(element, capture = false) {
    if (shouldIgnore(element)) return;
    let sources = attributeSources.get(element);
    if (!sources) {
      sources = new Map();
      attributeSources.set(element, sources);
    }
    TRANSLATABLE_ATTRIBUTES.forEach(attribute => {
      if (!element.hasAttribute(attribute)) return;
      if (capture || !sources.has(attribute)) sources.set(attribute, element.getAttribute(attribute));
      const source = sources.get(attribute);
      const localized = currentLanguage === "en" ? translateValue(source) : source;
      if (element.getAttribute(attribute) !== localized) element.setAttribute(attribute, localized);
    });
  }

  function visit(root, capture = false) {
    if (root.nodeType === Node.TEXT_NODE) {
      localizeTextNode(root, capture);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
    if (root.nodeType === Node.ELEMENT_NODE) localizeElement(root, capture);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) localizeTextNode(node, capture);
      else localizeElement(node, capture);
      node = walker.nextNode();
    }
  }

  function observe() {
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: TRANSLATABLE_ATTRIBUTES
    });
  }

  function updateLanguageControls() {
    document.querySelectorAll("[data-language]").forEach(button => {
      const active = button.dataset.language === currentLanguage;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
      const label = button.dataset.language === "en" ? "切换为英文" : "切换为中文";
      let sources = attributeSources.get(button);
      if (!sources) {
        sources = new Map();
        attributeSources.set(button, sources);
      }
      sources.set("aria-label", label);
      button.setAttribute("aria-label", currentLanguage === "en" ? translateCore(label) : label);
    });
  }

  function applyLanguage({ announce = false } = {}) {
    observer?.disconnect();
    document.documentElement.lang = currentLanguage;
    document.body.classList.toggle("language-en", currentLanguage === "en");
    visit(document, false);
    updateLanguageControls();
    observe();
    if (announce) window.dispatchEvent(new CustomEvent("game-language-change", { detail: { language: currentLanguage } }));
  }

  function setLanguage(language) {
    if (!SUPPORTED_LANGUAGES.has(language) || language === currentLanguage) return;
    currentLanguage = language;
    localStorage.setItem(STORAGE_KEY, language);
    applyLanguage({ announce: true });
  }

  observer = new MutationObserver(mutations => {
    observer.disconnect();
    mutations.forEach(mutation => {
      if (mutation.type === "characterData") {
        localizeTextNode(mutation.target, true);
        return;
      }
      if (mutation.type === "attributes") {
        localizeElement(mutation.target, true);
        return;
      }
      mutation.addedNodes.forEach(node => visit(node, true));
    });
    updateLanguageControls();
    observe();
  });

  document.querySelectorAll("[data-language]").forEach(button => {
    button.addEventListener("click", () => setLanguage(button.dataset.language));
  });

  visit(document, true);
  applyLanguage();

  window.GameI18n = {
    getLanguage: () => currentLanguage,
    setLanguage,
    t: value => currentLanguage === "en" ? translateCore(value) : value,
    refresh: () => applyLanguage()
  };
})();
