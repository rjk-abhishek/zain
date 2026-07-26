// ---------- Hero diagnostic console animation (decorative, signature element) ----------
(function heroConsole() {
    const el = document.getElementById('console-lines');
    if (!el) return;
    const script = [
        { tag: 'chk', cls: 'chk', text: 'Checking Wi-Fi connection…' },
        { tag: 'ok', cls: 'ok', text: 'Wi-Fi: connected' },
        { tag: 'chk', cls: 'chk', text: 'Checking print spooler…' },
        { tag: 'warn', cls: 'warn', text: 'Spooler: not responding' },
        { tag: 'chk', cls: 'chk', text: 'Checking driver version…' },
        { tag: 'warn', cls: 'warn', text: 'Driver: update available' },
        { tag: 'chk', cls: 'chk', text: 'Specialist reviewing results…' },
        { tag: 'ok', cls: 'ok', text: 'Fix identified — 2 steps' },
    ];
    let i = 0;
    function addLine() {
        if (i >= script.length) {
            setTimeout(() => { el.innerHTML = ''; i = 0; addLine(); }, 2600);
            return;
        }
        const s = script[i];
        const row = document.createElement('div');
        row.className = 'cline';
        row.style.animationDelay = '0s';
        row.innerHTML = `<span class="tag ${s.cls}">${s.tag}</span><span class="txt">${s.text}</span>`;
        el.appendChild(row);
        i++;
        setTimeout(addLine, 850);
    }
    addLine();
})();

