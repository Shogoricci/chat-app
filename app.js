// すべてのDOMが読み込まれてから実行
document.addEventListener("DOMContentLoaded", () => {
    // ==============================
    // DOM 要素
    // ==============================
    const chatWindow = document.getElementById("chat-window");
    const messageInput = document.getElementById("message-input");
    const sendButton = document.getElementById("send-button");
    const quickButtons = document.querySelectorAll(".quick-btn");
    const attachBtn = document.querySelector(".attach-btn");

    console.log("Chat app initialized");

    // ==============================
    // 簡易返信パターン
    // ==============================
    const simpleReplies = [
        {
            keywords: ["こんにちは", "こんちゃ", "やあ"],
            reply:
                "こんにちは！Chatです。\nあらかじめ用意した文章で、簡単なデモチャットができます。"
        },
        {
            keywords: ["自己紹介", "誰", "あなたは"],
            reply:
                "私はデモ用のチャットボットです。\nこのサンプルでは、あらかじめ決めたルールで会話を返しています。"
        },
        {
            keywords: ["機能", "何ができる", "できること"],
            reply:
                "今はシンプルに、決めておいたキーワードや会話フローに従って返事をしています。\n" +
                "「趣味」「仕事」「旅行」などの話題を含めて話しかけると、3〜4ターンくらい会話が続くようになっています。"
        }
    ];

    // 会話フローの状態
    let dialogState = { topic: null, step: 0 };

    // ==============================
    // メッセージ描画
    // ==============================
    function renderMessage(role, text, dateObj) {
        const row = document.createElement("div");
        row.classList.add("message-row", role);

        const bubble = document.createElement("div");
        bubble.classList.add("message-bubble");
        bubble.textContent = text;
        row.appendChild(bubble);

        const timestamp = document.createElement("div");
        timestamp.classList.add("timestamp");
        const d = dateObj || new Date();
        const h = String(d.getHours()).padStart(2, "0");
        const m = String(d.getMinutes()).padStart(2, "0");
        timestamp.textContent = `${h}:${m}`;
        row.appendChild(timestamp);

        chatWindow.appendChild(row);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // ==============================
    // 返信ロジック
    // ==============================
    function getSimpleReply(userText) {
        const normalized = userText.trim();
        for (const item of simpleReplies) {
            if (item.keywords.some((kw) => normalized.includes(kw))) {
                return item.reply;
            }
        }
        return null;
    }

    function getMultiTurnReply(userText) {
        const t = userText.trim();

        if (!dialogState.topic) {
            if (t.includes("趣味") || t.includes("好きなこと")) {
                dialogState = { topic: "hobby", step: 1 };
                return "いいですね！まず教えてください。あなたの趣味は何ですか？";
            }
            if (t.includes("仕事") || t.includes("会社") || t.includes("働")) {
                dialogState = { topic: "work", step: 1 };
                return "お仕事の話、ぜひ聞きたいです。どんな仕事をされていますか？";
            }
            if (t.includes("旅行") || t.includes("旅")) {
                dialogState = { topic: "travel", step: 1 };
                return "旅行の話、ワクワクしますね！最近行った場所や、行ってみたい場所はどこですか？";
            }
            return null;
        }

        if (dialogState.topic === "hobby") {
            if (dialogState.step === 1) {
                dialogState.step = 2;
                return `「${t}」なんですね！\nその趣味はどのくらいの期間続けていますか？`;
            } else if (dialogState.step === 2) {
                dialogState.step = 3;
                return "続けていて良かったなと思う瞬間はどんな時ですか？";
            } else {
                dialogState = { topic: null, step: 0 };
                return "趣味の話を聞かせてくれてありがとうございました！\nまた別の話題（仕事・旅行など）も振ってみてください 😊";
            }
        }

        if (dialogState.topic === "work") {
            if (dialogState.step === 1) {
                dialogState.step = 2;
                return `お仕事は「${t}」なんですね！\nその仕事の中で、特にやりがいを感じるのはどんなときですか？`;
            } else if (dialogState.step === 2) {
                dialogState.step = 3;
                return "今後、そのお仕事でチャレンジしてみたいことや目標はありますか？";
            } else {
                dialogState = { topic: null, step: 0 };
                return "お仕事の話、とても興味深かったです！\n気分転換に趣味や旅行の話もしてみませんか？";
            }
        }

        if (dialogState.topic === "travel") {
            if (dialogState.step === 1) {
                dialogState.step = 2;
                return `「${t}」に関連した旅行なんですね！\nその場所で一番印象に残っている景色や体験は何ですか？`;
            } else if (dialogState.step === 2) {
                dialogState.step = 3;
                return "もし友だちにその旅行先をおすすめするとしたら、どんなところを推しますか？";
            } else {
                dialogState = { topic: null, step: 0 };
                return "旅行の思い出を共有してくれてありがとうございました！\nまた別の場所の話や、他の話題もぜひ聞かせてください ✈️";
            }
        }

        return null;
    }

    function decideBotReply(userText) {
        // ✅ まず「機能を教えて」などのシンプルコマンドを最優先
        const simple = getSimpleReply(userText);
        if (simple) {
            // コマンドを打ったら、趣味/仕事/旅行の流れはいったんリセット
            dialogState = { topic: null, step: 0 };
            return simple;
        }

        // それ以外は会話フローを優先
        let reply = getMultiTurnReply(userText);
        if (reply) return reply;

        // どちらにも当てはまらなければ汎用メッセージ
        return (
            "メッセージありがとうございます！\n" +
            "「趣味」「仕事」「旅行」などの話題を含めてメッセージを送ると、3〜4ターンくらい会話が続くようになっています。\n" +
            "もちろん、普通の雑談メッセージも歓迎です。"
        );
    }

    // ==============================
    // 送信処理
    // ==============================
    function handleSend() {
        const text = messageInput.value.trim();
        if (!text) return;

        messageInput.value = "";

        renderMessage("user", text);
        const reply = decideBotReply(text);
        renderMessage("bot", reply);
    }

    // ==============================
    // イベント設定
    // ==============================
    sendButton.addEventListener("click", handleSend);

    messageInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
        }
    });

    quickButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const text = btn.dataset.text || "";
            if (!text) return;
            messageInput.value = text;
            handleSend();
        });
    });

    if (attachBtn) {
        attachBtn.addEventListener("click", () => {
            alert("ファイル添付機能はまだ実装していません（ダミーボタンです）");
        });
    }

    // 最初の挨拶メッセージ
    renderMessage(
        "bot",
        "こんにちは！Chatです。\n下の Quick Replies から話題を選ぶか、メッセージを入力して送信してみてください。"
    );
});
