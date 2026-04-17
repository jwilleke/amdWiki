/* Journal editor — template picker, mood picker, voice-to-text */
(function () {
  'use strict';

  // ── Mood picker ─────────────────────────────────────────────────────────────

  const moodInput = document.getElementById('moodInput');
  if (moodInput) {
    document.querySelectorAll('.journal-mood-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const mood = btn.dataset.mood || '';
        moodInput.value = mood;
        document.querySelectorAll('.journal-mood-btn').forEach(function (b) {
          b.classList.toggle('selected', b.dataset.mood === mood && mood !== '');
        });
      });
    });
  }

  // ── Template picker ─────────────────────────────────────────────────────────

  const templatePicker = document.getElementById('journalTemplatePicker');
  const contentArea    = document.getElementById('journalContent');
  const titleInput     = document.querySelector('input[name="title"]');

  if (templatePicker && contentArea) {
    templatePicker.querySelectorAll('.journal-template-card').forEach(function (card) {
      card.addEventListener('click', function () {
        // Mark selected
        templatePicker.querySelectorAll('.journal-template-card').forEach(function (c) {
          c.classList.remove('selected');
        });
        card.classList.add('selected');

        const body = card.dataset.body || '';
        const name = card.dataset.name || '';

        // Pre-fill content only if it's empty (don't overwrite user edits)
        if (!contentArea.value.trim()) {
          contentArea.value = body;
          contentArea.focus();
        }

        // Update title placeholder if still default
        if (titleInput && name && name !== 'Free Write') {
          const defaultVal = titleInput.dataset.defaultTitle || '';
          if (!defaultVal || titleInput.value === defaultVal) {
            // Don't override — user may have already typed a title
          }
        }

        // Collapse picker after selection
        const collapseEl = document.getElementById('templatePickerCollapse');
        if (collapseEl && window.bootstrap) {
          const bsCollapse = bootstrap.Collapse.getInstance(collapseEl);
          if (bsCollapse) bsCollapse.hide();
        }
      });
    });
  }

  // ── Voice-to-text ────────────────────────────────────────────────────────────

  const voiceBtn = document.getElementById('journalVoiceBtn');
  if (voiceBtn && contentArea) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      voiceBtn.style.display = 'none';
    } else {
      let recognition = null;
      let isListening = false;

      voiceBtn.addEventListener('click', function () {
        if (isListening) {
          recognition && recognition.stop();
          return;
        }

        recognition = new SpeechRecognition();
        recognition.continuous    = true;
        recognition.interimResults = true;
        recognition.lang          = document.documentElement.lang || 'en-US';

        let interimSpan = document.getElementById('journalVoiceInterim');
        if (!interimSpan) {
          interimSpan = document.createElement('span');
          interimSpan.id = 'journalVoiceInterim';
          interimSpan.className = 'journal-voice-interim text-muted fst-italic small ms-2';
          voiceBtn.insertAdjacentElement('afterend', interimSpan);
        }

        recognition.onstart = function () {
          isListening = true;
          voiceBtn.classList.add('journal-voice-active');
          voiceBtn.title = 'Stop recording';
          interimSpan.textContent = 'Listening…';
        };

        recognition.onend = function () {
          isListening = false;
          voiceBtn.classList.remove('journal-voice-active');
          voiceBtn.title = 'Voice to text';
          interimSpan.textContent = '';
        };

        recognition.onerror = function () {
          isListening = false;
          voiceBtn.classList.remove('journal-voice-active');
          interimSpan.textContent = '';
        };

        recognition.onresult = function (event) {
          let interim = '';
          let finalText = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalText += transcript;
            } else {
              interim += transcript;
            }
          }

          if (finalText) {
            const cur = contentArea.value;
            const sep = cur && !cur.endsWith('\n') ? ' ' : '';
            contentArea.value = cur + sep + finalText;
          }
          interimSpan.textContent = interim ? `"${interim}"` : 'Listening…';
        };

        recognition.start();
      });
    }
  }

}());