// ---------- Chat widget ----------
(function chatWidget() {
    const launcher = document.getElementById('chat-launcher');
    const panel = document.getElementById('chat-panel');
    const closeBtn = document.getElementById('chat-close');
    const body = document.getElementById('chat-body');
    const inputRow = document.getElementById('chat-input-row');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');

    const openTriggers = [
        'nav-chat-open', 'hero-chat-open', 'console-chat-open', 'band-chat-open', 'brands-chat-open'
    ].map(id => document.getElementById(id)).filter(Boolean);

    const issueButtons = document.querySelectorAll('.issue-card .go, .brand-tile');

    let opened = false;
    let lead = { topic: '', name: '', phone: '', location: '' };
    let step = 'prechat'; // prechat -> topic (if unset) -> chatting -> done
    const sessionId = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));

    function openPanel(prefTopic) {
        if (panel) {
            panel.classList.add('open');
            if (launcher) launcher.setAttribute('aria-expanded', 'true');
        }
        if (prefTopic) lead.topic = prefTopic;
        if (!opened) {
            opened = true;
            renderPrechatForm();
        }
    }

    function closePanel() {
        if (panel) {
            panel.classList.remove('open');
            if (launcher) launcher.setAttribute('aria-expanded', 'false');
        }
    }

    if (launcher) {
        launcher.addEventListener('click', () => {
            panel && panel.classList.contains('open') ? closePanel() : openPanel();
        });
    }
    if (closeBtn) closeBtn.addEventListener('click', closePanel);
    openTriggers.forEach(btn => btn.addEventListener('click', (e) => { e.preventDefault(); openPanel(); }));
    issueButtons.forEach(btn => btn.addEventListener('click', () => openPanel(btn.dataset.topic)));

    function scrollToBottom() { if (body) body.scrollTop = body.scrollHeight; }

    function addMsg(text, who) {
        if (!body) return;
        const div = document.createElement('div');
        div.className = `msg ${who}`;
        div.textContent = text;
        body.appendChild(div);
        scrollToBottom();
        return div;
    }

    function addQuickReplies(options, onPick) {
        if (!body) return;
        const wrap = document.createElement('div');
        wrap.className = 'quick-replies';
        options.forEach(opt => {
            const b = document.createElement('button');
            b.type = 'button';
            b.textContent = opt;
            b.addEventListener('click', () => {
                wrap.remove();
                addMsg(opt, 'user');
                onPick(opt);
            });
            wrap.appendChild(b);
        });
        body.appendChild(wrap);
        scrollToBottom();
    }

    function botTyping(next, delay) {
        if (!body) return;
        const t = document.createElement('div');
        t.className = 'msg bot typing';
        t.innerHTML = '<span></span><span></span><span></span>';
        body.appendChild(t);
        scrollToBottom();
        setTimeout(() => { t.remove(); next(); }, delay || 550);
    }

    // ---- Step 1: pre-chat form (name, phone, location) ----
    function renderPrechatForm() {
        if (!body) return;
        body.innerHTML = '';
        if (inputRow) inputRow.hidden = true; // ensure input is hidden while filling form

        addMsg("Hi! 👋 I'm Laura, thanks for stopping by Printer Support.", 'bot');
        const card = document.createElement('div');
        card.className = 'prechat-card';
        card.innerHTML = `
      <p>Let's chat! Fill in a few details to get started.</p>
      <div class="prechat-field" data-field="name">
        <label for="pf-name">Name</label>
        <input type="text" id="pf-name" autocomplete="name">
        <div class="field-error">Please enter your name.</div>
      </div>
      <div class="prechat-field" data-field="phone">
        <label for="pf-phone">Phone</label>
        <input type="tel" id="pf-phone" autocomplete="tel" placeholder="(555) 123-4567">
        <div class="field-error">Please enter a valid phone number.</div>
      </div>
      <div class="prechat-field" data-field="location">
        <label for="pf-location">Location</label>
        <input type="text" id="pf-location" autocomplete="address-level2" placeholder="City, State">
      </div>
      <button type="button" class="prechat-submit">Start the chat</button>
    `;
        body.appendChild(card);
        scrollToBottom();

        const nameEl = card.querySelector('#pf-name');
        const phoneEl = card.querySelector('#pf-phone');
        const locEl = card.querySelector('#pf-location');
        const submit = card.querySelector('.prechat-submit');

        function clearInvalid(el) { el.closest('.prechat-field').classList.remove('invalid'); }
        [nameEl, phoneEl].forEach(el => el.addEventListener('input', () => clearInvalid(el)));

        submit.addEventListener('click', () => {
            let valid = true;
            if (!nameEl.value.trim()) {
                nameEl.closest('.prechat-field').classList.add('invalid');
                valid = false;
            }
            const digits = phoneEl.value.replace(/\D/g, '');
            if (digits.length < 7) {
                phoneEl.closest('.prechat-field').classList.add('invalid');
                valid = false;
            }
            if (!valid) return;

            lead.name = nameEl.value.trim();
            lead.phone = phoneEl.value.trim();
            lead.location = locEl.value.trim();

            submit.disabled = true;
            submit.textContent = 'Connecting…';
            submitLead({ stage: 'started' });

            card.remove();
            if (inputRow) inputRow.removeAttribute('hidden');
            startConversation();
        });
    }

    // ---- Step 2: conversation ----
    function startConversation() {
        step = 'topic';
        botTyping(() => {
            addMsg(`Hi ${lead.name}, I'm Laura 👋 Thanks for reaching out.`, 'bot');
            botTyping(() => {
                if (lead.topic) {
                    addMsg(`I see you need help with: ${lead.topic}. Tell me a bit more about what's happening, and I'll get you sorted.`, 'bot');
                    step = 'chatting';
                } else {
                    addMsg("What's going on with your printer?", 'bot');
                    addQuickReplies(
                        ['Wi-Fi setup', 'Printer offline', 'Scanner not working', 'Ink or cartridge', 'Paper jams', 'Something else'],
                        (choice) => {
                            lead.topic = choice;
                            step = 'chatting';
                            submitLead({ stage: 'topic_set' });
                            botTyping(() => addMsg("Got it — thanks. A specialist will follow up on that shortly. Feel free to add any more details below.", 'bot'), 500);
                        }
                    );
                }
            }, 500);
        }, 450);
    }

    async function submitLead(extra) {
        try {
            const res = await fetch('/api/lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionId,
                    name: lead.name,
                    phone: lead.phone,
                    location: lead.location,
                    topic: lead.topic,
                    page: location.href,
                    submitted_at: new Date().toISOString(),
                    ...extra
                })
            });
            if (!res.ok) throw new Error('Request failed');
        } catch (err) {
            console.error('Lead submission error:', err);
        }
    }

    function handleUserText(raw) {
        const text = raw.trim();
        if (!text) return;
        addMsg(text, 'user');

        if (step === 'topic') {
            lead.topic = text;
            submitLead({ stage: 'topic_set' });
            botTyping(() => addMsg("Thanks — a specialist will follow up on that shortly.", 'bot'), 500);
            step = 'chatting';
            return;
        }
        botTyping(() => addMsg("Thanks for the details — a specialist will be with you shortly.", 'bot'), 500);
    }

    // ---- Auto-open chat widget on DOM load ----
    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            openPanel();
        }, 300);
    });

    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            if (!input) return;
            const val = input.value;
            input.value = '';
            handleUserText(val);
        });
    }

    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = input.value;
                input.value = '';
                handleUserText(val);
            }
        });
    }
})();